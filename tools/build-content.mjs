#!/usr/bin/env node
// Pipeline nội dung: chạy TRƯỚC ng build.
// Đọc content/ -> validate -> render an toàn -> chỉ mục tìm kiếm
// -> xuất src/app/generated/content.generated.ts, routes.prerender.txt,
// public/sitemap.xml, public/robots.txt.
// Bất kỳ nội dung không hợp lệ nào làm fail với danh sách lỗi cụ thể (spec).
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseContentFile } from './lib/frontmatter.mjs';
import { validateContentItem, findDuplicateIds, containsUnsafeRawHtml } from './lib/validate.mjs';
import { renderMarkdown } from './lib/render.mjs';
import { buildSearchDoc } from './lib/search.mjs';
import { validateInternalLinks, validatePathSteps } from './lib/links.mjs';
import { generateSitemap, generateRobots } from './lib/sitemap.mjs';
import { SITE_URL } from './site-config.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];

function loadDir(sub, expectType) {
  const dir = join(ROOT, 'content', sub);
  const files = readdirSync(dir).filter((f) => f.endsWith('.md')).sort();
  return files.map((f) => {
    const file = `content/${sub}/${f}`;
    let data, body;
    try {
      ({ data, body } = parseContentFile(readFileSync(join(dir, f), 'utf8'), file));
    } catch (e) {
      errors.push(e.message);
      return null;
    }
    if (data.type && data.type !== expectType) {
      errors.push(`${file}: type "${data.type}" đặt sai thư mục (mong "${expectType}")`);
    }
    data = { ...data, type: expectType };
    errors.push(...validateContentItem(data, file));
    if (containsUnsafeRawHtml(body)) {
      errors.push(`${file}: nguồn Markdown chứa HTML/script nguy hiểm ngoài code fence`);
    }
    return { ...data, _file: file, body };
  }).filter(Boolean);
}

const articles = loadDir('articles', 'article');
const labs = loadDir('labs', 'lab');
const paths = loadDir('paths', 'path');

errors.push(...findDuplicateIds([...articles, ...labs, ...paths]));

// Render + phân loại route
const items = [];
for (const group of [
  { list: articles, base: '/kien-thuc' },
  { list: labs, base: '/thuc-hanh' },
  { list: paths, base: '/lo-trinh' },
]) {
  for (const it of group.list) {
    const { html, toc } = await renderMarkdown(it.body);
    const path = `${group.base}/${it.slug}`;
    items.push({ ...it, html, toc, path });
  }
}

// terms
const termsRaw = JSON.parse(readFileSync(join(ROOT, 'content/terms.json'), 'utf8'));
if (!Array.isArray(termsRaw.terms)) errors.push('content/terms.json: thiếu mảng "terms"');

// Liên kết nội bộ
const knownRoutes = new Set([
  '/', '/lo-trinh', '/kien-thuc', '/thuc-hanh', '/gioi-thieu', '/404',
  ...items.map((i) => i.path),
]);
for (const it of items) {
  errors.push(...validateInternalLinks({ file: it._file, body: it.body }, knownRoutes));
}
const allIds = new Set([...articles, ...labs].map((i) => i.id));
for (const p of items.filter((i) => i.type === 'path')) {
  errors.push(...validatePathSteps(p, allIds, p._file));
}
// prerequisite phải trỏ id thật
for (const it of items) {
  for (const pre of it.prerequisites ?? []) {
    if (!allIds.has(pre)) {
      errors.push(`${it._file}: prerequisite "${pre}" không khớp id bài/lab nào`);
    }
  }
}

if (errors.length > 0) {
  console.error(`build-content: ${errors.length} lỗi:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

// Chỉ mục tìm kiếm (tokens là mảng để serialize được)
const searchDocs = items
  .filter((i) => i.type !== 'path')
  .map((i) => {
    const d = buildSearchDoc(i);
    return { ...d, tokens: [...d.tokens] };
  });

const TOPIC_LABELS = {
  'model-va-ngu-canh': 'Model và ngữ cảnh',
  'an-toan-du-lieu': 'An toàn dữ liệu',
  'quy-trinh-ai-coding': 'Quy trình AI coding',
  'project-instructions-va-skills': 'Project instructions & skills',
  'tool-calling-va-mcp': 'Tool calling & MCP',
  'harness-va-evals': 'Harness & evals',
};

function toPublicItem(it) {
  const copy = { ...it };
  delete copy.body;
  delete copy._file;
  return copy;
}
const publicItems = items.map(toPublicItem);

const outDir = join(ROOT, 'src/app/generated');
mkdirSync(outDir, { recursive: true });
const banner = `// SINH TỰ ĐỘNG từ content/ bởi tools/build-content.mjs — không sửa tay.\n// Chạy lại: node tools/build-content.mjs\n`;
writeFileSync(
  join(outDir, 'content.generated.ts'),
  `${banner}
/* eslint-disable */
export interface TocEntry { level: number; text: string; id: string }
export interface ContentItem {
  id: string; slug: string; title: string; description: string;
  type: 'article' | 'lab' | 'path'; topic: string; level: string;
  prerequisites?: string[]; steps?: string[];
  sources: { title: string; url: string }[];
  updated: string; verified: boolean; validation?: Record<string, string>;
  html: string; toc: TocEntry[]; path: string;
}
export interface SearchDoc {
  id: string; slug: string; type: string; title: string; topic: string;
  level: string; path: string; description: string; tokens: string[];
}
export interface Term { term: string; definition: string; topic: string }

export const SITE_URL = ${JSON.stringify(SITE_URL)};
export const TOPIC_LABELS = ${JSON.stringify(TOPIC_LABELS)} as const;
export const CONTENT: ContentItem[] = ${JSON.stringify(publicItems, null, 1)};
export const TERMS: Term[] = ${JSON.stringify(termsRaw.terms, null, 1)};
export const SEARCH_DOCS: SearchDoc[] = ${JSON.stringify(searchDocs, null, 1)};
`,
);

const prerenderRoutes = [...knownRoutes].filter((r) => r !== '/404');
writeFileSync(join(ROOT, 'routes.prerender.txt'), prerenderRoutes.join('\n') + '\n');
writeFileSync(join(ROOT, 'public/sitemap.xml'), generateSitemap(prerenderRoutes, SITE_URL));
writeFileSync(join(ROOT, 'public/robots.txt'), generateRobots(SITE_URL));

console.log(
  `build-content: OK — ${articles.length} bài, ${labs.length} lab, ${paths.length} lộ trình, ` +
  `${termsRaw.terms.length} thuật ngữ, ${prerenderRoutes.length} route prerender. Site URL: ${SITE_URL}`,
);
