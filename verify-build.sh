#!/bin/bash
# Complete build verification for Dhikrtop
# Tests both default (no audio) and audio-enabled builds

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Dhikrtop Build Verification Script                       ║"
echo "║  Tests: Default build + Audio build (if deps available)   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")/src-tauri"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ── Test 1: Default build (no audio) ────────────────────────────────

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 1: Building without audio feature${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "Cleaning..."
cargo clean 2>/dev/null || true

echo ""
echo "Checking compilation (default, no audio)..."
if cargo check; then
    echo -e "${GREEN}✓ Default build check PASSED${NC}"
else
    echo -e "${RED}✗ Default build check FAILED${NC}"
    exit 1
fi

echo ""
echo "Building release binary (default, no audio)..."
if cargo build --release; then
    echo -e "${GREEN}✓ Default release build PASSED${NC}"
else
    echo -e "${RED}✗ Default release build FAILED${NC}"
    exit 1
fi

echo ""
echo "Running database tests..."
if cargo test --lib db --no-fail-fast; then
    echo -e "${GREEN}✓ Database tests PASSED${NC}"
else
    echo -e "${RED}✗ Database tests FAILED${NC}"
    exit 1
fi

# ── Test 2: Audio build (if ALSA available) ────────────────────────

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 2: Building with audio feature (if ALSA available)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if ALSA dev libs are available
if pkg-config --exists alsa 2>/dev/null; then
    echo "ALSA development libraries found!"
    echo ""

    echo "Cleaning..."
    cargo clean 2>/dev/null || true

    echo ""
    echo "Checking compilation (with audio feature)..."
    if cargo check --features audio; then
        echo -e "${GREEN}✓ Audio build check PASSED${NC}"
    else
        echo -e "${RED}✗ Audio build check FAILED${NC}"
        exit 1
    fi

    echo ""
    echo "Building release binary (with audio)..."
    if cargo build --release --features audio; then
        echo -e "${GREEN}✓ Audio release build PASSED${NC}"
    else
        echo -e "${RED}✗ Audio release build FAILED${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ ALSA development libraries not found${NC}"
    echo ""
    echo "To test audio builds, install ALSA dev libs:"
    echo "  sudo apt-get install -y pkg-config libasound2-dev"
    echo ""
    echo -e "${YELLOW}Skipping audio build test${NC}"
fi

# ── Summary ────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ ALL BUILD TESTS PASSED!                               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Summary:"
echo "  ✓ Default build (no audio) works"
echo "  ✓ Database tests pass"
if pkg-config --exists alsa 2>/dev/null; then
    echo "  ✓ Audio build works"
else
    echo "  ⊘ Audio build skipped (ALSA not installed)"
fi
echo ""
echo "Next steps:"
echo "  1. Run the app: cd .. && npm run tauri dev"
echo "  2. Test database persistence"
echo "  3. Test Quran API caching"
echo ""
