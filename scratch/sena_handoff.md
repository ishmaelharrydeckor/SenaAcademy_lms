# Sena Academy Cohort 2 Campaign — Handoff Brief

Use this document as the single source of truth for running video generations for the Cohort 2 launch campaign.

---

## Project Overview

*   **Project**: Sena Academy Cohort 2 Launch
*   **Brand**: Sena Academy Coding Bootcamp
*   **Concept**: Building automated systems and deploying real web/mobile apps in public.
*   **Target Offering**: Web Development (Web Dev) & Application Development (App Dev).
*   **Settings**: Cozy night study desk, Accra coworking spaces.

---

## Talent & Reference UUIDs

> 💡 **Action Item**: Run `higgsfield upload create <file>` for your character photos and paste the generated UUIDs here.

### Model 1: Kofi (`@kofi`)
| File | UUID | Role / Reference Type |
|------|------|-----------------------|
| `kofi-front-portrait.png` | `a52040b2-c663-4f57-babf-398c514996b9` | Character Sheet (Identity) |
| `kofi-black-hoodie-whitebg.png` | `{{PASTE_UUID_HERE}}` | Outfit Reference |

### Model 2: Ama (`@ama`)
| File | UUID | Role / Reference Type |
|------|------|-----------------------|
| `ama-front-portrait.png` | `{{PASTE_UUID_HERE}}` | Character Sheet (Identity) |
| `ama-knit-sweater-whitebg.png` | `{{PASTE_UUID_HERE}}` | Outfit Reference |

---

## Ready-to-Use Ref Stacks

Use these stacks directly in your commands once UUIDs are populated:

*   **Kofi Solo (No Start Image)**:
    ```bash
    --image <KOFI_CHAR_UUID> --image <KOFI_OUTFIT_UUID>
    ```
*   **Kofi Solo (With Start Image Still)**:
    ```bash
    --start-image <APPROVED_STILL_UUID> --image <KOFI_CHAR_UUID> --image <KOFI_OUTFIT_UUID>
    ```
*   **Ama Solo**:
    ```bash
    --image <AMA_CHAR_UUID> --image <AMA_OUTFIT_UUID>
    ```

---

## Standard CLI Fire Script

Save this script to `scratch/fire-video.sh` to run generations automatically. It will save outputs to `scratch/outputs/`.

```bash
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
```
