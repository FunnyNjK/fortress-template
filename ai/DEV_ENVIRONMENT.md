# Development Environment

Last Updated: 2026-05-09

## Status
Stable / Cross-project standard (Ubuntu-native). Supersedes the WSL-on-Windows
profile that was in place through 2026-05-08; see ADR-026.

## Where development happens

- **OS:** Ubuntu 26 LTS, dedicated dev machine
- **Project location:** `~/repos/<project-name>` (canonical: `/home/<user>/repos/<project>`)
- **Editors / IDEs:** VS Code, Cursor, or any preferred editor — running directly
  on Ubuntu (desktop session or Remote SSH from a workstation)
- **AI CLIs:** Claude Code, Cursor CLI (`agent`), GitHub Copilot CLI — all run
  natively on the Ubuntu host

## Hard rules (mirrors `/ai/AI_RULES.md` for emphasis)

- **No Docker for the application.** Docker is reserved for the supporting
  services declared in `docker-compose.yml`: Postgres, Redis, mailpit,
  Azurite, Unleash. The app itself, its dev server, its tests, and its build
  all run as native processes on Ubuntu.
- **No Windows paths anywhere in the repo.** `C:\`, `/mnt/c`, and
  `\\wsl.localhost\...` are not used. The dev host is Ubuntu; treat any
  appearance of these paths in code or docs as a bug.
- **No `wsl --exec`, `wsl --` or any WSL-bridge invocation.** WSL is no
  longer in the picture.
- **Code runs as the logged-in user.** Don't `sudo` for `pnpm install`, dev
  servers, or tests. Configure user-owned npm/pnpm prefixes per the setup
  below.

## Required tools (one-time setup)

These should already be installed on the dev machine. If not, install before
starting work.

| Tool                 | Install                                                       |
| -------------------- | ------------------------------------------------------------- |
| Git                  | `sudo apt install -y git`                                     |
| GitHub CLI           | `sudo apt install -y gh` then `gh auth login`                 |
| Node.js (LTS)        | NodeSource repo: `setup_lts.x` script (Node 24 LTS or newer)  |
| pnpm                 | `corepack enable && corepack prepare pnpm@latest --activate`  |
| Build essentials     | `sudo apt install -y build-essential curl wget jq unzip`      |
| Docker Engine        | Official `docker.io` packages or the upstream Docker apt repo |
| Docker Compose v2    | `sudo apt install -y docker-compose-plugin` (the v2 plugin)   |

User-owned global npm prefix (so `npm install -g` doesn't need sudo):

```bash
mkdir -p ~/.npm-global
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

Add the dev user to the `docker` group so `docker` and `docker compose`
commands run without sudo:

```bash
sudo usermod -aG docker $USER
# log out and back in for the group change to take effect
```

## AI CLIs (recommended)

```bash
npm install -g @anthropic-ai/claude-code @openai/codex @github/copilot @google/gemini-cli
# Cursor CLI (the `agent` command):
curl https://cursor.com/install -fsS | bash
```

After installing Cursor CLI, ensure `~/.local/bin` is on `PATH`. Run
`agent login` once to authenticate (or set `CURSOR_API_KEY` for headless use).

## Editors

- **VS Code:** install on Ubuntu directly (`.deb` from the official repo).
- **Cursor:** install on Ubuntu directly (`.AppImage` or upstream `.deb`).
- **Remote SSH option:** if you want to develop from another workstation,
  install the Remote SSH extension in your local editor and connect to the
  Ubuntu host. The editor GUI runs on the workstation; everything else runs
  on the dev box.

## How to start a project (typical day-one)

```bash
cd ~/repos
gh repo clone <owner>/<repo>
cd <repo>
./scripts/setup.sh                # generates .env, starts docker-compose services
pnpm install
pnpm dev                          # runs natively, hot reload
```

## Supporting services (Docker)

When this repo is checked out, `docker-compose.yml` at the root defines the
full set of services needed for local development:

- Postgres 18 — `localhost:5432`
- Redis 8 — `localhost:6379`
- mailpit (SMTP testing) — SMTP `localhost:1025`, web UI `localhost:8025`
- Azurite (Blob storage emulator) — `localhost:10000`
- Unleash (feature flags) — `localhost:4242`

Boot them with `docker compose up -d` from the repo root. The app processes
(`apps/web`, `apps/api`, `apps/worker`, `apps/marketing`) are NOT in this
compose file — they run as native Node processes via `pnpm dev`.

## Common pitfalls

- **`docker compose` permission errors** — the dev user isn't in the `docker`
  group. Run `sudo usermod -aG docker $USER`, log out, log back in.
- **`pnpm install` fails on first run** — `corepack enable` not yet run. Run
  it once and reopen the shell.
- **Storing secrets in `~/repos/.../.env`** — fine, but never commit. `.env`
  is in `.gitignore` for any project using this template.
- **Running app inside a container** — don't. Apps run native; only the
  supporting services from `docker-compose.yml` are containerized.

## Backup considerations

Standard Linux practice:

- Push to GitHub frequently (the source of truth for code).
- For local state (working trees, env files, Docker volumes) use whatever
  backup tool you prefer: `restic` to a remote target, `rsync` snapshots,
  ZFS/Btrfs snapshots if your filesystem supports them.

Docker volumes for the supporting services are throwaway by default — they
hold local-dev data only. Production data lives in Azure (or AWS), not on
the dev box.

## Troubleshooting

| Symptom                                          | Fix                                                                |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| `gh auth login` browser doesn't open             | Set `BROWSER=xdg-open` (or `firefox`/`chromium`) in your shell rc. |
| `npm install -g` errors with `EACCES`            | Set the user-owned npm prefix shown in "Required tools" above.     |
| `docker: permission denied` on the socket        | Add user to `docker` group; log out/in.                            |
| Container DB unreachable from app                | `docker compose ps` to confirm services are up; check `localhost` ports match `.env`. |
| Slow `pnpm install` on a network mount           | Move the repo to local disk under `~/repos/`.                      |
| Cursor CLI `agent` not found                     | `curl https://cursor.com/install -fsS \| bash`; ensure `~/.local/bin` on `PATH`. |
