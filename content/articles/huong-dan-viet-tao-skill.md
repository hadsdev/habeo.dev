---
id: huong-dan-viet-tao-skill
slug: huong-dan-viet-tao-skill
title: "Hướng dẫn viết và tạo Skill: đóng gói tri thức tác vụ cho Agent"
description: "Cẩm nang toàn diện từ A-Z: cấu trúc thư mục, quy tắc viết description định tuyến, cơ chế multi-file references, chạy script tự động và test skill thực chiến."
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
- Nắm vững kiến trúc đóng gói Skill chuẩn mở (Agent Skills Standard).
- Hiểu sâu cơ chế **Dynamic Skill Injection**: Khi nào skill được nạp và cách viết Prompt định tuyến (Routing) chính xác 100%.
- Biết cách tổ chức cây thư mục: Tách biệt quy trình thực thi (`SKILL.md`), tài liệu tra cứu dày (`references/`) và mã thực thi tự động (`scripts/`).
- Thành thạo quy trình tự kiểm thử (Skill Testing & QA) trước khi đưa vào kho kỹ năng của Agent.

## Kiến thức cần có

- Đã đọc bài [Project instructions và skills: biến quy ước thành file](/kien-thuc/project-instructions-va-skills).
- Đã từng sử dụng ít nhất một Agent framework có hỗ trợ skill (như Hermes Agent, OpenClaw, Claude Code).

## Giải thích

### 1. Sự khác biệt cốt lõi: Memory vs Rules vs Skills

Rất nhiều lập trình viên mới bắt đầu dùng Agent thường nhầm lẫn giữa 3 khái niệm này:

| Thành phần | Đại diện | Cơ chế nạp | Dùng cho mục đích gì? |
|---|---|---|---|
| **Memory (Bộ nhớ)** | User profile, personal notes | Luôn nạp vào đầu phiên | Nhớ thông tin người dùng, thói quen xưng hô, môi trường OS máy chủ. |
| **Project Rules** | `AGENTS.md`, `CLAUDE.md` | Luôn nạp khi vào repo | Quy ước cứng của dự án: stack công nghệ, lệnh test, cấm commit trực tiếp... |
| **Skills (Kỹ năng tác vụ)** | `SKILL.md` + `references/` | **Chỉ nạp khi có yêu cầu (On-demand)** | Hướng dẫn từng bước giải quyết một bài toán cụ thể: review PR, deploy K8s, optimize query SQL... |

> **Nguyên tắc vàng**: Nếu một tài liệu dài quá 30 dòng và không áp dụng cho mọi tin nhắn hàng ngày, **bắt buộc phải tách thành Skill**.

### 2. Cây thư mục giải phẫu một Skill chuyên nghiệp

Một skill không chỉ là một file markdown đơn lẻ, mà là một gói module độc lập:

```text
my-awesome-skill/
├── SKILL.md                 # Bộ não: Hướng dẫn tổng quan & quy trình chính (Bắt buộc)
├── references/              # Thư viện: Chứa tài liệu tra cứu sâu, cheat-sheet, spec
│   ├── api-contracts.md     # Đặc tả API chi tiết
│   └── error-catalog.md     # Danh mục 50 mã lỗi thường gặp và cách xử lý
├── templates/               # Mẫu code: File cấu hình, boilerplate
│   └── config.example.yaml
└── scripts/                 # Công cụ tự động: Script kiểm tra nhanh không tốn token
    ├── validate-syntax.py
    └── pre-check.sh
```

### 3. Bí quyết viết YAML Frontmatter để Agent không bao giờ nạp sai

File `SKILL.md` bắt đầu bằng khối metadata YAML:

```yaml
---
name: k8s-canary-deploy
description: Use when deploying canary releases to Kubernetes clusters. Enforces traffic splitting checks and rollback triggers.
---
```

Các Agent Router sử dụng kỹ thuật Semantic Search (Tìm kiếm ngữ nghĩa) hoặc LLM Pre-routing để đọc toàn bộ danh sách `name` + `description` của tất cả các skill có trong máy.

#### 4 Tiêu chuẩn của một `description` hoàn hảo:
1. **Từ khóa kích hoạt (Triggers)**: `Use when deploying canary...` hoặc `Use when diagnosing memory leaks...`.
2. **Đối tượng và phạm vi**: Nêu rõ ngôn ngữ/framework/môi trường (`...to Kubernetes clusters`).
3. **Hành vi cưỡng chế (Invariants)**: `Enforces traffic splitting checks...` (Để Agent biết nó phải tuân thủ nghiêm ngặt, không làm ẩu).
4. **Độ dài tối ưu**: Từ **100 đến 180 ký tự**. Không viết dài hơn 250 ký tự vì sẽ làm tràn danh mục index của Agent.

### 4. Thiết kế phân tầng thông tin: Quy tắc On-demand Loading

Đừng nhồi hết code mẫu 500 dòng vào `SKILL.md`. Hãy viết theo mô hình 2 tầng:

- **Tầng 1 (`SKILL.md`)**: Chỉ tóm tắt quy trình 4-5 bước và checklist nghiệm thu. Cuối mỗi phần, trỏ link:
  > *"Để tra cứu danh sách 20 loại lỗi kết nối DB, đọc file `references/db-errors.md`."*
- **Tầng 2 (`references/*.md`)**: Agent sẽ dùng công cụ đọc file để tự mở file này ra **chỉ khi nó thực sự cần giải quyết lỗi đó**.

Nhờ đó, một phiên làm việc thông thường chỉ tốn vài trăm token thay vì 15.000 token!

## Thực hành: Từng bước tạo Skill `code-review-gate`

Hãy cùng tạo một skill tự động rà soát code trước khi tạo PR:

### Bước 1: Tạo thư mục và file `SKILL.md`

```bash
mkdir -p ~/.hermes/skills/code-review-gate/references
```

Tạo file `~/.hermes/skills/code-review-gate/SKILL.md`:

```markdown
---
name: code-review-gate
description: Use before committing code or opening a Pull Request. Enforces security scans, boundary tests verification, and clean diff checks.
---

# Code Review Gate — Cổng kiểm soát chất lượng code

Quy trình này bắt buộc phải chạy trước khi tuyên bố hoàn thành bất kỳ task coding nào.

## 1. Rà soát an toàn & Bí mật (Security Gate)
- Quét diff git: Tuyệt đối không chứa `API_KEY`, `secret`, mật khẩu database.
- Đảm bảo các file cấu hình môi trường `.env` nằm trong `.gitignore`.

## 2. Kiểm thử biên (Boundary Verification)
- Không chấp nhận câu nói "test đã pass" nếu chưa kiểm tra các ca biên:
  - Input rỗng (`""`), mảng rỗng (`[]`), giá trị `null`/`undefined`.
  - Giới hạn trên/dưới của số liệu.
- Tham khảo checklist chi tiết tại `references/test-checklist.md`.

## 3. Rà soát phạm vi thay đổi (Scope Control)
- Chạy `git diff --stat`: Chỉ sửa đúng các file liên quan đến yêu cầu.
- Không tự ý re-format hay thay đổi khoảng trắng của các file không thuộc phạm vi.
```

### Bước 2: Tạo file tham chiếu `references/test-checklist.md`

Tạo file `~/.hermes/skills/code-review-gate/references/test-checklist.md`:

```markdown
# Checklist kiểm thử biên

1. **Mạng & Timeout**: Khi API bên ngoài timeout 10s, app xử lý thế nào?
2. **Dữ liệu lớn**: Payload 10MB có làm tràn RAM không?
3. **Đồng thời (Concurrency)**: Hai request ghi cùng 1 record có sinh ra race condition không?
```

## Cách kiểm chứng Skill của bạn

Để kiểm tra skill vừa viết có hoạt động hiệu quả không:

1. **Kiểm tra Index**: Chạy lệnh `hermes skills list` hoặc tương đương để đảm bảo skill xuất hiện trong danh sách và không bị lỗi cú pháp YAML.
2. **Thử nghiệm Prompt kích hoạt**:
   - Gõ: *"Tôi vừa code xong tính năng thanh toán, hãy chuẩn bị commit giúp tôi."*
   - **Kỳ vọng**: Agent sẽ tự động phát hiện ngữ cảnh và gọi công cụ nạp skill `code-review-gate`.
3. **Thử nghiệm Prompt tiêu cực (Negative test)**:
   - Gõ: *"Giải thích giúp tôi giải thuật QuickSort hoạt động thế nào."*
   - **Kỳ vọng**: Agent KHÔNG được nạp skill `code-review-gate` vì câu hỏi lý thuyết không liên quan đến việc commit/review code.

## Lỗi thường gặp & Bài học đắt giá

1. **Description bị trùng lặp (Keyword Collision)**: Đặt tên 2 skill có description na ná nhau khiến Agent phân vân hoặc nạp cùng lúc cả hai làm đầy context.
2. **Viết skill dưới dạng hướng dẫn con người thay vì ra lệnh cho Agent**:
   - ❌ *"Bạn nên nhớ chạy lệnh test trước nhé."*
   - ✅ *"Bắt buộc chạy `npm test` và kiểm tra exit code 0 trước khi báo thành công."*
3. **Hardcode đường dẫn tuyệt đối của máy cá nhân**: Dùng `~` hoặc biến môi trường thay vì đường dẫn cứng `/Users/ten-ban/...`.

## Đọc tiếp

- [Mô hình SDD: Phát triển phần mềm bằng AI theo đặc tả](/kien-thuc/mo-hinh-sdd-trien-khai-du-an)
- [Tool calling và MCP: Mở rộng khả năng thao tác cho Agent](/kien-thuc/tool-calling-va-mcp)
