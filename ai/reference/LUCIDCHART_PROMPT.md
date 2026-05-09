# Lucidchart prompt: Fortress Template architecture diagram

This file contains a prompt designed for **Lucidchart AI** ("Generate Diagram" → text input), plus a fallback Mermaid version that Lucidchart can also import (File → Import → Mermaid).

---

## Primary prompt — paste into Lucidchart AI

```
Create a layered system architecture diagram titled "Fortress Template — System Architecture". Use Azure architecture stencils for any Azure resources, and standard framework/vendor logos for the rest. Layout is vertical, top to bottom, with these tiers:

TIER 1 — PUBLIC (top center)
- One shape: "Users" with a user/people icon
- Subtitle: "browsers"

TIER 2 — EDGE
- One shape: "Azure Front Door" — use the official Azure Front Door icon from the Azure stencil
- Subtitle: "WAF, DDoS, TLS termination, routing"
- Arrow from Users to Azure Front Door, label: "TLS 1.3"

TIER 3 — APPLICATION TIER (three columns left to right)
- Left: "Marketing site" with Astro logo
  Subtitle line 1: "Astro, static"
  Subtitle line 2: "strict CSP, privacy analytics"
  Tag (red): "no DB access"
- Center: "Web app" with Next.js logo
  Subtitle line 1: "Next.js 16, App Router"
  Subtitle line 2: "React 19, Tailwind 4"
  Tag (red): "no DB access"
- Right: "API / business layer" with NestJS logo
  Subtitle line 1: "NestJS 11, Drizzle"
  Subtitle line 2: "Zod-validated boundaries"
  Tag (red): "sole DB owner"
- Three arrows from Azure Front Door to each, labeled with their subdomains: "www.example.com", "app.example.com", "api.example.com"
- Arrow from Web app to API, label: "@fortress/sdk · CSRF"

IDENTITY (positioned between Web app and API)
- Shape: "Clerk" with Clerk logo
- Subtitle line 1: "passkeys, MFA, social, magic link"
- Subtitle line 2: "step-up auth on sensitive ops"
- Arrow from Web app down to Clerk
- Arrow from API to Clerk labeled "verify JWT (JWKS)"

TIER 4 — ASYNC + SECURITY
- Left: "Worker" with a generic process/gear icon
  Subtitle line 1: "BullMQ consumer, isolated process"
  Subtitle line 2: "idempotent jobs, retry, DLQ"
- Right: "API security middleware chain" with a shield icon
  Subtitle: "headers · body size · rate limit · validation · safe logger · exception filter"
  Connect with a vertical line under the API box
- Arrow from API to Worker labeled "jobs via Redis (BullMQ)"

TIER 5 — DATA TIER (group inside a dashed-border container labeled "PRIVATE SUBNET — API + Worker only")
- Left: "Postgres 18" with PostgreSQL elephant logo
  Subtitle: "Azure DB Flexible Server, audit log, AES-256-GCM @encrypted columns"
- Center: "Redis 8" with Redis logo
  Subtitle: "Azure Cache, sessions, queue, rate limit"
- Right: "Blob Storage" with Azure Blob Storage icon
  Subtitle: "private endpoints, signed URLs only"
- Arrow from API to Postgres
- Arrow from API to Redis
- Arrow from API to Blob Storage
- Arrow from Worker to Postgres

TIER 6 — EXTERNAL INTEGRATIONS + OBSERVABILITY (four columns)
- "Postmark" with Postmark logo. Subtitle: "transactional email, DKIM/SPF/DMARC"
- "Stripe" with Stripe logo. Subtitle: "billing, HMAC-verified webhooks"
- "Sentry" with Sentry logo. Subtitle: "error tracking, PII scrubbed"
- "Grafana Tempo" with Grafana logo. Subtitle: "OTLP tracing, Azure Monitor sink"
- Arrow from Worker to Postmark
- Arrow from Worker to Stripe (webhook handler)
- Arrow from API to Sentry
- Arrow from API to Grafana Tempo

LEGEND (top right corner)
- Light gray fill = "in-template (we own this)"
- Light orange fill = "external service"

FOOTER ANNOTATIONS
- "Secrets stored in Azure Key Vault"
- "OpenTelemetry traces flow web → api → worker → database"

VISUAL STYLE
- Flat design — no gradients, no drop shadows
- Box stroke 1px, gray
- Owned services: light gray fill
- External services: light orange fill
- Private subnet container: dashed gray border
- All arrows: thin gray, simple arrowheads
- Consistent box sizing within each tier
- Sans-serif typography
- Title at top, legend top-right, footer annotations bottom-center
```

---

## Icons that are NOT in Lucidchart's default library

You will need to source these manually. Easiest path: use Lucidchart's **"Search Shapes" → web icon search**, or paste an SVG from the vendor's brand/press page.

| Icon | Where to find official SVG | Notes |
|---|---|---|
| Astro | astro.build/press | Use the rocket logo |
| Next.js | nextjs.org/brand | Black wordmark or N icon |
| NestJS | docs.nestjs.com (footer) | Red hexagon-cat logo |
| Clerk | clerk.com/brand | Square C logo |
| Drizzle | orm.drizzle.team | Two-tone D — only needed if you want to add it to the API box |
| PostgreSQL | postgresql.org/about/policies/trademarks/ | Elephant ("Slonik") |
| Redis | redis.io/legal/trademark-policy/ | Cube logo |
| BullMQ | docs.bullmq.io | Bull head — optional flourish on Worker box |
| Postmark | postmarkapp.com/about | Stamp icon |
| Stripe | stripe.com/about/brand | Striped S |
| Sentry | sentry.io/branding | Compass-cone purple |
| Grafana | grafana.com/about/brand/ | Orange flame |

**Icons that ARE in Lucidchart's Azure stencil** (use these directly, no import needed):
- Azure Front Door
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Blob Storage
- Azure Key Vault
- Azure Monitor
- Azure Container Apps (if you want to wrap the API/Worker in their hosting context)

To enable the Azure stencils in Lucidchart: **Shapes panel → Manage shape libraries → enable "Azure 2023" (or latest)**.

---

## Fallback: Mermaid version

If Lucidchart AI doesn't produce what you want, paste this as Mermaid. Lucidchart imports Mermaid via **File → Import → Mermaid syntax**. Note: Mermaid won't give you real logos, but it gets the structure right and you can swap shapes for icons after import.

```mermaid
flowchart TB
    subgraph PUBLIC[" "]
        Users[fa:fa-users Users<br/><i>browsers</i>]
    end

    Users -->|TLS 1.3| AFD

    subgraph EDGE[" "]
        AFD[fa:fa-shield Azure Front Door<br/><i>WAF · DDoS · TLS · routing</i>]
    end

    AFD -->|www| Marketing
    AFD -->|app| Web
    AFD -->|api| API

    subgraph APP_TIER["APPLICATION TIER"]
        Marketing["Marketing site<br/>Astro · static<br/><b style='color:red'>no DB access</b>"]
        Web["Web app<br/>Next.js 16<br/><b style='color:red'>no DB access</b>"]
        API["API / business layer<br/>NestJS 11 · Drizzle<br/><b style='color:red'>sole DB owner</b>"]
    end

    Web -->|@fortress/sdk · CSRF| API
    Web --> Clerk
    API -->|verify JWT JWKS| Clerk

    Clerk["Clerk<br/><i>passkeys · MFA · social · magic link</i>"]

    API -->|jobs via Redis BullMQ| Worker

    subgraph ASYNC[" "]
        Worker["Worker<br/>BullMQ consumer<br/><i>retry · DLQ</i>"]
    end

    subgraph SUBNET["PRIVATE SUBNET — API + Worker only"]
        PG[("Postgres 18<br/><i>audit log · @encrypted</i>")]
        Redis[("Redis 8<br/><i>sessions · queue · rate limit</i>")]
        Blob[("Blob Storage<br/><i>private · signed URLs</i>")]
    end

    API --> PG
    API --> Redis
    API --> Blob
    Worker --> PG

    subgraph EXTERNAL["EXTERNAL · OBSERVABILITY"]
        Postmark["Postmark<br/><i>transactional email</i>"]
        Stripe["Stripe<br/><i>billing · signed webhooks</i>"]
        Sentry["Sentry<br/><i>errors · PII scrubbed</i>"]
        Tempo["Grafana Tempo<br/><i>OTLP tracing</i>"]
    end

    Worker --> Postmark
    Worker --> Stripe
    API --> Sentry
    API --> Tempo

    classDef owned fill:#f8fafc,stroke:#cbd5e1,stroke-width:1px
    classDef external fill:#fff7ed,stroke:#fdba74,stroke-width:1px
    classDef subnet fill:none,stroke:#64748b,stroke-width:1.5px,stroke-dasharray:6 4

    class Users,AFD,Marketing,Web,API,Worker,PG,Redis,Blob owned
    class Clerk,Postmark,Stripe,Sentry,Tempo external
    class SUBNET subnet
```

---

## Workflow recommendation

1. Start with the Lucidchart AI prompt above. It will produce a rough structural diagram fast.
2. Enable the Azure 2023 stencil library and swap any generic shapes for proper Azure icons.
3. For framework/SaaS logos, search Lucidchart's icon search first; if missing, paste in the SVG from the vendor brand page.
4. If the AI output is messy, fall back to importing the Mermaid block, then style and icon-swap manually.
5. Save it as a master diagram and link it from your `docs/architecture.md` once the template is scaffolded.
