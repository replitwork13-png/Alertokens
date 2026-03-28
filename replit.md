# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── canarytokens/       # Canarytokens React+Vite frontend
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers
  - `health.ts` — `GET /api/healthz`
  - `tokens.ts` — CRUD for canary tokens
  - `alerts.ts` — list alerts for a token
  - `trigger.ts` — `GET /api/trigger/:token` — records trigger + returns uploaded image (for image tokens) or 1x1 pixel PNG
  - Tokens endpoints also include: `POST /:tokenId/upload-image` (image upload), `GET /:tokenId/image` (serve uploaded image), `POST /:tokenId/test-trigger` (manual test trigger for credit card tokens)
  - `stats.ts` — `GET /api/stats` — overall dashboard stats
- Depends on: `@workspace/db`, `@workspace/api-zod`

### `artifacts/canarytokens` (`@workspace/canarytokens`)

**Fully self-contained static React + Vite app** for the Alertokens honeypot tool. No backend or database required. All data stored in localStorage. Can be exported from `artifacts/canarytokens/dist/` and uploaded directly to static hosting (e.g. Porkbun).

- **Architecture**: Pure client-side SPA — no API calls, no server, no database
- **Data storage**: localStorage via `src/contexts/store-context.tsx` (`useStore()` hook)
- **Routing**: Hash-based routing (`wouter` with `useHashLocation`) — works on any static host without server redirects
- **Build**: `pnpm --filter @workspace/canarytokens run build` → outputs to `artifacts/canarytokens/dist/`
- **Pages**: Dashboard, Create Token, Token Details, FAQ
- **Token types**: web, dns, email, pdf, word, qr_code, image, credit_card, redirect
- **Special features**: QR code generation (client-side), credit card generation (random fake data), image upload (base64 in localStorage), manual trigger recording
- **Design**: glassmorphism cards (backdrop-blur + translucent bg), purple/blue gradient buttons/icons, animated floating orbs background, framer-motion transitions
- **Theme**: Light/dark toggle, localStorage-persisted, anti-flash script in index.html
- **Language**: All UI labels in Russian

### `artifacts/nextjs` (`@workspace/nextjs`)

**Full-stack Next.js 15 app** for the Alertokens honeypot tool. Designed for Vercel deployment with a real PostgreSQL database (Supabase) and email alerts via Resend. Unlike the static canarytokens app, this one tracks all token triggers server-side and sends real email notifications.

- **Architecture**: Next.js 15 App Router with Server Components + Client Components
- **Database**: PostgreSQL via Drizzle ORM — same `DATABASE_URL` as the workspace, tables: `tokens`, `alerts`
- **Email**: Resend API (`RESEND_API_KEY`) — sends alert emails when tokens are triggered
- **Design**: Glassmorphism dark theme, purple/violet primary color, framer-motion animations, Russian UI
- **Routing**: App Router — `/` (dashboard), `/tokens/new` (create), `/tokens/[id]` (details), `/faq`
- **API routes**:
  - `GET/POST /api/tokens` — list and create tokens
  - `GET/DELETE /api/tokens/[id]` — get and delete token
  - `GET /api/tokens/[id]/alerts` — list alerts for a token
  - `GET /api/trigger/[token]` — honeypot trigger: records IP/user-agent/referer, sends email, returns 1×1 PNG or 302 redirect
- **Token types**: web (pixel), redirect, dns, smtp, pdf, word, excel, image, creditcard
- **Schema**: `artifacts/nextjs/lib/schema.ts` — `tokensTable` + `alertsTable`
- **Vercel deployment**: Set `Root Directory = artifacts/nextjs`, env vars: `DATABASE_URL` (Supabase) + `RESEND_API_KEY`
- **Dev port**: 3001 (set via `PORT:-3001` in dev script)

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/schema/tokens.ts` — `tokensTable` with type enum, trigger tracking
- `src/schema/alerts.ts` — `alertsTable` with IP, user agent, referer, geo
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec. Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`.
