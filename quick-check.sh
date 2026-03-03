#!/bin/bash
# Quick compile check
cd "$(dirname "$0")/src-tauri"
echo "Checking compilation..."
cargo check 2>&1 | tail -20
