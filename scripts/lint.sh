#!/bin/bash
cd frontend && npm run lint && cd ../backend && npm run lint
echo "Linting complete!"

