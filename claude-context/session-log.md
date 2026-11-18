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
- **Production:** queued as prod-queue P403 on 2026-10-26. PR #11 merged into dev. Not applied by this session; waits for the owner window.
- **Open:** after the window, re-run security advisors; expect only accepted items. Asana task is the owner's to close (covers seven projects; this repo's part only).

### 2026-10-29 — P403 applied in production window
- **Applied:** migration revoke_anon_execute_helper_functions to rorfxjwsggtbgsnzlzec (same SQL as 20261026000000). Window opened by owner for P403.
- **Verified:** has_function_privilege: anon false, authenticated true, service_role true on all 4 functions. Security advisors now list only 4 authenticated_security_definer_function_executable WARNs (accepted: RLS helpers and signed-in own-row updates).
- **Not verified:** no anon page smoke test run (no anon query path found in code). Undo is the GRANT ... TO anon, PUBLIC in P403 text if a public page breaks.
- **Closed:** prod-queue done 403. Asana task remains the owner to close.

## 2026-11-17 — Dev CI red (test-dev): handoff from coingroup-tooling (owner item 3932)

- **Cause (verified from run 44165715719 log):** `npm run lint` failed with `sh: 1: eslint: not found` in packages/database. ESLint was never a dependency and no ESLint config existed in any workspace. CI on dev has failed on every push since it was added 03-17-2026 (8 runs, all red), so lint has never run.
- **Fix (branch fix/ci-eslint-setup):** eslint 8.57.1 + eslint-config-next 14.2.35 in apps/platform and apps/marketing (`.eslintrc.json` extends next/core-web-vitals and registers @typescript-eslint so existing disable comments resolve); eslint + @typescript-eslint parser/plugin 8.73.0 in packages/auth, database, ui (`.eslintrc.json` with eslint:recommended + typescript-eslint recommended, with an override so `eslint src/` lints .ts/.tsx). One real lint error fixed: a local variable named `module` in admin/sectors/[sectorKey]/page.tsx renamed to `sectorModule` (no behavior or copy change). No rules disabled.
- **Verified locally:** `turbo run lint --force` 5/5 green (only `<img>` warnings); `turbo run type-check` 6/6 green. `npm run build` NOT RUN to completion: the sandbox cannot reach fonts.googleapis.com (next/font). The dev CI job does not build.
- **Production-safety finding:** the only simplilms Supabase project is production (rorfxjwsggtbgsnzlzec; confirmed via list_projects 11-17). The test-dev job ends with `supabase db push` against secret SUPABASE_DEV_REF on every dev push; there is no dev project for it to point at, so it likely points at production (values not readable). Added a CI step that refuses the push when SUPABASE_DEV_REF is empty or equals SUPABASE_PROD_REF, without printing either. Also: repo secrets list only SUPABASE_ACCESS_TOKEN, SUPABASE_DEV_REF, SUPABASE_PROD_REF; the job references SUPABASE_DEV_ANON_KEY, SUPABASE_DEV_SERVICE_ROLE_KEY, SUPABASE_DEV_DB_PASSWORD, which are not set.
- **Owner decision needed:** what the dev migration step should target (a new simplilms-dev Supabase project, or remove the step). Asked via notify-owner; default until answered: guard stays, and dev CI may stay red at the guard or migration step.
- **Landed:** PR #14 (https://github.com/coingroup/simplilms/pull/14) merged into dev 11-17-2026. Independent reviewer agent: no blocking findings. Applied its notes: the guard also fails closed if SUPABASE_PROD_REF is empty, the ref reaches the command through env, and the apps declare @typescript-eslint/eslint-plugin directly.
- **Dev CI after merge (run https://github.com/coingroup/simplilms/actions/runs/44198052859):** Install, Lint, Type check, tests (none defined) and the new guard all PASS. The guard passing proves SUPABASE_DEV_REF is set and differs from SUPABASE_PROD_REF. The job still FAILS at `supabase db push --project-ref`: "unknown flag: --project-ref". That step never worked.
- **Not fixed, deliberately:** making the push work needs `supabase link` and SUPABASE_DEV_DB_PASSWORD (not set). SUPABASE_DEV_REF points at a project that is not simplilms (the org has no simplilms dev project), likely another product's dev database copied from the 03-17 CI template. A working push could write simplilms migrations there. Owner asked: item 3977 (A remove the dev push, recommended; B create simplilms-dev and set secrets; C leave red). Dev CI is NOT green yet.
- **launch-status** refused: simplilms is not in the ops sprint-sessions list; nothing recorded there.
- **Misleading for next session:** apps/platform build fails in this sandbox only because next/font cannot reach fonts.googleapis.com; it is not a code fault. packages/core has no lint script (proposal only, not built).
- **Owner decision 11-17-2026 (item 3977): option A, remove the dev migration push.** Done on branch fix/ci-remove-dev-migration-push: removed the setup-cli step, the `supabase db push` step and the guard (it only protected that push) from test-dev; left a comment on when to re-add it. test-dev now runs install, lint, type check, tests (none defined).
- **Known, not changed:** deploy-prod (push to main) also runs `supabase db push --project-ref`, the same unknown flag, against production. It will fail the same way when main is next pushed. Production CI is the owner's; flagged in the summary alert, not edited.
- **Landed and verified 11-17-2026:** PR #15 (https://github.com/coingroup/simplilms/pull/15) merged into dev. **Dev CI green:** run https://github.com/coingroup/simplilms/actions/runs/44201015974 (test-dev: install, lint, type check, tests all pass). First green dev run since CI was added 03-17-2026.
- **promote staging** refused: "no staging branch on origin". simplilms has no staging branch; not created (structural, owner's call). The promotion-guard workflow expects PRs to main from staging, so a main release would need one.

## 2026-11-18 — Supabase lint 0029 cleanup (handoff from fitnneka; owner items 3366 and 4067, option A)

- **Source:** owner message 11-18-2026 2:09 PM (inbox file), relaying the fitnneka handoff. Owner decided 11-18: lint 0029 (signed-in-callable SECURITY DEFINER) warnings get fixed, not accepted (reverses item 3665 for this category). Asana 1219224655474351.
- **Read-only on prod rorfxjwsggtbgsnzlzec (11-18):** advisors show 4 lint 0029 WARNs, nothing else. Five SECURITY DEFINER functions in public:
  - current_tenant_id(): RLS helper (139 policy refs), no rpc caller, no trigger, no auth.uid() (reads JWT claims).
  - current_user_role(): RLS helper (101 policy refs), same as above.
  - update_student_profile(text x4): rpc from apps/platform/app/(dashboard)/profile/page.tsx; WHERE id = auth.uid().
  - update_notification_preferences(bool, bool): rpc from packages/core/src/actions/notifications.ts; WHERE id = auth.uid().
  - custom_access_token_hook(jsonb): not flagged (execute only supabase_auth_admin, service_role); the Auth hook setting names it by schema. Whether the hook is enabled could not be read (supa-auth-config refuses those fields). Left in public; owner asked.
  - No other function or view references these names. No `private` schema existed.
- **Change:** migration `20261118000000_move_security_definer_to_private.sql`: schema private (usage: authenticated, service_role), the 4 functions moved (OID kept), search_path private, public, pg_temp, SECURITY INVOKER wrappers in public for the 2 rpc functions (same signature, search_path ''), grants, pgrst reload.
- **Proof (no dev/staging project exists):** PGlite harness in the session scratchpad replays prod's 5 definitions and ACLs, applies the migration, and checks: only the hook left as definer in public; OIDs kept; policies resolve to private.*; wrappers work signed in and update only the caller's row; anon refused on wrappers and private; RLS still filters by tenant; service_role works; hook unaffected. All passed 11-18.
- **Review 11-18:** independent reviewer agent, no blocking findings. Applied: removed BEGIN/COMMIT (MCP apply_migration wraps its own transaction); added a CLAUDE.md convention that new policies call `private.current_tenant_id()` / `private.current_user_role()`. Harness re-run: all passed. Reviewer notes kept: anon reads of RLS tables already fail since 10-26 (unchanged); post-apply smoke on prod (student profile save, notification toggle, one RLS read) is the owner's, signed in.
