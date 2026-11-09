import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContentService, TOPIC_LABELS_MAP } from '../services/content';
import { SearchService } from '../services/search';
import { ProgressService } from '../services/progress';
import { SeoService } from '../services/seo';

@Component({
  selector: 'app-library',
  imports: [FormsModule, RouterLink],
  template: `
    <h1>Kiến thức</h1>
    <p class="lead">Toàn bộ bài học đã xuất bản. Tìm theo từ khoá (có dấu hay không dấu đều được) hoặc lọc theo chủ đề.</p>

    <div class="toolbar">
      <input
        type="search"
        class="search-input"
        placeholder="Tìm bài viết… ví dụ: ngữ cảnh, mcp, eval"
        aria-label="Tìm kiếm bài viết"
        [ngModel]="query()"
        (ngModelChange)="query.set($event)"
      />
      <label class="filter">
        <span class="visually-hidden">Lọc theo chủ đề</span>
        <select [ngModel]="topic()" (ngModelChange)="topic.set($event)" aria-label="Lọc theo chủ đề">
          <option value="">Tất cả chủ đề</option>
          @for (t of topics; track t.value) {
            <option [value]="t.value">{{ t.label }}</option>
          }
        </select>
      </label>
    </div>

    @if (results().length > 0) {
      <p class="count" role="status">{{ results().length }} kết quả</p>
      <ul class="results">
        @for (r of results(); track r.id) {
          <li>
            <a [routerLink]="r.path"><strong>{{ r.title }}</strong></a>
            <p>{{ r.description }}</p>
            <span class="meta">
              {{ r.type === 'lab' ? 'Thực hành' : 'Bài học' }} ·
              {{ topicLabel(r.topic) }}
              @if (progress.isDone(r.id)) { <em class="done">· đã hoàn thành ✓</em> }
            </span>
          </li>
        }
      </ul>
    } @else {
      <p class="empty" role="status">
        Không tìm thấy bài nào khớp. Thử từ khoá ngắn hơn, bỏ dấu, hoặc chọn lại
        chủ đề.
      </p>
    }

    <section aria-labelledby="terms">
      <h2 id="terms">Thuật ngữ thường gặp</h2>
      <dl class="terms">
        @for (t of terms(); track t.term) {
          <div class="term">
            <dt>{{ t.term }}</dt>
            <dd>{{ t.definition }}</dd>
          </div>
        }
      </dl>
    </section>
  `,
  styles: [
    `
      .lead { color: var(--text-soft); max-width: 640px; }
      .toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin: 20px 0 8px; }
      .search-input {
        flex: 1 1 260px; padding: 10px 14px; font-size: 16px;
        border: 1px solid var(--border); border-radius: 8px;
        background: var(--bg); color: var(--text);
      }
      select {
        padding: 10px 12px; border: 1px solid var(--border); border-radius: 8px;
        background: var(--bg); color: var(--text); font-size: 15px;
      }
      .count { font-size: 13px; color: var(--text-soft); }
      .results { list-style: none; padding: 0; display: grid; gap: 12px; }
      .results li { border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; background: var(--bg-soft); }
      .results p { margin: 6px 0 4px; color: var(--text-soft); font-size: 14px; }
      .meta { font-size: 13px; color: var(--text-soft); }
      .done { color: var(--ok); font-style: normal; }
      .empty {
        border: 1px dashed var(--border); border-radius: 10px; padding: 24px;
        text-align: center; color: var(--text-soft);
      }
      .terms { display: grid; gap: 10px; margin-top: 12px; }
      .term { border-left: 3px solid var(--accent); padding: 4px 14px; background: var(--bg-soft); border-radius: 0 8px 8px 0; }
      dt { font-weight: 600; }
      dd { margin: 2px 0 6px; color: var(--text-soft); font-size: 14px; }
      section { margin-top: 44px; }
    `,
  ],
})
export class LibraryPage {
  private content = inject(ContentService);
  private searchSvc = inject(SearchService);
  protected progress = inject(ProgressService);

  protected query = signal('');
  protected topic = signal('');
  protected topics = this.content.topicsOf('article');
  protected topicLabel = (t: string) => TOPIC_LABELS_MAP[t] ?? t;

  protected results = computed(() =>
    this.searchSvc.search(this.content.searchDocs(), this.query(), {
      topic: this.topic() || undefined,
    }),
  );
  protected terms = computed(() => this.content.terms());

  constructor() {
    inject(SeoService).apply(
      'Kiến thức',
      'Thư viện bài học AI coding tiếng Việt: model và ngữ cảnh, an toàn dữ liệu, quy trình, instructions, MCP, harness, evals — kèm tra cứu thuật ngữ.',
      '/kien-thuc',
    );
  }
}
