# Architecture

Single-page React + TypeScript (Vite) application, browser-local document-processing library (`src/lib/document.ts`), no server API or account. Supported text inputs: TXT/MD/CSV; DOCX is unpacked with JSZip and OOXML paragraphs extracted; XLSX is parsed with read-excel-file. Output: DOCX via docx library, or placeholder replacement in user-supplied DOCX archive. Each conversion is explicit and warns when unsupported. Local-first means no document backend; browser memory clears on reload.

Privacy: no telemetry or AI. Free optional on-device AI is a future modular capability, never required for core work. Localization strings and Vietnam education rules should be decoupled from core in later versions. Architecture prioritizes intuitive three-step workflow over exposing complex controls.
