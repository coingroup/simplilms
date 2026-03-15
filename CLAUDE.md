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

**Last updated:** 2026-03-16

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

### Platform Summary
- **`apps/platform`** — 45+ routes + middleware
  - Admissions CRM, application flow, Stripe payments, student/instructor/admin portals
  - Core LMS with course builder, quiz engine, certificates
  - AI Course Creator (Claude API)
  - Advanced analytics with drill-downs and CSV export
  - Self-serve admin settings (organization, branding, features, notifications)
  - Sector module admin panel + question banks
  - Role-based access (5 roles: super_admin, school_rep, teacher_paid, teacher_unpaid, student)
- **`apps/marketing`** — 14 statically generated pages (landing, pricing, 8 industry pages, industries hub)
- **`packages/core`** — 80+ shared files (actions, components, lib)
- **`packages/ui`** — 18 shadcn/ui components
- **`supabase/`** — 10 migration files
- **`n8n/`** — 15 workflow JSONs
- **`scripts/`** — Tenant provisioning CLI

### Recent Commits
- `51e2057` — Phase 17: Admin settings UI with tabbed forms (6 files, 1,461 lines)
- `2cdd41e` — Phase 16: Advanced analytics dashboard with real data (13 files, 2,527 lines)
- `2c6f4e0` — Fix dead sidebar nav links + missing loading skeletons (19 files, 863 lines)
- `3357947` — Phase 15: Course edit page, quiz builder, student course catalog
- `997e18a` — Phase 14: Lesson content editor, enrollment management, quiz-taking UI

### In Progress
- None

### Next (Remaining Phases — ~3-4 left)
1. **Discussion Forums** — threaded discussions per course, student/instructor participation, moderation
2. **Gamification & Engagement** — points, streaks, leaderboards, achievement badges
3. **Live Classes / Zoom Integration** — schedule live sessions, in-portal Zoom embed, recording access
4. **Polish & Launch Prep** — error boundaries, loading states audit, accessibility, SEO, production env setup

### Blockers / Decisions Pending
- simplilms.com domain registration needed
- First tenant (COIN Education) needs to be configured as a deployment
- Supabase migrations need to be applied: LMS, AI interviews, sectors, tenant settings
- `ANTHROPIC_API_KEY` environment variable needed for AI Course Creator
- Stripe env vars needed for payment flow end-to-end
