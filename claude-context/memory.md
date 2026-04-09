# SimpliLMS — Claude Context Memory

## Project Name and Purpose

**SimpliLMS** is a branded SaaS platform (with white-label premium tier) for training schools and education businesses. Built by **COIN Group**, it handles the full lifecycle: admissions CRM, application processing, payment processing (Stripe), student/instructor/admin portals, core LMS (courses, quizzes, certificates), AI course creation (Claude API), discussion forums, gamification, live classes (Zoom), and advanced analytics.

**GitHub:** https://github.com/coingroup/simplilms
**Domain:** simplilms.com (marketing) / [tenant].simplilms.com or custom domain (platform)

---

## Tech Stack and Integrations

| Layer | Technology | Details |
|-------|-----------|---------|
| **Language/Runtime** | TypeScript / Node.js ≥20 | npm 11.6.2, Turborepo 2.3+ monorepo |
| **Frontend** | Next.js 14, React, Tailwind CSS, shadcn/ui | SSR + static generation |
| **Backend** | Next.js Server Actions (`"use server"`) | Actions in `packages/core/src/actions/` |
| **Database** | Supabase PostgreSQL | One project per tenant, 37+ tables, RLS enabled |
| **Auth** | Supabase Auth | Email + magic link, custom access token hook |
| **Payments** | Stripe | Checkout, Identity (KYC), Connect (instructor payouts) |
| **Video** | Zoom Server-to-Server OAuth | Auto meeting creation, recordings |
| **AI** | Anthropic Claude API | AI Course Creator — interview engine + generation |
| **Automation** | n8n Cloud | 15 workflow JSONs for webhooks/pipelines |
| **Hosting** | Vercel | One deployment per tenant |
| **CI/CD** | GitHub Actions | `.github/workflows/ci-cd.yml` |
| **Monorepo** | Turborepo + npm workspaces | `apps/*` + `packages/*` |

### Monorepo Structure

- `apps/platform` — Main SaaS app (60+ routes), deployed per tenant (port 3000)
- `apps/marketing` — simplilms.com public site, 14 static pages (port 3001)
- `packages/core` — Shared business logic, 95+ files (`@simplilms/core`)
- `packages/ui` — 18 shadcn/ui components (`@simplilms/ui`)
- `packages/database` — Supabase types + client (`@simplilms/database`)
- `packages/auth` — Auth helpers (`@simplilms/auth`)
- `packages/config` — Tailwind + TS configs (`@simplilms/config`)
- `supabase/migrations/` — 15 migration files
- `n8n/workflows/` — 15 workflow JSONs
- `scripts/` — Tenant provisioning CLI

---

## Current Status / What's Been Done

**All 21 planned phases are complete.** Platform is launch-ready.

### Completed Phases (1–21)

1. **Phases 1–10:** Foundation, marketing site, portal auth, admin CRM, applications, payments (Stripe), student portal, instructor portal, n8n workflows, white-label multi-tenancy
2. **Phase 11:** Core LMS — courses, modules, lessons, quizzes, progress tracking, certificates (9 DB tables)
3. **Phase 12:** AI Course Creator — Claude API interview engine, 3 generation modes, sector-specific prompts
4. **Phase 13:** Sector module database, admin UI, question banks (8 sector modules, $681M TAM)
5. **Phase 14:** Lesson content editor, enrollment management, quiz-taking UI
6. **Phase 15:** Course edit page, quiz builder, student course catalog/browse
7. **Phase 16:** Advanced analytics — 9 query functions, CSS charts, course drill-down, at-risk students, CSV export
8. **Phase 17:** Admin settings UI — 4 tabbed forms (Organization, Branding with live preview, Features with 16 toggles, Notifications)
9. **Phase 18:** Discussion forums — threaded per course, nested replies, moderation (pin/lock/delete)
10. **Phase 19:** Gamification — XP/points, daily streaks, 15 achievement badges, leaderboard
11. **Phase 20:** Live Classes / Zoom — session tracking, CRUD, recordings, join/start URLs
12. **Phase 21:** Polish & Launch Prep — error boundaries, not-found pages, robots.txt, sitemap, security headers, loading skeletons, DOMPurify XSS protection

### Gap Fixes Completed
- Admin certificate management (list, search, revoke)
- Stripe Connect instructor payouts (onboarding, dashboard link, status)
- Zoom API automation (create/delete meetings, fetch recordings, graceful degradation)
- CI/CD pipeline added

---

## Active Decisions and Reasoning

- **Multi-tenant isolation:** Each tenant gets its own Supabase project + Vercel deployment. Data isolation is enforced via separate databases plus RLS with `tenant_id` on every table. This was chosen over shared-DB multi-tenancy for security and compliance.
- **Server actions over API routes:** Business logic uses Next.js `"use server"` actions in `packages/core/src/actions/` rather than REST API routes. Simpler, fewer moving parts.
- **CSS-only charts:** Analytics dashboard uses pure CSS charts instead of a charting library (Phase 16). Keeps bundle size minimal.
- **ThemeInjector pattern:** Runtime CSS variable injection for white-label branding rather than build-time theme generation. Allows instant preview in admin settings.
- **5 roles:** `super_admin`, `school_rep`, `teacher_paid`, `teacher_unpaid`, `student` — role-based access throughout.

---

## Pending Tasks and Next Steps

### Blockers (Must Resolve Before Launch)
- [ ] **simplilms.com domain** — Not yet registered
- [ ] **Supabase Auth hook** — `custom_access_token_hook` needs to be enabled in Supabase dashboard
- [ ] **`SUPABASE_SERVICE_ROLE_KEY`** — Needs to be pasted into `.env.local` from Supabase dashboard
- [ ] **`ANTHROPIC_API_KEY`** — Needed for AI Course Creator
- [ ] **Stripe account + env vars** — Needed for payment flow end-to-end
- [ ] **n8n instance** — Needed for workflow automation
- [ ] **Vercel deployment** — Not yet deployed

### Potential Future Work [inferred]
- Production monitoring / error tracking (Sentry or similar)
- Email delivery service integration (currently via n8n)
- Mobile app or PWA
- Automated testing suite
- Multi-language / i18n support

---

## Key Conventions and Patterns

- **Imports:** All shared packages use `@simplilms/*` prefix
- **Server actions:** `"use server"` directive, located in `packages/core/src/actions/`
- **Tenant resolution:** `getTenantId()` from `@simplilms/core` reads `TENANT_ID` env var
- **Branding:** `useTenant()` hook for client components, `loadTenantConfig()` for server-side, `ThemeInjector` for CSS variables
- **Database:** All tables have `tenant_id` column with RLS policies; `tenants` table has exactly 1 row per Supabase project
- **No hardcoded brands:** Zero hardcoded brand references in runtime code
- **Naming:** kebab-case file names, PascalCase components, camelCase functions
- **Build:** `npm install` → `npx turbo build` → `npx turbo dev`
- **Migrations:** SQL files in `supabase/migrations/`, applied per tenant
- **Node version:** ≥20.0.0 required

---

**Last updated:** 2026-04-09 | **Device:** Mac-Studio.local
