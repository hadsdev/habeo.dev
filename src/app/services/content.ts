import { Injectable } from '@angular/core';
import {
  CONTENT, SEARCH_DOCS, TERMS, TOPIC_LABELS, SITE_URL,
  type ContentItem, type SearchDoc, type Term,
} from '../generated/content.generated';

export type { ContentItem, SearchDoc, Term };
export const TOPIC_LABELS_MAP: Record<string, string> = TOPIC_LABELS as Record<string, string>;

/** Truy cập nội dung đã sinh lúc build (không fetch runtime). */
@Injectable({ providedIn: 'root' })
export class ContentService {
  all(): ContentItem[] {
    return CONTENT;
  }
  articles(): ContentItem[] {
    return CONTENT.filter((i) => i.type === 'article');
  }
  labs(): ContentItem[] {
    return CONTENT.filter((i) => i.type === 'lab');
  }
  paths(): ContentItem[] {
    return CONTENT.filter((i) => i.type === 'path');
  }
  bySlug(slug: string | undefined | null): ContentItem | undefined {
    return slug ? CONTENT.find((i) => i.slug === slug) : undefined;
  }
  byId(id: string): ContentItem | undefined {
    return CONTENT.find((i) => i.id === id);
  }
  searchDocs(): SearchDoc[] {
    return SEARCH_DOCS;
  }
  terms(): Term[] {
    return TERMS;
  }
  topicsOf(type: 'article' | 'lab'): { value: string; label: string }[] {
    const seen = new Set<string>();
    for (const i of CONTENT) if (i.type === type) seen.add(i.topic);
    return [...seen].map((t) => ({ value: t, label: TOPIC_LABELS_MAP[t] ?? t }));
  }
  siteUrl(): string {
    return SITE_URL;
  }
}
