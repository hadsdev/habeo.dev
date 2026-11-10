---
id: huong-dan-viet-tao-skill
slug: huong-dan-viet-tao-skill
title: "Hướng dẫn viết và tạo Skill: đóng gói tri thức tác vụ cho Agent"
description: "Cách tạo một file SKILL.md đúng chuẩn, phân biệt procedural memory vs facts, thiết kế references tách biệt và cách test một skill trước khi dùng."
type: article
topic: project-instructions-va-skills
level: trung-cap
prerequisites:
  - project-instructions-va-skills
sources:
  - title: "Agent Skills Open Specification"
    url: "https://agentskills.io"
  - title: "Hermes Agent Skills Documentation"
    url: "https://hermes-agent.nousresearch.com/docs"
updated: "2026-11-09"
verified: true
---

## Mục tiêu

Sau bài này bạn sẽ:
- Hiểu chính xác cấu trúc một file `SKILL.md` (YAML Frontmatter + Thân Markdown).
- Biết cách viết **Description định tuyến (Routing)** để Agent tự biết khi nào cần nạp skill và khi nào không.
- Biết cách tổ chức thư mục skill: `SKILL.md` (chính), `references/` (tra cứu), `scripts/` (tool tự động).
- Phân biệt triệt để: Cái gì để ở Project Rules (`AGENTS.md`) và cái gì phải đóng gói thành `Skill`.

## Kiến thức cần có

- Đã đọc bài [Project instructions và skills](/kien-thuc/project-instructions-va-skills).
- Đã dùng thử ít nhất một agent framework hỗ trợ skills (Hermes Agent, OpenClaw, Claude Code...).

## Giải thích

### 1. Tại sao cần Skill thay vì dồn hết vào AGENTS.md?

`AGENTS.md` nạp vào **mọi phiên làm việc**. Nếu bạn nhét 50 trang tài liệu chi tiết về cách build Docker, cách viết migration DB, cách deploy Kubernetes vào `AGENTS.md`, bạn sẽ gặp 2 vấn đề lớn:
1. **Lãng phí Context Window & Tốn tiền**: Mỗi câu chat ngắn đều phải cõng 50 trang prompt.
2. **Context Rot**: Model bị nhiễu bởi quá nhiều luật không liên quan, dẫn đến giảm độ chính xác ở tác vụ chính.

**Skill** sinh ra để giải quyết việc này: Nó là **Procedural Memory (Bộ nhớ quy trình)** chỉ được nạp vào ngữ cảnh theo nhu cầu (On-demand loading).

### 2. Cấu trúc chuẩn của một Skill

Một skill chuẩn thường là một thư mục có cấu trúc như sau:

```text
my-custom-skill/
├── SKILL.md                # Điểm bắt đầu (Bắt buộc)
├── references/             # Tài liệu tra cứu chi tiết (Nạp khi cần)
│   ├── api-docs.md
│   └── common-pitfalls.md
└── scripts/                # Script thực thi tự động (Node/Python/Bash)
    └── validate.sh
```

### 3. Giải phẫu file SKILL.md

Phần quan trọng nhất quyết định Agent có gọi skill hay không nằm ở **Frontmatter**:

```markdown
---
name: my-feature-workflow
description: Use when building payment gateways or debugging checkout bugs. Enforces TDD and idempotency checks.
---

# Tên Hướng Dẫn Tác Vụ

Mô tả ngắn gọn về quy trình...
```

#### Quy tắc vàng viết `description`:
- **Luôn bắt đầu bằng ngữ cảnh kích hoạt**: `Use when <trigger>...`
- **Nêu rõ hành vi bắt buộc**: `...Enforces <rules>.`
- **Ngắn gọn (< 150 ký tự)**: Router của Agent đọc trường này để quyết định có load skill hay không. Đừng viết dài dòng giải thích lịch sử ra đời ở đây.

### 4. Viết "Bài học" (Lessons), không viết "Nhật ký" (Logs)

Khi đúc kết kinh nghiệm vào Skill:
- ❌ **Sai (Nhật ký)**: "Ngày 15/10/2026, chúng tôi gặp lỗi timeout trên Redis do server quá tải và đã fix ở PR #123." (Model không cần biết ngày tháng hay số PR).
- ✅ **Đúng (Quy tắc hành động)**: "Luôn đặt timeout tối đa 2000ms cho kết nối Redis và implement retry exponential backoff vì connection pool có thể bị nghẽn lúc cao điểm."

## Thực hành

Hãy tự tạo một skill mẫu cho dự án của bạn: `code-review-gate`.

Tạo file `SKILL.md`:

```markdown
---
name: code-review-gate
description: Use before committing or submitting a PR. Enforces security scans, boundary tests, and diff checks.
---

# Code Review Gate

## Quy trình kiểm tra bắt buộc

1. **Rà soát Secrets**: Quét diff không có API keys, passwords, private tokens.
2. **Kiểm tra Boundary Tests**: Đảm bảo có ít nhất 1 test cho case null/empty và 1 test cho case ngoại lệ.
3. **Phạm vi thay đổi**: Xác nhận diff chỉ sửa đúng các file được giao, không format đè các file khác.
```

## Cách kiểm chứng

Cách kiểm tra skill có hoạt động không:
1. Mở một phiên chat mới với Agent.
2. Đặt một câu hỏi hoặc giao một tác vụ liên quan đến từ khóa trong `description` (Ví dụ: *"Review giúp tôi diff này trước khi tạo PR"*).
3. Kiểm tra xem Agent có tự động kích hoạt công cụ load skill (`skill_view`) hay không.
4. Xem các câu trả lời và hành động của Agent có tuân thủ đúng các checklist đã viết trong `SKILL.md` không.

## Lỗi thường gặp

1. **Description quá mơ hồ**: Viết `description: "Helper for coding"` → Agent sẽ không bao giờ biết khi nào nên gọi hoặc sẽ gọi bừa bãi làm loãng context.
2. **Nhồi nhét code dài vào SKILL.md**: Tách các đoạn code tham khảo dài hoặc đặc tả API vào thư mục `references/` và hướng dẫn Agent đọc khi cần.
3. **Quên cập nhật sau sự cố**: Mỗi khi sửa một bug hóc búa, hãy cập nhật nguyên tắc phòng tránh vào skill tương ứng ngay.

## Đọc tiếp

- [Mô hình triển khai dự án bằng AI (SDD - Spec Driven Development)](/kien-thuc/mo-hinh-sdd-trien-khai-du-an)
- [Tool calling và MCP: Mở rộng năng lực thao tác cho Agent](/kien-thuc/tool-calling-va-mcp)
