# Security Policy / Chính sách bảo mật

## Supported releases

Security fixes target the most recent maintained prerelease/release on `main`. Older release candidates are historical snapshots and may not receive patches.

## Report a vulnerability privately

Please do **not** open a public issue containing exploit steps, credentials, sensitive files or student data. Use GitHub's **Report a vulnerability** flow if available for this repository, or contact **admin@brt.edu.vn** privately with a clear subject such as "EduPlan OSS security report".

Include affected version, reproduce steps using synthetic data, potential impact, and suggested mitigation. Maintainers will assess and coordinate disclosure once there is a reasonable fix and validation; no specific response SLA is promised.

## Threat model

All document parsing occurs in the browser and the application does not intentionally upload source documents. This does **not** protect against malicious browser extensions, compromised devices, unexpected behaviors of upstream dependencies, or hosting-provider access logs. File parsing limits exist but are not a substitute for security review.

Never expose API keys or user secrets through GitHub issues. Review dependency advisories and run `npm audit --audit-level=moderate` for each release. Security work takes priority over optional features.
