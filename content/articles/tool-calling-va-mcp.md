---
id: tool-calling-va-mcp
slug: tool-calling-va-mcp
title: "Tool calling và MCP: cho model đôi tay, không chỉ đôi mắt"
description: "Cơ chế model gọi hàm: JSON schema, vòng gọi- trả-kết-quả, và cách MCP chuẩn hoá việc gắn công cụ/data vào mọi client AI như một cổng USB-C."
type: article
topic: tool-calling-va-mcp
level: trung-cap
prerequisites:
  - model-va-ngu-canh
  - project-instructions-va-skills
sources:
  - title: "OpenAI — Function calling guide"
    url: "https://platform.openai.com/docs/guides/function-calling"
  - title: "Model Context Protocol — Introduction"
    url: "https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro"
updated: "2026-11-06"
verified: false
---

## Mục tiêu

Sau bài này bạn giải thích được vòng đời một lần tool call (mô tả công cụ → model xin gọi → ứng dụng chạy hộ → đưa kết quả trở lại → model trả lời), đọc hiểu một tool schema dạng JSON, và nói được MCP giải quyết bài toán gì mà function calling tự nó không giải quyết.

## Kiến thức cần có

- [Model và ngữ cảnh](/kien-thuc/model-va-ngu-canh) — tool result bản chất cũng chỉ là văn bản được nạp thêm vào ngữ cảnh.
- Biết JSON và gọi HTTP API cơ bản.

## Giải thích

### Model không chạy được gì cả

Điểm hay bị hiểu sai nhất: model *không thực thi* tool. Nó chỉ sinh văn bản. Tool calling là một thoả thuận giữa ứng dụng của bạn và model, mà tài liệu OpenAI mô tả thành 5 bước:

1. Gửi request kèm **danh sách công cụ** model được phép gọi (mỗi công cụ: tên, mô tả, JSON schema của tham số).
2. Model trả về một **tool call**: "tôi muốn gọi `get_forecast` với `{"thành_phố": "Hà Nội"}`" — vẫn chỉ là text có cấu trúc.
3. **Ứng dụng của bạn** chạy code thật với tham số đó.
4. Gửi kết quả trở lại model trong request tiếp theo.
5. Model trả lời cuối cùng (hoặc xin gọi tiếp).

Toàn bộ quyền lực và trách nhiệm nằm ở bước 3 — code của bạn. Hệ quả an ninh trực tiếp: model có thể xin gọi tool với tham số do *nội dung nó đọc được* điều khiển (prompt injection). Xác thực quyền hạn ở bước 3, đừng tin tham số chỉ vì "model bảo thế".

### Schema là hợp đồng

Chất lượng mô tả tool quyết định model gọi đúng hay bịa tham số. Ba quy tắc thực dụng từ tài liệu chính thức và kinh nghiệm:

- Mô tả ngắn nhưng nêu rõ *khi nào dùng* và *đơn vị/định dạng* ("ISO 8601, YYYY-MM-DD").
- Thu hẹp tham số: enum thay cho string tự do ở mọi nơi có thể.
- Tên tool là động từ + danh từ: `search_orders`, không phải `tool1`.

### MCP: chuẩn hoá cổng kết nối

Function calling giải quyết "model ↔ ứng dụng của tôi". Câu hỏi còn lại: ai viết adapter cho từng cặp model-app? Câu trả lời của hệ sinh thái là MCP (Model Context Protocol) — chuẩn mã nguồn mở để nối ứng dụng AI với nguồn data, công cụ và workflow. Ví von của chính dự án: MCP như cổng USB-C cho ứng dụng AI — một chuẩn cắm, hai phía tự do thay thế.

MCP chia khả năng của server thành ba loại: **resources** (data đọc được), **tools** (hàm model gọi được, có người duyệt), **prompts** (mẫu chuẩn bị sẵn). Một server MCP local phục vụ Claude/ChatGPT/coding agent của bạn cùng lúc mà không cần một dòng adapter nào — server viết một lần, mọi client chuẩn MCP dùng được.

| | Function calling | MCP |
|---|---|---|
| Phạm vi | Trong ứng dụng bạn tự viết | Chuẩn chung mọi client/server |
| Discovery | Bạn hard-code danh sách tool | Client kết nối server, liệt kê tool động |
| Ai thực thi | Code của bạn | Code của server MCP |

## Thực hành

Đọc một tool schema thật và chỉ ra 3 điểm có thể khiến model gọi sai (gợi ý: xem trang quickstart server của MCP ở phần nguồn — tool `get_alerts`/`get_forecast`). Sau đó chạy [lab MCP server local](/thuc-hanh/lab-mcp-server-local) để thấy trọn vòng 5 bước bằng mắt.

## Cách kiểm chứng

Bài tổng hợp tài liệu OpenAI và MCP chính thức (nguồn đầu trang, đối chiếu ngày 2026-11-06); các phát biểu đặc thù API (tên tham số, hành vi model) **chưa kiểm thử đầu cuối** và phụ thuộc phiên bản — vòng lab là nơi kiểm chứng tay chân.

## Lỗi thường gặp

- **Tool quá "tham lam".** Một tool `manage_everything(action, payload_json)` — model hiếm khi gọi đúng. Chia nhỏ.
- **Không giới hạn quyền bước 3.** Tool chạy SQL theo tham số model sinh mà không đọc-quyền-chỉ-đọc là tự đào mồ.
- **Tin tool result là sự thật.** Kết quả từ web/tool đi thẳng vào ngữ cảnh — nội dung độc hại trong đó cũng là vector prompt injection (xem OWASP, liên kết ở [bài an toàn dữ liệu](/kien-thuc/an-toan-du-lieu-khi-dung-ai)).

## Bài tập

Thiết kế trên giấy 3 tool cho một bot chăm sóc khách hàng (gợi ý: tra đơn, tạo hoàn tiền, tìm tài liệu): viết JSON schema của một trong ba tool, kèm mô tả 2 câu mà bạn nghĩ model nào cũng hiểu đúng.

## Đọc tiếp

- [Harness và evals](/kien-thuc/harness-va-evals) — khi agent có cả mắt lẫn tay, đo nó thế nào.
- [Lab: MCP server local](/thuc-hanh/lab-mcp-server-local).
