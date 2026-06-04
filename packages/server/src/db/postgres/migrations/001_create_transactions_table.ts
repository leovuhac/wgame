/**
 * PostgreSQL Migration: Create transactions table (append-only)
 * 
 * This table tracks all financial transactions for the game
 * It is append-only (no DELETE permission) for audit purposes
 */

export const up = `
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW', 'WIN', 'LOSE', 'REFUND')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  balance_before DECIMAL(15, 2) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL,
  frozen_balance DECIMAL(15, 2) DEFAULT 0,
  payment_method VARCHAR(50),
  order_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED')),
  description TEXT,
  game_room_id VARCHAR(255),
  reference_transaction_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_balance_change CHECK (
    (type = 'DEPOSIT' AND amount = balance_after - balance_before) OR
    (type != 'DEPOSIT')
  )
);

CREATE INDEX idx_transactions_player_id ON transactions(player_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);

-- Create view for player transaction history
CREATE VIEW player_transaction_summary AS
SELECT
  player_id,
  COUNT(*) as total_transactions,
  SUM(CASE WHEN type = 'DEPOSIT' THEN amount ELSE 0 END) as total_deposits,
  SUM(CASE WHEN type = 'WITHDRAW' THEN amount ELSE 0 END) as total_withdraws,
  SUM(CASE WHEN type = 'WIN' THEN amount ELSE 0 END) as total_winnings,
  SUM(CASE WHEN type = 'LOSE' THEN amount ELSE 0 END) as total_losses,
  MAX(created_at) as last_transaction_at
FROM transactions
WHERE status = 'SUCCESS'
GROUP BY player_id;

-- Create view for daily revenue
CREATE VIEW daily_revenue AS
SELECT
  DATE(created_at) as transaction_date,
  COUNT(*) as transaction_count,
  SUM(CASE WHEN type = 'DEPOSIT' AND status = 'SUCCESS' THEN amount ELSE 0 END) as total_deposits,
  SUM(CASE WHEN type = 'WITHDRAW' AND status = 'SUCCESS' THEN amount ELSE 0 END) as total_withdraws,
  SUM(CASE WHEN type = 'WIN' AND status = 'SUCCESS' THEN amount ELSE 0 END) as total_winnings
FROM transactions
GROUP BY DATE(created_at)
ORDER BY transaction_date DESC;
`;

export const down = `
DROP VIEW IF EXISTS daily_revenue;
DROP VIEW IF EXISTS player_transaction_summary;
DROP TABLE IF EXISTS transactions;
`;

export const metadata = {
  name: '001_create_transactions_table',
  description: 'Create append-only transactions table for financial tracking',
  version: 1,
};
