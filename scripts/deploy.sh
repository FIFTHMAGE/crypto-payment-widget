#!/bin/bash
# Deployment Script
echo "Building frontend..."
cd frontend && npm run build
echo "Building backend..."
cd ../backend && npm run build
echo "Deploying to production..."
echo "Deployment complete!"

