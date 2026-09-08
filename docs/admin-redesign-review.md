# Site-admin redesign — local review

Preview: http://localhost:3010/site-admin

Branch: `codex/admin-redesign`. This redesign has not been pushed or deployed.
The preview uses the existing isolated local API and demo database. The browser
is signed in as `admin@local.logaxp.test`; production accounts were not changed.

## Changes

- Compact green navigation with direct links to the nine implemented admin sections.
- Removed placeholder workspace choices, missing-page navigation, the unconnected
  notification button and the unsupported global health indicator.
- Working page finder, account-security link, logout, collapsible desktop navigation
  and accessible mobile drawer with Escape/focus restoration.
- Flatter overview, compact metrics, clearer headings, reduced shadows and borders,
  responsive tables and consistent spacing across the existing admin routes.
- Updated tenant, people, billing, publishing, security and audit headers.
- Article studio separates writing from optional AI assistance and preserves the
  existing draft-generation/save workflow.
- Searchable enquiry cards with loading, failure, empty and no-match states.
- Corrected password-change return links to the existing security route.
- Separate optional build output directory, so validation can run alongside preview.

## Validation

- Next.js production build passed (101 static pages generated).
- Final TypeScript check passed after interaction fixes.
- Targeted lint has no errors; TenantManagementPanel retains one existing unused
  state-setter warning.
- Local browser checks: overview metrics, populated tenant and people screens,
  article studio, publishing, billing empty state, security form, 20-row audit table,
  populated enquiry inbox and no-match search state.
- 390px mobile overview and article editor fit without horizontal overflow.
- Mobile drawer Escape restores focus to its trigger. Page finder filters and
  navigates to the article studio.

These checks cover the redesign and navigation. Destructive account actions,
payment-provider operations and the complete application security regression suite
were not re-executed for this visual update. Review desktop/mobile appearance
locally before authorizing a deployment.
