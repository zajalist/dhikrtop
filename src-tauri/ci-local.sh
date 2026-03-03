#!/bin/bash
set -euo pipefail

cd /home/zajalist/projects/dhikrtop/src-tauri
cargo clean
cargo check
cargo test
