# habeo.dev — Hiểu AI. Dùng đúng. Xây được.

Nền tảng học và tra cứu kiến thức AI coding thực chiến bằng tiếng Việt dành cho lập trình viên. Miễn phí, không tài khoản, tập trung vào thực hành có kiểm chứng.

## Lộ trình học chính
1. **Model và ngữ cảnh**: Cửa sổ ngữ cảnh, token, cutoff date.
2. **An toàn dữ liệu**: Phân loại dữ liệu trước khi gửi cho model.
3. **Quy trình AI coding**: Đặc tả → spec → kế hoạch → TDD → verify.
4. **Project instructions & Skills**: Cấu trúc AGENTS.md / CLAUDE.md và đóng gói quy trình tái sử dụng.
5. **Tool calling & MCP**: Kết nối model với thế giới bên ngoài an toàn.
6. **Agent harness & Evals**: Đo lường và kiểm soát agent trong thực tế.

## Kỹ thuật
- **Framework**: Angular 22 standalone + SSR/Prerender (SSG).
- **Styling**: Tối giản, hỗ trợ Dark / Light mode tự động hoặc theo lựa chọn người dùng.
- **Content pipeline**: Markdown + frontmatter validation + syntax highlighting (`highlight.js`) + DOMPurify sanitize.
- **Search**: Tìm kiếm toàn văn local hỗ trợ tiếng Việt có dấu và không dấu.

## Phát triển tại local

```bash
# Cài đặt dependency
npm install

# Build static content và chạy server phát triển
npm start
```

Mở trình duyệt tại `http://localhost:4200/`.

## Build production

```bash
npm run build
```

Toàn bộ 14 routes sẽ được prerender thành các file HTML tĩnh tại thư mục `dist/habeo/browser`.

## Kiểm thử

```bash
# Unit test pipeline xử lý nội dung
npm run test:tools # hoặc npx vitest run --dir tools

# Unit test Angular services
npm test -- --watch=false

# E2E smoke tests (Playwright)
npx playwright test
```

