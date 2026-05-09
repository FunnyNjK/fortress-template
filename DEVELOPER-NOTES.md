# Developer Notes

> **AI Notice — Do not modify this file.**
> AI assistants must NOT edit, update, change, alter, or delete this file
> unless the developer explicitly asks for changes by name. This file is
> developer-maintained reference material, not part of the project planning
> system. If you think something here is wrong or outdated, flag it in chat
> rather than editing it.

---

## Context limits — how to think about them

Both Claude Code (in VS Code) and chat-based AI tools have context window
limits. The `/ai` workflow files are designed to handle this — you don't
have to fight the limits, you just have to respect the workflow.

### Claude Code in VS Code

- Context window is ~200K tokens (roughly 150K words of effective working memory).
- Claude Code auto-compacts older context when you approach the limit. You'll
  see a "Context compacted" message when it happens.
- Manual commands:
  - `/compact` — summarize and continue in the same session
  - `/clear` — wipe context and start fresh in the same panel
  - `/resume` — pick up a previous conversation

### Chat-based AI (Cowork, ChatGPT, Codex CLI, etc.)

- Same kind of context limit, similar order of magnitude.
- After many back-and-forth turns, older messages drop out of effective context.
- For a new project phase or major topic shift, start a fresh chat.

## How to use the `/ai` workflow with context limits

Treat each task in `/ai/TASKS.md` as a fresh AI session.

1. Open a new Claude Code session (or `/clear` an existing one).
2. Have the AI read `/ai/START_HERE.md` first (which loads the rest of the
   `/ai` files in the documented order).
3. Work on one task at a time.
4. End the session by running the end-of-chat prompt in
   `/ai/templates/CHAT_END_PROMPT.md` — this updates
   `CURRENT_STATE.md`, `TASKS.md`, `HANDOFF.md`, and `DONE_LOG.md`.
5. The next session reads `HANDOFF.md` to pick up where the last left off.

The `/ai` files are the persistent memory across sessions. Auto-compact is a
safety net; the task-bounded workflow is the real solution.

## Quick reference

| Situation                              | Right move                                   |
| -------------------------------------- | -------------------------------------------- |
| Finished a task                        | Run CHAT_END_PROMPT, then `/clear`           |
| Mid-task and approaching context limit | Run `/compact` to keep going                 |
| Starting a new task tomorrow           | Open fresh session, read `/ai/START_HERE.md` |
| New major topic / phase shift          | Fresh chat / fresh session                   |
| Returning to interrupted work          | `/resume` (Claude Code) or read HANDOFF.md   |



Please read /ai/templates/CHAT_END_PROMPT.md and follow it.

/clear

Please read /ai/START_HERE.md and follow it. Then pick up the next task per HANDOFF.md.
