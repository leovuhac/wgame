/**
 * PostgreSQL Migration: Create audit_logs table (append-only)
 * 
 * Tracks all security and system events for compliance and debugging
 */

export const up = `
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  action_type VARCHAR(50),
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('SUCCESS', 'FAILED', 'UNAUTHORIZED')),
  ip_address INET NOT NULL,
  user_agent TEXT,
  device_info JSONB,
  request_data JSONB,
  response_data JSONB,
  error_message TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_player_id ON audit_logs(player_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_status ON audit_logs(status);
CREATE INDEX idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Create view for security alerts
CREATE VIEW security_alerts AS
SELECT
  player_id,
  COUNT(*) as failed_attempts,
  MAX(created_at) as last_attempt,
  MIN(created_at) as first_attempt,
  json_agg(DISTINCT ip_address) as ip_addresses
FROM audit_logs
WHERE status = 'FAILED' AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY player_id
HAVING COUNT(*) >= 5;

-- Create view for suspicious activity
CREATE VIEW suspicious_activity AS
SELECT
  player_id,
  action,
  COUNT(*) as occurrence_count,
  COUNT(DISTINCT ip_address) as unique_ips,
  json_agg(DISTINCT ip_address) as all_ips,
  MIN(created_at) as first_occurrence,
  MAX(created_at) as last_occurrence
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY player_id, action
HAVING COUNT(*) > 10;
`;

export const down = `
DROP VIEW IF EXISTS suspicious_activity;
DROP VIEW IF EXISTS security_alerts;
DROP TABLE IF EXISTS audit_logs;
`;

export const metadata = {
  name: '002_create_audit_logs_table',
  description: 'Create append-only audit logs table for security and compliance',
  version: 1,
};
