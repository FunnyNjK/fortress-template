# Development Environment

Last Updated: 2026-05-08

## Status
Stable / Cross-project standard

## Where development happens

- **OS:** Windows 11 host
- **Dev shell:** WSL Ubuntu (current default: Ubuntu 24.04 LTS)
- **Project location inside WSL:** `~/repos/<project-name>`
  (canonical: `/home/<user>/repos/<project>`)
- **From Windows tools:** `\\wsl.localhost\Ubuntu\home\<user>\repos\<project>`
  (used only by Windows-side editors and Explorer; never referenced in code)

## Hard rules (mirrors `/ai/AI_RULES.md` for emphasis)

- **No Docker for development.** Docker is reserved for hosting databases or
  external services that the app depends on. The app itself, its dev server,
  its tests, and its build all run as native processes in WSL.
- **No `/mnt/c` paths in code or config.** WSL's mount of the Windows
  filesystem is slow (~5-20x slower than the Linux filesystem) and creates
  ambiguous "where does this code really live" situations that AI agents
  routinely get wrong.
- **No `wsl --exec` or `wsl --` wrappers in scripts.** If a script needs WSL,
  it runs inside WSL.

## Required tools (one-time setup)

These should already be installed on the dev machine. If not, install before
starting work.

| Tool                    | Install path                                            |
| ----------------------- | ------------------------------------------------------- |
| Git                     | `sudo apt install -y git`                               |
| GitHub CLI              | `sudo apt install -y gh` then `gh auth login`           |
| Node.js (LTS)           | NodeSource repo: `setup_lts.x` script                   |
| pnpm                    | `corepack enable && corepack prepare pnpm@latest --activate` |
| Build essentials        | `sudo apt install -y build-essential curl wget jq unzip` |
| WSL ↔ browser bridge    | `sudo apt install -y wslu`                              |
| Docker (DB hosting)     | Docker Desktop on Windows + WSL Integration enabled     |

User-owned global npm prefix (so `npm install -g` doesn't need sudo):

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

## AI CLIs (optional but recommended)

```bash
npm install -g @anthropic-ai/claude-code @openai/codex @github/copilot @google/gemini-cli
```

## Editors

- VS Code installed on Windows; WSL Remote extension auto-installs on first
  `code .` from inside WSL.
- Cursor installed on Windows; WSL Remote auto-installs on first `cursor .`.

If `code` resolves to Cursor (because Cursor's `code` shim hijacks PATH), add
this function to `~/.bashrc`:

```bash
code() {
  "/mnt/c/Users/<user>/AppData/Local/Programs/Microsoft VS Code/bin/code" "$@"
}
```

(This is the one acceptable use of `/mnt/c` in the dev shell — invoking a
Windows-side editor binary. It still must not appear in project code.)

## How to start a project (typical day-one)

```bash
cd ~/repos
gh repo clone <owner>/<repo>
cd <repo>
pnpm install
cp .env.example .env.local      # then edit secrets
pnpm dev                         # runs natively in WSL, hot reload
```

## Database services (the only acceptable use of Docker for dev)

When a project needs a Postgres or Mongo instance for local development,
run a single shared container per database engine, not per-project. Default
ports:

- Postgres: `localhost:5432`
- MongoDB:  `localhost:27017`
- Redis:    `localhost:6379`

A shared `~/repos/_infra/docker-compose.yml` runs the DB containers; each
project connects via `localhost:<port>` with its own database/schema name.

The application itself (Astro, Node, tests, build) does NOT run in a
container — it runs directly in WSL.

**Fortress Template exception:** This template uses a `docker-compose.yml` at
the repo root (`~/repos/fortress-template/docker-compose.yml`) to host the
full set of supporting services for local dev: Postgres 18, Redis 8, mailpit
(SMTP testing), Azurite (Blob testing), and Unleash (feature flags). This is
distinct from the per-engine shared-container pattern described above — the
template is intentionally self-contained so a fresh clone + `pnpm setup` boots
all services without any external infra. Apps (`apps/web`, `apps/api`,
`apps/worker`, `apps/marketing`) still run as native Node processes via
`pnpm dev` orchestrated by Turbo. Do NOT run apps inside containers locally.

## Common pitfalls

- **Cloning into `/mnt/c/...`** — don't. Always clone into `~/repos/`.
- **Running `pnpm install` from `/mnt/c/...`** — extremely slow due to
  cross-filesystem npm operations. Always run from `~/repos/...`.
- **Editing files in Notepad / Windows tools by browsing `\\wsl.localhost\...`**
  — possible but slow and risks line-ending corruption. Use VS Code/Cursor
  WSL Remote instead.
- **Storing secrets in `~/repos/.../.env.local`** — fine, but never commit.
  `.env.local` should already be in `.gitignore` for any project using this
  starter.

## Backup considerations

The Linux filesystem lives inside `ext4.vhdx` on the Windows host. Standard
practice:

- Push to GitHub frequently.
- Periodic snapshots: `wsl --export Ubuntu C:\backups\ubuntu-YYYY-MM-DD.tar`.
- The user's `.wslconfig` should have `sparseVhd=true` so deleted space is
  reclaimed on the Windows side.

## Troubleshooting

| Symptom                                          | Fix                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| `code .` opens Cursor                            | Add `code()` shell function (see Editors section above).           |
| `gh auth login` browser doesn't open             | Install `wslu`. Verify with `explorer.exe .`.                      |
| `WSL Interoperability is disabled`               | `wsl --shutdown` from PowerShell, then re-enter the distro.        |
| `npm install -g` errors with EACCES              | Set user-owned npm prefix (see Required tools section).            |
| Slow `pnpm install` or `git status`              | Verify project is at `~/repos/...`, not `/mnt/c/...`.              |
| Container DB unreachable from app                | Confirm Docker Desktop's WSL Integration is on for this distro.    |
