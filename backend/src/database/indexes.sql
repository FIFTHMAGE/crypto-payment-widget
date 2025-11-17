-- Database Indexing Strategy
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_amount ON payments(amount);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_composite ON payments(address, status, created_at);

