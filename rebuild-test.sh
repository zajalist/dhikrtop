#!/bin/bash
set -e
cd /home/zajalist/projects/dhikrtop
echo "🔨 Rebuilding Tauri app..."
npm run tauri dev 2>&1 | head -100
