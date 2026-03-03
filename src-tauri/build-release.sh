#!/bin/bash

# Build Dhikrtop - Release Mode
# This script will compile the app for release

set -e

echo "🔨 Building Dhikrtop (Release Mode)"
echo "=================================================="
echo ""
echo "Step 1: Cleaning previous builds..."
cargo clean 2>/dev/null || true

echo "Step 2: Downloading dependencies..."
cargo fetch

echo "Step 3: Building release binary..."
cargo build --release

echo ""
echo "✅ Build Complete!"
echo ""
echo "Release binary location:"
if [ -f "target/release/dhikrtop" ]; then
    echo "  📦 target/release/dhikrtop"
elif [ -f "target/release/dhikrtop.exe" ]; then
    echo "  📦 target/release/dhikrtop.exe"
else
    echo "  📦 target/release/dhikrtop (binary)"
fi

echo ""
echo "To run the app:"
echo "  cargo run --release"
echo ""
echo "Or from the Tauri dev:"
echo "  cd .. && npm run tauri build"
