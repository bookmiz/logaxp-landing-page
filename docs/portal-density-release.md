# Portal density release — 8 September 2026

## Scope
Includes the site-admin redesign (5f65bc3), shared portal redesign (2a4e356), and final density refinements. User approved production deployment in this task.

- Project/work guidance is collapsed by default, with keyboard-accessible native disclosure and smaller help cards.
- Time shortcuts use compact wrapping buttons. Date controls replace the duplicate time introduction.
- Project selection, loading/error states and manager summary cards use smaller padding and icons.
- Shared navigation, headings, reports and surfaces retain the previous compact redesign across the portal.
- Permissions, API endpoints and business workflows are unchanged by this final density pass.

## Review coverage
Inventory: 102 portal/site-admin page files, including 76 static routes and 26 dynamic routes. Source review targeted shared layout sizing and remaining oversized elements. Browser checks covered project guidance, attendance/date filters/shortcuts, scheduling and manager overview, supplementing the earlier admin/portal review documents. Mobile time page at 390px had body width 390px and content width equal to its client width (380px).

This is a presentation and route-render review, not a new authenticated end-to-end certification of every dynamic record, payroll calculation or write operation. Existing broad lint backlog remains; final changed components report zero lint errors and seven existing unused-code warnings.

## Release validation
Production build, export regression tests and static-route HTTP smoke results are recorded with the deployment task. Deployment uses the existing Vercel production project and production API; local demo data is not promoted.

Rollback: restore Vercel production deployment GDqixntoMwK6bjeScYL8NRX4hk5B (9d1b308), or revert the redesign commits and redeploy. No database migration is required.

Final local results: optimized Next.js build passed (101 generated pages), 76/76 static portal/admin routes returned HTTP 200 against the optimized server, and 3/3 export regression tests passed. Route HTTP checks do not assert authenticated API workflows.
