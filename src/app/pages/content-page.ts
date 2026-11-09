import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { ContentService, type ContentItem } from '../services/content';
import { ProgressService } from '../services/progress';
import { SeoService } from '../services/seo';

@Component({
  selector: 'app-content-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './content-page.html',
  styleUrl: './content-page.css',
})
export class ContentPage {
  private content = inject(ContentService);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private host = inject(ElementRef);
  private seo = inject(SeoService);
  protected progress = inject(ProgressService);

  /** Route param `slug` bind vào input nhờ withComponentInputBinding. */
  slug = input<string>('');

  protected item = computed(() => this.content.bySlug(this.slug()));
  /** HTML đã được DOMPurify làm sạch lúc build (pipeline nội dung). */
  protected safeHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.item()?.html ?? ''),
  );

  private order = computed(() => {
    const path = this.content.paths()[0];
    const stepItems = (path?.steps ?? [])
      .map((id) => this.content.byId(id))
      .filter((i): i is ContentItem => !!i);
    return stepItems.length > 0 ? stepItems : this.content.all();
  });
  protected prev = computed(() => {
    const idx = this.order().findIndex((i) => i.id === this.item()?.id);
    return idx > 0 ? this.order()[idx - 1] : undefined;
  });
  protected next = computed(() => {
    const idx = this.order().findIndex((i) => i.id === this.item()?.id);
    return idx >= 0 && idx < this.order().length - 1 ? this.order()[idx + 1] : undefined;
  });

  constructor() {
    const decorate = () => this.decorateCodeBlocks();
    effect(() => {
      const it = this.item();
      if (it) this.seo.apply(it.title, it.description, it.path);
    });
    if (isPlatformBrowser(this.platformId)) {
      // đăng ký hook ở đây (constructor = injection context), không đăng ký trong effect
      afterNextRender({ write: decorate });
      effect(() => {
        if (!this.item()) return;
        // slug đổi khi component được tái sử dụng -> decorate lại sau khi DOM cập nhật
        setTimeout(decorate, 0);
      });
    }
  }

  protected listHref(type: ContentItem['type']): string {
    return type === 'lab' ? '/thuc-hanh' : type === 'path' ? '/lo-trinh' : '/kien-thuc';
  }
  protected listLabel(type: ContentItem['type']): string {
    return type === 'lab' ? 'Thực hành' : type === 'path' ? 'Lộ trình' : 'Kiến thức';
  }

  private decorateCodeBlocks(): void {
    const root: HTMLElement = this.host.nativeElement;
    for (const pre of root.querySelectorAll('div.prose pre')) {
      if (pre.querySelector(':scope > .copy-btn')) continue;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'Sao chép';
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.textContent ?? pre.textContent ?? '';
        let ok = false;
        try {
          await navigator.clipboard.writeText(code);
          ok = true;
        } catch {
          try {
            const ta = document.createElement('textarea');
            ta.value = code;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            ok = document.execCommand('copy');
            ta.remove();
          } catch {
            ok = false;
          }
        }
        btn.textContent = ok ? 'Đã sao chép ✓' : 'Không sao chép được';
        btn.classList.toggle('ok', ok);
        btn.classList.toggle('err', !ok);
        setTimeout(() => {
          btn.textContent = 'Sao chép';
          btn.classList.remove('ok', 'err');
        }, 2000);
      });
      pre.appendChild(btn);
    }
  }
}
