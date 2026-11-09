import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ContentService } from './content';

/** Metadata SEO riêng từng trang (chạy cả lúc prerender trên server). */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private content = inject(ContentService);

  apply(title: string, description: string, path: string): void {
    const fullTitle = `${title} | habeo.dev`;
    const fullUrl = this.content.siteUrl() + path;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });

    // OpenGraph / Facebook
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: fullUrl });
    this.meta.updateTag({ property: 'og:site_name', content: 'habeo.dev' });

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = fullUrl;
  }
}
