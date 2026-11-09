---
id: model-va-ngu-canh
slug: model-va-ngu-canh
title: "Model và ngữ cảnh: model thấy gì, không thấy gì"
description: "Hiểu cửa sổ ngữ cảnh, token và giới hạn kiến thức của model là nền tảng để dùng AI coding hiệu quả và không ảo tưởng về khả năng của nó."
type: article
topic: model-va-ngu-canh
level: nhap-mon
prerequisites: []
sources:
  - title: "Anthropic — Context windows"
    url: "https://platform.claude.com/docs/en/build-with-claude/context-windows"
  - title: "Anthropic — Models overview"
    url: "https://platform.claude.com/docs/en/models/overview"
updated: "2026-11-06"
verified: false
---

## Mục tiêu

Sau bài này bạn giải thích được: model chỉ "thấy" những gì nằm trong cửa sổ ngữ cảnh của lượt gọi; kiến thức huấn luyện có ngày cắt (cutoff) và không tự cập nhật; vì sao nhồi nhiều ngữ cảnh không hẳn tốt hơn. Từ đó bạn biết chủ động quản lý những gì đưa vào cho model đọc.

## Kiến thức cần có

- Bạn đã từng gọi một AI coding tool bất kỳ (chat, CLI, IDE assistant) và dán code vào.
- Không cần biết kiến trúc transformer chi tiết.

## Giải thích

### Ngữ cảnh là bộ nhớ làm việc, không phải trí nhớ lâu dài

Tài liệu của Anthropic gọi toàn bộ văn bản model được tham chiếu khi sinh câu trả lời — gồm cả hệ thống hướng dẫn, lịch sử hội thoại, nội dung file được đọc, và cả phản hồi nó đang viết — là *context window* (cửa sổ ngữ cảnh). Hãy hình dung nó như bàn làm việc: mọi thứ không trải trên bàn thì model không nhìn thấy, kể cả khi chúng tồn tại trong repo của bạn.

Ba hệ quả thực chiến:

1. **File bạn không mở, model không biết.** Một coding agent phải chủ động đọc file (hoặc được cấp công cụ đọc file). Nếu nó trả lời sai về module bạn chưa từng mở trong phiên, đó thường là dấu hiệu nó suy đoán từ tên file.
2. **Phiên mới là bàn sạch.** Tắt phiên, mở phiên mới: toàn bộ ngữ cảnh cũ biến mất trừ khi được ghi lại thành file, hoặc được tính năng "memory" của tool đọc lại hộ.
3. **Kiến thức huấn luyện là quá khứ.** Model không biết thư viện bạn vừa upgrade tuần trước, không biết API nội bộ công ty bạn, trừ khi chúng xuất hiện trong ngữ cảnh.

### Token: đơn vị tính của ngữ cảnh

Ngữ cảnh được đo bằng token — các mảnh chữ cái/phần từ, tiếng Anh trung bình 0.75 từ/token, tiếng Việt nhiều dấu và tổ hợp có thể "đắt" hơn. Giới hạn phổ biến hiện nay từ 200k đến 1M token tùy model (xem trang Models overview của Anthropic). Con số nghe lớn, nhưng repo vài chục nghìn dòng sẽ ngốn rất nhanh: agent đọc 20 file là hết nửa cửa sổ.

### Nhiều ngữ cảnh không tự động tốt hơn

Anthropic mô tả hiện tượng *context rot*: khi số token tăng, độ chính xác và khả năng "nhớ đúng" của model giảm dần. Nghĩa là curating — chọn lọc những gì đưa vào — quan trọng ngang dung lượng. Đây là lý do các agent hiện đại compact (tóm tắt hội thoại cũ) trước khi cửa sổ đầy, và lý do "dán cả repo vào prompt" hầu như không bao giờ là chiến lược tốt.

## Thực hành

Làm một phép thử với chính coding agent bạn dùng hằng ngày:

1. Mở phiên mới, hỏi: "Dự án này dùng framework gì?" — quan sát nó tự đọc file cấu hình (đúng) hay đoán (sai).
2. Mở `package.json` (hoặc `pom.xml`) trong editor/cho agent đọc, hỏi lại cùng câu.
3. Kết luận: câu trả lời nào đáng tin hơn, và vì sao — mô tả bằng khái niệm ngữ cảnh.

## Cách kiểm chứng

Bài này tổng hợp từ tài liệu chính thức (phần nguồn ở đầu trang) và **chưa được kiểm thử** theo quy trình của website: các phát biểu về giới hạn token cụ thể phụ thuộc phiên bản model, hãy đối chiếu trang Models overview tại thời điểm bạn đọc.

## Lỗi thường gặp

- **Tưởng model "nhớ" các phiên trước.** Không có gì được nhớ ngoài những gì nằm trong ngữ cảnh hiện tại hoặc được tool ghi thành file.
- **Cứ thấy sai là do model kém.** Rất nhiều câu trả lời sai là do thiếu ngữ cảnh đúng, không phải do năng lực suy luận.
- **Nhồi mọi thứ "cho chắc".** Ngữ cảnh loãng làm tăng nhiễu, tăng chi phí và làm giảm chất lượng theo đúng nghĩa đen (context rot).

## Bài tập

Chọn một phiên làm việc gần nhất của bạn với AI coding tool, liệt kê 3 thứ model *cần* mà đã không thấy (quy ước nội bộ, môi trường deploy, ràng buộc nghiệp vụ). Viết mỗi thứ thành một câu mệnh lệnh ngắn — bạn sẽ dùng chúng ở bài về project instructions.

## Đọc tiếp

- [An toàn dữ liệu khi dùng AI](/kien-thuc/an-toan-du-lieu-khi-dung-ai) — trước khi dán code vào hộp thoại, biết cái gì không nên dán.
- [Quy trình AI coding bốn bước](/kien-thuc/quy-trinh-ai-coding-bon-buoc) — dùng ngữ cảnh trong một quy trình có kiểm soát.
- Lộ trình đầy đủ ở [/lo-trinh](/lo-trinh).
