# EduPlan OSS v0.1.1-rc.1

**Public prerelease candidate — NOT a complete or certified education planning product.**

This updates the original local prototype with versioned build metadata and the official contact email admin@brt.edu.vn. Build manifest records UTC and Vietnam local time. Initial features: 3-step Vietnamese UX, local DOCX/XLSX/CSV/TXT/MD import, editable metadata/content, downloadable DOCX and placeholder-based DOCX custom templates. Includes GitHub CI, unit tests and public project policies.

Limitations: user-created Word templates require placeholders in a single text run; complex table/layout fidelity and school-specific PPCT validation are not complete; PDF OCR, local AI, offline PWA and global locales are not yet implemented. Do not present this prerelease as fully production-ready. Verify export with real documents before use.

Verified on Dell (2026-10-23): typecheck PASS, 9/9 unit tests PASS, production build PASS (10:30:11 Vietnam time), npm audit 0 advisories; browser smoke for the earlier prototype confirmed TXT import and DOCX download initiation. Exact QA evidence: `docs/QA_REPORT_2026-10-23.md`. Mac 2012 remote backup is a separate gate pending verification.
