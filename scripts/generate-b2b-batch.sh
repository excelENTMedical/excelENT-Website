#!/usr/bin/env bash
# Batch-generate the B2B hero set. All at 4:3, since every B2B hero slot
# uses aspect-[4/3] on the right column (~40vw on desktop).
set -euo pipefail

cd "$(dirname "$0")/.."
HERE="public/images/heroes-generated"
PREVIEW="/opt/bitnami/wordpress/hero-preview"
mkdir -p "$HERE" "$PREVIEW"

run() {
  local out="$1"; shift
  local prompt="$1"; shift
  echo ""
  echo "=== $out ==="
  ./scripts/generate-hero.sh "$prompt" "$HERE/$out" 4:3
  cp "$HERE/$out" "$PREVIEW/"
}

# 1) /b2b — flagship: thriving practice, premium feel, doctor walking confidently
run "b2b-home.png" "Interior of a modern, premium ENT practice during a busy clinic day. Clean architectural lines, wood and brushed-steel accents, high-end exam equipment in soft focus background. Wide hallway perspective with warm natural light pouring through tall windows. A doctor in a clean white coat walks confidently away from camera down the hallway, only their back visible. Sense of a thriving, well-run practice. Photographic, naturalistic color, premium medical aesthetic. No text, no logos."

# 2) /b2b/solutions — physician's workspace, sense of operational control
run "b2b-solutions.png" "An ENT physician's workspace at a modern clinic. Clean glass desk with a large display showing a soft, abstract dashboard interface (no readable text), a stethoscope, and a tablet. Warm window light, healthy plants, organized and intentional. No people. Photographic, premium professional aesthetic, mid-distance, slightly elevated angle. No text, no logos."

# 3) /b2b/solutions/connect — bright clinic waiting area, busy & full
run "b2b-connect.png" "Bright modern ENT clinic waiting area at midday: comfortable contemporary seating, soft pendant lighting, a glass partition behind a check-in counter. A few seated figures in soft motion blur to suggest a busy, full clinic. Plants, warm wood, natural light through tall windows. Photographic, premium clinic aesthetic, mid-distance. People kept blurred so no faces are sharp. No text, no logos."

# 4) /b2b/solutions/lexi — modern phone/headset, professional clinical office
run "b2b-lexi.png" "A close mid-distance shot of a modern medical office desk during a quiet clinical moment: a sleek wireless headset resting beside a tablet on a clean wood-grain surface, soft natural light, a subtle plant in the background, the edge of a stethoscope visible. Suggests calm, professional voice communication. No people. Photographic, premium professional aesthetic, shallow depth of field. No text, no logos."

# 5) /b2b/solutions/rcm — billing operations workspace, financial clarity
run "b2b-rcm.png" "A modern medical billing operations workspace: a large curved monitor with a clean abstract financial dashboard (no readable text or numbers), neat papers organized in trays, an open notebook with a pen. Warm window light, premium minimal aesthetic. Sense of order, control, financial clarity. No people. Photographic, mid-distance, slightly elevated angle. No text, no logos."

# 6) /b2b/how-it-works — collaborative partnership moment
run "b2b-how-it-works.png" "Two professionals — one in business attire, one in a clinical white coat — viewed from behind, leaning in over a tablet on a modern desk in a bright office. Collaborative posture. Soft natural light from a tall window. No faces visible. Photographic, naturalistic, sense of strategic partnership and shared planning. Premium professional aesthetic. No text, no logos."

echo ""
echo "Done. Preview at https://excelentmedical.com/hero-preview/<filename>"
