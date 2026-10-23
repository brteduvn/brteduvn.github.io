# EduPlan OSS v0.1.0-rc1 — Release candidate

First working local-first prototype. **Not yet a production-ready curriculum validation tool.**

### Included
- Three-step Vietnamese web UI: import, review, export.
- Multiple local inputs: DOCX, XLSX, CSV, TXT, MD (12 MB per source).
- Editable detected school, subject, grade, teacher, title and content.
- Standard editable Word export and custom DOCX placeholder replacement.
- Downloadable sample DOCX with editable placeholders.
- MIT license, contribution/security/privacy docs and automated CI.
- No account, telemetry, paid API or server document upload.

### Known limitations
- Custom templates must contain whole placeholders in a single OOXML text run.
- Complex tables, page layout and legacy DOC/XLS/PDF/scanned images are not fully supported.
- No automatic curriculum rules or AI feature yet.
- PWA manifest exists, but offline service worker is not implemented.
- Users must verify exported content/formatting before official submission.

### Verification
Windows Dell WebCodex: TypeScript PASS, 9/9 tests PASS, Vite production build PASS, npm audit 0 reported. Browser smoke test completed for TXT input. Refer to `docs/QA_REPORT_2026-10-23.md`.

### Publishing
Do not label as v1.0, do not submit OpenAI application based on this version alone. GitHub repository and public release pending confirmed authenticated creation/permissions.
