# Development, versioning and backup policy / Quy tắc phát triển

## Scope
**Only** `brteduvn/eduplan-oss` is a public GitHub repository. Other projects remain local and must not be pushed to GitHub, any public remote, or another third-party cloud.

ChatGPT authors all code, fixes, tests and documents. WebCodex is a tool for explicitly instructed build/test/log collection, versioned packaging, verified local Git operations and approved releases. Never let it autonomously rewrite code, change other projects, reset or restart existing runners, tunnels or services.

## Required release discipline
- Every edited release increments the SemVer version (including release candidates) BEFORE final build.
- Run typecheck, tests, dependency audit and production build on that exact version.
- Build emits `dist/build-info.json` with version, UTC time and Vietnam local time. UI footer displays the same embedded build information.
- Every released version has a Git commit and an immutable annotated tag; no force-push or rewriting tags.
- EduPlan OSS tag pushes trigger GitHub Actions to independently validate, generate a fresh build timestamp and publish a prerelease with a SHA-256 manifest. This does not replace Dell QA or Mac 2012 backups.
- Record SHA-256 of source archive, build artifacts and backup files, release notes, environment, test outcomes and timestamp.
- The Git *commit* captures source; artifacts/archives must be recoverable from a timestamped backup. Never equate a successful build with full user-acceptance testing.

## Local projects, Git and Mac 2012 backup
- Each existing local project keeps its own local Git repository; **no new remote** is configured unless explicitly approved for that project.
- For each validated release, create a local Git commit and annotated tag, then an offline Git bundle plus a compressed artifact/source snapshot and SHA-256 manifest.
- Replicate to Mac 2012 only after the machine identity, authenticated network path and write permissions have been verified; maintain a per-project namespace and do not overwrite previous backups.
- Never auto-reset, auto-clean dirty trees, delete source, rotate keys or mount arbitrary shares. Verify copy by comparing checksums and restore ability on a separate test directory.
- If Mac 2012 is unreachable, mark backup **PENDING**; retain local backup and block declaring the backup policy fully satisfied.
- Backup excludes secrets, tokens, personal data, `node_modules`, caches and credentials, unless explicitly scoped and encrypted.

## Release and OpenAI application
Early alpha/release candidates must be labelled as such. Public GitHub releases only for EduPlan OSS. Prepare the OpenAI Codex for Open Source application only after meaningful features, credible maintenance, genuine user feedback and verified end-to-end QA.
Contact: admin@brt.edu.vn. Maintainer: https://github.com/brteduvn
