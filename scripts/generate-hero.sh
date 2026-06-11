#!/usr/bin/env bash
# Generate a hero image with Gemini 2.5 Flash Image ("Nano Banana").
# Usage:
#   scripts/generate-hero.sh "<prompt>" <output.png> [aspect-ratio]
# Defaults to 16:9. API key is read from ~/.gemini_api_key (chmod 600).

set -euo pipefail

PROMPT="${1:-}"
OUTPUT="${2:-}"
ASPECT="${3:-16:9}"

if [[ -z "$PROMPT" || -z "$OUTPUT" ]]; then
  echo "Usage: $0 \"<prompt>\" <output.png> [aspect-ratio]" >&2
  exit 1
fi

KEY_FILE="${HOME}/.gemini_api_key"
if [[ ! -r "$KEY_FILE" ]]; then
  echo "API key not found at $KEY_FILE" >&2
  exit 1
fi
API_KEY="$(tr -d '[:space:]' < "$KEY_FILE")"

MODEL="gemini-2.5-flash-image"
ENDPOINT="https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent"

REQUEST_JSON="$(jq -n \
  --arg prompt "$PROMPT" \
  --arg ratio "$ASPECT" \
  '{
    contents: [{ parts: [{ text: $prompt }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: { aspectRatio: $ratio }
    }
  }')"

TMP_RESP="$(mktemp)"
trap 'rm -f "$TMP_RESP"' EXIT

HTTP_STATUS="$(curl -sS -o "$TMP_RESP" -w '%{http_code}' \
  -X POST "$ENDPOINT" \
  -H "x-goog-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "$REQUEST_JSON")"

if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "API call failed with status $HTTP_STATUS:" >&2
  cat "$TMP_RESP" >&2
  exit 1
fi

B64="$(jq -r '.candidates[0].content.parts[]? | select(.inlineData? // .inline_data?) | (.inlineData.data // .inline_data.data)' "$TMP_RESP" | head -n1)"

if [[ -z "$B64" || "$B64" == "null" ]]; then
  echo "No image data in response:" >&2
  jq '.' "$TMP_RESP" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT")"
echo "$B64" | base64 -d > "$OUTPUT"

BYTES="$(wc -c < "$OUTPUT")"
printf 'Wrote %s (%s bytes, aspect %s)\n' "$OUTPUT" "$BYTES" "$ASPECT"
