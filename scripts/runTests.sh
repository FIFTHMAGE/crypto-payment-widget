#!/bin/bash
echo "Running all tests..."
cd frontend && npm test && cd ../backend && npm test && cd ../contracts && npm test
echo "All tests completed!"

