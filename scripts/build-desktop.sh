#!/bin/bash

# Aether Mail - Desktop Build Script
# This script builds the desktop application for all platforms

echo "🚀 Building Aether Mail Desktop Application..."

# Check if required dependencies are installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    exit 1
fi

if ! command -v electron &> /dev/null; then
    echo "❌ Electron is not installed. Running pnpm install..."
    pnpm install
fi

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist-electron/
rm -rf electron/dist/

# Build frontend
echo "🏗️  Building frontend..."
pnpm build:frontend

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

# Build Electron main process
echo "⚡ Building Electron main process..."
pnpm build:electron:main

if [ $? -ne 0 ]; then
    echo "❌ Electron main process build failed!"
    exit 1
fi

# Build desktop application
echo "📦 Building desktop application..."
pnpm build:electron

if [ $? -ne 0 ]; then
    echo "❌ Desktop build failed!"
    exit 1
fi

echo "✅ Desktop application built successfully!"
echo "📁 Output directory: dist-electron/"

# List built files
echo "📋 Built files:"
ls -la dist-electron/