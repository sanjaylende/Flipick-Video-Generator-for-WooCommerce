#!/usr/bin/env bash
# Builds dist/flipick-video-generator.zip (needs only Node).
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/build-zip.js"
