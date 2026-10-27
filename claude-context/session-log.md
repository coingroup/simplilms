# SimpliLMS — Session Log

---

## 2026-04-09

**Session Goals:**
- Initialize claude-context tracking system for cross-device, cross-session continuity

**What Was Done:**
- Scanned full project: monorepo structure, tech stack, integrations, CI/CD, env vars, migrations
- Created `claude-context/` folder with:
  - `memory.md` — Fully populated project context (stack, status, decisions, conventions, blockers)
  - `session-log.md` — This file, with session logging template
  - `README.md` — Workflow instructions for maintaining context across sessions/devices
- Allowlisted `claude-context/` in `.gitignore`
- Committed everything

**Blockers:**
- None

**Next Session Goals:**
- Resume work on any pending tasks or new feature development
- Address launch blockers (domain, Supabase auth hook, env vars, Vercel deployment) as needed

## 2026-08-18 — Credential handling rules added to CLAUDE.md

- **Change:** standing section in `CLAUDE.md` covering credential recovery, overwriting in place, mode encoding, runtime verification, and handoff. Commit `4c66a08` on `dev` — committed, not pushed.
- **Store of record:** Doppler `simplilms-platform`, Vercel environment, and `.env.local` — three copies, none propagating.
- **Mode-encoded credential:** Not yet — `.env.example` seeds `sk_test_`/`pk_test_` placeholders. Flagged to add an explicit mode variable **before** live keys arrive rather than swapping values.
- Unrelated Phase 18–21 edits were already uncommitted in the working tree and were left untouched; only `CLAUDE.md` was staged.
- Docs only — no code, no migrations, no deploy.

## 2026-10-26 — Supabase security cleanup (Launch Sprint "Other Supabase databases - security check", Asana 1219224655474351)

- **Source:** handoff from the fitnneka session. Owner marked simplilms (ref rorfxjwsggtbgsnzlzec) LIVE on 2026-10-26. Advisors (read-only, 10-26): 8 WARN, no errors; 4 SECURITY DEFINER functions executable by anon and authenticated.
- **Read from live (read-only):** all four functions are SECURITY DEFINER with search_path pinned; ACL has PUBLIC, anon, authenticated, service_role. Both update functions filter `WHERE id = auth.uid()`, so they only touch the caller's own row and match nothing with no session (not exploitable, just exposed).
- **Dependency found:** all 151 public-schema RLS policies are `TO public`; 146 call current_tenant_id()/current_user_role(). After the revoke an anon query on those tables errors with "permission denied for function" instead of returning 0 rows. Code check: loadTenantConfig uses the service-role key; the only RPC callers (profile page, notifications action) run signed in. Nothing found that queries those tables as anon.
- **Change:** migration `20261026000000_revoke_anon_execute_helper_functions.sql` (REVOKE from PUBLIC, anon; GRANT to authenticated, service_role). Not applied anywhere yet.
- **No staging project exists for simplilms** (one project per tenant; only rorfxjwsggtbgsnzlzec). Staging proof is not possible; assumption: proof is the read-only live checks above plus verify-in-window below. Recorded as an assumption for the owner to overrule.
- **Production:** queued with prod-queue (see below once id is known). Not applied by this session.
- **Open:** after the window, re-run security advisors; expect only accepted items. Asana task is the owner's to close (covers seven projects; this repo's part only).
