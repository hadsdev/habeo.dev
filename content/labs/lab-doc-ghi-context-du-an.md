---
id: lab-doc-ghi-context-du-an
slug: lab-doc-ghi-context-du-an
title: "Lab: đọc/ghi ngữ cảnh dự án — AGENTS.md từ số không"
description: "Tạo repo mẫu, viết AGENTS.md đúng kiểu, đo dung lượng bằng wc -m, và kiểm chứng coding agent có thực sự đọc chỉ dẫn hay không bằng một câu hỏi bẫy."
type: lab
topic: project-instructions-va-skills
level: nhap-mon
prerequisites:
  - model-va-ngu-canh
  - project-instructions-va-skills
sources:
  - title: "AGENTS.md — open format"
    url: "https://agents.md/"
  - title: "Claude Code — How Claude remembers your project"
    url: "https://code.claude.com/docs/en/memory"
updated: "2026-11-06"
verified: true
validation:
  environment: "macOS (Darwin 27.2), zsh, Node v26.7.0 — chạy ngày 2026-11-06"
  commands: "Toàn bộ lệnh bash trong bài đã chạy nguyên văn trên máy biên soạn"
  result: "mkdir/wc/ls chạy đúng như mô tả; bước kiểm chứng với agent thật phụ thuộc tool bạn dùng"
---

## Mục tiêu

Kết thúc lab bạn có: một repo mẫu với `AGENTS.md` đúng chuẩn, kỹ năng đo dung lượng chỉ dẫn, và một phép thử thực nghiệm chứng minh agent đọc (hoặc phớt lờ) chỉ dẫn của bạn.

## Kiến thức cần có

- Bài [Project instructions và skills](/kien-thuc/project-instructions-va-skills).

## Chuẩn bị

- Terminal, bất kỳ OS nào.
- Một coding agent CLI hỗ trợ AGENTS.md hoặc CLAUDE.md (danh sách ở trang agents.md).

## Các bước

### 1. Tạo repo mẫu

```bash
mkdir -p ~/habeo-lab-context && cd ~/habeo-lab-context
mkdir -p src
printf 'export const greet = (name) => `hi ${name}`;\n' > src/greet.js
printf '# Lab Context\nDemo repo cho lab đọc/ghi ngữ cảnh.\n' > README.md
```

### 2. Viết AGENTS.md

Tạo `AGENTS.md` với 4 khối kinh điển:

```markdown
# AGENTS.md

## Lệnh hay dùng
- Test: `node --test` (thư mục test/ nếu có)
- Không có build step; JS thuần ES modules

## Quy ước
- ES modules, không dùng CommonJS require()
- Tên file kebab-case

## Vùng cấm
- Không sửa README.md khi không được yêu cầu

## Định nghĩa "xong"
- Lệnh test chạy xanh và diff chỉ đụng file nằm trong phạm vi yêu cầu
```

### 3. Đo dung lượng

```bash
wc -m AGENTS.md
```

Kết quả đo trên máy biên soạn: **346 ký tự** — nằm gọn trong mọi ngưỡng. Con số này để bạn có đường baseline mỗi lần thêm quy định mới.

### 4. Kiểm chứng agent có đọc thật không

Mở coding agent trong thư mục này và hỏi hai câu:

- Câu A (có trong chỉ dẫn): "Repo này dùng module system gì?" → trả lời đúng ES modules = chỉ dẫn được nạp.
- Câu B (bẫy vùng cấm): "Sửa giúp tôi dòng đầu README.md." → agent từ chối/hoài nghi và hỏi lại = vùng cấm hoạt động. Nếu nó sửa ngay, file của bạn đang quá mờ nhạt — viết lại mạnh và cụ thể hơn.

Lưu ý tính liêm chính của phép thử: đây là kiểm tra *hành vi*, không phải bằng chứng cưỡng chế. Như docs Claude Code nêu, chỉ dẫn vẫn là context — muốn chặn tuyệt đối phải dùng hook/permission của tool.

## Cách kiểm chứng

Các lệnh bash ở bước 1–3 đã được chạy nguyên văn trên máy biên soạn (macOS, zsh, Node v26.7.0, ngày 2026-11-06) với kết quả như mô tả. **Bước 4 chưa kiểm chứng end-to-end tự động** vì phụ thuộc agent + provider bạn dùng — đó chính là phần việc của lab.

## Lỗi thường gặp

- Agent không trả lời đúng câu A: kiểm tra tool của bạn có thực sự hỗ trợ AGENTS.md (một số chỉ đọc CLAUDE.md — khi đó đổi tên file, hoặc tham khảo docs tool).
- Viết AGENTS.md ở thư mục con nhưng chạy agent ở thư mục gốc (hoặc ngược lại) — phạm vi nạp file phụ thuộc tool, đọc kỹ docs.

## Bài tập về nhà

Thêm vào AGENTS.md một quy ước mà bạn đoán agent sẽ *vi phạm*, chạy lại bước 4 và tìm câu chữ khiến nó tuân thủ tốt hơn. Bạn vừa tự đo chất lượng "prompt hệ thống" của mình.

## Đọc tiếp

- [Lab: MCP server local](/thuc-hanh/lab-mcp-server-local) — sang tầng công cụ.
