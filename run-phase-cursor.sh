#!/usr/bin/env bash
# run-phase-cursor.sh — same harness as run-phase.sh, but drives Cursor CLI (`agent`).
# Each task: work → handoff → commit → push.
#
# Usage:
#   ./run-phase-cursor.sh <num_tasks>                    # commit + push (default)
#   RUN_PHASE_NO_PUSH=1 ./run-phase-cursor.sh <num_tasks> # commit, skip push
#
# Prerequisites:
#   - Cursor CLI installed (~/.local/bin/agent); ensure PATH includes it or run from a shell
#     where `agent` resolves (https://cursor.com/docs/cli/installation).
#   - Authenticate once: `agent login` (or set CURSOR_API_KEY for headless/CI).
#
# Run from your project root (where /ai/ lives).
# Human-only steps (Azure, DNS, secrets, Postmark): see /ai/TASKS.md
# "Human pairing vs unattended harness".

set -euo pipefail

# Prefer Cursor CLI on PATH (install default: ~/.local/bin).
export PATH="${HOME}/.local/bin:${PATH}"
if ! command -v agent >/dev/null 2>&1; then
  echo "error: 'agent' not found. Install Cursor CLI and add ~/.local/bin to PATH." >&2
  echo "  curl https://cursor.com/install -fsS | bash" >&2
  exit 127
fi

TASKS=${1:?Usage: $0 <num_tasks>   e.g.  ./run-phase-cursor.sh 8}

LOG_DIR="ai/logs/run_cursor_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$LOG_DIR"

START_PROMPT="Please read /ai/START_HERE.md and follow it. Read /ai/TASKS.md section 'Human pairing vs unattended harness' (task matrix) for the task or batch IDs in HANDOFF.md. If any constituent work is Unattended: No, stop after documenting what the human must do and set HANDOFF to Blocked — do not claim Done or enter live secrets from the harness. If Unattended: Partial, implement only the automatable parts and list remaining human steps in HANDOFF before marking Done. Otherwise pick up the next task per HANDOFF.md."
END_PROMPT="Please read /ai/templates/CHAT_END_PROMPT.md and follow it."

# Headless automation: trust repo, allow tool/shell actions without interactive approval.
# Cursor CLI has no equivalent to Claude Code's --max-turns; omit here.
CURSOR_AGENT_FLAGS=(
  --trust
  --force
  --sandbox
  disabled
  --output-format
  text
)

# Optional: pin model, e.g. RUN_PHASE_CURSOR_MODEL="composer-2"
if [ -n "${RUN_PHASE_CURSOR_MODEL:-}" ]; then
  CURSOR_AGENT_FLAGS+=(--model "$RUN_PHASE_CURSOR_MODEL")
fi

echo "Starting Cursor phase run: $TASKS tasks. Logs -> $LOG_DIR"

for i in $(seq 1 "$TASKS"); do
  printf '\n========== Task %d of %d ==========\n' "$i" "$TASKS"

  echo "[$(date +%H:%M:%S)] Step 1/3: working on next task (agent -p)..."
  agent -p "${CURSOR_AGENT_FLAGS[@]}" -- "$START_PROMPT" \
    2>&1 | tee "$LOG_DIR/task_${i}_work.log"

  echo "[$(date +%H:%M:%S)] Step 2/3: writing handoff (agent --continue -p)..."
  agent --continue -p "${CURSOR_AGENT_FLAGS[@]}" -- "$END_PROMPT" \
    2>&1 | tee "$LOG_DIR/task_${i}_handoff.log"

  echo "[$(date +%H:%M:%S)] Step 3/3: staging + committing + pushing..."
  if [ -n "$(git status --porcelain)" ]; then
    # Pull a subject line from the handoff log; fall back to generic.
    SUBJECT=$(awk '
  /^[*]*Work completed:[*]*/ {
    sub(/^[*]*Work completed:[*]*[[:space:]]*/, "")
    if (length($0) > 0) { print; exit }
    inheader = 1; next
  }
  inheader && /^[[:space:]]*$/ { next }
  inheader { sub(/^[*-][[:space:]]*/, ""); print; exit }
' "$LOG_DIR/task_${i}_handoff.log" 2>/dev/null \
| sed 's/`//g; s/\*\*//g' \
| cut -c1-72 || true)
    [ -z "$SUBJECT" ] && SUBJECT="Phase task $i (auto, Cursor)"

    git add -A
    git commit -m "$SUBJECT" \
               -m "Automated commit by run-phase-cursor.sh. Log: $LOG_DIR/task_${i}_handoff.log"
    echo "[$(date +%H:%M:%S)] 📝 Committed: $SUBJECT"

    if [ "${RUN_PHASE_NO_PUSH:-0}" = "1" ]; then
      echo "[$(date +%H:%M:%S)] ⏭  RUN_PHASE_NO_PUSH=1 set — skipping push."
    else
      echo "[$(date +%H:%M:%S)] ⬆  Pushing to origin..."
      if ! git push; then
        echo
        echo "[$(date +%H:%M:%S)] ❌ Push failed for task $i (commit: $SUBJECT)." >&2
        echo "Stopping phase run so the local branch does not drift from origin." >&2
        echo "Resolve the push (auth / network / non-fast-forward) and re-run." >&2
        echo "Log: $LOG_DIR/task_${i}_handoff.log" >&2
        exit 1
      fi
      echo "[$(date +%H:%M:%S)] ✅ Pushed to origin."
    fi
  else
    echo "[$(date +%H:%M:%S)] ℹ️  No changes after task $i; nothing to commit or push."
  fi

  echo "[$(date +%H:%M:%S)] ✅ Task $i complete."
done

echo
echo "🎉 Cursor phase complete: $TASKS tasks done."
echo "Logs: $LOG_DIR"
