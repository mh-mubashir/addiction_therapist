#!/bin/bash

echo "🚀 Starting Vercel build..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Verify API routes exist
echo "🔍 Verifying API routes..."
if [ ! -d "api" ]; then
    echo "❌ API directory not found!"
    exit 1
fi

echo "✅ API routes found:"
ls -la api/

echo "🎉 Build completed successfully!" 