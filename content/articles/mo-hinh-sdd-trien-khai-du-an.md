---
id: mo-hinh-sdd-trien-khai-du-an
slug: mo-hinh-sdd-trien-khai-du-an
title: "Mô hình SDD: Phát triển phần mềm bằng AI theo đặc tả (Spec-Driven Development)"
description: "Cẩm nang triển khai dự án AI chuyên nghiệp: 5 pha từ Clarify → Spec → Task Plan → Subagent Loop (TDD Red-Green) → Evidence Verification. Có template mẫu tải về."
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
- Hiểu vì sao lối làm việc "Vibe Coding" (chat tự do không văn bản) luôn đổ vỡ ở dự án thực tế.
- Làm chủ quy trình 5 bước **SDD (Spec-Driven Development)** được thiết kế riêng cho AI Coding Agents.
- Biết cách thiết lập **Cổng chặn cứng (Hard Gate)** để ngăn chặn model tự ý sinh code lan man.
- Nắm vững kỹ thuật phân rã tác vụ (Task Decomposition) xuống mức 2-5 phút thực thi kèm vòng lặp kiểm chứng độc lập.

## Kiến thức cần có

- Đã đọc [Quy trình AI coding bốn bước: đặc tả → sinh code hẹp → kiểm chứng → chốt](/kien-thuc/quy-trinh-ai-coding-bon-buoc).
- Hiểu nguyên lý TDD (Test-Driven Development: Red → Green → Refactor).

## Giải thích

### 1. Cái bẫy "Vibe Coding" và nghịch lý của AI

Khi giao việc cho AI bằng một câu lệnh chung chung (*"Tạo giúp tôi hệ thống thông báo realtime qua WebSocket"*), model sẽ gặp phải hiện tượng **Context Drift (Trôi dạt ngữ cảnh)**:

1. **Sinh code giả định**: Tự chế ra các bảng DB, tự bịa ra các DTO mà không khớp với hệ thống hiện tại.
2. **Sửa 1 chỗ, hỏng 5 chỗ**: Do không có biên giới kỹ thuật (Boundary), AI sẽ tự tiện sửa cả những module không liên quan.
3. **Ảo tưởng hoàn thành**: AI báo "Đã xong rất mượt mà" nhưng khi chạy thật thì gặp lỗi `NullPointerException` hoặc `Connection Refused`.

**SDD (Spec-Driven Development)** là kỷ luật kỹ thuật sinh ra để trị dứt điểm vấn đề này: **Biến văn bản đặc tả thành hợp đồng bất di bất dịch trước khi sinh ra bất kỳ dòng code nào.**

### 2. Vòng đời 5 pha của một dự án SDD

```text
       [Ý TƯỞNG / YÊU CẦU BAN ĐẦU]
                    ↓
  [Pha 1: Brainstorm & Clarify] ── Làm rõ mục tiêu, hỏi 1 câu/lượt, cắt bỏ YAGNI
                    ↓
    [Pha 2: Viết Bản Đặc Tả (Spec)] ── Lưu docs/specs/..., mô tả data flow, edge cases
                    ↓
═════════════════════════════════════════════════
  [HARD GATE: Con người phê duyệt văn bản Spec]
═════════════════════════════════════════════════
                    ↓
  [Pha 3: Lập Kế Hoạch (Plan)] ── Bẻ nhỏ thành N task (mỗi task 2-5 phút kèm test)
                    ↓
  [Pha 4: Subagent Build & Review] ── TDD Red-Green + Spec Reviewer + Code Reviewer
                    ↓
  [Pha 5: Nghiệm Thu Bằng Chứng] ── Kiểm chứng bằng lệnh thật, 0 failures mới merge
```

### 3. Chi tiết và mẫu tài liệu từng pha

#### Pha 1: Brainstorming & Phỏng vấn làm rõ
Agent không bao giờ được phép bắt tay vào code ngay. Nó phải đóng vai trò Solution Architect và hỏi người dùng:
- *Câu hỏi 1 (Phạm vi)*: "Dự án này chạy nội bộ hay public internet? Có cần auth đa người dùng không?"
- *Câu hỏi 2 (Stack)*: "Sử dụng stack nào? (Java Spring Boot 3.5 / Angular 19 / Python FastAPI)?"
- *Câu hỏi 3 (Giới hạn)*: "Lưu lượng tối đa kỳ vọng là bao nhiêu? Xử lý lưu trữ qua DB nào?"

#### Pha 2: Cấu trúc file Đặc tả chuẩn (`SPEC.md`)
Tài liệu Spec phải được lưu thành file tĩnh (ví dụ: `docs/specs/2026-11-09-notification-spec.md`):

```markdown
# Đặc tả kỹ thuật: Hệ thống thông báo Realtime

## 1. Mục tiêu & Phạm vi
- Cung cấp WebSocket endpoint cho client nhận thông báo tức thời.
- KHÔNG làm: Gửi email hay SMS trong bản này (YAGNI).

## 2. Luồng dữ liệu (Data Flow)
1. Producer bắn message vào Kafka topic `notifications.v1`.
2. Worker nhận event, ghi vào MongoDB collection `notifications`.
3. Push payload qua WebSocket session tương ứng của User.

## 3. Ca biên & Xử lý lỗi (Edge Cases)
- Client mất mạng: Giữ tin nhắn chưa đọc trong DB; khi reconnect kéo lại qua REST API `/api/notifications/unread`.
- Payload quá 64KB: Từ chối ngay tại Gateway với HTTP 413.

## 4. Tiêu chí nghiệm thu (Acceptance Criteria)
- [ ] Gửi thử 1.000 message, 100% client nhận đủ trong < 200ms.
- [ ] Test unit đạt độ phủ kiểm thử logic parse message.
```

> **CỔNG CHẶN (HARD GATE)**: Agent dừng lại và hỏi: *"Bản đặc tả đã được soạn tại docs/specs/... Boss có phê duyệt bản này để bắt đầu lập kế hoạch không?"*. Nếu người dùng chưa gõ duyệt, tuyệt đối không được viết plan hay code!

#### Pha 3: Bẻ nhỏ Task (Task Decomposition)
Một kế hoạch tốt là kế hoạch mà một lập trình viên tập sự cũng có thể làm theo mà không cần đoán. Mỗi Task có cấu trúc:

```markdown
### Task 3: Validate độ dài nội dung thông báo

**Files**:
- Test: `src/test/java/NotificationValidatorTest.java`
- Code: `src/main/java/NotificationValidator.java`

- **Bước 1 (RED)**: Viết test case `testRejectNotificationContentExceeding1000Chars()`.
- **Bước 2 (Chạy RED)**: `mvn test -Dtest=NotificationValidatorTest`. Output mong đợi: FAIL (Class/Method chưa tồn tại).
- **Bước 3 (GREEN)**: Viết code tối thiểu trong `NotificationValidator.java` để ném `IllegalArgumentException`.
- **Bước 4 (Chạy GREEN)**: `mvn test -Dtest=NotificationValidatorTest`. Output mong đợi: BUILD SUCCESS (1 passed).
```

#### Pha 4: Cơ chế Subagent & Đánh giá độc lập (Triad Pattern)
Trong các mô hình agent nâng cao (Multi-agent orchestration), mỗi task được xử lý bởi 3 agent độc lập:

1. **Implementer Agent**: Đọc đúng task được giao, viết test RED, code cho test GREEN.
2. **Spec Compliance Reviewer**: Một subagent mới tinh (không mang định kiến của Implementer) vào đọc code và đối chiếu với file `SPEC.md`. Nhiệm vụ: Bắt các lỗi tự ý thêm tính năng thừa hoặc làm sai yêu cầu.
3. **Code Quality Reviewer**: Soi cú pháp, hiệu năng, nguy cơ rò rỉ bộ nhớ, đặt tên biến và quy chuẩn dự án.

#### Pha 5: Bằng chứng trước khẳng định (Evidence-First Verification)
Nghiêm cấm dùng các từ ngữ cảm tính: *"Hình như chạy được rồi"*, *"Trông rất ổn"*.
Báo cáo hoàn thành bắt buộc phải chứa:
- Lệnh chạy: `npm run build && npm test`
- Output máy in ra: `19 passed, 0 failed, Exit Code: 0`
- Thời gian thực thi và đường dẫn file artifact đã sinh ra.

## Thực hành: Áp dụng SDD vào bài toán thực tế

Khi Boss muốn thêm tính năng "Đánh dấu bài viết đã đọc":

1. **Clarify**: Lưu trên server hay local? → Chốt: `localStorage`.
2. **Spec**: Đánh dấu theo `id` duy nhất, reload trang không mất, nếu trình duyệt chặn storage thì không được sập app.
3. **Plan**:
   - Task 1: Test service lưu ID vào storage giả lập.
   - Task 2: Implement `toggleProgress(id)`.
   - Task 3: Test trường hợp storage throw ngoại lệ (`QuotaExceededError`).
   - Task 4: Catch lỗi và bật cờ cảnh báo giao diện.
4. **Verify**: Chạy Playwright test mở tab ẩn danh và reload trang để đối chiếu trạng thái nút bấm.

## Lỗi thường gặp của kỹ sư khi dùng AI

1. **Lười viết Spec**: Nghĩ rằng viết prompt dài 3 dòng là đủ. Kết quả là mất 2 tiếng debug vì AI hiểu sai ý đồ kiến trúc.
2. **Cho phép AI tự sửa Plan**: Plan đã chốt là kim chỉ nam. Nếu muốn đổi plan, phải quay lại cập nhật Spec trước.
3. **Tin vào bài test do AI tự nghĩ ra sau khi viết code**: AI thường có xu hướng viết test vừa khít với đoạn code nó vừa bịa ra, che giấu các bug logic nghiêm trọng. **Bắt buộc phải Test RED trước khi Code GREEN**.

## Đọc tiếp

- [Hướng dẫn viết và tạo Skill: đóng gói tri thức tác vụ cho Agent](/kien-thuc/huong-dan-viet-tao-skill)
- [Harness và evals: đo chất lượng hệ AI như một kỹ sư](/kien-thuc/harness-va-evals)
