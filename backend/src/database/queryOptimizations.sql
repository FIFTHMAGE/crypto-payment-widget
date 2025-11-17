-- Database Query Optimization
EXPLAIN ANALYZE SELECT * FROM payments WHERE address = '0x123' AND status = 'completed';

-- Optimize with index
CREATE INDEX CONCURRENTLY idx_payments_address_status ON payments(address, status);

-- Analyze query plan
ANALYZE payments;

