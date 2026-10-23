# Release gating checklist

- [ ] Typecheck, unit tests and production build succeeded on the exact release source.
- [ ] Browser smoke test: multi-file input → review/edit → DOCX download.
- [ ] Open the output DOCX in Word/LibreOffice and verify content is readable.
- [ ] Verify user-supplied placeholder DOCX export and invalid-template errors.
- [ ] Mobile viewport / keyboard / contrast pass.
- [ ] No real private documents in repo.
- [ ] README feature claims align with verified behavior.
- [ ] LICENSE, CONTRIBUTING, SECURITY, PRIVACY, CODE_OF_CONDUCT present.
- [ ] GitHub Actions green on release commit.
- [ ] Tag, release notes and demo URL only when genuinely available.

Do not publish a version claiming completed educational compliance or AI functionality unless implemented and verified.
