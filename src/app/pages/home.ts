import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService } from '../services/content';
import { ProgressService } from '../services/progress';
import { SeoService } from '../services/seo';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Hiểu AI. Dùng đúng. Xây được.</h1>
      <p>
        Kiến thức và thực hành AI coding miễn phí bằng tiếng Việt, dành cho người
        đã biết lập trình. Mỗi bài có nguồn trích dẫn và trạng thái kiểm chứng rõ
        ràng.
      </p>
      <div class="cta">
        <a class="btn primary" routerLink="/lo-trinh">Bắt đầu học</a>
        <a class="btn" routerLink="/kien-thuc">Tra cứu kiến thức</a>
      </div>
    </section>

    <section aria-labelledby="newest">
      <h2 id="newest">Mới cập nhật</h2>
      <ul class="card-list">
        @for (item of latest(); track item.id) {
          <li>
            <a [routerLink]="item.path">
              <strong>{{ item.title }}</strong>
              <p>{{ item.description }}</p>
            </a>
            <span class="meta">
              {{ item.type === 'lab' ? 'Thực hành' : 'Bài học' }} ·
              {{ item.updated }}
              @if (progress.isDone(item.id)) {
                <em class="done">· đã hoàn thành ✓</em>
              }
            </span>
          </li>
        }
      </ul>
    </section>

    <section aria-labelledby="path-sec">
      <h2 id="path-sec">Lộ trình nền tảng</h2>
      @for (p of mainPath(); track p.id) {
        <p>
          <a [routerLink]="p.path">{{ p.title }}</a> —
          {{ stepsCount() }} bài và buổi lab, đi từ model và ngữ cảnh tới harness
          và evals.
        </p>
      }
    </section>
  `,
  styles: [
    `
      .hero h1 { font-size: 34px; margin-bottom: 8px; }
      .hero p { max-width: 620px; color: var(--text-soft); font-size: 17px; }
      .cta { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
      .btn {
        display: inline-block; padding: 10px 18px; border-radius: 8px;
        border: 1px solid var(--border); color: var(--text); background: var(--bg-soft);
      }
      .btn.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
      .btn:hover { text-decoration: none; opacity: 0.92; }
      .card-list { list-style: none; padding: 0; display: grid; gap: 12px; }
      .card-list li {
        border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px;
        background: var(--bg-soft);
      }
      .card-list a { color: var(--text); display: block; }
      .card-list a:hover { text-decoration: none; }
      .card-list a:hover strong { color: var(--accent); }
      .card-list p { margin: 6px 0 4px; color: var(--text-soft); font-size: 14px; }
      .meta { font-size: 13px; color: var(--text-soft); }
      .done { color: var(--ok); font-style: normal; }
      section { margin-top: 40px; }
    `,
  ],
})
export class HomePage {
  private content = inject(ContentService);
  protected progress = inject(ProgressService);

  protected latest = computed(() =>
    [...this.content.all()]
      .sort((a, b) => (a.updated < b.updated ? 1 : -1))
      .slice(0, 4),
  );
  protected mainPath = computed(() => this.content.paths());
  protected stepsCount = computed(() => this.mainPath()[0]?.steps?.length ?? 0);

  constructor() {
    inject(SeoService).apply(
      'Hiểu AI. Dùng đúng. Xây được',
      'Kiến thức và thực hành AI coding miễn phí bằng tiếng Việt: model và ngữ cảnh, an toàn dữ liệu, quy trình, MCP, harness và evals.',
      '/',
    );
  }
}
