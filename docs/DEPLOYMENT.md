# EduPlan OSS — GitHub Pages at domain root

**Repository:** https://github.com/brteduvn/brteduvn.github.io
**Official website:** https://brteduvn.github.io/
**Maintainer:** admin@brt.edu.vn

This is GitHub's special *user-site* repository. It serves from `/` instead of the old `/eduplan-oss/` project path. The repo rename preserved commit history and tags.

## Deploy with GitHub Actions

1. Open https://github.com/brteduvn/brteduvn.github.io/settings/pages while signed into GitHub.
2. In **Build and deployment → Source**, choose **GitHub Actions** (not branch-based raw-source publishing).
3. `.github/workflows/pages.yml` tests, builds and deploys each change on `main`. On failure, open the workflow run.
4. Verify a green workflow at https://github.com/brteduvn/brteduvn.github.io/actions/workflows/pages.yml.
5. Verify `https://brteduvn.github.io/`, `/build-info.json`, `/manifest.webmanifest`, `/sw.js` and JavaScript under `/assets/`, and an offline reload on supported browsers.

## Release and backup requirements

Every published revision increments SemVer, has a Git commit and annotated tag, records UTC and Vietnam build time, runs unit tests and desktop/mobile browser checks, and produces a release archive and SHA-256 manifest. A local Git bundle and build archive are retained on Dell; replication to Mac 2012 remains **PENDING** until identity, connectivity and file integrity are verified.

## Common errors

- Blank or unstyled page, raw `/src/main.tsx` HTML: Pages is serving development files. Set **GitHub Actions** as the Pages Source.
- Assets 404: Vite user Pages base must be `/`, not `/eduplan-oss/`.
- Offline problems: load once online, then reload after the service worker has been installed; supported browsers vary.
- Unexpected old UI: verify footer version/build time and refresh service-worker cache.
- Browser draft missing: draft data is local to that device/browser and is not synchronized.

**Only EduPlan OSS** may be published on this GitHub account. Other projects remain local and must not be uploaded.
