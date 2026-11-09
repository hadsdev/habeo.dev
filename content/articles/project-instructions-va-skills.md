---
id: project-instructions-va-skills
slug: project-instructions-va-skills
title: "Project instructions và skills: biến quy ước thành file, không lặp lại miệng"
description: "CLAUDE.md / AGENTS.md và skill là hai tầng mang tri thức qua phiên: facts luôn nạp và procedure nạp khi dùng. Viết gì, không viết gì, và giới hạn của chúng."
type: article
topic: project-instructions-va-skills
level: trung-cap
prerequisites:
  - quy-trinh-ai-coding-bon-buoc
sources:
  - title: "Claude Code — How Claude remembers your project"
    url: "https://code.claude.com/docs/en/memory"
  - title: "Claude Code — Extend Claude with skills"
    url: "https://code.claude.com/docs/en/skills"
  - title: "AGENTS.md — open format"
    url: "https://agents.md/"
updated: "2026-11-06"
verified: true
validation:
  environment: "macOS (Darwin 27.2), zsh, Node v26.7.0 — 2026-11-06"
  commands: "wc -m CLAUDE.md; ls -R .claude/skills (các lệnh kiểm tra file được trích trong bài)"
  result: "Các lệnh kiểm tra đếm ký tự và liệt kê cấu trúc file chạy đúng trên máy biên soạn"
---

## Mục tiêu

Sau bài này bạn phân biệt được hai tầng chỉ dẫn cho coding agent — *project instructions* (facts nạp mọi phiên) và *skills* (procedure nạp khi cần) — biết viết file ngắn đúng kiểu, và biết rõ giới hạn: chúng là ngữ cảnh, không phải cấu hình cưỡng chế.

## Kiến thức cần có

- [Quy trình AI coding bốn bước](/kien-thuc/quy-trinh-ai-coding-bon-buoc) — bạn đã tích luỹ được vài quy ước từ các phiên review.
- [Model và ngữ cảnh](/kien-thuc/model-va-ngu-canh).

## Giải thích

### Tầng 1: file chỉ dẫn của dự án

AGENTS.md là định dạng mở "README cho agent" — vị trí dự đoán được để đặt context và hướng dẫn, được hơn 60k dự án mã nguồn mở và nhiều agent khác nhau đọc (Factory, Aider, goose, opencode, Zed, Warp...). Ý tưởng cốt lõi: README viết cho người, AGENTS.md viết cho agent — lệnh build/test/lint, quy ước code, những thứ đặt vào README thì ồn mà thiếu thì agent đoán sai.

Claude Code dùng CLAUDE.md cho cùng vai trò (và đọc được AGENTS.md thay thế). Tài liệu chính thức mô tả rõ cả hai là *context, không phải enforced configuration* — nếu có hành vi **cấm tuyệt đối**, công cụ đúng là hook chặn trước khi tool chạy, không phải một dòng trong file markdown.

`wc -m` là bạn đồng minh: Claude Code giới hạn dung lượng CLAUDE.md theo ký tự (trang memory docs nêu ngưỡng theo model, ví dụ 200.000 ký tự với một số bản, ít hơn với bản khác). File càng dài, tỷ lệ bị "lướt qua" càng cao — cùng lý do context rot ở bài nền tảng.

**Bốn khối nội dung đáng nằm trong file chỉ dẫn:**

```markdown
## Lệnh hay dùng
- Test: `npm test` (chạy local, KHÔNG commit file test)
- Build: `npm run build` — phải xanh trước khi báo xong

## Quy ước cứng
- Java 21 + Spring Boot 3.5; FE Angular standalone + PrimeNG
- Commit sạch dấu vết AI, không Co-authored-by

## Vùng cấm
- Không sửa file ngoài phạm vi được giao
- Không tự commit/merge/push khi chưa được yêu cầu

## Định nghĩa "xong"
- Có bằng chứng chạy lệnh thật, không nhận "trông như xong"
```

Ba khối cuối thường quý nhất: chúng mã hoá những lần bạn đã bị agent làm đau.

### Tầng 2: skill — procedure nạp theo yêu cầu

Skill giải quyết vấn đề của tầng 1 khi nó phình to: một SKILL.md (frontmatter mô tả *khi nào dùng* + thân là quy trình các bước) chỉ được nạp **khi liên quan**, nên "tài liệu tham khảo dài gần như miễn phí cho tới lúc cần" — nguyên văn định hướng từ docs skills của Claude Code. Tín hiệu đến lúc chuyển một section của CLAUDE.md thành skill: bạn nhận ra nó đã trở thành *quy trình nhiều bước* thay vì *một sự thật*, hoặc bạn cứ phải dán lại cùng một checklist trong chat.

Cấu trúc tối giản:

```text
.claude/skills/
  deploy-staging/
    SKILL.md      # frontmatter: name + description (khi nào dùng)
    references/   # tài liệu dài, chỉ đọc khi được trỏ tới
```

Hai quy tắc thực dụng: mô tả trong frontmatter phải trả lời "dùng khi nào" (đây là tín hiệu định tuyến để agent quyết định nạp hay không); và giữ thân skill dưới ~100 dòng — phần chi tiết đẩy sang `references/`.

### Chọn đúng tầng

| Câu hỏi | Tầng đúng |
|---|---|
| Fact ngắn, đúng mọi phiên (lệnh test, vùng cấm)? | CLAUDE.md / AGENTS.md |
| Procedure nhiều bước, chỉ dùng đôi khi? | Skill |
| Điều *không bao giờ* được xảy ra? | Hook/cấu hình cưỡng chế, không phải prompt |

## Thực hành

Với repo cá nhân bất kỳ: tạo `AGENTS.md` gồm 4 khối như mẫu (điền lệnh thật của repo), sau đó thêm `wc -m AGENTS.md` vào thói quen mỗi lần sửa file. Chạy một phiên agent thật và đếm: bao nhiêu câu hỏi nền tảng nó *không còn* hỏi nữa?

## Cách kiểm chứng

Các lệnh `wc -m`, cấu trúc thư mục `.claude/skills/` đã được chạy/đối chiếu thật trên máy biên soạn (macOS, Node v26.7.0, ngày 2026-11-06). Ngưỡng ký tự cụ thể phụ thuộc phiên bản tool — **kiểm tra lại trang memory docs** vì các con số thay đổi theo release.

## Lỗi thường gặp

- **Copy nguyên wiki nội bộ vào CLAUDE.md.** File chỉ dẫn 5.000 dòng là cách nhanh nhất để không dòng nào được tuân thủ.
- **Tin file chỉ dẫn như chính sách an ninh.** Nó là context — muốn cưỡng chế, dùng hook/permission.
- **Skill mô tả mơ hồ.** `description: "deploy"` thì agent không biết khi nào nạp; hãy viết "Use when deploying to staging...".

## Bài tập

Chọn một quy trình bạn lặp lại ≥3 lần/tuần bằng cách dán hướng dẫn vào chat. Viết nó thành skill: frontmatter trả lời "khi nào", thân ≤100 dòng, chi tiết để references/.

## Đọc tiếp

- [Lab: đọc/ghi ngữ cảnh dự án](/thuc-hanh/lab-doc-ghi-context-du-an) — làm thật trên một repo trống.
- [Tool calling và MCP](/kien-thuc/tool-calling-va-mcp) — khi tri thức chưa đủ, model cần công cụ.
