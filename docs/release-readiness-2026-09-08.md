# LogaXP release readiness audit — September 8, 2026

**Verdict: the core application works locally, but this is not ready for a public production release.** The remaining work includes reproducible authentication and document-routing defects, unfinished public-facing behavior, dependency remediation, and production integration testing.

This audit used the isolated `logaxp_demo` database on `127.0.0.1:5544`, API on port 5500, and frontend on port 3010. A separate production frontend build ran on port 3012. Neon was not modified. All new people, workspaces, time records, and messages are synthetic local fixtures.

## Coverage and results

| Check | Result | Scope / limitation |
| --- | --- | --- |
| Existing backend test suite | 33/33 pass | Smoke, auth, integration-style, employee documents, chat, testing, project hardening. Several tests use mocks; these alone are not live E2E coverage. |
| Frontend TypeScript | Pass | `tsc --noEmit --incremental false`. |
| Frontend lint | Fail | 786 errors and 150 warnings across 691 files. All errors reported by this run are `no-explicit-any`; warnings include unused variables and hook dependencies. These are not 786 proven runtime bugs. |
| Frontend production build | Pass with system CA store | Initial Google Fonts download failed certificate validation. Retest using `NODE_OPTIONS=--use-system-ca` passed. TLS validation remained enabled. Build explicitly skips lint. |
| API production build | Pass | Nx API build. |
| Worker production build | Pass | Nx worker build. |
| Fresh database deployment | Pass | All checked-in migrations applied to separate `logaxp_migration_audit`; schema comparison found no drift. |
| Production page HTTP smoke | 94 requests: 90 HTTP 200, 4 HTTP 404 | Includes expected `/_not-found`; actual broken links are `/demo`, `/terms`, `/privacy`. This verifies server route responses, not every interactive feature. |
| Populated API read smoke | 68 endpoints: 61 HTTP 200, 6 expected HTTP 403, 1 defect | Six site-admin endpoints correctly reject tenant-owner access and subsequently return 200 with site-admin access. `/employees/folders` incorrectly returns 404. |
| Browser employee workflow | Pass | Required-field validation, synthetic employee creation, review step, saved detail page and assignment visible. |
| Browser payroll | Pass for display | Generated pay periods appear in the payroll UI. Submission and approval were exercised via live API. |
| Browser homepage | Desktop/mobile reviewed | Mobile hero fits at 390px and menu opens; several content, navigation, and accessibility gaps remain. |
| Contact-sales submission | Fail | Browser displays “Message received” without a request to persist or deliver the enquiry. |

### Live workflows exercised

- Owner authentication and account identity; linked employee creation/read/update; invalid employee input rejection.
- Attendance clock-in, break, clock-out; manual time entry; reversed time interval rejection; date-range summaries.
- Vacation request creation, approval, and history.
- Shift creation/read; onboarding template and instance creation/start/completion. This used an empty template and does not certify document-dependent onboarding.
- Project creation/summary; work-item creation/update; project-scoped testing list/dashboard reads.
- Focus timer start and stop. An immediate stop is rejected as too short; a later stop succeeds.
- Pay-period generation, timesheet submission, and approval. This does not test payroll calculation correctness, disbursement, tax, or regulatory compliance.
- Unauthenticated employee access rejected; restricted-member reads/writes rejected; cross-tenant employee ID rejected; spoofing `x-tenant-id` did not expose the other tenant's fixture.
- Delayed refresh succeeds and replaying that rotated cookie returns 401. Immediate refresh has a separate defect below.
- Registration, local welcome/verification delivery, email verification, single-use verification-token enforcement, password-reset email, reset, single-use reset-token enforcement, and persisted password verification.
- New workspace signup, captured verification email, verified login, and owner-role provisioning passed: the new owner received `tenant.owner` and 19 navigation capabilities. This distinguishes the working signup path from the incomplete original demo seed.
- Site-admin tenant, showcase, taxonomy, and audit-log reads.

The initial workflow script recorded an invalid `ANNUAL` leave type and a timer stopped immediately after starting. Corrected tests using `VACATION` and an elapsed timer passed. Those two initial results are test-input/timing issues, not application defects.

## Release blockers and acceptance criteria

### R1 — Refresh token collision (high priority)

**Observed:** login followed by refresh within the same second returns HTTP 500. The API logs Prisma P2002 on `RefreshToken_tokenHash_key`. Delaying refresh by more than a second returns 201; replaying the successfully rotated cookie then returns 401.

**Cause supported by code:** `TokensService.signRefresh` signs the same `sub` and `familyId` without a per-token identifier. JWT timestamps have second precision, so same-second signing can reproduce the existing token and hash. Both tenant and global refresh paths insert a new row with that hash.

**Work:** give each refresh token a unique identifier, preserve family rotation/replay rules, and add real-token/database regression coverage for immediate and concurrent refresh. Existing auth tests mock token signing and did not catch this.

**Acceptance:** immediate rotation never produces a duplicate hash or 500; prior token replay is rejected; concurrent requests have a defined tested outcome; normal browser refresh remains logged in.

Sources: `logaxp-api/libs/auth/src/tokens.service.ts`, `libs/auth/src/lib/auth.service.ts`; evidence: `security-payroll-audit.json`, `refresh-followup.json`.

### R2 — Document folder endpoint shadowed (high priority)

**Observed:** authorized `GET /api/v1/employees/folders` returns “Employee not found” (404).

**Cause supported by code:** `EmployeesController` registers `GET :id` before `EmployeeDocumentsController` registers `GET folders`, both under `employees`. The request is treated as employee ID `folders`.

**Work:** register specific routes before the parameter route or give document folders an unambiguous path. Verify other static employee routes and align frontend services.

**Acceptance:** folder listing returns the documented response, with live HTTP tests covering folders, detail IDs, and permissions.

Sources: `apps/api/src/app/app.module.ts`, `controllers/employees.controller.ts`, `controllers/employee-documents.controller.ts`.

### R3 — Sales enquiries are silently lost (high priority)

`src/app/contact/page.tsx` waits 650ms and sets success state; it neither calls an API nor saves the form. The browser confirmed the false success message.

**Work:** implement validated enquiry persistence/delivery, error states, and appropriate abuse controls. Confirm the intended sales destination before enabling outbound delivery.

**Acceptance:** a submission has a durable record or verified delivery; failures never display success; duplicate submissions and validation are tested.

### R4 — Dependency findings need triage (high priority)

- Frontend `npm audit --omit=dev`: **14 findings: 1 critical, 11 high, 2 moderate**. The critical result names Swiper prototype pollution, advisory `GHSA-hmx5-qpq5-p643`.
- Backend `pnpm audit --prod`: **110 reported findings: 35 high, 69 moderate, 6 low**. Package-manager totals include dependency paths and are not equivalent to independently exploitable application defects.

**Work:** triage reachability, update affected direct/transitive packages using compatible releases, retest builds and main workflows, and document any accepted residual findings. Do not apply a blanket forced upgrade without reviewing breaking changes.

**Acceptance:** no unreviewed critical/high findings in the release dependency graph; lockfiles and tested runtime versions are fixed in source control.

### R5 — Missing pages and misleading product data (high priority for launch)

- `/demo`, `/terms`, and `/privacy` return 404 but are linked from public/login screens.
- Portal overview uses hardcoded employee counts, recruitment, leave, performance, and payroll figures (`DashboardContent.tsx`). These do not reflect the local database.
- Time/payroll screens expose “Stage 1”, future-stage notes, raw endpoint explanations, and other implementation copy.
- Header search, notifications, and user-menu controls need functional/accessible acceptance tests; the current user-menu click showed no visible result.

**Acceptance:** every launch CTA reaches a functioning destination; approved policy content exists; operational dashboard metrics use real queries or are clearly labeled as demo data; unfinished controls are completed or removed from launch scope.

### R6 — Release packaging and environment separation

- The frontend has extensive existing modified/untracked work. The backend folder is not currently a Git repository. A reproducible reviewed release revision is not established.
- Current local `.env` is intentionally a demo environment, including local database/JWT secrets and unconfigured payment/storage integrations. It must not be copied into production.
- Explicitly set `NODE_ENV=production` in the release environment. Development registration/signup responses expose verification tokens by design; the code removes them outside development.
- The original seed provides only four basic permissions and leaves the demo site-admin's tenant membership without a role. The isolated demo needed explicit full RBAC provisioning. Test the supported bootstrap path for new installations.
- API, worker, PostgreSQL, and Redis all need independently managed production lifecycles. The root “Hello API” response does not establish database/Redis/worker readiness.
- Configure HTTPS origins and cookie settings, secret management, backups/restore verification, health/readiness checks, error monitoring, and queue failure handling before rollout. Real provider delivery/storage/payment tests remain outstanding.

**Acceptance:** a clean checkout can build, migrate, bootstrap roles, start services, pass staging smoke tests, and roll back using a documented process. Deployment uses a staging-tested configuration and a known revision.

## Homepage change brief

Specific design preferences were requested during the audit and remain pending. Recommended concrete scope:

1. Decide whether the primary offer is the HR/business platform or an agency-plus-products business. Keep one clear primary message; move secondary services below the main product explanation.
2. Add a prominent working product/demo CTA near the hero. Replace the broken demo destination.
3. Show the modules verified in this audit: people, onboarding, attendance, leave, scheduling, timesheets, and work management. Align recruitment, AI, engagement, and performance claims with functionality actually available at launch.
4. Replace or substantiate the “38% time-to-hire”, “22% retention”, and other outcome claims. Use real product screens rather than unsupported proof points.
5. Replace `#` showcase/footer destinations and repeated placeholder blog content with real destinations/content, or omit unfinished sections.
6. Replace the default SEO description “Generated by create next app” and reconcile the “Software Agency” title with the chosen offer. Review social previews, indexing metadata, and accurate copyright text.
7. Improve the low-contrast logo on the light navbar, give mobile visitors a clear login/contact path, and validate keyboard focus, menu semantics, accessible names, contrast, and reduced-motion behavior.

The homepage was reviewed, not redesigned in this audit. No new unverified marketing promises were added.

## Suggested delivery order

| Phase | Work | Exit criterion |
| --- | --- | --- |
| 1 | Refresh collision, document routing, dependency triage | Regression tests pass; security findings triaged. |
| 2 | Real contact submission, missing destinations, dashboard accuracy, bootstrap | Critical user journeys have no false-success/placeholder behavior. |
| 3 | Homepage revisions and navigation/accessibility cleanup | Approved positioning and desktop/mobile review; all CTAs work. |
| 4 | Staging deployment and real integrations | Email, storage, payment sandbox, monitoring, backups, and rollback verified. |
| 5 | Release candidate | Repeat E2E against the immutable staging build; approve production rollout. |

## What remains unverified

This is broad local release-readiness testing, **not exhaustive certification of all 117 page files or 363 API paths**. Remaining coverage includes every role/action combination, all employee subforms and document uploads, real invitation acceptance, nonempty onboarding tasks, scheduling conflicts/DST, complete payroll calculations, payment-provider webhooks, chat realtime delivery, large imports/exports, load/soak testing, comprehensive keyboard/screen-reader testing, and production-domain cookie/CORS behavior.

External storage/payment integrations were not exercised. Email was delivered only to the local SMTP catcher; production deliverability is unverified. HTTP 200 route checks do not establish client-side authorization or complete workflow correctness.

## Evidence and local state

Detailed evidence is in `C:/Users/kriss/logaxp-api/tmp/local-demo/`:

- `backend-tests.log`, `api-build-audit.log`, `worker-build-audit.log`
- `frontend-build.log` (initial certificate failure), `frontend-build-system-ca.log` (successful build)
- `migration-audit.log`, `migration-drift.log`
- `production-route-audit.json`, `api-read-baseline.json`, `api-read-audit.json`
- `workflow-audit.json`, `security-payroll-audit.json`, `refresh-followup.json`, `site-admin-audit.json`, `email-audit.json`, `signup-audit.json`
- `dependency-audit.json` (backend)

Frontend raw outputs: `.codex-typecheck.log`, `.codex-eslint.json`, `.codex-dependency-audit.json` in the frontend root.

The local API/worker use queue prefix `logaxp-local-demo`. The local SMTP catcher listens on `127.0.0.1:1025` and stores messages under `tmp/local-demo/mail`. Synthetic employees, projects, leave, shifts, timesheets, and audit workspaces were retained for review. Sensitive demo credentials and mail tokens remain in local files and are not included in this report. The audit scripts create fixtures and are not a production test suite; use them only against the isolated local demo.

The temporary production frontend on port 3012 was stopped after testing. The regular frontend/API and local email test services remain running.
