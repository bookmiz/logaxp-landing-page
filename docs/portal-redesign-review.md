# User portal — local design review

Preview: http://localhost:3010/portal/reports and http://localhost:3010/portal

The changes remain local on `codex/admin-redesign`. No deployment was requested
or performed. The preview uses the isolated local demo workspace.

## Presentation changes

- 224px sidebar (72px collapsed), 32px avatars, small unboxed icons, compact rows
  and muted green active states. Existing role/capability filtering is preserved.
- Header aligned beside the sidebar; notification and account controls retained.
- Shared 16px base typography, compact headings, consistent surfaces, table text,
  borders, form corners and light/dark colours across the portal.
- Reports become an accessible list of clearly labelled report destinations;
  permission filtering remains in place.
- Dashboard metrics and heading spacing are reduced.
- Attendance, scheduling, onboarding, organization, project/work and finance
  layouts use compact shared headers instead of oversized hero sections.
- Removed the duplicate scheduling introduction and the floating public-site
  back-to-top button from the workspace.
- Mobile navigation uses a modal drawer with focus containment and Escape/focus
  restoration. Desktop collapse preserves access to labelled navigation controls.

## Checks

- TypeScript passed and targeted sidebar/header/dashboard/report lint passed.
- Existing errors in changed files were compared against HEAD: no increase.
  A broad portal lint run still reports pre-existing issues (305 errors and 36
  warnings); this visual update does not claim to resolve that backlog.
- Final production build passed after all shared-layout refinements (101 static pages).
- Browser checks: populated employee directory, attendance, scheduling, work,
  report destinations, sidebar collapse/expand, and 390px mobile reports.
- No horizontal page overflow on inspected desktop views or mobile reports.
- Mobile drawer Escape returns focus to Open sidebar.

This is a presentation review, not a new end-to-end certification of every
payroll, approval, upload or destructive action. Review locally before deployment.
