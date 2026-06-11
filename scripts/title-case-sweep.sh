#!/usr/bin/env bash
# One-shot: convert sentence-case card/tile titles to Title Case across B2B.
# AP-style: capitalize first/last word + major words; lowercase a/an/the/and/
# but/or/for/nor + short prepositions <=3 letters (at/by/in/of/on/to/up).
# Each substitution is a literal string -> literal string, so we don't risk
# false positives from regex. Run once and delete.
set -euo pipefail

cd "$(dirname "$0")/.."

# Format: "RELATIVE/PATH:OLD STRING:NEW STRING"
declare -a EDITS=(
  # solutions/connect — capabilities (4)
  "src/app/b2b/solutions/connect/page.tsx:Fast access:Fast Access"
  "src/app/b2b/solutions/connect/page.tsx:Efficient visits:Efficient Visits"
  "src/app/b2b/solutions/connect/page.tsx:Minimally invasive options:Minimally Invasive Options"
  "src/app/b2b/solutions/connect/page.tsx:Practice growth support:Practice Growth Support"
  # solutions/connect — business impact (4)
  "src/app/b2b/solutions/connect/page.tsx:Improved patient experience:Improved Patient Experience"
  "src/app/b2b/solutions/connect/page.tsx:Stronger practice brand:Stronger Practice Brand"
  "src/app/b2b/solutions/connect/page.tsx:Higher-quality patient mix:Higher-Quality Patient Mix"
  "src/app/b2b/solutions/connect/page.tsx:Improved staff morale:Improved Staff Morale"

  # solutions/lexi — audience (3)
  "src/app/b2b/solutions/lexi/page.tsx:Faster help, fewer headaches:Faster Help, Fewer Headaches"
  "src/app/b2b/solutions/lexi/page.tsx:Less mundane work, more meaningful moments:Less Mundane Work, More Meaningful Moments"
  "src/app/b2b/solutions/lexi/page.tsx:Smarter operations, real-time insight:Smarter Operations, Real-Time Insight"
  # solutions/lexi — HIPAA (2)
  "src/app/b2b/solutions/lexi/page.tsx:Secure data handling:Secure Data Handling"
  "src/app/b2b/solutions/lexi/page.tsx:Controlled data flow:Controlled Data Flow"

  # solutions/rcm — compliance (3)
  "src/app/b2b/solutions/rcm/page.tsx:State medical board actions:State Medical Board Actions"
  "src/app/b2b/solutions/rcm/page.tsx:Malpractice exposure:Malpractice Exposure"
  "src/app/b2b/solutions/rcm/page.tsx:Audit triggers:Audit Triggers"
  # solutions/rcm — business impact (4)
  "src/app/b2b/solutions/rcm/page.tsx:Stronger cash flow:Stronger Cash Flow"
  "src/app/b2b/solutions/rcm/page.tsx:Less administrative burden:Less Administrative Burden"
  "src/app/b2b/solutions/rcm/page.tsx:Lower financial risk:Lower Financial Risk"
  "src/app/b2b/solutions/rcm/page.tsx:Real visibility:Real Visibility"

  # products/allergyx (4)
  "src/app/b2b/products/allergyx/page.tsx:Designed around patient compliance:Designed Around Patient Compliance"
  "src/app/b2b/products/allergyx/page.tsx:Supports better surgical outcomes:Supports Better Surgical Outcomes"
  "src/app/b2b/products/allergyx/page.tsx:Approved device:Approved Device"
  "src/app/b2b/products/allergyx/page.tsx:Patient education built-in:Patient Education Built-In"

  # products/shaver-blades (4)
  "src/app/b2b/products/shaver-blades/page.tsx:Engineered for tissue precision:Engineered for Tissue Precision"
  "src/app/b2b/products/shaver-blades/page.tsx:Compatible with major systems:Compatible With Major Systems"
  "src/app/b2b/products/shaver-blades/page.tsx:Available now:Available Now"
  "src/app/b2b/products/shaver-blades/page.tsx:Trained sales support:Trained Sales Support"

  # products/bb8 — six functions (6)
  "src/app/b2b/products/bb8/page.tsx:Light-guided navigation:Light-Guided Navigation"
  "src/app/b2b/products/bb8/page.tsx:No navigation requirements:No Navigation Requirements"
  "src/app/b2b/products/bb8/page.tsx:Navigation compatible:Navigation Compatible"
  "src/app/b2b/products/bb8/page.tsx:Tactile feedback:Tactile Feedback"
  "src/app/b2b/products/bb8/page.tsx:Malleable tip:Malleable Tip"
  "src/app/b2b/products/bb8/page.tsx:Integrated suction & irrigation:Integrated Suction & Irrigation"
  # products/bb8 — sales support (4)
  "src/app/b2b/products/bb8/page.tsx:Live trials in your office:Live Trials in Your Office"
  "src/app/b2b/products/bb8/page.tsx:Anesthesia protocol training:Anesthesia Protocol Training"
  "src/app/b2b/products/bb8/page.tsx:Pre-op, intra-op, and post-op flow review:Pre-Op, Intra-Op, and Post-Op Flow Review"
  "src/app/b2b/products/bb8/page.tsx:Ongoing provider training:Ongoing Provider Training"

  # how-it-works — differentiators (3)
  "src/app/b2b/how-it-works/page.tsx:Modular by design:Modular by Design"
  "src/app/b2b/how-it-works/page.tsx:Built for ENT specifically:Built for ENT Specifically"
  "src/app/b2b/how-it-works/page.tsx:Aligned incentives:Aligned Incentives"

  # request-demo — steps + trust headings (5)
  "src/app/b2b/request-demo/page.tsx:We review your request:We Review Your Request"
  "src/app/b2b/request-demo/page.tsx:We reach out within one business day:We Reach Out Within One Business Day"
  "src/app/b2b/request-demo/page.tsx:We run a working session, not a sales pitch:We Run a Working Session, Not a Sales Pitch"
  "src/app/b2b/request-demo/page.tsx:Built by a practicing otolaryngologist:Built by a Practicing Otolaryngologist"
  "src/app/b2b/request-demo/page.tsx:Independent-practice friendly:Independent-Practice Friendly"
)

count=0
for edit in "${EDITS[@]}"; do
  IFS=':' read -r path old new <<< "$edit"
  if grep -qF "$old" "$path"; then
    # Use a non-/ delimiter to avoid issues with the / in slashes (none in our strings, but safe)
    perl -i -pe "s/\Q$old\E/$new/g" "$path"
    count=$((count+1))
    printf '  %-55s %s\n' "$(basename "$(dirname "$path")")/$(basename "$path")" "$new"
  else
    echo "  SKIP (not found): $path :: $old" >&2
  fi
done

echo ""
echo "Applied $count edits."
