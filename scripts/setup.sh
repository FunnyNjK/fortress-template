#!/usr/bin/env bash
# Idempotent local env bootstrap: copy `.env.example` → `.env` with strong secrets,
# then start docker supporting services. Does not run `pnpm install`.
set -euo pipefail

if [[ "${NODE_ENV:-development}" == "production" ]]; then
  echo "setup.sh: refusing to run when NODE_ENV=production" >&2
  exit 1
fi

if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
elif [[ -n "${1:-}" ]]; then
  echo "Usage: $0 [--force]" >&2
  exit 2
else
  FORCE=false
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

ENV_EXAMPLE=".env.example"
ENV_OUT=".env"

if [[ ! -f "$ENV_EXAMPLE" ]]; then
  echo "setup.sh: missing $ENV_EXAMPLE (run from repo root)" >&2
  exit 1
fi

if [[ -f "$ENV_OUT" ]] && [[ "$FORCE" != true ]]; then
  echo "setup.sh: $ENV_OUT already exists. Re-run with --force to overwrite." >&2
  exit 1
fi

gen_hex() {
  openssl rand -hex 32
}

gen_b64_key() {
  openssl rand -base64 32 | tr -d '\n'
}

postgres_password_for_compose=""
redis_password_for_compose=""
generated_secret_count=0

tmp_out="$(mktemp)"
cleanup() { rm -f "$tmp_out"; }
trap cleanup EXIT

while IFS= read -r line || [[ -n "$line" ]]; do
  if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "${line// }" ]]; then
    printf '%s\n' "$line" >>"$tmp_out"
    continue
  fi
  if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
    raw_key="${BASH_REMATCH[1]}"
    val="${BASH_REMATCH[2]}"
    key="${raw_key%%[[:space:]]*}"
    key="${key##[[:space:]]}"

    if [[ "$val" != *"replace-with-"* ]]; then
      printf '%s\n' "$line" >>"$tmp_out"
      continue
    fi

    new_val="$val"

    if [[ "$key" == "ENCRYPTION_KEY" ]]; then
      new_val="$(gen_b64_key)"
      generated_secret_count=$((generated_secret_count + 1))
    else
      if [[ "$key" == "DATABASE_URL" ]] && [[ "$new_val" == *"replace-with-local-postgres-password"* ]]; then
        pgpw="$(gen_hex)"
        postgres_password_for_compose="$pgpw"
        new_val="${new_val//replace-with-local-postgres-password/$pgpw}"
        generated_secret_count=$((generated_secret_count + 1))
      fi
      if [[ "$key" == "REDIS_URL" ]] && [[ "$new_val" == *"replace-with-local-redis-password"* ]]; then
        rpw="$(gen_hex)"
        redis_password_for_compose="$rpw"
        new_val="${new_val//replace-with-local-redis-password/$rpw}"
        generated_secret_count=$((generated_secret_count + 1))
      fi
      while [[ "$new_val" == *"replace-with-"* ]]; do
        if [[ "$new_val" =~ replace-with-[a-zA-Z0-9-]+ ]]; then
          ph="${BASH_REMATCH[0]}"
          rep="$(gen_hex)"
          new_val="${new_val//$ph/$rep}"
          generated_secret_count=$((generated_secret_count + 1))
        else
          break
        fi
      done
    fi

    printf '%s\n' "${key}=${new_val}" >>"$tmp_out"
    continue
  fi
  printf '%s\n' "$line" >>"$tmp_out"
done < "$ENV_EXAMPLE"

if [[ -n "$postgres_password_for_compose" ]] || [[ -n "$redis_password_for_compose" ]]; then
  printf '\n# Docker Compose (local): must match DATABASE_URL / REDIS_URL above\n' >>"$tmp_out"
  if [[ -n "$postgres_password_for_compose" ]]; then
    printf 'POSTGRES_PASSWORD=%s\n' "$postgres_password_for_compose" >>"$tmp_out"
  fi
  if [[ -n "$redis_password_for_compose" ]]; then
    printf 'REDIS_PASSWORD=%s\n' "$redis_password_for_compose" >>"$tmp_out"
  fi
fi

mv "$tmp_out" "$ENV_OUT"
trap - EXIT

if [[ "$generated_secret_count" -gt 0 ]]; then
  echo "setup.sh: generated ${generated_secret_count} secret value(s); values were not printed." >&2
fi

if docker compose version &>/dev/null; then
  docker compose up -d
elif command -v docker-compose &>/dev/null; then
  docker-compose up -d
else
  echo "setup.sh: docker compose not found; .env was written. Install Docker and run: docker compose up -d" >&2
  exit 1
fi

cat <<'EOF'

Next steps:
  pnpm install    # install workspace dependencies
  pnpm dev        # run dev servers (Turbo)

For a fresh DB volume, use docker compose down -v before docker compose up -d.
EOF
