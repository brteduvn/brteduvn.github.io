# Privacy Policy / Quyền riêng tư

EduPlan OSS aims to keep educator and student information under user control.

## What stays local?
- Imported files (DOCX, XLSX, text-based PDF, CSV, TXT, Markdown) are read and processed in your browser. The application does not provide a document upload endpoint or mandatory account.
- Edited fields and document text are auto-saved **in browser localStorage on the current device**. This is not end-to-end encrypted; anyone with access to your browser profile may access that local data.
- Click **Bắt đầu lại / Xóa bản nháp** to clear the current stored draft. Browser storage may also be erased through the browser's settings.
- Generated Word files are downloaded directly; printing/PDF uses your browser's native print dialog.

## Network activity
- First loading the app or an update downloads static HTML/CSS/JS, worker code, icons, and fonts supplied by the browser/OS. A PWA service worker can cache these static assets for basic offline use.
- The source contains no telemetry, cloud sync, mandatory commercial API keys or AI backend. No AI inference currently occurs.
- GitHub Pages (or another chosen hosting provider) may receive HTTP access logs such as IP address and user agent. Device software or browser extensions can independently access local content.

## Security advice
- Avoid entering real student identification numbers, health records or private family information, especially on shared devices.
- Do not upload private documents to GitHub Issues/PRs or other public services.
- For shared school computers, export/download your files, then clear your local draft and close the browser.
- Some devices/browsers may not provide persistent local storage. Export Word regularly as a durable copy.

This policy describes v0.2.0-rc.1 behavior; future online storage/AI features would require separate explicit privacy choices and a policy update.
