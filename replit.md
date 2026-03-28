# Alertokens — Security Honeypot Token Manager

## Overview

Two apps for managing security honeypot tokens (canary tokens):

1. **Root-level Next.js app** — Full-stack app at repo root using `src/` directory convention. PostgreSQL + Resend emails. Designed for Vercel deployment.
2. **Static React+Vite app** — `artifacts/canarytokens/` — localStorage-only, for static hosting (Porkbun).

## Stack

- **Runtime**: Node.js 24
- **Package manager**: pnpm
- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL + Drizzle ORM
- **Email**: Resend API
- **UI**: Tailwind CSS 4, Framer Motion, Lucide icons, Radix UI
- **Language**: Russian UI

## Root-Level Next.js App Structure

```text
/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout (dark theme, orbs, navbar)
│   │   ├── globals.css         # Tailwind + glass-card + orb animations
│   │   ├── page.tsx            # Dashboard (server component)
│   │   ├── create/page.tsx     # Create token form
│   │   ├── faq/page.tsx        # FAQ page
│   │   ├── token/[id]/page.tsx # Token details
│   │   └── api/
│   │       ├── tokens/         # CRUD: GET/POST /api/tokens
│   │       │   └── [id]/       # GET/DELETE /api/tokens/[id]
│   │       │       └── alerts/ # GET/POST /api/tokens/[id]/alerts
│   │       └── trigger/[token]/ # Honeypot endpoint: returns 1x1 PNG or 302
│   ├── components/             # Client components
│   │   ├── navbar.tsx
│   │   ├── dashboard-client.tsx
│   │   ├── create-token-form.tsx
│   │   └── token-details-client.tsx
│   └── lib/
│       ├── db.ts               # Drizzle + postgres.js
│       ├── schema.ts           # tokens + alerts tables
│       ├── email.ts            # Resend email alerts
│       └── utils.ts            # cn(), generateCardData(), TOKEN_TYPE_LABELS
├── next.config.ts
├── tsconfig.json               # paths: @/* → ./src/*
├── postcss.config.js           # @tailwindcss/postcss
├── drizzle.config.ts           # schema: ./src/lib/schema.ts
├── vercel.json                 # framework: nextjs
└── package.json                # Next.js deps, scripts: dev/build/start
```

## Token Types

web, dns, email, pdf, word, qr_code, image, credit_card, redirect

## Database Schema

- `tokens` — id, type, name, memo, token (unique trigger key), alertEmail, cardData (JSON), redirectUrl, triggered, triggerCount, createdAt, lastTriggeredAt
- `alerts` — id, tokenId (FK), ipAddress, userAgent, referer, geo, geoData, queryParams, notes, triggeredAt

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (auto-provided by Replit)
- `RESEND_API_KEY` — Resend API key for email notifications

## Vercel Deployment

Root directory auto-detected as Next.js. Set env vars: `DATABASE_URL` (Supabase/Neon) + `RESEND_API_KEY`.

## Design

- Purple primary (`hsl(265 90% 65%)`)
- Glassmorphism cards (`glass-card` class)
- Dark theme with animated floating orbs
- Framer Motion transitions
- Support email: info@premiumwebsite.ru

## Dev Commands

- `pnpm run dev` — Start Next.js dev server (port 3001)
- `pnpm run build` — Production build
- `pnpm run db:push` — Push schema to database

## Static App (artifacts/canarytokens)

Self-contained React+Vite SPA. Hash routing, localStorage data. Build: `pnpm --filter @workspace/canarytokens run build` → `artifacts/canarytokens/dist/`.
