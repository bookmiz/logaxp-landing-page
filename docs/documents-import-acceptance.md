# Documents and employee CSV acceptance — 8 September 2026

## Decision and scope

The owner included document uploads and employee CSV import/export in launch, selected DigitalOcean Spaces, and approved removal of unattached drafts after seven days while retaining attached documents until authorized removal.

Implemented locally and tested using the real staging Spaces bucket. This is not a production rollout or acceptance of every onboarding variant.

## Private documents

- Created `logaxp-documents-staging` in NYC3, with CDN disabled. Application key is restricted to this bucket with read/write/delete permissions. Credentials are in private local backend configuration, never frontend code or Git.
- API uploads PDF/PNG/JPEG documents up to 10 MB. It checks file signatures, assigns random keys under the tenant prefix, stores a SHA-256 checksum and uses private object ACLs.
- Downloads pass through authenticated API authorization. They return attachment headers, `private, no-store` caching and `nosniff`; direct anonymous object access is denied.
- Employee document dialog, public document requests and onboarding upload dialog now use the private upload API instead of unsigned Cloudinary uploads.
- Public requests require a live token. Uploaded files are bound to that request; expired/invalid/processed requests cannot upload. Concurrent submission is serialized and only one submission succeeds. Retrying the same upload reuses it; a different replacement requires a new request link.
- Onboarding file attachment now validates tenant and deletion state. File attachment and removal use a shared per-file lock on these document workflows.
- Cleanup runs at startup and every six hours when `SPACES_DRAFT_CLEANUP_ENABLED=true`. It removes unattached drafts older than seven days, preserves attached files and uploads for still-open unexpired requests, and retries failed cleanup on later runs. Local cleanup is enabled. Production requires deliberate configuration on deployment.
- Removing a document reference does not automatically purge every shared file reference. Once unreferenced, an older draft is eligible for cleanup; the protected deletion endpoint rejects attached evidence.

## Employee CSV

- Export, downloadable template and import confirmation controls are on `/portal/employees`.
- Columns: `employeeNumber,firstName,lastName,workEmail,employmentType`. Export uses the existing record ID if no employee number is assigned, allowing a same-workspace re-import to recognize that record.
- Import accepts 1–500 rows and files under 500 KB; export is limited to 10,000 non-deleted directory records. Export is the workspace directory, not the current filtered page.
- New records start in ONBOARDING. Existing employee numbers/IDs or work emails are skipped, not overwritten. Replaying a request or submitting the same new record concurrently does not duplicate it.
- All rows are validated before the transaction; invalid rows cause no partial import. Errors include CSV row numbers. Imports record a transactional audit summary.
- Quoted commas, quotes, multiline values and Unicode are supported. Spreadsheet-formula prefixes are neutralized on export; those escaped cell values are intentionally not byte-identical to original formula-like text on re-import.
- This is a basic directory import/export. It does not import login accounts, assignments, payroll information or attachments; the UI states this explicitly.

## Verification

- Backend default suite: 55 passed, 4 opt-in integration suites skipped.
- Final run after dependency patches: **16 passed, 0 skipped**, combining live document/import, headless browser and security acceptance (`documents-patched-live.log`). Backend production build and all 55 default tests passed again.
- Patched Multer to 2.3.0 (including transitive copies), Nodemailer to 9.1.1 and Hono to 4.13.5. The final production dependency audit reports zero known vulnerabilities across all severities; this is a registry audit result, not a guarantee of complete security.
- Separately enabled live document/import plus security acceptance: **15 passed, 0 skipped**. These use the isolated local database/API and real staging Spaces storage, not production employee data.
- Covered: CSV round trip; invalid-row rollback; duplicate/replayed/concurrent imports; role/tenant restrictions; binary byte equality; anonymous and cross-tenant denial; unsupported bytes and oversized-file checks; provider failure handling; request-token binding, expiry and concurrent submission; attached-file preservation and expired-draft cleanup.
- A separate headless Edge browser test passed file selection, CSV import, CSV download, employee document upload, Save and authenticated file download with the original filename. It uses synthetic fixtures and a fixture access-token cookie; it does not retest login. This full document/import run has 5 passing tests, zero skipped.
- The user's browser also confirmed employee controls render and export reports “Exported 2 employees.”
- Frontend typecheck and focused lint of new controls passed. Frontend and backend production builds passed.
- Synthetic files, requests, employees and tenants were cleaned up after live tests. No external email was sent.

## Reproduce and deployment

Backend tests:

```powershell
$env:NODE_OPTIONS='--use-system-ca'
$env:RUN_DOCUMENT_IMPORT_TESTS='1'
$env:RUN_LOCAL_SECURITY_TESTS='1'
$env:SECURITY_API_URL='http://127.0.0.1:5500/api/v1'
node node_modules/tsx/dist/cli.mjs --tsconfig tsconfig.base.json --test tests/documents-import-e2e.test.ts tests/security-regression.test.ts
```

Tests refuse a remote database or a non-staging bucket. Configure `SPACES_ENDPOINT`, `SPACES_BUCKET`, `SPACES_ACCESS_KEY_ID`, `SPACES_SECRET_ACCESS_KEY` only on the backend. Keep staging and production buckets/keys separate. The pinned AWS S3 SDK is recorded in `pnpm-lock.yaml`; no database migration was required.

For browser reproduction, install `playwright@1.63.0` under backend `tmp/browser-acceptance`, use the installed Microsoft Edge binary, and add `RUN_BROWSER_ACCEPTANCE=1` to the command above. Browser testing passed against the local frontend/API; repeat on the deployed staging revision before release.

Before production: create/configure its separate bucket and scoped key, enable approved cleanup, then deploy API and frontend together. Existing external/Cloudinary documents are not silently migrated; inventory and migrate them separately if present. Provider-level bucket recovery/versioning and wider operational alerting remain release checks.
