# n8n Workflows — COIN Education

## Import Instructions

1. Go to **coingroup.app.n8n.cloud**
2. Click **"Add workflow"** → **"Import from File"**
3. Select each JSON file from this directory
4. After import, configure the required credentials/environment variables (see below)
5. **Do NOT activate** until all credentials are configured and tested

## Workflows

| # | File | Name | Trigger | Status |
|---|------|------|---------|--------|
| 1 | `01-interest-form-intake.json` | Interest Form Intake | Webhook POST `/coin-interest-form` | Ready to import |
| 2 | `02-discovery-call-scheduling.json` | Discovery Call Scheduling | Webhook POST `/coin-call-booked` | Ready to import |
| 3 | `03-discovery-call-rescheduling.json` | Discovery Call Rescheduling | Webhook POST `/coin-reschedule` | Ready to import |
| 4 | `04-eligibility-decision-handler.json` | Eligibility Decision Handler | Webhook POST `/coin-eligibility-update` | Ready to import |
| 10 | `10-remarketing-campaign-sender.json` | Remarketing Campaign Sender | Webhook POST `/coin-remarketing-send` | Ready to import |
| 11 | `11-link-tracking-handler.json` | Link Tracking Handler | Webhook GET `/coin-track/open/:id` + `/coin-track/click/:id` | Ready to import |
| 14 | `14-global-error-handler.json` | Global Error Handler | Error Trigger (auto) | Ready to import |
| 5 | `05-application-submission-handler.json` | Application Submission Handler | Webhook POST `/coin-application-submit` | Ready to import |
| 6 | `06-stripe-identity-webhook-handler.json` | Stripe Identity Webhook Handler | Webhook POST `/coin-identity-event` | Ready to import |
| 7 | `07-application-review-handler.json` | Application Review Handler | Webhook POST `/coin-application-review` | Ready to import |
| 8 | `08-stripe-payment-webhook-handler.json` | Stripe Payment Webhook Handler | Webhook POST `/coin-payment-events` | Ready to import |
| 9 | `09-enrollment-finalization.json` | Enrollment Finalization | Webhook POST `/coin-enrollment-confirmed` | Ready to import |
| 12 | `12-payment-plan-reminder.json` | Payment Plan Reminder | Schedule (daily 9 AM EST) | Ready to import |
| 13 | `13-github-sync.json` | GitHub Sync | Schedule (daily 2 AM EST) + Manual | Ready to import |
| 15 | `15-class-zoom-integration.json` | Class/Zoom Integration | Schedule (every 15 min) + Webhook POST `/coin-class-start` | Ready to import |

## Required Environment Variables (in n8n)

Set these in n8n → **Settings** → **Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGci...` |
| `BREVO_API_KEY` | Brevo (Sendinblue) API key | `xkeysib-...` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for alerts | `123456:ABC...` |
| `TELEGRAM_CHAT_ID` | Telegram chat/group ID for alerts | `-100123456` |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | `AC...` |
| `TWILIO_PHONE_NUMBER` | Twilio SMS sender number | `+14045551234` |
| `TWILIO_WHATSAPP_NUMBER` | Twilio WhatsApp sender | `whatsapp:+14045551234` |
| `SCHOOL_REP_WHATSAPP` | School rep WhatsApp number | `whatsapp:+14045559999` |
| `ADMIN_WHATSAPP` | Admin WhatsApp for error alerts | `whatsapp:+14045559999` |
| `ADMIN_WHATSAPP_NUMBER` | Admin WhatsApp number (for enrollment alerts) | `+14045559999` |
| `ZOOM_ACCESS_TOKEN` | Zoom OAuth access token | `eyJ...` |
| `GOOGLE_CALENDAR_ID` | Google Calendar ID | `cal@group.calendar.google.com` |
| `GOOGLE_ACCESS_TOKEN` | Google OAuth access token | `ya29...` |
| `N8N_API_KEY` | n8n API key (for WF13 GitHub Sync) | `n8n_api_...` |

## Required Credentials (in n8n)

For Twilio HTTP Basic Auth nodes:
- **Username:** Twilio Account SID
- **Password:** Twilio Auth Token

## Webhook URLs (after import)

Once imported and activated, update these in the portal `.env.local`:

```env
N8N_WEBHOOK_BASE_URL=https://coingroup.app.n8n.cloud/webhook
N8N_REMARKETING_WEBHOOK_URL=https://coingroup.app.n8n.cloud/webhook/coin-remarketing-send
N8N_WEBHOOK_APPLICATION_SUBMIT=https://coingroup.app.n8n.cloud/webhook/coin-application-submit
N8N_WEBHOOK_APPLICATION_REVIEW=https://coingroup.app.n8n.cloud/webhook/coin-application-review
N8N_WEBHOOK_ENROLLMENT_CONFIRMED=https://coingroup.app.n8n.cloud/webhook/coin-enrollment-confirmed
```

The interest form API route (`apps/web/app/api/interest/route.ts`) should POST to:
```
https://coingroup.app.n8n.cloud/webhook/coin-interest-form
```

Link tracking URLs (used in remarketing emails):
```
Open pixel:  https://coingroup.app.n8n.cloud/webhook/coin-track/open/{tracking_id}
Click wrap:  https://coingroup.app.n8n.cloud/webhook/coin-track/click/{tracking_id}
```

## Workflow Descriptions

### 1 — Interest Form Intake
Receives POST from coineducation.com interest form → validates data → stores prospect in Supabase `prospects` table → sends Brevo confirmation email → sends Telegram alert to admin → responds with prospect ID.

### 2 — Discovery Call Scheduling
Receives booking notification → creates Zoom meeting → updates prospect record in Supabase → sends WhatsApp to school rep with prospect details + Zoom link → sends SMS confirmation to prospect → creates Google Calendar event.

### 3 — Discovery Call Rescheduling
Receives reschedule request → fetches prospect from Supabase → creates new Zoom meeting → updates prospect record → sends SMS to prospect with new details → sends WhatsApp notification to school rep.

### 4 — Eligibility Decision Handler
Receives eligibility status update → routes by status:
- **YES** → generates application link → sends email + SMS to prospect
- **NO** → logs decision (prospect remains remarketing-eligible)
- **MAYBE** → sends Telegram alert to admin for follow-up

### 10 — Remarketing Campaign Sender
Receives remarketing request from portal → routes by channel (email/SMS/WhatsApp) → sends via Brevo or Twilio → updates communication_log with delivery timestamp.

### 11 — Link Tracking Handler
Two webhook endpoints for tracking remarketing engagement:
- **Open tracking** (`GET /coin-track/open/:trackingId`) — Embedded as a 1x1 tracking pixel in emails. Records `opened_at` timestamp in `communication_log`. Returns a transparent GIF with no-cache headers.
- **Click tracking** (`GET /coin-track/click/:trackingId`) — Wraps links in remarketing messages. Fetches the original `link_url` from `communication_log`, records `clicked_at` timestamp (also sets `opened_at` if not already set), then 302-redirects the user to the destination URL.

### 14 — Global Error Handler
Catches errors from any COIN Education workflow → parses error details → logs to Supabase `error_log` table → sends Telegram alert → sends WhatsApp alert to admin.

### 5 — Application Submission Handler
Receives POST when a prospect submits their application → parses application data → sends admin notification email via Brevo → sends WhatsApp alert → sends Telegram alert. All three notifications fire in parallel.

### 6 — Stripe Identity Webhook Handler
**Note:** The primary Stripe Identity webhook is handled by the portal API route (`POST /api/stripe/identity-webhook`) for signature verification and direct database updates. This n8n workflow is an optional secondary handler for sending Telegram notifications when KYC status changes.

### 7 — Application Review Handler
Receives status update when admin approves or rejects an application → routes by decision:
- **APPROVED** → sends congratulations email (Brevo) + SMS (Twilio) to applicant → Telegram alert to admin
- **REJECTED** → sends professional rejection email to applicant

### 8 — Stripe Payment Webhook Handler
Receives payment events from the portal's Stripe webhook handler → routes by event type:
- **enrollment_confirmed** → sends welcome email with login credentials (Brevo) + enrollment SMS (Twilio) + Telegram alert
- **payment_failed** → sends Telegram alert for admin action
- **installment_2_completed** → sends Telegram notification that enrollment is fully active

### 9 — Enrollment Finalization
Receives enrollment confirmation from the portal → sends multi-channel notifications in parallel:
- Welcome email via Brevo (with login credentials, program info, next steps)
- Enrollment SMS via Twilio
- WhatsApp alert to admin
- Telegram alert

The portal's Stripe payment webhook handler calls this workflow after creating the enrollment and provisioning student credentials.

### 12 — Payment Plan Reminder
Runs daily at 9 AM EST via cron schedule. Queries Supabase for pending installment payments, calculates days until due (30 days from creation), and sends reminders at 7, 3, and 1 day(s) before due date. Notifications sent via:
- Brevo email with payment link to portal
- Twilio SMS with amount and due date

### 13 — GitHub Sync
Runs daily at 2 AM EST (or manually triggered). Queries the n8n API for all COIN Education tagged workflows, catalogs their status (active/inactive, last updated), and sends a Telegram summary notification.

### 15 — Class/Zoom Integration
Runs every 15 minutes (or via webhook POST to `/coin-class-start`). Checks active classes for sessions starting within the next 15 minutes by parsing schedule jsonb. For each class starting:
- Fetches enrolled students from `class_enrollments`
- Creates in-portal class reminder messages with Zoom join link
- Sends Telegram alert to admin
