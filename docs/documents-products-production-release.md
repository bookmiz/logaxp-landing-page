# Documents and product collection production release

## Released revisions

- Frontend: `8aaf1d16fa92fc2178c8214019445c1d578a0b3d`, deployed through `main` to `https://www.logaxp.com/`. Vercel production deployment: `6eh6QrJFfJf2p1HeijBkXZfRF9Es`. Final staging deployment: `Bg35qXvG87Xm7PBZKaGHRqBW1JZe`.
- Backend and worker: `4b59e5c465cc41fb0908ef0f8eecc824926a6c59`, image `logaxp-api:4b59e5c`, image ID `sha256:fcfab3c567e35f550a3dbbbf8aa2bc360231fff89a0a411b3fb41cd42fef6740`. The same image passed staging before production.
- GitHub validation passed: backend run `34305459071`; final frontend production run `34307673994`.

## Included changes

Private employee documents, request-bound uploads, seven-day unattached-draft cleanup, basic employee CSV import/export, and the previously verified attendance/date/error-state fixes are deployed. Staging revealed a case-sensitive routing defect: `portal/Layout.tsx` was renamed to `portal/layout.tsx`, restoring the portal shell and its client access routing on Linux.

The homepage features four products: Hearken, GatherPlux, BookMiz and HireAFixer. **View all products** opens `/products`, containing those four plus LogaDash, Flospay, Patvero and OmoFlow. Each new entry uses imagery from its own public website. Hearken uses desktop/presentation screenshots; Flospay uses its published previews; Patvero and OmoFlow use their published imagery. These images are not a certification of the external products' workflows. Each has a distinct motion treatment, with reduced-motion support. The full collection is included in the sitemap.

## Storage and data protection

- Separate NYC3 buckets and bucket-scoped read/write/delete keys: `logaxp-documents-staging` and `logaxp-documents-production`. CDN disabled; application uploads use private ACLs and authenticated API downloads.
- Production storage configuration is in `/opt/logaxp-production/.env.production`, mode 600. Staging remains isolated. Credentials and private working files are excluded from Git.
- Cleanup runs on startup and every six hours. Attached documents and active, unexpired request uploads are preserved; eligible unattached drafts older than seven days are removed.
- A fresh production database dump was restored successfully into an isolated local PostgreSQL validation database before rollout. This is a verified release backup, not an ongoing backup-scheduling guarantee.
- One existing Cloudinary employee document was copied byte-for-byte to the production bucket and checked for anonymous-access denial before updating its existing FileObject record. Its record ID and references were preserved. The original Cloudinary asset and private metadata backup were retained for recovery; the external source was not deleted or revoked.
- No schema migration was needed. Synthetic acceptance tenants, users, documents and storage objects were removed by the test cleanup.

## Verification

- Local backend: 55 tests passed; final production dependency audit reported zero known advisories after Multer, Nodemailer and Hono patches.
- Hosted staging: CSV validation, round trip, duplicates/concurrency, role/tenant restrictions, real private upload/download, request token binding/expiry, concurrent submission and draft retention passed. Four tests passed; the local-only automated browser subtest was skipped on staging. The deployed staging browser separately verified portal navigation, employee controls and the homepage-to-catalog journey.
- Staging HTTPS, explicit CORS, disallowed-origin rejection, login, secure refresh cookies, immediate/concurrent refresh, protected enquiry access and article checks passed. Fifty readiness requests at concurrency five passed (p95 209 ms); this is a smoke test, not load certification.
- Staging rollback to the prior API/worker image returned readiness 200; restoring the candidate returned readiness 200.
- **Production acceptance: five tests passed, zero skipped**, including an isolated Edge browser selecting CSV/files, importing/exporting employees, uploading a private document, saving it and downloading it with its original filename. Fixture access tokens were used; browser login was not part of this test.
- Production public-site browser checks passed: exactly four homepage cards, eight catalog products, new product destinations, loaded images, filters, reduced motion and 390px viewport without horizontal overflow.
- Production API and Redis are healthy; worker SMTP authentication verified with the patched mail library. No customer email was sent by these acceptance checks.

Detailed output is in the backend's ignored `tmp/phase4/` directory: `documents-staging-acceptance.log`, `documents-staging-smoke.log`, `documents-backup.log`, `documents-legacy-migration.log`, `documents-production-browser-check.log`, and `products-production-check.log`.

## Rollback and remaining operations

Frontend rollback target: previous Vercel production deployment `ereJwGx4EeuwJZG4eCFRGyd3GMaE` (`ef3017b`). Backend previous image: `logaxp-api:a99b40c`; original Compose configuration is `/opt/logaxp-production/compose.production.before-documents.yml`. Retain current storage credentials and objects during rollback. The old release does not provide the new private-document workflow; prefer a forward fix for document functionality. Do not restore the whole database over newer customer changes. The single migrated legacy record has a private before-image if its metadata needs a carefully scoped recovery.

Full launch acceptance is still broader than this release: role UAT, timesheet/scheduling edge cases, approved legal text, ongoing off-host backups, operational alert ownership and realistic capacity testing remain in the launch checklist. Image packaging was slow on the shared 2 GB host; building release images in CI and deploying from a registry remains an operational improvement. A 2 GB swap file was enabled on the host to reduce build memory pressure; it was not added to persistent boot configuration.
