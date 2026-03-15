# CLAUDE.md — SimpliLMS Platform

## Project Identity

- **Product:** SimpliLMS
- **Type:** Branded SaaS (with white-label premium tier)
- **Domain:** simplilms.com (marketing), [tenant].simplilms.com or custom domain (platform)
- **GitHub Repo:** https://github.com/coingroup/simplilms
- **Parent Company:** COIN Group

---

## What This Is

SimpliLMS is an all-in-one SaaS platform for training schools and education businesses. It handles:

1. **Admissions & CRM** — Prospect pipeline, discovery calls, eligibility decisions
2. **Application Processing** — Online applications, KYC via Stripe Identity, document upload
3. **Payment Processing** — Stripe Checkout, installment plans, income share agreements
4. **Student Portal** — Dashboard, profile, payments, messages, classes
5. **Instructor Portal** — Classes, attendance, Zoom integration, earnings (Stripe Connect)
6. **Multi-Tenant** — Each customer gets their own branded deployment with isolated data

**Future:**
- **Core LMS** — Courses, modules, lessons, quizzes, progress tracking, certificates
- **AI Course Creator** — AI interviews SMEs and builds courses automatically

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 / React / Tailwind CSS / shadcn/ui |
| Hosting | Vercel |
| Database | Supabase PostgreSQL (one project per tenant) |
| Auth | Supabase Auth (email + magic link) |
| Payments | Stripe (Checkout, Identity, Connect) |
| Automation | n8n Cloud |
| Monorepo | Turborepo + npm workspaces |

---

## Repo Structure

```
simplilms/
├── apps/
│   ├── platform/          ← SaaS app deployed per tenant (port 3000)
│   └── marketing/         ← simplilms.com landing + pricing (port 3001)
├── packages/
│   ├── core/              ← Shared business logic (@simplilms/core)
│   ├── ui/                ← Shared UI components (@simplilms/ui)
│   ├── database/          ← Supabase types + client (@simplilms/database)
│   ├── auth/              ← Auth helpers (@simplilms/auth)
│   └── config/            ← Tailwind + TS configs (@simplilms/config)
├── supabase/
│   └── migrations/        ← Database migrations (applied per tenant)
├── n8n/
│   └── workflows/         ← 15 workflow JSONs for n8n import
├── scripts/               ← Tenant provisioning tools
└── docs/                  ← Documentation
```

---

## Multi-Tenant Architecture

Each tenant gets:
- Their own Vercel deployment of `apps/platform`
- Their own Supabase project (full data isolation)
- Their own Stripe account
- Their own domain (custom or subdomain)
- Environment variables pointing to their own resources

The `tenants` table in each Supabase project has exactly ONE row.

Tenant branding is applied via:
- `TenantProvider` (React Context) — passes config to client components
- `ThemeInjector` — injects CSS variables at runtime for shadcn/ui theming
- `loadTenantConfig()` — server-side loader from Supabase with env var fallback

---

## Key Conventions

- All imports from shared packages use `@simplilms/*` prefix
- Server actions use `"use server"` directive and live in `packages/core/src/actions/`
- Components use `useTenant()` hook for dynamic branding
- All tables have `tenant_id` column with RLS policies
- `getTenantId()` from `@simplilms/core` resolves tenant from `TENANT_ID` env var
- No hardcoded brand references in any runtime code

---

## Build & Dev

```bash
npm install           # Install all dependencies
npx turbo build       # Build all apps
npx turbo dev         # Dev server (platform: 3000, marketing: 3001)
```

---

## Current State

**Last updated:** 2026-03-15

### Completed
- Turborepo monorepo with 5 packages and 2 apps
- All @simplilms/* packages renamed from @coin-education/*
- Zero COIN Education references in runtime code
- `apps/platform` — Full admissions/enrollment SaaS (35 routes + middleware)
  - CRM & prospect pipeline
  - Application flow with 5-step wizard
  - Stripe Identity KYC
  - Payment processing (full + installment plans)
  - Student portal (dashboard, messages, classes, payments)
  - Instructor portal (classes, attendance, earnings)
  - Role-based access control (5 roles)
  - Tenant-dynamic branding (TenantProvider + ThemeInjector)
- `apps/marketing` — SimpliLMS landing page + pricing page
  - Landing: hero, features grid, how-it-works, social proof, CTA
  - Pricing: 3 tiers (Starter $99, Professional $299, Enterprise $999)
- `packages/core` — 56 shared files (7 lib, 9 actions, 40 components)
- `packages/ui` — 18 shadcn/ui components
- `packages/database` — Typed Supabase client
- `packages/auth` — Supabase Auth with role-based helpers
- `supabase/` — 6 migration files for per-tenant database setup
- `n8n/` — 15 workflow JSONs for admissions automation
- Build verified: `turbo build` passes for all apps

### In Progress
- None

### Next
- Phase 10 Steps 5-8: Tenant provisioning CLI, admin panel, n8n adaptation, docs
- Phase 11: Core LMS features (courses, modules, lessons, quizzes, progress, certificates)
- Phase 12: AI Course Creator (Claude API interview engine, auto course builder)

### Blockers / Decisions Pending
- simplilms.com domain registration needed
- First tenant (COIN Education) needs to be configured as a deployment
