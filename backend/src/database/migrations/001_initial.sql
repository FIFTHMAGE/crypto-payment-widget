-- Initial Migration
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  amount VARCHAR(255) NOT NULL,
  address VARCHAR(42) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_address ON payments(address);
CREATE INDEX idx_payments_status ON payments(status);

