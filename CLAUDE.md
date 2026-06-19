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

**Built:**
- **Core LMS** — Courses, modules, lessons, quizzes, progress tracking, certificates
- **AI Course Creator** — Claude API interviews SMEs and builds courses automatically with sector-specific prompts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 / React 19 / Tailwind CSS / shadcn/ui |
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

**Last updated:** 2026-06-19

### Completed Phases
- **Phase 1-10:** Foundation, public website, portal auth, admin CRM, application flow, payment processing, student portal, instructor portal, n8n workflows, white-label multi-tenancy
- **Phase 11:** Core LMS (courses, modules, lessons, quizzes, progress tracking, certificates — 9 new DB tables)
- **Phase 12:** AI Course Creator (Claude API interview engine, 3 generation modes, outline review, sector-specific prompts)
- **Sector Strategy:** 8 sector modules defined, marketing pages, $681M TAM analysis
- **Phase 13:** Sector module database, admin UI, question banks
- **Phase 14:** Lesson content editor, enrollment management, quiz-taking UI
- **Phase 15:** Course edit page, quiz builder, student course catalog/browse
- **Phase 16:** Advanced analytics dashboard with real data — 9 query functions, pure CSS charts, course drill-down, at-risk students, CSV exports
- **Phase 17:** Admin settings UI with 4 tabbed forms — Organization, Branding (live color preview), Features (16 toggles), Notifications
- **Security Audit:** Comprehensive security + trace audit — all CRITICAL/HIGH/MEDIUM/LOW findings resolved
- **Infrastructure:** ESLint setup, Supabase type regeneration, Next.js 15.5.19 upgrade (React 19)
- **Phase 18:** Discussion Forums — threaded discussions per course, replies, pin/lock/delete moderation, student + admin views
- **Phase 19:** Gamification & Engagement — points (8 actions), streaks, 8 badge types, leaderboard, student dashboard integration
- **Phase 20:** Live Classes / Zoom — session scheduling, countdown timers, Zoom embed, recording management, student/teacher/admin views
- **Phase 21:** Polish & Launch Prep — error boundaries, 62 loading skeletons (every route), SEO metadata, accessibility, production next.config

### Security Audit (completed 2026-06-19)

Full security and trace audit across auth, RLS, OWASP top 10, data flow, dependencies, and configuration. All findings resolved across 3 PRs.

Key fixes: removed service role key from webhook payloads, added auth guards to 20+ server actions, HTML sanitization via DOMPurify, fixed certificates RLS, added security headers, rate limiting on AI API, replaced temp passwords with magic links, fixed open redirect, fixed broken trigger, patched vulnerable deps.

### Infrastructure (completed 2026-06-19)

- **ESLint** — shared config in `packages/config/eslint`, `.eslintrc.js` in all 7 packages, lint enabled in CI
- **Supabase types** — full types regenerated from schema (38 tables, 2,673 lines) in `packages/database/src/types.ts`
- **Next.js 15.5.19** — upgraded from 14.2.x, React 19, resolves 14 CVEs. Breaking changes handled: async `cookies()`, Promise `params`/`searchParams`, Radix UI type fixes

### CI/CD & Branch Protection
- **GitHub Actions** — `test-staging` workflow runs lint + type-check + build on all PRs to `main`
- **Branch protection** — PRs required, 1 approval, `test-staging` must pass, enforce for admins, linear history, conversation resolution required, no force pushes

### Platform Summary
- **`apps/platform`** — 70+ routes + middleware
  - Admissions CRM, application flow, Stripe payments, student/instructor/admin portals
  - Core LMS with course builder, quiz engine, certificates
  - AI Course Creator (Claude API)
  - Discussion forums per course with moderation
  - Gamification: points, streaks, badges, leaderboard
  - Live classes with Zoom integration and recordings
  - Advanced analytics with drill-downs and CSV export
  - Self-serve admin settings (organization, branding, features, notifications)
  - Sector module admin panel + question banks
  - Error boundaries + loading skeletons on every route
  - Role-based access (5 roles: super_admin, school_rep, teacher_paid, teacher_unpaid, student)
- **`apps/marketing`** — 14 statically generated pages (landing, pricing, 8 industry pages, industries hub)
- **`packages/core`** — 100+ shared files (actions, components, lib)
- **`packages/ui`** — 18 shadcn/ui components
- **`supabase/`** — 17 migration files
- **`n8n/`** — 15 workflow JSONs (COIN Education-specific, see `docs/coin-education-relationship.md`)
- **`scripts/`** — Tenant provisioning CLI
- **`.github/workflows/`** — CI pipeline (`test-staging.yml`)

### COIN Education Relationship
COIN Education is the first tenant of SimpliLMS. They share the same codebase but COIN Education's Supabase schema has diverged significantly (46 tables vs 38, different column structures on shared tables). See `docs/coin-education-relationship.md` for full details including:
- How code, n8n, and Supabase relate between the two
- Schema divergence inventory
- Known issues (payment flow broken due to missing `payment_token` column and Stripe webhook signature mismatch)

### In Progress
- None

### All Phases Complete
The SimpliLMS platform feature set is complete (Phases 1-21). Remaining work is deployment, tenant onboarding, and operational.

### Blockers / Decisions Pending
- COIN Education schema reconciliation needed (see `docs/coin-education-relationship.md`)
- `ANTHROPIC_API_KEY` environment variable needed for AI Course Creator
- Stripe env vars needed for payment flow end-to-end
- COIN Education Stripe webhook secret mismatch needs fixing in Stripe dashboard
- n8n enrollment workflow needs updating — now receives `magic_link` instead of `temp_password`
- Supabase `as any` cast removal (200+ instances) — types are generated, removal is incremental
