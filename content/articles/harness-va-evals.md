---
id: harness-va-evals
slug: harness-va-evals
title: "Harness và evals: đo chất lượng hệ AI như đo phần mềm"
description: "Harness là lớp code quanh model (quản lý ngữ cảnh, tool, retry); evals là bộ test lặp lại được cho chất lượng. Không có eval, mọi cải tiến prompt chỉ là tin đồn."
type: article
topic: harness-va-evals
level: nang-cao
prerequisites:
  - quy-trinh-ai-coding-bon-buoc
  - tool-calling-va-mcp
sources:
  - title: "OpenAI — Working with evals"
    url: "https://platform.openai.com/docs/guides/evals"
  - title: "openai/evals — framework và registry mở"
    url: "https://github.com/openai/evals"
  - title: "Claude Code — Best practices"
    url: "https://code.claude.com/docs/en/best-practices"
updated: "2026-11-06"
verified: false
---

## Mục tiêu

Sau bài này bạn định nghĩa được *harness* (lớp mã bao quanh model biến nó thành sản phẩm), hiểu vì sao cùng một model cho chất lượng chênh lệch lớn giữa các harness, và xây được eval đầu tiên: tập input cố định, tiêu chí chấm, chạy lặp lại.

## Kiến thức cần có

- Toàn bộ lộ trình nền: [ngữ cảnh](/kien-thuc/model-va-ngu-canh), [quy trình 4 bước](/kien-thuc/quy-trinh-ai-coding-bon-buoc), [tool calling](/kien-thuc/tool-calling-va-mcp).
- Kinh nghiệm viết test tự động là một lợi thế lớn.

## Giải thích

### Harness là sản phẩm, model chỉ là động cơ

Coding agent, chatbot RAG, automation workflow — thứ bạn thực sự dùng là **harness**: toàn bộ code quyết định *model thấy gì* (chọn file, nén lịch sử, bơm system prompt), *model làm được gì* (danh sách tool, quyền hạn, sandbox), *mô hình lặp* (một lượt hay vòng lặp lập kế hoạch-thực hiện-kiểm tra), và *xử lý lỗi* (retry, fallback, timeout).

Hai đội dùng cùng một model API nhưng kết quả chênh nhau một bậc — độ chênh nằm ở harness, không ở model. Đây cũng là góc nhìn của best practices Claude Code: mặc định của harness tốt đủ dùng cho ca thông thường; setup thêm (permissions, hooks, memory) là để bịt các ca đặc thù của *dự án bạn*.

Khi đánh giá hoặc xây harness, bốn trục câu hỏi:

1. **Ngữ cảnh:** harness tự nạp gì? Có compact khi gần đầy không? Có cho phép tôi chỉ định context không?
2. **Công cụ & quyền:** tool gì, ai duyệt lệnh? Có chạy ngoài sandbox được không?
3. **Vòng lặp:** có bước tự kiểm chứng (chạy test) trước khi báo xong không?
4. **Chi phí & vận hành:** token tiêu bao nhiêu cho một task điển hình? Lỗi thì fail-an toàn hay fail-âm-thầm?

### Evals: unit test cho hành vi không tất định

Vấn đề cốt lõi: model không tất định, output "đúng chung chung" là bẫy cảm tính. Evals là kỹ thuật biến đánh giá thành vòng lặp máy chạy được. Tài liệu OpenAI mô tả 3 bước: *mô tả task thành eval* → *chạy với tập input test* → *phân tích kết quả, lặp lại cải tiến prompt*.

Kiến trúc một eval tối giản:

```text
evals/
  dataset.jsonl      # N ví dụ: {"input": ..., "expected": ...}
  run.mjs            # gọi hệ thống với từng input
  grade.mjs          # chấm: khớp chính xác / regex / LLM-as-judge
  results/<date>.md  # điểm theo lần chạy, để so sánh hồi quy
```

Ba cấp độ chấm, đắt dần và mềm dần:

- **Programmatic:** khớp chính xác, JSON validate, chạy được `tsc`/test — ưu tiên tuyệt đối khi hành vi kiểm chứng máy được.
- **LLM-as-judge:** dùng model chấm theo rubric — tiện cho văn bản mở, nhưng *chính model chấm cũng là một hệ thống cần kiểm* (lệch vị trí, nể lời, prefer dài).
- **Người chấm:** đắt nhất, dành cho golden set nhỏ và khi 2 cấp trên hết dư địa.

Framework mã nguồn mở [openai/evals](https://github.com/openai/evals) cung cấp registry + cách viết eval custom; OpenAI cũng có Evals trên dashboard (lưu ý: tài liệu chính thức của họ thông báo đang deprecated nền tảng này — đọc kỹ timeline trước khi phụ thuộc).

### Văn hoá hồi quy

Mỗi lần đổi prompt/model/harness, chạy lại eval như chạy unit test. Mỗi lỗi thật người dùng báo → thêm một ví dụ vào dataset. Sau vài tháng bạn có tài sản: bộ dữ liệu mô tả chính xác "như thế nào là đúng" cho bài toán của bạn — thứ không mua được từ bất kỳ model mới nào.

## Thực hành

Chọn *một* task nhỏ bạn đã làm bằng AI trong tuần qua (ví dụ: chuyển mô tả bug thành ticket chuẩn). Viết dataset 10 input tự tay tạo; chấm programmatic nếu được (ví dụ: output phải chứa các field bắt buộc dạng JSON). Chạy 2 phiên bản prompt khác nhau. So — con số, không cảm giác.

## Cách kiểm chứng

Khái niệm và quy trình theo tài liệu OpenAI/Anthropic ở phần nguồn (đối chiếu 2026-11-06). **Chưa kiểm thử end-to-end** — bài này cố tình giao phần chạy eval thật cho bạn; nếu làm xong, phần thực hành của bạn chính là một eval đầu tiên.

## Lỗi thường gặp

- **Eval 2 ví dụ kết luận "prompt mới tốt hơn".** Nhiễu lấy mẫu nuốt chửng chênh lệch 10% ở mẫu nhỏ.
- **Chấm mọi thứ bằng LLM.** Hành vi kiểm được bằng code thì đừng thuê model chấm — chậm, đắt, sai âm thầm.
- **Đổi model mới không chạy lại eval.** "Model mới mạnh hơn" không áp dụng tự động cho *task của bạn*.

## Bài tập

Chuyển 3 lỗi production/gặp-cả-ngày gần nhất của hệ AI bạn đang dùng thành 3 ví dụ dataset eval (input + expected + cách chấm). Đây là hạt giống bộ eval của dự án bạn.

## Đọc tiếp

- Bạn đã đi hết lộ trình nền — quay lại [/lo-trinh](/lo-trinh) chọn chủ đề mở rộng, hoặc xem trang [/thuc-hanh](/thuc-hanh) để chốt hai lab còn lại.
