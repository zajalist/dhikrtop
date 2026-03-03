#!/bin/bash

# Dhikrtop Testing Script
# Runs all tests for database, API, and hooks
#
# Usage:
#   ./run-tests.sh          (run all tests)
#   ./run-tests.sh rust     (rust tests only)
#   ./run-tests.sh ts       (typescript tests only)
#   ./run-tests.sh coverage (with coverage report)

set -e

echo "╔════════════════════════════════════════╗"
echo "║  Dhikrtop Test Suite                   ║"
echo "║  Phase 0: Database & Quran API         ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_type=${1:-all}
coverage=${2:-}

# Function to print section
print_section() {
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Function to run command and report
run_test() {
    local name=$1
    local cmd=$2

    echo -e "${YELLOW}Running:${NC} $name"
    if eval "$cmd"; then
        echo -e "${GREEN}✓ $name${NC}\n"
        return 0
    else
        echo -e "${RED}✗ $name${NC}\n"
        return 1
    fi
}

# Tests
tests_passed=0
tests_failed=0

# ── Rust Tests ────────────────────────────────────────────────────────

if [ "$test_type" = "all" ] || [ "$test_type" = "rust" ]; then
    print_section "Rust Tests (Database Module)"

    cd src-tauri

    if run_test "Database schema tests" "cargo test --lib db::tests::test_schema_initialization"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi

    if run_test "User CRUD operations" "cargo test --lib db::tests::test_user"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi

    if run_test "Adhkar progress tests" "cargo test --lib db::tests::test_adhkar"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi

    if run_test "Quran progress tests" "cargo test --lib db::tests::test_quran"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi

    if run_test "Voice recording tests" "cargo test --lib db::tests::test_voice"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi

    if run_test "All Rust database tests" "cargo test --lib db"; then
        ((tests_passed++))
    else
        ((tests_failed++))
    fi

    cd ..
fi

# ── TypeScript Tests ────────────────────────────────────────────────────

if [ "$test_type" = "all" ] || [ "$test_type" = "ts" ]; then
    print_section "TypeScript Tests (React Hooks)"

    if [ "$coverage" = "coverage" ]; then
        run_test "useDatabase Hook (with coverage)" "npm run test:coverage -- tests/useDatabase.test.ts" && ((tests_passed++)) || ((tests_failed++))
        run_test "useQuranAPI Hook (with coverage)" "npm run test:coverage -- tests/useQuranAPI.test.ts" && ((tests_passed++)) || ((tests_failed++))
    else
        run_test "useDatabase Hook tests" "npm run test -- tests/useDatabase.test.ts" && ((tests_passed++)) || ((tests_failed++))
        run_test "useQuranAPI Hook tests" "npm run test -- tests/useQuranAPI.test.ts" && ((tests_passed++)) || ((tests_failed++))
    fi

    if [ "$coverage" != "coverage" ]; then
        run_test "All TypeScript tests" "npm run test" && ((tests_passed++)) || ((tests_failed++))
    fi
fi

# ── Summary ────────────────────────────────────────────────────────────

print_section "Test Summary"

echo -e "${GREEN}✓ Tests Passed: $tests_passed${NC}"
echo -e "${RED}✗ Tests Failed: $tests_failed${NC}"
echo ""

if [ $tests_failed -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════${NC}"
    echo -e "${GREEN}All tests passed! ✅${NC}"
    echo -e "${GREEN}════════════════════════════════════════${NC}"

    if [ "$coverage" = "coverage" ]; then
        echo ""
        echo "Coverage reports generated in:"
        echo "  - coverage/ (TypeScript)"
        echo "  - target/coverage/ (Rust)"
    fi

    exit 0
else
    echo -e "${RED}════════════════════════════════════════${NC}"
    echo -e "${RED}Some tests failed ❌${NC}"
    echo -e "${RED}════════════════════════════════════════${NC}"
    exit 1
fi
