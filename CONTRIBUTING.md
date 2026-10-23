# Contributing / Hướng dẫn đóng góp

Thank you for making education tools more accessible. We welcome teachers, developers, testers, translators and accessibility reviewers. **Vietnamese and English are both welcome.**

## Before submitting
1. Check existing issues and roadmap; describe the teacher's concrete problem, not only the technology.
2. For bugs include reproducible steps, actual/expected result, OS/browser, current build version and a **synthetic or anonymized** document sample.
3. For feature requests describe the shortest workflow a teacher should follow. UX simplicity is a release requirement.

## Development
Use Node.js 22+. Fork and clone the repository, create a focused branch, use small commits, add regression tests and run:

```bash
npm ci
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
```

Create a pull request using the supplied template, describe tradeoffs, and mention any changed file-format or privacy assumptions. Respect the principle that the **base editor must work without paid AI or network inference**.

## Code quality
- Prefer explicit, testable parsers rather than silently inventing school/curriculum details.
- Do not describe planned OCR, AI, PWA offline support or arbitrary DOCX template mapping as shipped.
- Ensure the keyboard and screen-reader experience is understandable; avoid tutorial-only UX.
- Do not include credentials, analytics tokens, personal data, copyrighted school templates without redistribution rights, or fabricated adoption numbers.
- Follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

Maintainer: @brteduvn • admin@brt.edu.vn
