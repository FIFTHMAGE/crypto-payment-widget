#!/bin/bash
# Clean up all console.logs and debug code
find ./frontend/src -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  sed -i '' '/console\.log/d' "$file"
  sed -i '' '/console\.debug/d' "$file"
done
echo "Logs cleaned!"

