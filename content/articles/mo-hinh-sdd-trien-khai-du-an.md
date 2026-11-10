---
id: mo-hinh-sdd-trien-khai-du-an
slug: mo-hinh-sdd-trien-khai-du-an
title: "Mô hình SDD: Phát triển phần mềm bằng AI theo đặc tả (Spec-Driven Development)"
description: "Quy trình xây dựng dự án bài bản từ Spec → Plan → Subagents (TDD Red-Green) → Review → Verify, tránh tình trạng code lan man và mất kiểm soát."
type: article
topic: quy-trinh-ai-coding
level: trung-cap
prerequisites:
  - quy-trinh-ai-coding-bon-buoc
sources:
  - title: "Spec-Driven Development Methodology"
    url: "https://martinfowler.com/articles/spec-driven-development.html"
  - title: "Superpowers Engineering Workflow"
    url: "https://github.com/obra/superpowers"
updated: "2026-11-09"
verified: true
---

## Mục tiêu

Sau bài này bạn sẽ:
- Nắm vững mô hình **SDD (Spec-Driven Development)** kết hợp Agent Orchestration.
- Biết cách chia nhỏ dự án lớn thành các vòng lặp kiểm chứng độc lập (Task 2-5 phút).
- Áp dụng cơ chế **Hard Gate (Cổng chặn cứng)**: Không duyệt Spec thì cấm viết Code.
- Nắm được cách điều phối subagent: 1 Implementer + 2 Reviewers độc lập.

## Kiến thức cần có

- Đã đọc [Quy trình AI coding bốn bước](/kien-thuc/quy-trinh-ai-coding-bon-buoc).
- Hiểu khái niệm TDD (Test-Driven Development) và Git branch/worktree.

## Giải thích

### 1. Tại sao AI coding tự do (Vibe Coding) luôn thất bại ở dự án lớn?

Khi bạn bảo AI: *"Hãy làm cho tôi một web bán hàng có đăng nhập, giỏ hàng, thanh toán và gửi mail"*, những điều sau chắc chắn sẽ xảy ra:
1. Model code tràn lan hàng chục file nhưng không có file nào chạy hoàn chỉnh.
2. Quên các trường hợp biên (edge cases), bảo mật hớ hênh.
3. Càng sửa bug thì càng sinh ra nhiều bug mới vì ngữ cảnh bị trôi dạt (Context Drift).

**SDD (Spec-Driven Development)** đảo ngược quy trình: **Viết văn bản ràng buộc trước, dùng AI như công cụ thực thi có giám sát.**

### 2. Vòng đời dự án theo mô hình SDD

Một dự án SDD tiêu chuẩn đi qua 5 giai đoạn:

```text
[Ý tưởng thô] 
     ↓
1. Brainstorm & Clarify (Làm rõ yêu cầu, hỏi từng câu một)
     ↓
2. Spec Document (Đặc tả chi tiết: UI, Data flow, Security, Boundaries)
     ↓ [HARD GATE: Phải duyệt Spec mới được đi tiếp]
3. Implementation Plan (Bẻ nhỏ thành các Task 2-5 phút kèm test case)
     ↓
4. Subagent-Driven Build (TDD: Test RED → Code GREEN → Review)
     ↓
5. Verification & Ship (Bằng chứng lệnh thật trước khi merge)
```

### 3. Chi tiết từng giai đoạn

#### Giai đoạn 1: Brainstorm & Làm rõ (Clarification)
- Không vội code. Agent hỏi người dùng các câu hỏi nhiều lựa chọn để chốt phạm vi:
  - *"Stack dùng gì? Chạy static hay server?"*
  - *"Dữ liệu lưu ở đâu? Có cần auth không?"*
- Nguyên tắc YAGNI: Cắt bỏ mọi tính năng không thực sự cần thiết trong bản đầu tiên.

#### Giai đoạn 2: Viết Đặc tả (Spec Document)
- Lưu ra file tài liệu cụ thể: `docs/specs/YYYY-MM-DD-<ten-tinh-nang>.md`.
- Gồm: Kiến trúc thông tin, API contract, cơ chế lưu trữ, xử lý lỗi khi mất mạng, tiêu chí nghiệm thu (Acceptance Criteria).
- **Cổng chặn cứng (Hard Gate)**: Người phụ trách dự án phải đọc và gõ duyệt (`approved`) thì mới chuyển sang giai đoạn lập kế hoạch.

#### Giai đoạn 3: Lập kế hoạch chi tiết (Task-by-Task Plan)
Mỗi task chỉ được kéo dài từ 2 đến 5 phút thực thi. Cấu trúc một task chuẩn:
1. **Files**: File nào tạo mới, file nào sửa.
2. **Step 1 (RED)**: Viết test case chứng minh tính năng chưa có hoặc bug đang tồn tại.
3. **Step 2 (Verify RED)**: Chạy lệnh test và thấy output `FAIL` đúng như dự kiến.
4. **Step 3 (GREEN)**: Viết code tối thiểu để test chuyển sang `PASS`.
5. **Step 4 (Verify GREEN)**: Chạy lại test và xác nhận `0 failures`.

#### Giai đoạn 4: Vòng lặp Subagent & Review chéo
Khi dùng các hệ thống Multi-Agent (Hermes, Claude Code, OpenClaw):
- **Agent 1 (Implementer)**: Nhận task, viết test, sửa code cho pass.
- **Agent 2 (Spec Reviewer)**: Đối chiếu code vừa viết với bản Spec ban đầu xem có làm thừa, làm thiếu hoặc vi phạm ràng buộc không.
- **Agent 3 (Code Quality Reviewer)**: Soi lỗi bảo mật, memory leak, đặt tên biến, convention của dự án.
Chỉ khi cả 2 Reviewer đồng ý, task mới được coi là hoàn thành.

#### Giai đoạn 5: Nghiệm thu bằng chứng (Verification)
- Tuyệt đối không tin câu nói: *"Em đã làm xong và test chạy ngon rồi"*.
- Tiêu chí nghiệm thu phải dựa trên **output lệnh thực tế**: Log test pass, exit code 0, kết quả đo bundle size, screenshot giao diện thật.

## Thực hành: Áp dụng SDD vào một task nhỏ

Thử áp dụng SDD khi thêm tính năng "Đổi mật khẩu":

1. **Spec**: Mật khẩu mới >= 8 ký tự, phải khác mật khẩu cũ, hash bằng bcrypt.
2. **Plan**:
   - Task 1: Viết test từ chối mật khẩu cũ trùng mật khẩu mới (RED).
   - Task 2: Implement validation logic (GREEN).
   - Task 3: Viết test độ dài < 8 ký tự (RED).
   - Task 4: Implement độ dài (GREEN).
3. **Verify**: Chạy toàn bộ test suite và đối chiếu diff git.

## Lỗi thường gặp

- **Bỏ qua bước Spec để code cho nhanh**: Tiết kiệm được 10 phút đầu nhưng mất 3 ngày sau để đi dọn rác và refactor.
- **Task quá to**: Một task sửa 10 file cùng lúc khiến model bị quá tải và rất khó cô lập nguyên nhân khi test fail.
- **Thiếu cổng chặn duyệt Spec**: Để AI tự biên tự diễn từ đầu đến cuối mà không có sự đồng thuận của con người về thiết kế.

## Đọc tiếp

- [Hướng dẫn viết và tạo Skill: đóng gói tri thức tác vụ](/kien-thuc/huong-dan-viet-tao-skill)
- [Harness và evals: đo chất lượng hệ AI như một kỹ sư](/kien-thuc/harness-va-evals)
