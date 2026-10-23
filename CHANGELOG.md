# Changelog

## 0.2.0-rc.2 — User GitHub Pages root deployment
- Preserve the same repository history while migrating to `brteduvn/brteduvn.github.io` and `https://brteduvn.github.io/`.
- Change Vite/PWA base and Pages build checks to the site root; update website links and release docs.
- Publish only after Dell and GitHub checks pass, verify the built live website (not raw source).

## 0.2.0-rc.1 — Public web beta and Pages deployment
- New intuitive responsive three-step UI; create new or import by drag/drop.
- CSV quoted-cell parsing; text-based PDF extraction via pdfjs-dist; stronger DOCX A4 export.
- Custom DOCX placeholders now work across split Word text runs, with line breaks preserved.
- Browser-local draft save/recovery and explicit clear; print/Save as PDF.
- Installable offline-capable PWA, GitHub Pages workflow, new app icons and deployment instructions.
- Expanded automated regression coverage for import, export, templates, drafting and error cases.
- Maintainer: brteduvn <admin@brt.edu.vn>. AI/OCR and full curriculum rules remain future features.

## 0.1.1-rc.2 — GitHub Actions release automation
- Tag-triggered CI validates, builds, checks dependencies, generates a SHA-256 checksum manifest and publishes a prerelease.
- Downloadable Web App archive includes exact build date/time and version.
- GitHub Release uses official project notes; no tokens embedded in source or sent through chat.

## 0.1.1-rc.1 — versioned prerelease
- Official maintainer contact admin@brt.edu.vn.
- Version and exact build timestamp (UTC / Asia/Ho_Chi_Minh) embedded in UI and build manifest.
- Per-project local Git and offline Mac 2012 backup policy documented; remote backup requires connection verification.
- QA: 9 unit tests and passing typecheck, production build, dependency audit (0 reported).

## 0.1.0 — initial working prototype (unreleased until QA)
- Vietnamese three-step workflow.
- Local DOCX/XLSX/CSV/TXT/MD import, editable review, standard DOCX/custom placeholder DOCX export.
- Initial unit tests and GitHub CI.
