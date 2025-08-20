#!/bin/bash

# Development Server Script for Dog Metrics Plotter
# This script provides multiple options for running a local development server

echo "🐕 Dog Metrics Plotter - Development Server"
echo "=========================================="

PORT=${1:-3000}
echo "Starting server on port $PORT..."
echo ""

# Check if Node.js is available
if command -v node >/dev/null 2>&1; then
    echo "✅ Node.js detected"
    if [ -f "package.json" ]; then
        echo "📦 Installing dependencies..."
        npm install --silent
        echo "🚀 Starting Node.js development server..."
        echo "   Open: http://localhost:$PORT"
        echo "   Press Ctrl+C to stop"
        echo ""
        npx http-server -p $PORT -o -c-1
    fi
else
    echo "🐍 Using Python development server..."
    echo "   Open: http://localhost:$PORT"
    echo "   Press Ctrl+C to stop"
    echo ""
    python3 -m http.server $PORT
fi
