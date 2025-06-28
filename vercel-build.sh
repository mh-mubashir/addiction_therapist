#!/bin/bash

# Build the React app
echo "🔨 Building React app..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful - dist folder created"
    ls -la dist/
else
    echo "❌ Build failed - dist folder not found"
    exit 1
fi 