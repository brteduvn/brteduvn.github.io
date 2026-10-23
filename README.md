# EduPlan OSS

[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![CI](https://github.com/brteduvn/eduplan-oss/actions/workflows/ci.yml/badge.svg)](https://github.com/brteduvn/eduplan-oss/actions/workflows/ci.yml)
[![Status: Release candidate](https://img.shields.io/badge/status-release%20candidate-orange.svg)](docs/RELEASE_NOTES_v0.1.1-rc.1.md)
![Vietnam-first](https://img.shields.io/badge/language-Vietnamese%20first-blue.svg)

**EduPlan OSS is a free, privacy-first, open-source web app for teachers.** Start with real Vietnamese education workflows, then extend internationally through reusable formats and locale-specific templates.

**Current status: v0.1.1-rc.1 — limited working prototype.** Not a certified curriculum or policy compliance checker. Features labelled *planned* are not implemented yet.

## 🇻🇳 Dành cho giáo viên Việt Nam

Không cần tạo tài khoản, không yêu cầu API trả phí, không tự tải tài liệu lên máy chủ. Quy trình trên trình duyệt chỉ gồm **3 bước: Chọn tài liệu → Xem lại → Tải Word**.

### Có gì ở bản thử nghiệm?

| Nhu cầu | Đã hỗ trợ | Lưu ý |
|---|---|---|
| Đọc file Word | `.docx` | Trích xuất văn bản, chưa bảo đảm giữ bảng và bố cục phức tạp |
| Đọc file Excel | `.xlsx` | Đọc nội dung bảng cơ bản |
| Đọc văn bản | `.txt`, `.md`, `.csv` | CSV hiện đọc như văn bản |
| Chọn nhiều tệp | Có | Giới hạn 12 MB/tệp; nội dung tổng có giới hạn để bảo vệ giao diện |
| Xem và chỉnh sửa thông tin | Có | Tự nhận diện một số trường tiếng Việt, giáo viên xác nhận kết quả |
| Xuất Word cơ bản | Có | Tạo DOCX có thể sửa tiếp trong Word |
| Xuất theo Word của trường | Có điều kiện | Dùng thẻ rõ ràng trong mẫu DOCX; **chưa tự hiểu mọi mẫu** |
| AI miễn phí, PDF scan/OCR, quy tắc PPCT | Chưa | Trong [lộ trình](ROADMAP.md) |

### Tải mẫu Word của bạn

1. Mở ứng dụng, nhập tài liệu và kiểm tra nội dung.
2. Chọn **Mẫu Word của tôi**, hoặc tải **mẫu tham khảo .docx**.
3. Đặt các thẻ tại nơi muốn điền: `{{school}}`, `{{subject}}`, `{{grade}}`, `{{teacher}}`, `{{title}}`, `{{content}}`.
4. Mỗi thẻ phải nằm nguyên trong một đoạn ký tự Word (OOXML text run). Nếu Word tự chia thẻ thành nhiều run, phiên bản này chưa thể tự ghép. Kiểm tra file DOCX tải về trước khi dùng chính thức.

### Cài chạy trên máy (Node.js 22+)

```bash
git clone https://github.com/brteduvn/eduplan-oss.git
cd eduplan-oss
npm ci
npm run dev
```

Mở URL mà Vite hiển thị. Các lệnh kiểm tra:

```bash
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
```

Bản build nằm trong `dist/`. File `dist/build-info.json` ghi **phiên bản và thời điểm build theo UTC + giờ Việt Nam**; chân trang giao diện hiển thị cùng thông tin. `dist/` là output được sinh ra, không lưu vào Git.

### Lưu ý dữ liệu

Tài liệu được xử lý trên trình duyệt và tồn tại tạm trong bộ nhớ. Trang chưa có tính năng tự lưu công việc khi tải lại. Không đăng tài liệu thật có thông tin học sinh lên Issues, Pull Requests hoặc dịch vụ kiểm thử công khai. Mã nguồn không có backend nhận tài liệu hay telemetry; môi trường lưu trữ trang web vẫn có thể thu thập access logs tiêu chuẩn.

---

## 🌍 English

**EduPlan OSS** is a Vietnam-first, local-processing, open-source education document helper. The current release candidate provides a simple browser workflow for importing basic DOCX/XLSX/plain-text content, reviewing fields and exporting editable DOCX. You can supply a DOCX template with explicit placeholders.

There is **no required account, server document upload, paid AI service or telemetry**. Advanced Word layout inference, OCR, Vietnamese curriculum validation, offline service worker, local AI models and internationalized curriculum packs are planned, *not currently shipped*.

### For developers

- Stack: React, TypeScript, Vite, JSZip, read-excel-file, docx, Vitest.
- Run checks: `npm ci && npm run typecheck && npm test && npm run build`.
- Browser UI in `src/App.tsx`; format conversion in `src/lib/document.ts`; regression tests in `tests/`.
- Releases follow SemVer prerelease tags and record timestamped build metadata.
- Please review [architecture](docs/ARCHITECTURE.md), [roadmap](ROADMAP.md) and [project policy](docs/PROJECT_POLICY.md) before larger changes.

### Community and trust

| Resource | Details |
|---|---|
| Contribution guide | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Community standards | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| Security reports | [SECURITY.md](SECURITY.md) |
| Privacy | [PRIVACY.md](PRIVACY.md) |
| Releases and evidence | [CHANGELOG.md](CHANGELOG.md) · [QA report](docs/QA_REPORT_2026-10-23.md) |
| Versioned backups | [Project policy](docs/PROJECT_POLICY.md) |
| License | [MIT](LICENSE) |
| Maintainer | [@brteduvn](https://github.com/brteduvn) |
| Official contact | **admin@brt.edu.vn** |

Contributions are welcome in Vietnamese or English. Report concrete defects using **anonymized** input examples. No fake metrics, unsupported AI claims or synthetic community evidence will be used for the OpenAI open-source application.

**This is an early release candidate: please validate exported documents independently before using them for official school submissions.**
