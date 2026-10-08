#!/usr/bin/env bash
# Builds dist/flipick-video-generator.zip (top-level folder "flipick-video-generator", as WordPress expects).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."
rm -rf dist && mkdir -p dist/flipick-video-generator
tar cf - --exclude=dist --exclude=.git --exclude=bin --exclude=.gitignore --exclude=.gitattributes . | (cd dist/flipick-video-generator && tar xf -)
(cd dist && zip -qr flipick-video-generator.zip flipick-video-generator && rm -rf flipick-video-generator)
echo "Built dist/flipick-video-generator.zip"
