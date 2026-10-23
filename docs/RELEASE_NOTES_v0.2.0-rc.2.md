# EduPlan OSS v0.2.0-rc.2 — Web beta on brteduvn.github.io

**Giới hạn:** Bản thử nghiệm; không phải sản phẩm chứng nhận tuân thủ chương trình giáo dục.

## Official links
- Web App: https://brteduvn.github.io/
- GitHub: https://github.com/brteduvn/brteduvn.github.io
- Email: admin@brt.edu.vn
- Same repository and Git history as original eduplan-oss, renamed to its user-site URL.

## Included in this beta
- Vietnamese 3-step responsive UI: import → review/edit → export.
- Blank plan or multi-format file input: DOCX, XLSX, CSV, TXT, Markdown, and **text-based** PDF (no OCR for scans).
- Browser-local draft autosave/recovery and explicit reset.
- A4 Times New Roman 13pt editable Word, browser Print/Save PDF, custom DOCX placeholders including split text runs.
- Installable PWA with offline static asset caching.
- Version and exact UTC/Vietnam build timestamps, open-source policies and release history.
- GitHub Pages workflow validates, builds and deploys from the site root.

## Quality gates
The release pipeline runs `npm ci`, typecheck, unit tests, `npm audit --audit-level=moderate`, production build, and Playwright desktop/mobile tests before publishing a prerelease. The downloadable ZIP includes `build-info.json` and a SHA-256 checksum. Release notes should not claim successful public deployment without separately verifying the live URL and assets.

## Known limitations
- Complex/legacy Word formats and floating textboxes might not preserve original layout.
- PPCT deterministic curriculum checking, AI and OCR are **not yet shipped**.
- PDF output uses native browser printing. Draft data in localStorage is not encrypted.
- All exported files must be reviewed by the teacher before official school submission.
- Mac 2012 remote backup is still pending until actual verified copy/restore.

Other projects are not published to GitHub.
