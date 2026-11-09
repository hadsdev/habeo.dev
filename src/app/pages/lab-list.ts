import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../services/content';
import { ProgressService } from '../services/progress';
import { SeoService } from '../services/seo';

@Component({
  selector: 'app-lab-list',
  imports: [RouterLink],
  template: `
    <h1>Thực hành</h1>
    <p class="lead">
      Các buổi lab tự làm theo bước. Lab nào phụ thuộc dịch vụ bên ngoài (API key,
      tài khoản provider) đều được dán nhãn trung thực về mức đã kiểm chứng.
    </p>
    <ul class="labs">
      @for (lab of labs(); track lab.id) {
        <li>
          <a [routerLink]="lab.path"><strong>{{ lab.title }}</strong></a>
          <p>{{ lab.description }}</p>
          <span class="meta">
            {{ lab.verified ? 'Đã kiểm thử' : 'Chưa kiểm chứng end-to-end' }}
            @if (progress.isDone(lab.id)) { <em class="done">· đã hoàn thành ✓</em> }
          </span>
        </li>
      }
    </ul>
  `,
  styles: [
    `
      .lead { color: var(--text-soft); max-width: 640px; }
      .labs { list-style: none; padding: 0; display: grid; gap: 12px; margin-top: 20px; }
      .labs li { border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; background: var(--bg-soft); }
      .labs a { color: var(--text); }
      .labs a:hover { text-decoration: none; color: var(--accent); }
      .labs p { margin: 6px 0 4px; color: var(--text-soft); font-size: 14px; }
      .meta { font-size: 13px; color: var(--text-soft); }
      .done { color: var(--ok); font-style: normal; }
    `,
  ],
})
export class LabListPage {
  private content = inject(ContentService);
  protected progress = inject(ProgressService);
  protected labs = computed(() => this.content.labs());

  constructor() {
    inject(SeoService).apply(
      'Thực hành',
      'Bài lab AI coding từng bước bằng tiếng Việt: viết project instructions, chạy MCP server local.',
      '/thuc-hanh',
    );
  }
}
