import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ContentService, TOPIC_LABELS_MAP } from '../services/content';
import { ProgressService } from '../services/progress';
import { SeoService } from '../services/seo';

@Component({
  selector: 'app-path-list',
  imports: [RouterLink],
  template: `
    <h1>Lộ trình</h1>
    <p class="lead">
      Thứ tự học gợi ý, có yêu cầu đầu vào và mục tiêu kiểm chứng được. Đây là
      khung dài hạn — chỉ các bài đã xuất bản mới hiện trong danh sách.
    </p>

    @for (p of paths(); track p.id) {
      <article class="path-card">
        <h2><a [routerLink]="p.path">{{ p.title }}</a></h2>
        <p>{{ p.description }}</p>

        @if (p.steps?.length) {
          <ol class="steps">
            @for (sid of p.steps; track sid) {
              @if (byId(sid); as step) {
                <li>
                  <a [routerLink]="step.path">{{ step.title }}</a>
                  <span class="meta">
                    {{ TOPIC_LABELS_MAP[step.topic] ?? step.topic }}
                    @if (progress.isDone(step.id)) { <em class="done">· đã hoàn thành ✓</em> }
                  </span>
                </li>
              } @else {
                <li class="planned">{{ sid }} <span class="meta">(chưa xuất bản)</span></li>
              }
            }
          </ol>
        }
        <p class="meta">{{ doneInPath(p.steps) }}/{{ totalSteps(p) }} bước đã hoàn thành theo đánh dấu của bạn.</p>
      </article>
    }

    <h2>Tiếp theo (đang biên soạn)</h2>
    <ul class="roadmap">
      @for (r of roadmap; track r) {
        <li>{{ r }}</li>
      }
    </ul>
  `,
  styles: [
    `
      .lead { color: var(--text-soft); max-width: 640px; }
      .path-card { border: 1px solid var(--border); border-radius: 12px; padding: 20px 24px; margin-top: 20px; background: var(--bg-soft); }
      .steps { padding-left: 20px; }
      .steps li { margin: 6px 0; }
      .planned { color: var(--text-soft); }
      .meta { font-size: 13px; color: var(--text-soft); }
      .done { color: var(--ok); font-style: normal; }
      .roadmap { color: var(--text-soft); }
      .roadmap li { margin: 4px 0; }
    `,
  ],
})
export class PathListPage {
  private content = inject(ContentService);
  protected progress = inject(ProgressService);
  protected TOPIC_LABELS_MAP = TOPIC_LABELS_MAP;

  protected paths = computed(() => this.content.paths());
  protected byId = (id: string) => this.content.byId(id);
  protected totalSteps = (p: { steps?: string[] }) => p.steps?.length ?? 0;
  protected doneInPath = (steps?: string[]) =>
    (steps ?? []).filter((s) => this.progress.isDone(s)).length;

  protected roadmap = [
    'Sandbox và cô lập môi trường chạy code do AI sinh',
    'Chi phí vận hành model và chiến lược chọn model theo việc',
    'Đánh giá agent nhiều bước: evals theo task, không chỉ theo câu trả lời',
    'Vận hành dài hạn: theo dõi, hồi quy khi model thay đổi phiên bản',
  ];

  constructor() {
    inject(SeoService).apply(
      'Lộ trình',
      'Lộ trình nền tảng AI coding bằng tiếng Việt: model và ngữ cảnh, an toàn dữ liệu, quy trình, instructions và skills, tool calling và MCP, harness và evals.',
      '/lo-trinh',
    );
  }
}
