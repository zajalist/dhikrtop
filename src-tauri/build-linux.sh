#!/bin/bash
# Quick build helper for Linux.
# - Builds without audio by default (no ALSA dev deps required)
# - Set WITH_AUDIO=1 to build with voice recording support

set -euo pipefail

cd "$(dirname "$0")"

if [[ "${WITH_AUDIO:-0}" == "1" ]]; then
  echo "Building with audio feature (requires libasound2-dev + pkg-config)"
  cargo build --release --features audio
else
  echo "Building without audio feature (no ALSA dev deps required)"
  cargo build --release
fi
