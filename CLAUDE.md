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

**Last updated:** 2026-03-15

### Completed
- Turborepo monorepo with 5 packages and 2 apps
- All @simplilms/* packages renamed from @coin-education/*
- Zero COIN Education references in runtime code
- `apps/platform` — Full admissions/enrollment SaaS (43 routes + middleware)
  - CRM & prospect pipeline
  - Application flow with 5-step wizard
  - Stripe Identity KYC
  - Payment processing (full + installment plans)
  - Student portal (dashboard, messages, classes, payments)
  - Instructor portal (classes, attendance, earnings)
  - Role-based access control (5 roles)
  - Tenant-dynamic branding (TenantProvider + ThemeInjector)
  - **Tenant admin panel** (list, create, detail/edit) — super_admin only
  - **Core LMS** (Phase 11) — see below
- `apps/marketing` — SimpliLMS landing page + pricing page + **industry pages**
  - Landing: hero, features grid, **industry grid**, how-it-works, social proof, CTA
  - Pricing: 3 tiers (Starter $99, Professional $299, Enterprise $999) + **sector module add-ons**
  - **Industries hub page** (`/industries`) — 8 sector cards with icons, pricing, links
  - **8 sector landing pages** (`/industries/[slug]`) — full marketing pages per sector:
    - Real Estate ($149/mo), Insurance ($149/mo), Healthcare ($199/mo), CDL Trucking ($149/mo)
    - Cosmetology ($99/mo), IT/Tech ($99/mo), Corporate Compliance ($149/mo), Government ($199/mo)
  - Each sector page includes: pain points, features, AI capabilities, compliance docs, regulators, question bank size, platform features, pricing CTA, cross-links to other sectors
  - Shared Header and Footer components (extracted from inline)
  - Marketing site now: 14 statically generated pages
- `packages/core` — 70+ shared files (8 lib, 14 actions, 45 components)
  - Tenant server actions: CRUD for whitelabel_tenants table
  - `buildTenantContext()` added to all n8n webhook payloads
  - **LMS actions**: courses.ts, progress.ts, quizzes.ts (Course/Module/Lesson CRUD, progress tracking, quiz auto-grading, certificates)
  - **AI Course Creator**: ai-service.ts (Claude API client, prompts), ai-course.ts (server actions), 5 UI components
  - **Sector module feature flags**: 8 new flags in TenantConfig (sectorRealEstate, sectorInsurance, sectorHealthcare, sectorCdlTrucking, sectorCosmetology, sectorItTech, sectorCorporateCompliance, sectorGovernment)
  - `activeSectors` derived array in TenantConfig
  - `deriveActiveSectors()` helper in load-tenant-config
- `packages/ui` — 18 shadcn/ui components
- `packages/database` — Typed Supabase client
- `packages/auth` — Supabase Auth with role-based helpers
- `supabase/` — 9 migration files (6 per-tenant schema + 1 whitelabel_tenants + 1 LMS tables + 1 AI course interviews)
- `n8n/` — 15 workflow JSONs for admissions automation
- `scripts/` — Tenant provisioning CLI
  - `provision-tenant.ts` — Interactive script: generates .env + seed.sql
  - `apply-migrations.ts` — Applies migrations to new Supabase projects
  - `templates/tenant-seed.sql` — Parameterized seed template
- `docs/sector-strategy.md` — Full sector strategy document with architecture, revenue model ($681M TAM), market sizing per sector, regulatory compliance approach, and implementation roadmap
- Build verified: `turbo build` passes for all apps (marketing: 14 pages, platform: 45 routes)

#### Phase 11: Core LMS (Completed)
- **Database migration** (`20260316000001_lms_tables.sql`): 9 new tables — courses, modules, lessons, quizzes, quiz_questions, course_enrollments, lesson_progress, quiz_attempts, certificates. Full RLS policies, indexes, triggers, and `generate_certificate_number()` function.
- **Server actions** (3 new files, ~1,570 lines):
  - `courses.ts` — CourseRow/ModuleRow/LessonRow types, getCourses, getCourseById, getCourseBySlug, getCourseWithContent, createCourse (FormData), updateCourse, toggleCoursePublished, createModule, updateModule, deleteModule, createLesson, updateLesson, deleteLesson
  - `progress.ts` — CourseEnrollmentRow/LessonProgressRow/QuizAttemptRow/QuizRow/QuizQuestionRow/CertificateRow types, enrollStudentInCourse, startLesson, completeLesson, recalculateCourseProgress, startQuizAttempt, submitQuizAttempt (auto-grades MC/TF/short_answer, flags essay for manual grading), issueCertificate
  - `quizzes.ts` — createQuiz, updateQuiz, deleteQuiz, addQuestion, updateQuestion, deleteQuestion (admin-only)
- **Feature flags**: lmsEnabled, aiCourseCreator, certificates, quizzes added to TenantConfig
- **Sidebar navigation**: Courses + Certificates added for admin, teacher, and student roles
- **Admin pages** (5 new routes):
  - `/admin/courses` — Course list table with difficulty badges, status, enrollment counts
  - `/admin/courses/new` — Create course form (title, description, category, difficulty, pricing, learning objectives)
  - `/admin/courses/[courseId]` — Course detail + builder: add/remove modules and lessons, publish/unpublish, content type badges
  - `/admin/certificates` — Certificate management (placeholder)
- **Student pages** (3 new routes):
  - `/student/courses` — Enrolled courses grid with progress bars
  - `/student/courses/[courseId]` — Course player: lesson sidebar navigation, content rendering (text/video/document/embed), mark-complete, next lesson
  - `/student/certificates` — Earned certificates with verification codes, certificate numbers, PDF download
- **Teacher pages** (2 new routes):
  - `/teacher/courses` — Assigned courses grid with student counts
  - `/teacher/courses/[courseId]` — Course detail: info cards (students, modules, lessons, difficulty), content tree, student progress placeholder
- All loading skeletons for every page

#### Sector Module Strategy (Completed — Marketing & Architecture)
- **Strategy document**: `docs/sector-strategy.md` — architecture, revenue model, competitive analysis, market sizing
- **8 target sectors**: Real Estate, Insurance, Healthcare, CDL Trucking, Cosmetology, IT/Tech, Corporate Compliance, Government
- **Pricing model**: $99-199/mo per sector module add-on (on top of Professional $299 or Enterprise $999)
- **Revenue projections**: Conservative Year 2 ARR ~$796K, Aggressive ~$2.5M
- **TAM**: $681M across all sectors (79,000+ potential customers)
- **Key differentiator**: Only platform combining admissions + enrollment + payments + LMS + AI course creation + regulatory compliance documentation
- **TenantConfig updated**: 8 sector feature flags + activeSectors array
- **Marketing pages**: 8 sector landing pages + hub page + updated pricing + updated home page
- **Regulatory bodies covered**: TWC, GNPEC, BPPE, SCHEV, ACCSC, COE, DEAC, FMCSA, state DOI, nursing boards, cosmetology boards, OPM, and more

#### Phase 12: AI Course Creator (Completed)
- **Database migration** (`20260316000002_ai_course_interviews.sql`): ai_course_interviews table with status enum (interviewing/generating/review/completed/failed), generation_mode (interview/document/topic), sector_key, messages jsonb, uploaded_documents jsonb, generated_outline jsonb, token tracking. Full RLS policies.
- **AI service layer** (`packages/core/src/lib/ai-service.ts`, ~300 lines):
  - Claude API client (claude-sonnet-4-20250514 for both interview and generation)
  - `getInterviewSystemPrompt()` — builds SME interview system prompt with sector context
  - `getGenerationSystemPrompt()` — JSON schema output with quality requirements
  - `getDocumentGenerationPrompt()` — for document upload mode
  - `SECTOR_AI_PROMPTS` — 8 detailed sector prompts covering regulations, terminology, standards for: real estate (TREC, GREC, FREC, DRE), insurance (DOI, NAIC, FINRA, NMLS), healthcare (nursing boards, CMS, NAACLS), CDL (FMCSA, ELDT), cosmetology (NIC, state boards), IT/tech (CompTIA, AWS, Azure), corporate compliance (OSHA, HIPAA, EEO), government (OPM, EEOC, CISA)
  - `parseGeneratedOutline()`, `isReadyToGenerate()`, `stripReadyMarker()` helpers
  - Types: ChatMessage, GeneratedOutline, GeneratedModule, GeneratedLesson, GeneratedQuizQuestion
- **Server actions** (`packages/core/src/actions/ai-course.ts`, ~780 lines):
  - `startInterview(formData)` — creates interview, calls Claude for first question (interview mode) or creates row for document mode
  - `sendInterviewMessage(interviewId, userMessage)` — appends message, calls Claude, detects `[READY_TO_GENERATE]` marker, tracks tokens
  - `generateCourseFromInterview(interviewId)` — sends transcript/documents to Claude for structured JSON, parses outline
  - `createCourseFromOutline(interviewId, editedOutline?)` — inserts into courses, modules, lessons, quizzes, quiz_questions from outline
  - `addDocumentToInterview(interviewId, formData)` — text extraction, stores in interview record
  - `deleteAiInterview(interviewId)` — cleanup
  - Queries: `getAiInterviews()`, `getAiInterview(id)`
- **5 UI components** (`packages/core/src/components/ai-course/`):
  - `interview-start-form.tsx` — topic, audience, length, sector, mode selection (interview vs document)
  - `interview-chat.tsx` — real-time chat with typing indicator, auto-scroll, readiness banner
  - `outline-review.tsx` — editable title/description, difficulty badge, learning objectives, module cards, create/regenerate buttons
  - `outline-module-card.tsx` — collapsible module with lesson list, duration, quiz count
  - `interview-status-badge.tsx` — color-coded: interviewing=blue, generating=amber, review=green, completed=gray, failed=red
- **3 admin pages** (`apps/platform/app/(dashboard)/admin/courses/ai/`):
  - `page.tsx` — AI Course Creator listing with interview table or empty state
  - `new/page.tsx` — InterviewStartForm page
  - `[interviewId]/page.tsx` — status-based rendering (chat → spinner → outline review → success → error)
- Updated admin courses page with "Create with AI" button (Sparkles icon)
- Three generation modes: SME Interview, Document Upload, Topic-based
- Build verified: 45 platform routes

### In Progress
- None

### Next
- Sector module database tables: `sector_modules`, `tenant_sector_subscriptions`, `sector_question_banks`
- Sector module content: curriculum frameworks, question banks per sector
- LMS + AI Course Creator migrations need to be applied to Supabase project
- ANTHROPIC_API_KEY environment variable needs to be configured for AI features
- Document upload mode refinement (PDF parsing beyond basic text extraction)

### Blockers / Decisions Pending
- simplilms.com domain registration needed
- First tenant (COIN Education) needs to be configured as a deployment
- LMS migration (`20260316000001_lms_tables.sql`) needs to be applied to Supabase
- AI migration (`20260316000002_ai_course_interviews.sql`) needs to be applied to Supabase
- `ANTHROPIC_API_KEY` environment variable needed for AI Course Creator
