#!/bin/bash
# Force clean rebuild to clear stale build cache

set -e

cd "$(dirname "$0")/src-tauri"

echo "🧹 Cleaning all build artifacts..."
cargo clean

echo ""
echo "🔨 Checking compilation..."
cargo check

echo ""
echo "✅ Build check complete!"
