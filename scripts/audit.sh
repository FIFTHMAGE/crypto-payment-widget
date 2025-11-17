#!/bin/bash
cd frontend && npm audit --production && cd ../backend && npm audit --production
echo "Security audit complete!"

