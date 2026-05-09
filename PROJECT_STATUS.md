# Project status — Fortress template

Living snapshot of scaffold progress. For task detail see [`/ai/TASKS.md`](ai/TASKS.md);
for phase verification see [`/ai/ROADMAP.md`](ai/ROADMAP.md). Full spec:
[`/ai/reference/NEW_TEMPLATE_PROMPT.md`](ai/reference/NEW_TEMPLATE_PROMPT.md).

---

## Phase overview

| Phase | Title | Status | Spec / notes |
|-------|--------|--------|--------------|
| 0 | Repo skeleton | **Complete** | Monorepo tooling, CI scaffold, `.env.example`, `docker-compose`, setup scripts, `security.txt`, this file — see [`/ai/TASKS.md`](ai/TASKS.md) |
| 1 | Shared packages | **Complete** | `packages/types`, `crypto`, `auth-core`, `observability`, `sdk`, `testing` (+ Phase 0 config packages). `packages/ui` deferred until a consumer needs it. |
| 2 | API skeleton | TODO | NestJS 11, middleware chain, health, audit table — [`NEW_TEMPLATE_PROMPT.md` Phase 2](ai/reference/NEW_TEMPLATE_PROMPT.md) |
| 3 | Web skeleton | TODO | Next.js 16 + Clerk + `@fortress/sdk` — Phase 3 |
| 4 | Worker skeleton | TODO | BullMQ + Postmark example job — Phase 4 |
| 5 | Marketing site | TODO | Astro, CSP, Plausible, `security.txt` link — Phase 5 |
| 6 | Infrastructure | TODO | Terraform Azure + AWS modules — Phase 6 |
| 7 | Documentation | TODO | `docs/*`, runbooks, STRIDE — Phase 7 |
| 8 | Acceptance | TODO | E2E checklist — Phase 8 |

---

## Locked decisions (template choices)

| # | Decision | In this repo today |
|---|----------|-------------------|
| 1 | Clerk | **Pending** — placeholders in [`.env.example`](.env.example); no app yet |
| 2 | Drizzle | **Pending** — Phase 2 |
| 3 | Azure + Terraform | **Pending** — Phase 6 |
| 4 | SOC 2 + GDPR baseline | **Pending** — compliance/runbooks Phase 7 |
| 5 | Single-tenant | **Pending** — enforced once API/data exist |
| 6 | Astro (marketing) | **Pending** — Phase 5 |
| 7 | Postmark | **Pending** — placeholders in [`.env.example`](.env.example); Phase 4 |
| 8 | Unleash + OpenFeature | **Partial** — Unleash in [docker-compose.yml](docker-compose.yml) + env placeholders; app integration Phase 2–3 |
| 9 | Sentry | **Pending** — env placeholders; Phase 2+ |
| 10 | Tempo + OTLP | **Partial** — `@fortress/observability` (Pino baseline only); OTLP wiring Phase 2+ |

---

## Known pending items

- **`REFRESH_PROMPT.md`:** Full project-specific refresh workflow still lives in
  [`/ai/templates/REFRESH_PROMPT.md`](ai/templates/REFRESH_PROMPT.md) (starter-era).
  **TODO:** Rewrite for this template once Phases 1–8 narrow the real surface area.
- **`security.txt`:** Contact, Policy URL, and Expires are **placeholders** in
  [`.well-known/security.txt`](.well-known/security.txt) — must be replaced per fork.
- **No `apps/` yet** — application code starts Phase 2 (`apps/api`).

---

## Related docs

- Agent rules: [`AGENTS.md`](AGENTS.md)
- Handoff baton: [`/ai/HANDOFF.md`](ai/HANDOFF.md)
- Current snapshot: [`/ai/CURRENT_STATE.md`](ai/CURRENT_STATE.md)
