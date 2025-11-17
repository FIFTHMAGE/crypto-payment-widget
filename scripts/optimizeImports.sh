#!/bin/bash
# Optimize all import statements
npx organize-imports-cli tsconfig.json frontend/src/**/*.{ts,tsx}
echo "Imports optimized!"

