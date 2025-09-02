#!/usr/bin/env bash
# Railway start script

echo "🚀 Starting LockerSys on Railway..."
echo "📦 Node version: $(node --version)"
echo "📂 Current directory: $(pwd)"
echo "📋 Files in root:"
ls -la

echo "🔧 Starting server..."
npm start
