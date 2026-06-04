/**
 * PostgreSQL Migration: Create payment orders tables
 * 
 * Tracks deposit and withdrawal orders with payment gateway integration
 */

export const up = `
CREATE TABLE deposit_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'VND',
  payment_method VARCHAR(50) NOT NULL,
  payment_gateway VARCHAR(50),
  gateway_transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'EXPIRED')),
  payment_url TEXT,
  expires_at TIMESTAMP,
  completed_at TIMESTAMP,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE withdraw_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  currency VARCHAR(3) DEFAULT 'VND',
  payment_method VARCHAR(50) NOT NULL,
  bank_account_name VARCHAR(255),
  bank_account_number VARCHAR(255),
  bank_code VARCHAR(50),
  momo_phone VARCHAR(20),
  status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'REJECTED')),
  rejection_reason TEXT,
  reference_id VARCHAR(255),
  processed_at TIMESTAMP,
  failed_reason TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_retry_at TIMESTAMP,
  metadata JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for deposit_orders
CREATE INDEX idx_deposit_orders_player_id ON deposit_orders(player_id);
CREATE INDEX idx_deposit_orders_status ON deposit_orders(status);
CREATE INDEX idx_deposit_orders_created_at ON deposit_orders(created_at DESC);
CREATE INDEX idx_deposit_orders_gateway_transaction_id ON deposit_orders(gateway_transaction_id);
CREATE INDEX idx_deposit_orders_expires_at ON deposit_orders(expires_at) WHERE expires_at IS NOT NULL;

-- Indexes for withdraw_orders
CREATE INDEX idx_withdraw_orders_player_id ON withdraw_orders(player_id);
CREATE INDEX idx_withdraw_orders_status ON withdraw_orders(status);
CREATE INDEX idx_withdraw_orders_created_at ON withdraw_orders(created_at DESC);
CREATE INDEX idx_withdraw_orders_next_retry_at ON withdraw_orders(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Create view for pending deposits
CREATE VIEW pending_deposits AS
SELECT
  id,
  player_id,
  amount,
  payment_method,
  status,
  created_at,
  expires_at
FROM deposit_orders
WHERE status IN ('PENDING', 'PROCESSING')
  AND (expires_at IS NULL OR expires_at > NOW());

-- Create view for pending withdrawals
CREATE VIEW pending_withdrawals AS
SELECT
  id,
  player_id,
  amount,
  payment_method,
  status,
  attempts,
  max_attempts,
  next_retry_at
FROM withdraw_orders
WHERE status IN ('PENDING', 'PROCESSING')
  AND attempts < max_attempts;

-- Create view for failed orders needing retry
CREATE VIEW orders_needing_retry AS
SELECT
  'withdraw' as order_type,
  id,
  player_id,
  amount,
  created_at,
  next_retry_at,
  attempts,
  max_attempts
FROM withdraw_orders
WHERE status = 'FAILED'
  AND attempts < max_attempts
  AND next_retry_at <= NOW()
ORDER BY next_retry_at ASC;
`;

export const down = `
DROP VIEW IF EXISTS orders_needing_retry;
DROP VIEW IF EXISTS pending_withdrawals;
DROP VIEW IF EXISTS pending_deposits;
DROP TABLE IF EXISTS withdraw_orders;
DROP TABLE IF EXISTS deposit_orders;
`;

export const metadata = {
  name: '003_create_payment_orders_tables',
  description: 'Create payment orders tables for deposit and withdrawal tracking',
  version: 1,
};
