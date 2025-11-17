#!/bin/bash
# Remove all unused dependencies
cd frontend && npx depcheck --json > unused.json
echo "Check unused.json for unused dependencies"

