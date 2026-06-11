#!/usr/bin/env bash
# Convert approved heroes to WebP and place them in public/images/heroes/.
# Then we'll update src= references in the page files.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC="public/images/heroes-generated"
OUT="public/images/heroes"
mkdir -p "$OUT"

# (source-png-without-extension, output-name-without-extension)
declare -A MAPPING=(
  ["patient-home-v3-figure"]="patient-home"
  ["b2b-home-v3"]="b2b-home"
  ["b2b-solutions"]="b2b-solutions"
  ["b2b-connect"]="b2b-connect"
  ["b2b-lexi"]="b2b-lexi"
  ["b2b-rcm"]="b2b-rcm"
  ["b2b-how-it-works"]="b2b-how-it-works"
)

for src_name in "${!MAPPING[@]}"; do
  out_name="${MAPPING[$src_name]}"
  src="$SRC/$src_name.png"
  out="$OUT/$out_name.webp"

  if [[ ! -f "$src" ]]; then
    echo "MISSING: $src" >&2
    exit 1
  fi

  cwebp -q 85 -m 6 "$src" -o "$out" 2>&1 | tail -1
  bytes_in=$(wc -c < "$src")
  bytes_out=$(wc -c < "$out")
  printf '%-30s %7d -> %7d bytes (%.0f%% reduction)\n' \
    "$out_name.webp" "$bytes_in" "$bytes_out" \
    "$(awk "BEGIN { print (1 - $bytes_out/$bytes_in)*100 }")"
done
