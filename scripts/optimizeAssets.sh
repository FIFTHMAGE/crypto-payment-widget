#!/bin/bash
# Asset Optimization Pipeline
echo "Optimizing images..."
find ./public -name "*.png" -exec pngquant --ext .png --force {} \;
find ./public -name "*.jpg" -exec jpegoptim --max=85 {} \;
echo "Assets optimized!"

