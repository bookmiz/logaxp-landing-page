# Readiness review — 8 September 2026

Follow-up: the three confirmed defects below have now been fixed and verified locally. See [the updated launch acceptance checklist](launch-acceptance-checklist.md) for current status. This document preserves the original findings.

## Verdict and scope

The redesigned desktop Reports page is compact and readable. Further wholesale redesign is not the priority. Data correctness and an enforced launch scope need attention before declaring the application complete.

This review inspected the local owner session on Reports, Time & Attendance, Leave and Dashboard, traced the relevant frontend/backend code, and reconciled earlier phase and deployment reports. It is not a fresh end-to-end run of every route, role, production provider or mobile layout. Production configuration conclusions below are recorded verification gaps, not newly reproduced outages.

## Confirmed defects to fix first

### 1. Time overview statistics disagree with records — high

Observed: 8.0h tracked with “0 entries in range,” despite two recent entries; attendance shows 0h despite a closed 08:00–16:00 record.

Code evidence:
- `src/components/time-management/TimeOverviewStatsCards.tsx` reads `stats.totalEntries`, defaulting to zero. Backend `libs/time-management/src/lib/services/time-entries.service.ts` returns minutes/hours and grouping totals, but no entry count.
- The same component sums `row.totalMinutes`; backend clock-summary rows expose `workedMinutes`, with `totalMinutes` at the response aggregate level.

Required: align the response contract and frontend types; verify the summary against dated entries and closed clocks, including breaks, empty ranges and the intended personal/workspace scope. Add regression tests that would fail on these field mismatches.

### 2. Leave dates shift by one day — high

Observed for the same E2E Local Owner request: dashboard September 21–22; leave table September 20–21.

`src/app/portal/DashboardContent.tsx` formats dates in UTC. `src/lib/leave/leave.types.ts` formats the UTC timestamp in the browser timezone. Date-only leave values must preserve the requested calendar dates.

Required: one date-only convention across list, detail, calendar, edit and approval views. Verify in timezones on both sides of UTC and around daylight-saving changes; separately inspect duration calculations rather than assuming this display fix corrects them.

### 3. Failed time queries can look like genuine zero results — high

`src/app/portal/time-attendance/page.tsx` passes missing query data as null to summary/recent-activity components and handles loading, but has no query-error branch. Summary cards default absent figures to zero.

Required: distinguish unavailable data from zero, expose retry, and test rejected/failed requests. Do not leave an apparently authoritative zero or “No open clock detected” after a failed request.

## Launch scope requiring an explicit decision

The Phase 2 report records exclusions and says not all excluded screens are feature-flagged off. Complete each included workflow or enforce exclusion in navigation and backend access:

| Area | Remaining acceptance evidence |
| --- | --- |
| Documents | Actual binary upload/download, tenant permissions, retention and cleanup; metadata workflows alone do not prove storage works. |
| Employee import/export | Real round trip, invalid rows, duplicate handling and role restrictions. CSV escaping tests are narrower. |
| Payroll | Approved-hours export is available; monetary wages, taxes, deductions and disbursements were explicitly excluded. Keep product wording and navigation accurate. |
| Timesheets | Lock races and period-boundary edits/clock adjustments. |
| Scheduling | Template-generated shifts across DST, recurrence, bulk reassignment and timer switching. |
| Onboarding | Form/policy acknowledgement and storage-dependent variants beyond tested task onboarding. |

Reports currently provides five permission-filtered links into record screens. It is a report-navigation hub, not evidence of saved reports, scheduled delivery or a consolidated reporting engine. Its copy should only promise exports supported by each destination.

## Usability and public-site finishing work

- Leave pagination icon buttons lack accessible names in `src/components/leave/LeaveTable.tsx`; label previous/next and the page input, then inspect similar controls.
- Leave currently carries Time Entries/Time Clocks/Timers navigation, and the sidebar exposes Payroll both within Time & Leave and as a separate group. Clarify the hierarchy and the distinction between hours and payroll.
- Replace remaining customer-facing implementation language such as “tenant-scoped,” “tenant-safe,” and raw record IDs where they do not help users act.
- The four HR hero category links all target the same `#workflows` section. Either provide relevant category views or make their common destination clearer.
- The latest HR work is local. HEAD is `8d66573`; the compact product-tour changes remain uncommitted in `WorkstreamsSection.tsx` and `hr-page.css`. Verify the final responsive layout and release exactly the approved revision.
- Existing Terms/Privacy review still requires the business owner's approved wording. The website draft does not cover all employee-data product terms.
- Sales enquiries persist in the admin inbox. The earlier review records no outbound sales notification: assign an inbox owner or implement delivery with visible failure handling.
- A demo request is a request for a walkthrough, not a confirmed calendar booking. Keep confirmation language accurate.
- Use richer synthetic demo records for product screenshots; avoid empty-looking charts and E2E labels in marketing imagery.

## Operational acceptance still to close

The production report records working HTTPS/API readiness, Resend SMTP acceptance, a successful database restore test and isolated staging/production databases. Do not redo these blindly or describe them as absent. It does not establish:

1. Signup and recovery delivered to real recipient inboxes end to end, including expiry and replay.
2. Ongoing off-host backups, retention and recovery objectives, plus an exercised application rollback.
3. Alert delivery for API/worker failures, queue retries/exhaustion and operational ownership.
4. Realistic workload/capacity testing. Staging and production share one host, so separate databases do not eliminate shared resource/failure risk.
5. Final role-based UAT, keyboard/mobile/accessibility coverage and approved launch workflows.

Review remaining lint findings by risk (unsafe types, hook dependencies and data handling), and retain automated build/auth/tenant-isolation checks on the exact release revision.

## Verification in this review

- Browser reproduced both time-statistics inconsistencies and the one-day leave discrepancy.
- Source inspection explained the field/date mismatches and missing time-overview error handling.
- Desktop Reports screenshot reviewed: compact list, readable hierarchy, no need for a replacement design.
- `npm run test:exports`: 3/3 pass. These verify CSV escaping, spreadsheet-formula neutralization and empty values; they do not prove bulk employee import/export.
- No application code, production data or deployment changed during this review.

## Recommended completion order

1. Fix the confirmed statistics/date/error-state defects and add focused regression tests.
2. Enforce launch scope; finish included workflows and clearly disable excluded ones.
3. Complete mobile/keyboard/role UAT and public-site content approval.
4. Close operational acceptance, build the exact revision, deploy, and repeat production smoke tests.
