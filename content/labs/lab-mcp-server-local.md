---
id: lab-mcp-server-local
slug: lab-mcp-server-local
title: "Lab: viết MCP server local và gọi tool qua client"
description: "Theo quickstart chính thức của MCP: dựng server weather bằng Python SDK, kiểm tra bằng MCP Inspector, và gắn vào một client hỗ trợ MCP để xem trọn vòng tool call."
type: lab
topic: tool-calling-va-mcp
level: trung-cap
prerequisites:
  - tool-calling-va-mcp
sources:
  - title: "MCP quickstart — Build an MCP server"
    url: "https://modelcontextprotocol.io/quickstart/server"
  - title: "Model Context Protocol — Introduction"
    url: "https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro"
updated: "2026-11-06"
verified: false
---

## Mục tiêu

Kết thúc lab bạn tự chạy được một MCP server local expose 2 tool, thấy được danh sách tool bằng MCP Inspector, và (nếu có client) chứng kiến model gọi tool của mình — tức trọn 5 bước của vòng tool call chạy trên máy mình.

## Kiến thức cần có

- Bài [Tool calling và MCP](/kien-thuc/tool-calling-va-mcp).
- Python ≥3.10 và quyền cài package.

## Trạng thái kiểm chứng

Lab bám sát quickstart chính thức của MCP (nguồn đầu trang, đối chiếu 2026-11-06). Các lệnh `uv` bên dưới **chưa được kiểm chứng end-to-end trên máy biên soạn** (cần cài uv + client MCP ngoài phiên build của website này) — hãy coi đây là hướng dẫn tham chiếu từ tài liệu gốc, không phải cam kết chạy-ngay-trúng.

## Các bước

### 1. Cài uv và khởi tạo project

```bash
# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
uv init weather && cd weather
uv add "mcp[cli]" httpx
```

### 2. Viết server hai tool

Tạo `src/weather/server.py` theo khuôn quickstart: khai báo FastMCP, hai tool `get_alerts` và `get_forecast` (nguồn dữ liệu: API mẫu NWS của quickstart, hoặc thay bằng hàm trả dữ liệu cố định cho khỏi phụ thuộc mạng):

```python
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")

@mcp.tool()
async def get_alerts(state: str) -> str:
    """Xem cảnh báo thời tiết theo mã bang MY (2 ký tự, ví dụ: CA, NY)."""
    samples = {"CA": "Gio cat cap nhat luc 07:00", "NY": "Bao tuyet cap do 1"}
    return samples.get(state.upper(), "Khong co canh bao.")

@mcp.tool()
async def get_forecast(latitude: float, longitude: float) -> str:
    """Du bao thoi tiet theo toa do (do, thap phan)."""
    return f"Du bao cho {latitude},{longitude}: nang, 31C"

if __name__ == "__main__":
    mcp.run(transport="stdio")
```

Chú ý chỗ docstring: đó chính là *mô tả tool* mà model đọc để quyết định khi nào gọi — bài học schema ở bài nền tảng áp dụng trực tiếp tại đây.

### 3. Kiểm tra cô lập bằng MCP Inspector

```bash
uv run mcp dev src/weather/server.py
```

Inspector mở UI local: bấm *List Tools*, gọi thử `get_alerts` với `CA`. Mọi vòng đời (connect, list, call) hiển thị rõ — đây là cách debug không cần model.

### 4. Gắn vào một client MCP

Thêm server vào client hỗ trợ MCP (Claude Desktop / coding agent CLI) qua cấu hình JSON của client, dạng khái quát:

```json
{
  "mcpServers": {
    "weather": {
      "command": "uv",
      "args": ["run", "src/weather/server.py"],
      "cwd": "/duong-dan-tuyet-doi-toi/weather"
    }
  }
}
```

Tên key và đường dẫn cấu hình cụ thể **phụ thuộc từng client** — làm theo docs của client bạn (quickstart ở nguồn có ví dụ cho Claude Desktop).

### 5. Gọi tool bằng ngôn ngữ tự nhiên

Hỏi client: "Cảnh báo thời tiết ở California?" — quan sát: client xin duyệt tool call → server chạy → kết quả vào ngữ cảnh → model trả lời. Bạn vừa mục sở thị bước 1→5 của vòng tool call.

## Cách kiểm chứng

- Bước 3 thành công = server hợp lệ (Inspector liệt kê đủ 2 tool, gọi ra kết quả).
- Bước 5 thành công = tích hợp client hoạt động. Ghi lại phiên bản client + server vào notes của bạn; nếu tài liệu quickstart đã đổi so với các bước trên, đó là bằng chứng bạn nên tin trang gốc hơn tin bản chép lại này.

## Lỗi thường gặp

- Client không thấy tool: sai `cwd`/đường dẫn `command` (client chạy bằng PATH của riêng nó — dùng đường dẫn tuyệt đối tới `uv`).
- Server crash im lặng: chạy bước 3 trước, đừng debug mù trong client.
- Tool không bao giờ được gọi: docstring mô tả mơ hồ — sửa mô tả trước khi nghi ngờ model.

## Bài tập về nhà

Thêm tool `compare_cities(city_a, city_b)` với tham số enum gọn; quan sát Inspector và cách model chọn tool khi hai tool có mô tả na ná nhau (sửa mô tả cho đến khi chọn đúng).

## Đọc tiếp

- [Harness và evals](/kien-thuc/harness-va-evals) — bước tiếp theo của lộ trình.
