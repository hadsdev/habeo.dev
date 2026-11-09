---
id: quy-trinh-ai-coding-bon-buoc
slug: quy-trinh-ai-coding-bon-buoc
title: "Quy trình AI coding bốn bước: đặc tả → sinh code → kiểm chứng → chốt"
description: "Framework làm việc lặp lại với AI coding agent: nói rõ đầu ra mong muốn, giới hạn phạm vi sinh code, bắt model tự chạy kiểm tra, và chỉ coi là xong khi có bằng chứng."
type: article
topic: quy-trinh-ai-coding
level: nhap-mon
prerequisites:
  - model-va-ngu-canh
sources:
  - title: "Claude Code — Best practices"
    url: "https://code.claude.com/docs/en/best-practices"
  - title: "GitHub Copilot documentation"
    url: "https://docs.github.com/en/copilot"
updated: "2026-11-06"
verified: false
---

## Mục tiêu

Sau bài này bạn có một quy trình cố định để làm việc với mọi AI coding agent, thay vì "đoán prompt" từng lần: biết cách giao việc đặc tả rõ, giới hạn phạm vi, yêu cầu bằng chứng hoàn thành, và biết khi nào phải dừng vòng lặp.

## Kiến thức cần có

- [Model và ngữ cảnh](/kien-thuc/model-va-ngu-canh) — vì sao "nó không biết" thường là "nó không được thấy".
- Bạn có một dự án biết chạy test (bất kỳ ngôn ngữ).

## Giải thích

Tài liệu best practices của Claude Code nêu đúng ba kiểu thất bại hay gặp nhất của phiên coding: model xây thứ khác với ý bạn (thiếu thông tin), model báo xong mà chưa xong (không có gì để tự kiểm tra), và model làm điều cấm hoặc bỏ bước bắt buộc (prompt đơn lẻ không đảm bảo được). Quy trình bốn bước dưới đây đóng cả ba lỗ hổng đó.

### Bước 1 — Đặc tả (nói rõ "xong" nghĩa là gì)

Trước khi xin code, viết 3–10 dòng:

- **Đầu ra mong muốn** — hành vi, không phải cài đặt: "endpoint trả 400 kèm danh sách field lỗi khi thiếu email".
- **Ràng buộc** — không đổi file nào, không thêm dependency nào, theo quy ước nào.
- **Tiêu chí xong (definition of done)** — lệnh nào phải chạy xanh, ví dụ `npm test -- --filter auth`.

Model không đọc được ý bạn trong đầu — best practices của Claude Code gọi chính xác lớp lỗi này là "thông tin nó không thấy được từ repo". Đặc tả là cách bạn đặt thông tin đó lên bàn.

### Bước 2 — Sinh code trong phạm vi hẹp

Giao một thay đổi đủ nhỏ để review nổi trong một hơi đọc. Một phiên làm một việc: thêm function, không phải "viết lại module auth". Phạm vi nhỏ khiến bước 3 rẻ và bước 4 khả thi. Nếu agent muốn sửa lan man ngoài phạm vi, đó là tín hiệu đặc tả của bạn chưa đủ ràng buộc — quay lại bước 1, đừng mặc cả với code sinh ra.

### Bước 3 — Kiểm chứng bằng máy, không bằng mắt

Điểm chết người của "đọc thấy đúng" là code trông đúng vẫn chạy sai. Bắt buộc có một trong các bằng chứng:

- test tự động phủ hành vi vừa yêu cầu (TDD với agent: viết test trước, đưa cả test cho agent, yêu cầu làm test xanh);
- chạy lệnh build/lint/type-check in kết quả thật;
- với UI: screenshot hoặc bước thao tác được ghi lại.

Claude Code mô tả nhu cầu này nguyên văn: model "nói xong mà chưa xong, thường vì nó không có gì để tự kiểm tra công việc của mình". Cho nó một phép kiểm (a check to run) — đó là câu khác biệt giữa tin và không tin được output.

### Bước 4 — Chốt: review diff và ghi lại quy ước

Đọc *toàn bộ* diff trước khi chấp nhận (diff nhỏ nên điều này nhanh). Sau đó, nếu phiên vừa rồi lộ ra một quy ước mà agent nên biết mãi (cách chạy test của repo, file cấm sửa), ghi nó vào tài liệu chỉ dẫn của dự án — xem [bài project instructions](/kien-thuc/project-instructions-va-skills). Mỗi lần lặp, chất lượng phiên sau tăng mà không tốn prompt dài hơn.

## Thực hành

Với một ticket thật (hoặc tự bịa một requirement nhỏ), chạy trọn bốn bước với coding agent bạn có, trong đó bắt buộc: đặc tả ghi definition of done bằng một lệnh test cụ thể, và bạn chỉ accept khi thấy lệnh đó chạy xanh trên máy mình. Ghi lại: bước nào agent hỏng, bạn phải can thiệp gì.

## Cách kiểm chứng

Bài tổng hợp từ tài liệu chính thức (nguồn đầu trang) và kinh nghiệm biên soạn; **chưa được kiểm thử** tự động. Khung bốn bước áp dụng công cụ-agnostic; với Copilot, tham chiếu thêm docs GitHub Copilot ở phần nguồn.

## Lỗi thường gặp

- **Đặc tả bằng một câu.** "Thêm validate cho form" — model tự quyết định hộ bạn 80% phương án rồi bạn trả giá ở bước review.
- **Accept khi code "trông ổn" mà chưa chạy gì.** Bằng chứng hoặc im miệng.
- **Một phiên sửa cả thế giới.** Diff 800 dòng không review được nghĩa là không review được, đừng tự lừa.
- **Vòng lặp vô vọng.** Agent sửa 3 vòng vẫn đỏ: vấn đề thường nằm ở đặc tả hoặc ở chính test — dừng lại, thu nhỏ phạm vi, điều tra gốc.

## Bài tập

Viết mẫu đặc tả 3 phần (đầu ra / ràng buộc / tiêu chí xong) cho 3 dạng việc hay gặp ở dự án của bạn: bug fix, thêm API, refactor. Cất đi — hai bài tiếp theo trong lộ trình sẽ dùng lại chúng làm nội dung chỉ dẫn vĩnh viễn cho repo.

## Đọc tiếp

- [Project instructions và skills](/kien-thuc/project-instructions-va-skills) — biến quy ước học được thành file.
- [Lab: đọc/ghi ngữ cảnh dự án](/thuc-hanh/lab-doc-ghi-context-du-an) — tay chân hoá bài tập trên.
