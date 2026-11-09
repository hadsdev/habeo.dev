---
id: an-toan-du-lieu-khi-dung-ai
slug: an-toan-du-lieu-khi-dung-ai
title: "An toàn dữ liệu khi dùng AI: cái gì không được dán vào hộp thoại"
description: "Dữ liệu bạn gửi cho AI service đi đâu, chế độ train mặc định hoạt động thế nào, và checklist phân loại thông tin trước khi dán code hoặc log vào model."
type: article
topic: an-toan-du-lieu
level: nhap-mon
prerequisites:
  - model-va-ngu-canh
sources:
  - title: "OWASP Top 10 for LLM Applications"
    url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/"
  - title: "OpenAI Help — How your data is used to improve model performance"
    url: "https://help.openai.com/en/articles/5722486-how-your-data-is-used-to-improve-model-performance"
updated: "2026-11-06"
verified: false
---

## Mục tiêu

Sau bài này bạn tự tin trả lời: thông tin nào tuyệt đối không đưa vào AI service công cộng; chính sách train dữ liệu của các dịch vụ phổ biến hoạt động ra sao và kiểm soát ở đâu; quy tắc tẩy dữ liệu (redact) trước khi dán log/config.

## Kiến thức cần có

- [Model và ngữ cảnh](/kien-thuc/model-va-ngu-canh): bất cứ thứ gì bạn dán vào đều trở thành ngữ cảnh và rời khỏi máy bạn.
- Bạn làm việc với code thật của công ty hoặc khách hàng.

## Giải thích

### Ba đường rò rỉ phổ biến nhất

1. **Bí mật cứng trong code.** API key, password DB, token nội bộ thường "đi theo" đoạn code khi bạn dán cả hàm vào hộp thoại để hỏi "hàm này sai ở đâu". Với model, secret cũng chỉ là text — nó sẽ lặp lại, gợi ý lại, và nằm trong dữ liệu nhật ký của dịch vụ.
2. **Dữ liệu cá nhân / dữ liệu khách hàng trong log.** Log debug đầy đủ thường chứa tên, SĐT, địa chỉ, số hợp đồng. Dán cả log để hỏi lỗi là rò rỉ hàng loạt.
3. **Chất xám nội bộ:** thiết kế chưa công bố, dữ liệu tài chính, thông tin khách hàng theo hợp đồng bảo mật (NDA). Không "kỹ thuật" nào biến chúng thành an toàn.

OWASP xếp prompt injection và sensitive information disclosure vào nhóm rủi ro hàng đầu cho ứng dụng LLM — nguyên nhân thường không nằm ở model "ác", mà ở chỗ ngữ cảnh được nhét quá tay không kiểm soát.

### Mặc định train hay không train?

Không có câu trả lời chung cho mọi dịch vụ. Ví dụ thực tế từ tài liệu chính thức của OpenAI (tính tại ngày cập nhật bài): với tài khoản cá nhân (Free/Plus/Pro), OpenAI *có thể* dùng nội dung để cải thiện model, và người dùng tắt được bằng "Improve the model for everyone" trong Settings → Data controls hoặc chọn "Do not train on my content" ở Privacy Portal. Ngược lại, với Business/Enterprise/Edu, OpenAI cam kết không dùng prompt/response/file để train trừ khi tổ chức ký thỏa thuận riêng cho phép.

Hai bài học rút ra:

- **Tài khoản cá nhân và tài khoản doanh nghiệp có chế độ dữ liệu khác nhau.** Dùng tài khoản công ty qua consumer app là vùng xám cần hỏi bộ phận an toàn.
- **Tắt train không có nghĩa là không rời máy.** Dữ liệu vẫn được truyền lên, vẫn được nhân viên nhà cung cấp xử lý trong phạm vi chính sách của họ. Không có setting nào biến nó thành "không gửi đi".

### Checklist trước khi dán

Với mỗi khối nội dung chuẩn bị dán, quét nhanh:

- [ ] Có secret/credential/cookie/session token nào không? → thay bằng `REDACTED` hoặc giá trị giả *có cùng độ dài/format*.
- [ ] Có PII (tên, SĐT, email, CCCD, số hợp đồng thật) không? → sinh dữ liệu giả.
- [ ] Có logic/thuật toán độc quyền mà NDA cấm chia sẻ ra ngoài không? → chỉ mô tả bằng lời, hoặc dùng giải pháp cho phép self-host/on-prem nếu công ty bạn có.
- [ ] Có dữ liệu sản xuất (production data) không? → tái hiện bằng fixture, đừng debug bằng data thật.

## Thực hành

Lấy một log lỗi thật (của dự án cá nhân hoặc test env), tẩy theo checklist trên thành một đoạn log hỏi AI "sạch". So sánh: model có trả lời được như với log gốc không? Gần như luôn được — vì model cần *cấu trúc* lỗi, không cần *bí mật* của bạn.

## Cách kiểm chứng

Các mô tả về chính sách train dẫn nguyên văn từ trang trợ giúp OpenAI ở phần nguồn, kèm ngày cập nhật bài — **chính sách có thể đổi, hãy kiểm tra lại trang gốc trước khi áp dụng cho quyết định quan trọng.** Bài chưa qua quy trình kiểm thử của website.

## Lỗi thường gặp

- **"Tài khoản Pro thì an toàn như Enterprise."** Không. Chế độ dữ liệu khác nhau theo loại tài khoản, như trích dẫn ở trên.
- **"Đã tắt train nên cứ dán thoải mái."** Dữ liệu vẫn rời khỏi quyền kiểm soát của bạn.
- **Tẩy qua loa.** Xóa 2 ký tự cuối số điện thoại vẫn còn 9 ký tự định danh. Thay hẳn bằng giá trị giả.

## Bài tập

Viết một file `REDACTION.md` ngắn (5–10 dòng) cho riêng bạn: danh mục các pattern cần tẩy (regex hoặc mô tả) trước khi dán vào bất kỳ AI service công cộng nào. Bạn sẽ dùng nó ở [lab đọc/ghi ngữ cảnh dự án](/thuc-hanh/lab-doc-ghi-context-du-an).

## Đọc tiếp

- [Lab: đọc/ghi ngữ cảnh dự án](/thuc-hanh/lab-doc-ghi-context-du-an) — thực hành tẩy dữ liệu và ghi quy ước vào file.
- OWASP Top 10 for LLM Applications (link ở nguồn) — bản đầy đủ các rủi ro.
