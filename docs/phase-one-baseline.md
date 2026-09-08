# Phase 1 baseline — 2026-09-08

The frontend and API have matching local `phase1-2026-09-08` release-baseline tags on `codex/phase-one`. No deployment or push was performed. The backend's `docs/phase-one-baseline.md` records detailed security coverage, provisioning changes and dependency exceptions.

## Results

- Frontend clean `npm ci` and production build pass; TypeScript check passes. Fonts are bundled locally so builds do not depend on Google Fonts downloads.
- Frontend full dependency audit: **zero vulnerabilities** at verification time. Next and its ESLint configuration are aligned at 15.5.25; Axios, Lodash, Socket.IO, Swiper and vulnerable transitive dependencies were updated. Swiper 14's migration compatibility was checked against its [official changelog](https://swiperjs.com/changelog).
- Backend clean API and worker builds pass. Its complete regression run passed **45 tests with no skips**, including live HTTP refresh concurrency and five-role/cross-workspace access checks.
- Backend production dependency audit is clear. Development tooling still has two high image-parser findings without a registry patch and one moderate legacy UUID finding; the backend report documents their paths, exposure and containment.
- Corrected floating-header callback dependencies, time-permission dependencies, member-role synchronization and branding preview cleanup. Replaced unsafe casts in shared authorization and list-unwrapping helpers.

## Reproduce

Use Node **22.23.2**, npm **10.9.4**, and a private local `.env` based on `.env.example`. Use the matching API baseline.

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run build
npm.cmd audit
```

The lockfile is `package-lock.json`; the stale Yarn lockfile was removed. In environments requiring Windows trusted CAs, set `NODE_OPTIONS=--use-system-ca`, keeping certificate validation enabled.

## Scope and follow-up

The initial broad lint review reported 786 `no-explicit-any` errors and 150 warnings. Prioritized hook and authorization fixes do not make the entire application lint-clean. Selected authentication lint checks pass; continue reducing the remaining typing and unused-code debt by workflow. Production builds currently skip the full ESLint gate, so a build pass must not be presented as a lint pass.

This baseline includes the existing HR application and the previously requested homepage changes. Privacy and terms remain subject to the review noted in `website-legal-review.md`. The earlier `release-readiness-2026-09-08.md` is a historical pre-fix audit; this report supersedes its Phase 1 authentication, route and dependency findings. Remaining business workflows, integration delivery, responsive UI acceptance and deployment configuration belong to the subsequent phases. These checks do not certify every screen or external service.
