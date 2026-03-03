#!/bin/bash
set -euo pipefail

cd /home/zajalist/projects/dhikrtop/src-tauri
cargo clean
cargo test

cd /home/zajalist/projects/dhikrtop
npm test --silent || true
