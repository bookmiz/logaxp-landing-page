# Launch acceptance — updated 8 September 2026

Status: the three confirmed readiness defects are fixed and verified locally. Private document storage and basic employee CSV import/export are now implemented and have live local/staging-storage acceptance coverage; see [detailed evidence](documents-import-acceptance.md). Full launch acceptance remains open.

## Passed in this follow-up

- [x] Entry statistics return the filtered record count. Browser: 2 entries, 8.0h rounded tracked time (481 minutes).
- [x] Attendance reads API `workedMinutes`. Browser: 7.5 net hours instead of the incorrect 0h.
- [x] Leave table preserves September 21–22, matching the dashboard. Calendar parsing also preserves date-only values.
- [x] Date regression coverage includes Chicago, Los Angeles, UTC and Tokyo, plus US DST transition dates.
- [x] Failed summary/recent-activity queries show alerts and retry controls rather than zero/empty results. Verified by stopping only the local API, refreshing, restarting and retrying successfully.
- [x] Frontend regression/CSV tests: 5 pass. Typecheck passes.
- [x] Latest backend default test run: 55 pass, 4 opt-in integration suites skipped. The new entry-count and document/CSV unit tests are included.
- [x] Latest enabled document/import, browser and security acceptance: 16 passed, zero skipped after dependency patches.
- [x] Patched upload/email dependencies; latest backend production dependency audit reports zero known vulnerabilities.
- [x] Local live security suite separately enabled: 11 passed, zero skipped; see `logaxp-api/tmp/local-demo/readiness-security.log` for subtest evidence.
- [x] API production build passed and updated local API is running; readiness returns HTTP 200.
- [x] Frontend production build passed. Build evidence is in `.codex-readiness-build.log`.
- [x] Added new regression commands to frontend/backend CI.

## Required before full launch acceptance

### Scope and workflow acceptance

- [ ] Agree an explicit included/deferred module list and enforce exclusions in navigation and backend access.
- [x] Verify private binary upload/download, authorization, request tokens and retention against the real staging Spaces bucket through the local API.
- [x] Verify basic employee CSV round trip, invalid rows, duplicates and concurrent submissions.
- [x] Automate local browser CSV file selection/import/export and private document upload/Save/download using synthetic records.
- [ ] Complete browser file-selection/upload/import acceptance on staging and configure a separate production bucket/key before rollout.
- [ ] Verify timesheet lock races and edits across period boundaries.
- [ ] Verify recurring/template schedules across DST and bulk reassignment.
- [ ] Verify form/policy/storage onboarding variants, or exclude them.
- [ ] Keep monetary payroll excluded unless separately implemented and verified. Approved-hours export is not wage/tax/payment processing.
- [ ] Complete role-based UAT for the included scope, including owner, HR, manager, employee and site admin.

### User experience and public site

- [ ] Complete mobile and keyboard acceptance on the final revision, including named pagination controls and clear navigation.
- [ ] Remove remaining unnecessary implementation wording and reconcile duplicate Payroll navigation.
- [ ] Approve the latest local HR page, meaningful product-preview destinations and final screenshots.
- [ ] Supply/approve final Terms and Privacy wording, including product employee-data requirements where applicable.
- [ ] Assign the sales inbox owner or verify outbound enquiry notifications and failure handling.
- [ ] Verify actual recipient signup/recovery delivery, expired/replayed links and honest confirmation states.

### Operations and release

- [ ] Verify ongoing off-host backup scheduling, retention and restore objectives. A historical successful restore test is recorded, but ongoing operations require acceptance.
- [ ] Exercise application rollback for the release revision.
- [ ] Verify monitoring alerts reach an owner, including API, workers and exhausted queue retries.
- [ ] Run realistic capacity/load checks; staging and production share a host.
- [ ] Build and deploy the approved frontend/backend revisions together, then run production smoke tests.

## Limits and follow-up

No production deployment was made in this follow-up. The broader live workflow and public-site suites were not rerun: local `.env` now selects Resend, so email-producing acceptance should first use an isolated capture provider or deliberate approved test recipients. The security suite and outage test did not send external messages.

The time overview remains a mixture of personally filtered entry data and the existing authorized attendance-summary scope; label or align this scope during role UAT. Recent clock/timer row duration presentation also merits review. These are not covered by the three fixes above.

Keep the earlier detailed review at `docs/final-readiness-review-2026-09-08.md` as the discovery record; its three confirmed defects are superseded by this verification status.
