#!/usr/bin/env bash
# fonts/subset-fonts.sh
# Usage: place original font files (TTF/OTF) into fonts/source/ then run this script to produce subsetted .woff2 files
# Requires: fonttools (pyftsubset), woff2 (woff2_compress)
# Example install (mac/linux):
#   pip install fonttools
#   git clone https://github.com/google/woff2.git && cd woff2 && make

set -euo pipefail

SRC_DIR="fonts/source"
OUT_DIR="fonts"

mkdir -p "$SRC_DIR"
mkdir -p "$OUT_DIR"

echo "Looking for source fonts in $SRC_DIR"

# Map of expected source filenames to output names used by the site
declare -A FILES=(
  ["EBGaramond-Regular.ttf"]="EBGaramond-Regular.woff2"
  ["EBGaramond-Bold.ttf"]="EBGaramond-Bold.woff2"
  ["PlayfairDisplay-Regular.ttf"]="PlayfairDisplay-Regular.woff2"
  ["CormorantGaramond-Regular.ttf"]="CormorantGaramond-Regular.woff2"
  ["Lora-Regular.ttf"]="Lora-Regular.woff2"
)

# Subset options: Latin + punctuation, basic set of glyphs to reduce size
SUBSET_OPTS="--flavor=woff2 --with-zopfli --unicodes=U+000-5FF --layout-features='*' --recommended-glyphs"

for src in "${!FILES[@]}"; do
  if [ -f "$SRC_DIR/$src" ]; then
    out="${FILES[$src]}"
    echo "Subsetting $src -> $OUT_DIR/$out"
    # Use pyftsubset to subset and output woff2 directly where supported
    pyftsubset "$SRC_DIR/$src" $SUBSET_OPTS --output-file="$OUT_DIR/tmp-${out%.*}.woff2" || {
      echo "pyftsubset failed or not available; attempting TTF->WOFF2 via woff2_compress"
      # fallback: copy source then compress (requires woff2_compress)
      cp "$SRC_DIR/$src" "$OUT_DIR/tmp-${src%.*}.ttf"
      woff2_compress "$OUT_DIR/tmp-${src%.*}.ttf" || true
      # rename compressed file if present
      if [ -f "$OUT_DIR/tmp-${src%.*}.ttf.woff2" ]; then mv "$OUT_DIR/tmp-${src%.*}.ttf.woff2" "$OUT_DIR/$out"; fi
    }
    # if pyftsubset produced file rename to target
    if [ -f "$OUT_DIR/tmp-${out%.*}.woff2" ]; then mv "$OUT_DIR/tmp-${out%.*}.woff2" "$OUT_DIR/$out"; fi
  else
    echo "Source font missing: $SRC_DIR/$src — skipping"
  fi
done

echo "Done. Produced files (if source fonts were present):"
ls -lh $OUT_DIR/*.woff2 || true

cat <<'EOF'
Next steps:
- Upload the generated .woff2 files into the repository under /fonts/ (they are already placed there by this script if you run it locally).
- Commit them to git so the site can serve them.
- Alternatively, if you'd like me to fetch and add common webfont builds, say so and I will attempt to add licensed fonts from known CDNs where permitted.
EOF
