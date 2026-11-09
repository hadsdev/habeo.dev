import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="nf">
      <h1>404 — Không tìm thấy trang</h1>
      <p>Đường dẫn này không khớp trang nào. Có thể bài chưa xuất bản hoặc link sai.</p>
      <p>
        <a routerLink="/">Về trang chủ</a> ·
        <a routerLink="/kien-thuc">Thư viện kiến thức</a> ·
        <a routerLink="/lo-trinh">Lộ trình</a>
      </p>
    </div>
  `,
  styles: [
    `
      .nf { padding: 48px 0; text-align: center; color: var(--text-soft); }
      h1 { color: var(--text); }
    `,
  ],
})
export class NotFoundPage {
  constructor() {
    inject(SeoService).apply('Không tìm thấy trang', 'Trang bạn tìm không tồn tại trên habeo.dev.', '/404');
  }
}
