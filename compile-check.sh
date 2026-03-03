#!/bin/bash
cd "$(dirname "$0")/src-tauri"
echo "🔨 Compiling..."
cargo build --release 2>&1 | tail -30
