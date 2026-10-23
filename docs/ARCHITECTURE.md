# EduPlan OSS architecture (v0.2.0-rc.2)

## Core
- React + TypeScript + Vite single-page frontend. Pure static assets, no document backend, no account server, no paid API.
- \`src/App.tsx\`: simple 3-step flow, file selection/drag/drop, metadata editing, export, contextual hints, print.
- \`src/lib/document.ts\`: local DOCX parsing with JSZip, XLSX parsing with read-excel-file, quoted CSV, text-based PDF via lazy-loaded pdfjs-dist. Standard Word generated using docx; custom templates filled with safe XML-escaped substitutions while preserving OOXML structure.
- \`src/lib/draft.ts\`: browser-local draft save/recovery. Conservative limit to avoid exhausting quota; no cloud backup.
- \`src/styles/app.css\`: responsive styles plus dedicated A4 print stylesheet.
- \`vite.config.ts\`: build timestamp/version, VitePWA service worker and generated manifest; \`GITHUB_PAGES=true\` builds at user-site root `/` (never under the former project prefix).

## Deployment & compatibility
- \`.github/workflows/ci.yml\`: typecheck, tests, npm build.
- \`.github/workflows/pages.yml\`: builds static assets and uploads/deploys GitHub Pages after site is enabled.
- \`.github/workflows/release.yml\`: builds versioned tagged prereleases and publishes ZIP/checksum.
- No secret in client bundle; GitHub Actions uses GitHub-provided ephemeral tokens.

## Safety and tradeoffs
- The DOCX text reader does not guarantee layout fidelity for highly formatted tables.
- Custom DOCX replacement supports named placeholders in normal Word paragraphs, including fragmented text runs; floating textboxes and special embedded objects may require manual work.
- Text PDFs are extracted; scans lacking text need OCR (planned). No curriculum content is invented.
- Static assets are cached for basic offline use; imported documents and downloaded files are not uploaded or cached as network resources.
- Printing produces PDF through browser print support, not direct PDF serializer.
- Localization and education-policy data need separation into versioned modules before international expansion.

## Quality
Unit tests cover file parsing, template substitutions, Word A4 export and draft storage. Desktop/mobile browser smoke tests and real-document visual review remain independent release gates.
