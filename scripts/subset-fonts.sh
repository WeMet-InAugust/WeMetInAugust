#!/usr/bin/env bash
# scripts/subset-fonts.sh
# Requires: fonttools (pyftsubset) - pip install fonttools
# Usage: ./scripts/subset-fonts.sh /path/to/source-font.ttf "U+0000-00FF, U+0100-017F" output.woff2

set -euo pipefail

if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <input-font.ttf|otf> <unicode-range> <output.woff2>"
  echo "Example: $0 source/EBGaramond-Regular.ttf 'U+0020-007E' fonts/EBGaramond-Regular.woff2"
  exit 2
fi

INPUT="$1"
RANGE="$2"
OUT="$3"

echo "Subsetting $INPUT -> $OUT (range: $RANGE)"

pyftsubset "$INPUT" --output-file="$OUT" --flavor=woff2 --unicodes="$RANGE" --recommended-glyphs --desubroutinize --layout-features='*' --no-hinting

echo "Done: $OUT"
