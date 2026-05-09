Stop work and prepare the project handoff.

## Hard rules (read first)

These rules exist because past CHAT_END passes have silently lost planning
content. Do not skip them.

1. **Sync first, edit second.** Before editing any planning file, run
   `git fetch && git status` to confirm whether `origin/main` has moved
   since this session started. If origin is ahead, run
   `git pull --rebase origin main` to bring those commits in. Resolve any
   conflicts before editing; do NOT overwrite files that were modified on
   the remote.
2. **Edit the delta, not the file.** Append your CHAT_END entry to
   DONE_LOG.md; update only the specific lines in CURRENT_STATE.md, TASKS.md,
   HANDOFF.md that changed this session. Never rewrite a planning file
   end-to-end. If you are tempted to "tidy" the file, stop — that is how
   we lose ADRs and DONE_LOG entries.
3. **Read the file you are editing first.** Open the current contents and
   verify the lines you intend to change still match. If they don't, the
   file changed since you last looked; re-read and re-plan the edit.
4. **Verify after edit.** After each edit, re-read the surrounding section
   to confirm no unintended content was dropped.
5. **`gh run list` before declaring a phase Done.** Capture
   **`gh run list --branch main --limit 1 --json status,conclusion,headSha`**
   in the DONE_LOG CHAT_END entry (or explicitly document that **`gh`** is not
   available and why). **Do not claim "Phase N complete"** unless the latest
   `main` workflow run shows **`conclusion`** is **`success`**. When CI is
   red/pending/skipped (`null`/`""`), STOP and describe the blocker for humans.

## What to update

Update or provide exact patches for:

1. `/ai/CURRENT_STATE.md`
2. `/ai/TASKS.md`
3. `/ai/HANDOFF.md`
4. `/ai/DONE_LOG.md`

Also update these if relevant:

- `/ai/ARCHITECTURE.md`
- `/ai/ROADMAP.md`
- `/ai/TESTING.md`
- `/ai/DEPLOYMENT.md`
- `/ai/DECISIONS.md`

Final response must include:

- Work completed
- Files changed
- Tests/checks run
- Known issues
- Project files updated
- Next recommended task
- Confirmation that no Windows paths or Docker-for-app usage was introduced
