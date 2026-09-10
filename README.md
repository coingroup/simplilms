# SimpliLMS

All-in-one SaaS platform for training schools and education businesses. White-label, multi-tenant, built for scale.

## What It Does

| Module | Description |
|--------|-------------|
| **Admissions CRM** | Prospect pipeline, discovery calls, eligibility decisions |
| **Applications** | Online applications, KYC via Stripe Identity, document upload |
| **Payments** | Stripe Checkout, installment plans, income share agreements |
| **Core LMS** | Courses, modules, lessons, quizzes, progress tracking, certificates |
| **AI Course Creator** | Claude API interviews SMEs and auto-generates full courses |
| **Discussion Forums** | Threaded per-course discussions with moderation |
| **Gamification** | XP points, daily streaks, 15 achievement badges, leaderboard |
| **Analytics** | Course performance, at-risk students, revenue, CSV exports |
| **Student Portal** | Dashboard, courses, payments, messages, classes, badges |
| **Instructor Portal** | Classes, attendance, Zoom integration, earnings |
| **Admin Portal** | Full CRM, course builder, settings, analytics, tenant management |
| **Marketing Site** | Landing page, pricing, 8 industry-specific pages |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 / React 18 / Tailwind CSS / shadcn/ui |
| Hosting | Vercel |
| Database | Supabase PostgreSQL (one project per tenant) |
| Auth | Supabase Auth (email + magic link) |
| Payments | Stripe (Checkout, Identity, Connect) |
| AI | Claude API (Anthropic) |
| Automation | n8n Cloud (15 workflows) |
| Monorepo | Turborepo + npm workspaces |

## Quick Start

```bash
# Prerequisites: Node.js >= 20, npm >= 11

# 1. Install dependencies
npm install

# 2. Set up environment
cp apps/platform/.env.example apps/platform/.env.local
# Fill in your Supabase, Stripe, and Anthropic keys

# 3. Apply database migrations
npx tsx scripts/apply-migrations.ts --url YOUR_SUPABASE_URL --key YOUR_SERVICE_KEY

# 4. Start development
npm run dev
# Platform: http://localhost:3000
# Marketing: http://localhost:3001
```

## Repo Structure

```
simplilms/
├── apps/
│   ├── platform/           # SaaS app (55+ routes, deployed per tenant)
│   └── marketing/          # simplilms.com (14 static pages)
├── packages/
│   ├── core/               # Shared business logic, actions, components
│   ├── ui/                 # 18 shadcn/ui components
│   ├── database/           # Supabase types + client
│   ├── auth/               # Auth helpers (server + client)
│   └── config/             # Tailwind + TypeScript configs
├── supabase/
│   └── migrations/         # 12 SQL migration files (33 tables)
├── n8n/
│   └── workflows/          # 15 automation workflow JSONs
└── scripts/                # Tenant provisioning + migration tools
```

## Multi-Tenant Architecture

Each tenant (customer) gets fully isolated infrastructure:

- **Vercel deployment** of `apps/platform` with custom domain
- **Supabase project** with its own PostgreSQL database
- **Stripe account** for payments
- **Environment variables** pointing to tenant-specific resources

Data isolation is enforced at every layer:
- Every table has a `tenant_id` column
- Row-Level Security (RLS) policies on all 33 tables
- `current_tenant_id()` PostgreSQL function extracts tenant from JWT
- `getTenantId()` resolves from `TENANT_ID` env var on the server

Branding is applied dynamically:
- `TenantProvider` (React Context) passes config to components
- `ThemeInjector` injects CSS variables at runtime for shadcn/ui theming
- `loadTenantConfig()` loads from Supabase with env var fallback

## Roles

| Role | Access |
|------|--------|
| `super_admin` | Full access to everything |
| `school_rep` | CRM only (prospects, applications) |
| `teacher_paid` | Their courses, classes, attendance, earnings |
| `teacher_unpaid` | Same as above minus earnings |
| `student` | Their enrollments, courses, payments, messages |

Role-based access is enforced in middleware, server actions, and RLS policies.

## Environment Variables

Copy `apps/platform/.env.example` to `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `TENANT_ID` | Yes | UUID of the tenant row |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key |
| `STRIPE_IDENTITY_WEBHOOK_SECRET` | For KYC | Stripe Identity webhook secret |
| `STRIPE_PAYMENT_WEBHOOK_SECRET` | For payments | Stripe payment webhook secret |
| `ANTHROPIC_API_KEY` | For AI courses | Claude API key |
| `N8N_WEBHOOK_BASE_URL` | For automation | n8n instance URL |

## Database Migrations

12 migration files creating 33 tables with full RLS:

```bash
# Apply all migrations to a Supabase project
npx tsx scripts/apply-migrations.ts --url $SUPABASE_URL --key $SERVICE_KEY

# Dry run (preview without executing)
npx tsx scripts/apply-migrations.ts --url $SUPABASE_URL --key $SERVICE_KEY --dry-run

# Print SQL only (for manual paste into Supabase SQL Editor)
npx tsx scripts/apply-migrations.ts --print-only
```

## Provisioning a New Tenant

```bash
npx tsx scripts/provision-tenant.ts
```

Interactive CLI that generates:
- `.env` file content for the new Vercel deployment
- `seed.sql` for tenant initialization
- Checklist of manual setup steps

## n8n Workflows

15 automation workflows in `n8n/workflows/`. See [`n8n/README.md`](n8n/README.md) for import instructions.

Covers: interest forms, discovery calls, eligibility decisions, application processing, Stripe webhooks, enrollment finalization, remarketing, payment reminders, Zoom integration, error handling, and GitHub sync.

## Industry Sectors

8 pre-built sector modules with industry-specific question banks:

- Healthcare & Medical Training
- Real Estate & Licensing
- Technology & IT Certification
- Financial Services & Compliance
- Construction & Trades
- Beauty & Cosmetology
- Legal & Paralegal
- Education & Teaching

Sectors can be activated per-tenant from the admin settings panel.

## Scripts

```bash
npm run build        # Build all apps and packages
npm run dev          # Start dev servers
npm run lint         # Lint all packages
npm run type-check   # TypeScript type checking
npm run clean        # Clean all build artifacts
```

## License

Proprietary. Copyright COIN Group.
