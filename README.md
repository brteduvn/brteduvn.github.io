# EduPlan OSS 🇻🇳

**A free, open-source and privacy-first education planning web app.** Vietnam-first, designed for internationalization.

> Prototype v0.1.0. Not yet a certified or complete curriculum validator.

## Tiếng Việt

EduPlan OSS giúp giáo viên nhập DOCX/XLSX/CSV/TXT/Markdown, xem lại và chỉnh sửa nội dung rồi xuất Word. Có thể chọn mẫu DOCX cá nhân với các trường `{{school}}`, `{{subject}}`, `{{grade}}`, `{{teacher}}`, `{{title}}`, `{{content}}` (v0.1: mỗi thẻ cần nằm nguyên trong một text run của Word). Không cần tạo tài khoản; xử lý trong trình duyệt. Có thể tải mẫu DOCX minh họa ngay trong giao diện để không phải tự thêm thẻ thủ công.

**Khởi động:** yêu cầu Node.js >= 20.19, sau đó `npm install`, `npm run dev`. **Kiểm tra:** `npm run typecheck && npm test && npm run build`.

**Quy trình:** chọn tài liệu → kiểm tra nội dung → chọn mẫu và tải DOCX. File nguồn không bị ghi đè. Không nhập dữ liệu học sinh nhạy cảm nếu máy tính dùng chung.

## English

EduPlan OSS is a browser-based local-first tool for creating editable education planning documents. Initial supported inputs: `.docx`, `.xlsx`, `.csv`, `.txt`, `.md`. Export: standard DOCX or user-supplied DOCX template with explicit placeholders. It currently does **not** support arbitrary template layout inference, scanned PDFs or AI-assisted writing. Those are roadmap items, not existing features.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), [PRIVACY.md](PRIVACY.md), [ROADMAP.md](ROADMAP.md). MIT licensed. No telemetry or required cloud service. Maintainer: [@brteduvn](https://github.com/brteduvn).
