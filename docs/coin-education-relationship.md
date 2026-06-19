# COIN Education & SimpliLMS — Relationship Explained

## Overview

SimpliLMS is a **multi-tenant SaaS platform** for training schools. COIN Education is the **first tenant** — the training school that SimpliLMS was originally built for. They share the same codebase but serve fundamentally different roles.

| | SimpliLMS | COIN Education |
|--|-----------|----------------|
| **What it is** | SaaS product (the platform) | Training school (a customer) |
| **Sells to** | Schools (B2B) | Students (B2C) |
| **Revenue** | Subscriptions + sector modules | Tuition + instructor marketplace |
| **Supabase project** | `simplilms` (template schema, 0 rows) | `COIN Education` (production data, 46 tables) |
| **n8n instance** | None (n8n is optional per tenant) | `coingroup.app.n8n.cloud` |
| **Stripe account** | Platform Stripe (for SaaS billing, future) | COIN Education Stripe (for student tuition) |

## How they share code

COIN Education's production deployment **is** the SimpliLMS `apps/platform` app, deployed to Vercel with COIN Education-specific environment variables:

```
TENANT_ID=<coin-education-uuid>
TENANT_NAME=COIN Education Services Center
NEXT_PUBLIC_SUPABASE_URL=<coin-education-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<coin-education-service-key>
STRIPE_SECRET_KEY=<coin-education-stripe-key>
N8N_WEBHOOK_ENROLLMENT_CONFIRMED=<coin-education-n8n-webhook>
...
```

Every tenant gets the same app binary with different env vars pointing to their own Supabase project, Stripe account, and (optionally) n8n instance.

## The n8n relationship

n8n is **not part of SimpliLMS itself**. It is an optional automation layer that individual tenants can use.

### How it works

The SimpliLMS codebase has webhook hooks at key points in the admissions/payment pipeline:

1. **Application submitted** → fires `N8N_WEBHOOK_APPLICATION_SUBMIT` (if set)
2. **Application approved/rejected** → fires `N8N_WEBHOOK_APPLICATION_REVIEW` (if set)
3. **Payment completed + credentials provisioned** → fires `N8N_WEBHOOK_ENROLLMENT_CONFIRMED` (if set)
4. **Remarketing campaign sent** → fires `N8N_REMARKETING_WEBHOOK_URL` (if set)

If the env var is not set, the webhook call is silently skipped. The platform works without n8n — students can still apply, pay, and log in. n8n just handles the email/SMS notifications.

### COIN Education's n8n setup

COIN Education has 15 workflows on `coingroup.app.n8n.cloud` that handle:

- Welcome emails with login credentials after payment
- Application confirmation and review notification emails
- Discovery call scheduling via Zoom
- Remarketing campaigns (email, SMS, WhatsApp via Brevo/Twilio)
- Payment plan reminders (daily cron)
- Link tracking (open/click analytics)
- Global error handling

These workflows use their own `SUPABASE_SERVICE_ROLE_KEY` stored in n8n's environment/credentials — they do **not** receive the key from webhook payloads.

### For new tenants

When onboarding a new tenant:

- If they want email automation → they set up their own n8n instance (or project), import/recreate the workflow templates, configure their own credentials, and set the `N8N_WEBHOOK_*` env vars in their Vercel deployment.
- If they don't want automation → leave the env vars blank. Everything still works except automated emails won't send.

The 15 workflow JSONs in `n8n/workflows/` are currently COIN Education-specific (hardcoded `portal.coineducation.com` URLs, COIN branding in email templates). They need to be templated with tenant-specific variables before they can be reused for other tenants.

## Schema divergence

This is the biggest technical debt in the relationship.

### What happened

COIN Education's database was built first, before SimpliLMS was formalized as a multi-tenant product. As SimpliLMS evolved through Phases 11-17 (LMS, AI Course Creator, gamification, discussions, analytics, settings), the new migrations were applied to the `simplilms` Supabase project but **never applied to COIN Education's production database**.

Meanwhile, COIN Education's database grew 24 additional tables for operational needs (cohorts, instructor applications, referrals, job placements, compliance, support tickets, etc.) that were built directly in production and never ported back to the SimpliLMS migration files.

### Current state

- **SimpliLMS schema:** 38 tables, all from the codebase migrations, 0 rows (never used)
- **COIN Education schema:** 46 tables — 22 shared with SimpliLMS (but with column differences), 24 unique to COIN Education

Key column mismatches on shared tables:
- `applications` — SimpliLMS has `payment_token`, `citizenship_document_type`, `citizenship_document_url`; COIN Education doesn't
- `tenants` — SimpliLMS has 8 branding/settings cols; COIN Education has 27 operational cols
- `courses`, `lessons` — structurally different (LMS-oriented vs program-oriented)
- `prospects` — COIN Education has 10 extra cols for consent, referrals, and ISA

### Impact

The shared codebase assumes the SimpliLMS schema. When COIN Education runs that code and hits a column that doesn't exist in its database (like `payment_token`), it fails. This is the root cause of the payment issues discovered in June 2026.

### Resolution path

1. **Short-term:** Add missing columns to COIN Education's database that the codebase requires (e.g., `payment_token` on `applications`)
2. **Medium-term:** Decide which COIN Education-specific tables should become SimpliLMS features and create proper migrations for them
3. **Long-term:** Establish a single source of truth for the schema — all changes go through SimpliLMS migrations, applied to all tenant databases including COIN Education

## Supabase instances

As of June 2026, there are 4 SimpliLMS-related Supabase projects:

| Instance | Purpose | Status |
|----------|---------|--------|
| `COIN Education` | Production tenant | **Active — has real data** |
| `simplilms` | Template schema (prod) | Empty — can be used as reference |
| `simplilms-dev` | Dev environment | **Empty shell — no tables, safe to delete** |
| `coin-education-dev` | COIN Education dev | **Empty shell — no tables, safe to delete** |
