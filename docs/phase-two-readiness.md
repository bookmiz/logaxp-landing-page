# Phase 2 application readiness — 2026-09-08

## Decision

Local implementation and regression verification are complete for the scope below. This is not approval to deploy the full application. Unverified workflows listed below are excluded from the launch scope until their gates pass; their existing screens are not all feature-flagged off yet. Release preparation must enforce these exclusions in navigation and APIs before a restricted launch.

## Delivered and verified

| Area | Result and evidence |
| --- | --- |
| Dashboard and navigation | Database-backed employee counts, clock status, leave requests and status distribution, with personal/workspace scope. Analytics uses the same real metrics. Reports links to available reports. Removed fake global search and notification badge. Account menu displays the current identity; notifications load real data. Browser verified dashboard, retry, account menu and empty notifications. |
| Employee records | Live HTTP tests cover profile creation, invalid and duplicate submissions, updates, payroll-profile upsert and access restrictions. Manager reporting uses a real primary assignment and linked employee account. |
| Documents | Live metadata registration, document creation, boolean verification validation, expiry listing, public request submission and replay rejection pass. This does not verify binary storage or retrieval. Onboarding now has a file picker with upload progress, size/type checks and useful configuration errors. |
| Invitations and onboarding | Employee invitation enters the email queue and reaches the isolated SMTP catcher through the worker. Canonical acceptance link works; acceptance creates and links the employee account, and replay fails. An actual required onboarding task must complete before the instance can complete. |
| Time and leave | Clock-in, duplicate clock-in, aggregate breaks, clock-out, leave validation/approval/history, timer start/stop and duplicate stop tests pass. Ownership checks scope clocks, entries, timers and timesheets. Manager summary and team boundaries are exercised. |
| Scheduling | Overnight shifts, reversed ranges and overlap rejection pass. Concurrent overlapping creates allow one winner. Time-zone helpers reject ambiguous/nonexistent local DST times; explicit instants remain usable. |
| Timesheets | Concurrent submission has one winner; decisions require administrative permission. Repeated decisions fail; locked periods reject tested entry/submission mutations; foreign-period operations fail. Frontend approval visibility matches the backend permission. |
| Overtime | Calendar-day splitting, daily/weekly/double-time thresholds, partial-week history, break subtraction, overnight work and 7/9-hour DST nights have deterministic tests. Daily and weekly overtime are not double-counted. |
| Projects and testing | Live tests create/update work items, board columns and sprints, execute a test case, complete the run and close the sprint. |
| Chat | REST message persistence/edit and real Socket.IO token authentication/delivery pass, including a thread created after recipients connect. Fixed DTO validation that previously discarded payload fields. |
| Customer feedback | Removed several development/API explanations, added operational empty/loading/error states, prevented selected duplicate actions, and neutralized spreadsheet formulas in CSV exports. Contact form now opens an email draft and clearly says the website has not sent the message. |

## Explicit exclusions and open launch gates

1. **Binary document storage and evidence uploads:** configure reviewed staging storage, then exercise real uploads, download authorization, tenant boundaries, retention, failed uploads and cleanup. Current tests register metadata; they do not prove a file can be stored or downloaded. Do not launch storage-dependent onboarding or document collection yet.
2. **Bulk employee imports/exports:** no complete verified bulk workflow is included. CSV escaping/formula tests verify the shared exporter only, not a full employee import/export round trip.
3. **Monetary payroll:** the page is labelled **Approved hours export**. Wages, taxes, deductions, statutory rules and payment/disbursement are excluded. CLOCKS or dated ENTRIES are the supported calculation sources; BOTH is rejected to avoid double counting. Duration-only undated entries are not payroll inputs. Aggregate breaks are prorated across local-day segments because individual break timestamps are not available.
4. **Locking at boundaries:** ordinary locked-period mutations and concurrent timesheet decisions are tested. Entries or clock adjustments spanning pay-period boundaries, and concurrent edits racing a period lock, still require dedicated hardening and regression coverage before attendance data can be treated as a finalized payroll ledger.
5. **Onboarding variants:** TASK checklist completion and account linking are verified. FORM, policy acknowledgement and storage-dependent completion need their own end-to-end acceptance cases.
6. **Advanced scheduling and timers:** template generation across DST changes, recurrence, bulk reassignment and timer switching are not certified by the targeted cases. Current coverage tests time conversion helpers, manual overnight shifts and concurrent overlap handling.
7. **Production integrations:** SMTP tests use a local catcher only. Production email delivery, SMS OTP/Termii activation, storage, monitoring and provider failure behaviour belong to staging/release verification. Website contact capture is an email draft, not a server-delivered enquiry.
8. **UI acceptance breadth:** API regression coverage is substantially broader than browser coverage. Complete mobile/browser role journeys and accessibility checks remain required. This report does not claim every screen or every action in the large application has been tested. Remaining role-specific placeholder/development copy should be checked in those journeys.

## Validation results

- Backend: **73 tests passed, 0 failed, 0 skipped**, including opt-in live database/HTTP workflow and security tests, local SMTP and Socket.IO.
- Frontend CSV regression tests: **3 passed**.
- Frontend TypeScript check and focused lint of revised dashboard/header/report/export areas: passed. Pre-existing whole-project lint debt remains recorded in Phase 1.
- Production frontend build: passed in the separate clean dependency installation. Backend API and worker builds: passed.
- Fresh dependency audit: frontend **0** vulnerabilities; backend production **0**. Backend development tooling remains at **2 high / 1 moderate**, previously reviewed in `phase-one-baseline.md`; this phase adds only a pinned Socket.IO test client.
- No database schema changes, production database writes, deployment or external emails were performed. Synthetic regression fixtures are removed after tests. Local SMTP messages and ignored diagnostic logs remain local.

## Reproduce

Use the Node and package-manager versions and isolated infrastructure described in `phase-one-baseline.md`. Use a local PostgreSQL database (`logaxp_demo` or `logaxp_phase1_test`), Redis with an isolated queue prefix, and the local SMTP catcher on port 1025. The workflow mail assertion expects messages under backend `tmp/local-demo/mail`; the worker must be running with the same local configuration.

Backend (PowerShell; API and worker in separate terminals):

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd db:generate
$env:NX_DAEMON='false'
pnpm.cmd build:api
pnpm.cmd build:worker
# Start API on port 5502 and start the worker using the isolated local environment.
$env:RUN_LOCAL_SECURITY_TESTS='1'
$env:RUN_LOCAL_WORKFLOW_TESTS='1'
$env:SECURITY_API_URL='http://127.0.0.1:5502/api/v1'
$env:WORKFLOW_API_URL='http://127.0.0.1:5502/api/v1'
pnpm.cmd test:backend
pnpm.cmd audit --prod
```

Frontend:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run test:exports
npm.cmd run build
```

Missing opt-in variables cause live tests to skip and do not constitute a passing release gate. Supply private configuration separately; do not commit credentials or use demo seeds in production. The implementation and tests are the reviewable Phase 2 baseline; resolve the exclusions above before claiming full application launch readiness.
