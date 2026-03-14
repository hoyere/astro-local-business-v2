#!/usr/bin/env bash
# Repeatedly runs fetch_images.py every hour until all images are downloaded.
# Run with: nohup bash docs/html-base/scripts/fetch_images_loop.sh &
#
# Logs to: docs/html-base/scripts/fetch_images_loop.log
# Stop with: kill $(cat docs/html-base/scripts/fetch_images_loop.pid)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
LOG="$SCRIPT_DIR/fetch_images_loop.log"
PID_FILE="$SCRIPT_DIR/fetch_images_loop.pid"

echo $$ > "$PID_FILE"

cd "$PROJECT_ROOT"

MAX_RUNS=12
SLEEP_SECONDS=3600  # 1 hour

for i in $(seq 1 $MAX_RUNS); do
  echo "" >> "$LOG"
  echo "=== Run $i of $MAX_RUNS — $(date) ===" >> "$LOG"

  python3 docs/html-base/scripts/fetch_images.py \
    --output src/assets/images/photos \
    --attribution ATTRIBUTION.md \
    2>&1 | tee -a "$LOG" | tail -5

  # Check how many are still missing
  TOTAL=$(python3 -c "import json; d=json.load(open('$SCRIPT_DIR/preprocessed/image-config.json')); print(len(d))")
  HAVE=$(ls src/assets/images/photos/*.jpg 2>/dev/null | wc -l)
  REMAINING=$((TOTAL - HAVE))

  echo "Progress: $HAVE / $TOTAL downloaded ($REMAINING remaining)" | tee -a "$LOG"

  if [ "$REMAINING" -le 0 ]; then
    echo "All images downloaded. Done!" | tee -a "$LOG"
    rm -f "$PID_FILE"
    exit 0
  fi

  if [ "$i" -lt "$MAX_RUNS" ]; then
    echo "Sleeping 1 hour before next attempt..." | tee -a "$LOG"
    sleep $SLEEP_SECONDS
  fi
done

echo "Completed $MAX_RUNS runs. $REMAINING images still missing (may need simpler queries)." | tee -a "$LOG"
rm -f "$PID_FILE"
