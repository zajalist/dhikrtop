#!/bin/bash
# Quick sanity check - verifies the build will work

set -e

echo "🔍 Quick Build Sanity Check"
echo "==========================="
echo ""

cd "$(dirname "$0")/src-tauri"

echo "Checking Cargo.toml..."
if grep -q 'audio = \["cpal", "hound"\]' Cargo.toml; then
    echo "✓ Audio feature configured correctly"
else
    echo "✗ Audio feature not found in Cargo.toml"
    exit 1
fi

echo ""
echo "Checking lib.rs for stub audio module..."
if grep -q '#\[cfg(not(feature = "audio"))\]' src/lib.rs; then
    echo "✓ Stub audio module present"
else
    echo "✗ Stub audio module missing"
    exit 1
fi

echo ""
echo "Checking audio.rs for feature gate..."
if grep -q '#!\[cfg(feature = "audio")\]' src/audio.rs; then
    echo "✓ Audio module is feature-gated"
else
    echo "✗ Audio module not feature-gated"
    exit 1
fi

echo ""
echo "Testing cargo check (default, no audio)..."
if cargo check 2>&1 | grep -q "error"; then
    echo "✗ Cargo check failed"
    cargo check
    exit 1
else
    echo "✓ Cargo check passed"
fi

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║  ✅ Sanity Check PASSED!             ║"
echo "╚═══════════════════════════════════════╝"
echo ""
echo "Build should work. Run:"
echo "  cd /home/zajalist/projects/dhikrtop"
echo "  npm run tauri dev"
