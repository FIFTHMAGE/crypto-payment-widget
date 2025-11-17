#!/bin/bash
cd frontend && npx tsc --noEmit && cd ../backend && npx tsc --noEmit
echo "Type checking complete!"

