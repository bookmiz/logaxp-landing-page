# Phase 3 — Public website and conversion review

Date: 2026-09-08. Local changes only; nothing has been deployed.

## Positioning and visual direction

The agreed positioning is **agency plus products**. The homepage keeps its existing typography, colours, section order, hero media, product imagery and product transition styles. The main calls to action are **Discuss your project** and **Explore our products**. HR remains a product within that presentation.

The four original blog images (`/images/4.png` through `/images/7.png`) remain in the carousel. The formerly repeated placeholder article has been replaced by four real, editable local articles. New product screenshots come from the isolated demo workspace and are labelled as actual product screens with synthetic data. No employee or customer production records were used.

## Implemented

- Agency-plus-products homepage wording and CTAs; HR descriptions now focus on implemented employee, onboarding, leave, attendance and reporting workflows rather than unverified hiring/performance features.
- Real contact form: validated submissions persist in PostgreSQL before success is shown. Request IDs make retries idempotent; concurrent retries create one enquiry. A per-email hourly limit and a honeypot DTO field reject basic abuse. Site admins can read the latest 100 enquiries at `/site-admin/enquiries`. There is no outbound sales-email notification yet: receipt means saved in this inbox, not delivered to an external mailbox. Operationally, a person must review the inbox.
- `/demo` explains the walkthrough and leads to the enquiry form. It explicitly does not reserve a calendar time.
- Existing showcase publishing reused for articles through the `articles` category. Drafts and future-scheduled articles are not public. Publishing and unpublishing determine visibility. `/site-admin/articles` provides manual/AI drafting; `/site-admin/showcases` remains the editing and publishing management screen. These capabilities are now linked from the admin sidebar.
- Four locally published articles: software project scoping; onboarding ownership; attendance review before payroll; choosing an existing product or custom build. Original source is in backend `scripts/seed-local-articles.ts`; rerunning it preserves existing editorial content.
- OpenAI-backed article drafting uses the server-only `OPENAI_API_KEY` and your `OPENAI_MODEL=gpt-4o-mini`. A structured draft is returned for human review and is not automatically published. Only the typed brief is sent, with `store:false`, a timeout and output limit. Provider failures leave the editor intact. JWT plus site-admin authorization protects the endpoint. `AI_BUILDER_READY` is not an authorization control; Giphy is not needed for this feature.
- Public AI wording is limited to this implemented article-drafting capability. No AI hiring/matching or quantified performance claim was added.
- Footer placeholders point to real destinations with adjusted labels; unverified social links are hidden. Showcase pills now filter the actual product list. Navigation links use real URLs, including from non-home pages.
- Page title/description/share defaults, contact/HR/blog/demo metadata, robots and a static public sitemap. Account pages are noindex. Individual article pages have canonical URLs. The sitemap currently lists landing pages; automated inclusion of future article URLs can be extended.
- Mobile menu focus entry/return, Escape, Tab cycling, hidden-menu inert state, keyboard labels and visible focus rings. Motion preferences stop public videos and bypass smooth scrolling/cursor effects; scroll hooks and CSS respect reduced motion. The existing distinct product transitions remain for normal-motion users.
- Signup confirmation no longer displays a development verification token. Registration/signup/resend responses no longer return verification tokens in development either; signup also returns only basic user identity, not a password hash.

## Verification

- **79 backend tests passed, zero failures/skips**, with live security, workflow and public-site checks enabled against the isolated local API on port 5500.
- Public checks cover enquiry validation/persistence/concurrent retries, inbox access, AI authorization, provider failure, draft/scheduled/published/unpublished visibility, and signup response filtering.
- One actual OpenAI request succeeded with your configured `gpt-4o-mini`; output was a draft, not a published article. The implementation follows [OpenAI structured output documentation](https://developers.openai.com/api/docs/guides/structured-outputs).
- Browser checks at 390px mobile width: homepage layout/logo/CTAs, menu opening and Escape, enquiry submission success, signup steps and creation, local verification email, password reset request/email/completion, successful sign-in with the new password. Original owner session restored afterwards.
- Public/account route checks returned 200, including the four external product links. Desktop article rendering and the original cover image were reviewed; the mobile HR page has no horizontal overflow.
- Local email testing uses the SMTP catcher. It does not establish production SMTP or SMS delivery.
- Frontend typecheck and focused lint passed. Backend API build passed. Production frontend build also passed; broad existing lint debt remains outside this change.
- The synthetic signup workspace/account were removed after the browser walkthrough. Local captured messages and the clearly labelled browser-test enquiry remain for review. Test-generated automated fixtures are removed. Four authored articles remain intentionally available locally.

## Review and release gates

1. **Legal approval is pending.** You said approved Terms/Privacy wording exists but is not currently available. Existing pages were retained, not represented as approved replacements. Add the approved text and confirm that it covers enquiry persistence and admin AI briefs before release.
2. **Visual approval is pending.** Review the local homepage, HR page, article pages and mobile menu. The layout/images were preserved where requested; copy, working links and actual product previews changed.
3. **Production configuration and migration:** the local demo database was originally schema-pushed and has no complete migration baseline. `prisma migrate deploy` reported P3005. The single new SalesEnquiry migration was applied directly to the isolated demo database using `prisma db execute`; no production database was touched. Reconcile the existing migration baseline against the deployment database before deployment. Do not blindly mark all historical migrations applied. The new migration is additive and checked in.
4. **Sales operations:** assign inbox ownership and retention/deletion policy. If external email alerts or CRM delivery are required, add and verify that integration; this implementation confirms durable inbox receipt only. Stronger edge/IP abuse controls should be set at the deployment boundary.
5. **Official social URLs** remain pending; no invented profiles were linked. Final legal copy and social URLs can be supplied later without undoing the site changes.
6. **Production acceptance:** verify HTTPS/CORS, live mail, storage, hosting metadata and indexing policy, and supported browser/device/reduced-motion combinations in staging. Public screenshots demonstrate local workflows; they do not close the Phase 2 exclusions around storage, monetary payroll or advanced time-lock cases.

## Reproduce new checks

Backend uses the existing local PostgreSQL/Redis/mail configuration. After generating Prisma and building/restarting the API:

```powershell
$env:RUN_LOCAL_PUBLIC_TESTS='1'
$env:RUN_LOCAL_SECURITY_TESTS='1'
$env:RUN_LOCAL_WORKFLOW_TESTS='1'
$env:SECURITY_API_URL='http://127.0.0.1:5500/api/v1'
$env:WORKFLOW_API_URL='http://127.0.0.1:5500/api/v1'
pnpm.cmd test:backend
```

`pnpm.cmd exec tsx --tsconfig tsconfig.base.json scripts/check-local-ai.ts` makes one real, billable AI request if a key is configured. Regular regression tests mock provider failure and do not make AI requests. Keep `.env` private; `.env.example` contains empty placeholders only.
