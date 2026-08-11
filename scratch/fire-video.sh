#!/usr/bin/env bash
set -u

# Setup output directories
OUT="scratch/outputs/batch-01-cinematics"
mkdir -p "$OUT"

fire() {
  local SHOT_NAME="$1"
  local PROMPT_FILE="$2"
  local REFS="$3"
  local GENRE="${4:-epic}" # Default to epic genre
  
  # Strip '@' symbols before sending to CLI
  local PROMPT
  PROMPT=$(sed 's/@//g' "$PROMPT_FILE")
  
  echo "Firing generation: $SHOT_NAME"
  
  # Running Higgsfield generate command
  higgsfield generate create seedance_2_0 \
    --prompt "$PROMPT" $REFS \
    --duration 15 \
    --resolution 1080p \
    --aspect_ratio 9:16 \
    --genre "$GENRE" \
    --mode std \
    --wait --wait-timeout 30m 2>&1 | tail -5 > "$OUT/$SHOT_NAME.txt"
    
  URL=$(grep -oE 'https://[^ ]+\.mp4' "$OUT/$SHOT_NAME.txt" || true)
  
  if [ -n "$URL" ]; then
    curl -s "$URL" -o "$OUT/$SHOT_NAME.mp4"
    echo "SUCCESS: Saved to $OUT/$SHOT_NAME.mp4"
  else
    echo "FAILED: $SHOT_NAME"
    cat "$OUT/$SHOT_NAME.txt"
  fi
}

# Run the fire function with the script arguments
fire "$1" "$2" "$3" "${4:-epic}"
