import { Component, inject } from '@angular/core';
import { SeoService } from '../services/seo';

@Component({
  selector: 'app-about',
  template: `
    <h1>Giới thiệu</h1>
    <p class="lead">
      habeo.dev là website cá nhân, chia sẻ kiến thức và bài thực hành về AI coding
      bằng tiếng Việt — miễn phí, không thu phí, không yêu cầu tài khoản.
    </p>

    <h2>Định hướng</h2>
    <p>
      Website bắt đầu từ nền tảng AI coding (model và ngữ cảnh, an toàn dữ liệu,
      quy trình làm việc), sau đó mở rộng sang project instructions, skills, tool
      calling, MCP, harness và evals. Nội dung hướng tới người đã biết lập trình —
      không dạy lại lập trình cơ bản.
    </p>

    <h2>Nguyên tắc biên soạn</h2>
    <ul>
      <li>Mỗi bài dẫn nguồn tài liệu chính thức kèm ngày cập nhật.</li>
      <li>
        Trạng thái kiểm chứng ghi trung thực: nội dung chỉ tổng hợp từ tài liệu
        được đánh dấu <em>chưa kiểm chứng</em>; hướng dẫn chạy thử thật mới ghi
        <em>đã kiểm thử</em> kèm môi trường và kết quả.
      </li>
      <li>Tách kiến thức chung khỏi hướng dẫn từng công cụ để giảm lỗi thời.</li>
      <li>Chỉ tổng hợp có dẫn nguồn, không sao chép nguyên văn tài liệu bên thứ ba.</li>
      <li>Không dùng nội dung trống hoặc trích dẫn bịa để lấp danh mục.</li>
    </ul>

    <h2>Tác giả và liên hệ</h2>
    <p>
      Website do một lập trình viên tại Việt Nam vận hành (bút danh habeo).
    </p>
    <ul>
      <li>GitHub: <a href="https://github.com/sonhadev" target="_blank" rel="noopener noreferrer">github.com/sonhadev</a></li>
      <li>Mọi góp ý, phản hồi về nội dung hoặc đề xuất chủ đề mới đều được hoan nghênh.</li>
    </ul>

    <h2>Tên miền và hosting</h2>
    <p>
      Tên habeo.dev là tên thương hiệu đang dùng cho bản phát triển cục bộ; chưa
      xác nhận quyền sở hữu tên miền, chưa mua tên miền hay chọn nhà cung cấp
      hosting. Trang bạn đang xem là bản build tĩnh chạy local.
    </p>
  `,
  styles: [
    `
      .lead { font-size: 17px; color: var(--text-soft); max-width: 640px; }
      h2 { margin-top: 32px; }
      ul li { margin-bottom: 6px; }
    `,
  ],
})
export class AboutPage {
  constructor() {
    inject(SeoService).apply(
      'Giới thiệu',
      'Định hướng và nguyên tắc biên soạn nội dung của habeo.dev — kiến thức AI coding tiếng Việt, miễn phí, có dẫn nguồn.',
      '/gioi-thieu',
    );
  }
}
