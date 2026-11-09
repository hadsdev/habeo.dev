import { Injectable } from '@angular/core';

export interface SearchDocLike {
  id: string;
  slug: string;
  type: string;
  title: string;
  topic: string;
  level: string;
  path: string;
  description: string;
  tokens: string[];
}

/** "Hướng dẫn" -> "huong dan" — khớp thuật toán tools/lib/search.mjs (nguồn chân lý build-time). */
export function normalizeVi(input: string): string {
  return String(input ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tìm kiếm trên chỉ mục đã sinh sẵn (SEARCH_DOCS).
 * Logic phản chiếu tools/lib/search.mjs: AND token, prefix match, lọc topic,
 * query rỗng trả tất cả, không khớp trả mảng rỗng.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  normalize(input: string): string {
    return normalizeVi(input);
  }

  search(docs: SearchDocLike[], query: string, filters: { topic?: string } = {}): SearchDocLike[] {
    let result = Array.isArray(docs) ? docs : [];
    if (filters?.topic) {
      result = result.filter((d) => d.topic === filters.topic);
    }
    const qTokens = normalizeVi(query).split(' ').filter(Boolean);
    if (qTokens.length === 0) return result;
    return result.filter((d) =>
      qTokens.every((q) => {
        const tokens = Array.isArray(d.tokens) ? d.tokens : [];
        return tokens.some((t) => t === q || t.startsWith(q));
      }),
    );
  }
}
