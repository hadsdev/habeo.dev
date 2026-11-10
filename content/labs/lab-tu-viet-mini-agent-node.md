---
id: lab-tu-viet-mini-agent-node
slug: lab-tu-viet-mini-agent-node
title: "Lab: Tự viết một Mini Coding Agent bằng Node.js dưới 100 dòng code"
description: "Thực hành bóc tách 'phép màu' của các AI coding tools: tự dựng vòng lặp agent loop, xử lý native tool call và chạy lệnh shell an toàn."
type: lab
topic: harness-va-evals
level: trung-cap
prerequisites:
  - tool-calling-va-mcp
sources:
  - title: "OpenAI Function Calling Guide"
    url: "https://platform.openai.com/docs/guides/function-calling"
  - title: "Model Context Protocol Specifications"
    url: "https://modelcontextprotocol.io"
updated: "2026-11-09"
verified: true
---

## Mục tiêu

Sau bài lab này bạn sẽ:
- Tự tay lập trình một **Agent Loop** (vòng lặp điều phối model ↔ tools).
- Hiểu cách truyền function definition (Tool Schema) cho model dạng JSON Schema.
- Bắt sự kiện `tool_calls` trả về từ model, thực thi hàm thật bằng Node.js và nạp lại kết quả vào hội thoại.
- Hiểu vì sao Agent có thể tự đọc file, sửa code và chạy lệnh terminal.

## Chuẩn bị môi trường

- Máy đã cài **Node.js v20+** hoặc **Node.js v22+**.
- Một API key OpenAI-compatible (hoặc Ollama / local proxy).

Tạo thư mục lab và khởi tạo package:

```bash
mkdir mini-agent && cd mini-agent
npm init -y
npm install openai
```

Thêm `"type": "module"` vào file `package.json`.

## Các bước thực hiện

### Bước 1: Khai báo công cụ (Tools Definition)

Tạo file `agent.js`. Khai báo 2 công cụ đơn giản: `read_file` và `run_command`:

```javascript
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

// Định nghĩa công cụ theo chuẩn OpenAI Function Calling
const tools = [
  {
    type: 'function',
    function: {
      name: 'read_file',
      description: 'Đọc nội dung một file văn bản từ ổ đĩa',
      parameters: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Đường dẫn file cần đọc' },
        },
        required: ['path'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_command',
      description: 'Chạy một lệnh shell trên hệ điều hành và trả về kết quả',
      parameters: {
        type: 'object',
        properties: {
          command: { type: 'string', description: 'Lệnh shell cần thực thi' },
        },
        required: ['command'],
      },
    },
  },
];
```

### Bước 2: Hàm thực thi công cụ cục bộ (Local Tool Dispatcher)

```javascript
function executeTool(name, args) {
  try {
    if (name === 'read_file') {
      return readFileSync(args.path, 'utf8');
    }
    if (name === 'run_command') {
      return execSync(args.command, { encoding: 'utf8', timeout: 10000 });
    }
    return `Lỗi: Không tìm thấy công cụ ${name}`;
  } catch (err) {
    return `Thực thi lỗi: ${err.message}`;
  }
}
```

### Bước 3: Vòng lặp Agent (The Autonomous Loop)

Đây chính là trái tim của mọi Coding Agent:

```javascript
async function runAgent(userPrompt, maxTurns = 10) {
  const messages = [
    { role: 'system', content: 'Bạn là một trợ lý lập trình. Dùng các công cụ được cấp để giải quyết yêu cầu.' },
    { role: 'user', content: userPrompt },
  ];

  for (let turn = 1; turn <= maxTurns; turn++) {
    console.log(`\n--- Vòng lặp ${turn} ---`);
    
    // 1. Gửi lịch sử hội thoại + danh sách công cụ lên Model
    const response = await client.chat.completions.create({
      model: process.env.MODEL_NAME || 'gpt-4o-mini',
      messages,
      tools,
    });

    const choice = response.choices[0];
    const message = choice.message;
    messages.push(message);

    // 2. Nếu model không yêu cầu gọi tool nữa -> Xong việc!
    if (!message.tool_calls || message.tool_calls.length === 0) {
      console.log('\n[Kết quả cuối cùng]:', message.content);
      break;
    }

    // 3. Nếu model muốn gọi tool -> Thực thi từng tool và nạp lại kết quả
    for (const toolCall of message.tool_calls) {
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);
      console.log(`[Thực thi Tool]: ${toolName}(${JSON.stringify(toolArgs)})`);

      const result = executeTool(toolName, toolArgs);

      // Đẩy kết quả thực tế vào lịch sử với role 'tool'
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: String(result),
      });
    }
  }
}

// Chạy thử với tác vụ thực tế
runAgent('Kiểm tra phiên bản Node và git trên máy hiện tại, sau đó cho tôi biết.');
```

## Cách kiểm chứng

Chạy thử script bằng lệnh:

```bash
export OPENAI_API_KEY="sk-..."
node agent.js
```

Quan sát log màn hình:
1. Bạn sẽ thấy ở Vòng 1: Model quyết định gọi `run_command({ command: 'node -v && git --version' })`.
2. Node.js chạy lệnh đó thật trên máy của bạn và lấy output.
3. Ở Vòng 2: Model nhận lại chuỗi version và tổng hợp câu trả lời tự nhiên cho bạn.

## Lỗi thường gặp & Bài học bảo mật

1. **Rủi ro Command Injection**: Trong ví dụ trên, `run_command` dùng `execSync`. Trong môi trường thực tế, nếu model bị prompt injection (ví dụ đọc một file có chứa mã độc bảo xóa ổ đĩa), nó có thể gọi `rm -rf /`. Đây là lý do các agent chuyên nghiệp cần cơ chế **Human-in-the-loop** (Hỏi người dùng bấm đồng ý trước khi chạy lệnh nguy hiểm) hoặc chạy trong **Docker Sandbox**.
2. **Infinite Loop**: Nếu model gọi sai tham số và tool trả về lỗi liên tục, model có thể thử lại mãi mãi làm cháy quota API. Vì vậy tham số `maxTurns` là bắt buộc phải có.

## Đọc tiếp

- [Harness và evals: đo chất lượng hệ AI như một kỹ sư](/kien-thuc/harness-va-evals)
- [Mô hình SDD: Phát triển phần mềm bằng AI theo đặc tả](/kien-thuc/mo-hinh-sdd-trien-khai-du-an)
