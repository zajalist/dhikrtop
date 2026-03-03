#!/bin/bash
# Test build script - verifies compilation works

set -e

echo "🔨 Testing Dhikrtop compilation (without audio)..."
echo "=================================================="

cd "$(dirname "$0")/src-tauri"

echo ""
echo "Step 1: Cleaning previous builds..."
cargo clean 2>/dev/null || true

echo ""
echo "Step 2: Checking compilation (no audio feature)..."
cargo check

echo ""
echo "Step 3: Running tests..."
cargo test --lib db --no-fail-fast

echo ""
echo "✅ Build test PASSED!"
echo ""
echo "To build with audio support:"
echo "  sudo apt-get install -y pkg-config libasound2-dev"
echo "  cargo check --features audio"
