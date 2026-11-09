// Render Markdown -> HTML an toàn cho prerender.
// - heading có id (TOC + deep-link), slug tiếng Việt không dấu, "&" đọc là "va"
// - code block: highlight.js_sync, class đúng "language-<lang>" để copy + CSS
// - DOMPurify (jsdom) chặn script/on*/javascript: kể cả khi validator cho lọt
// - link ngoài: target=_blank rel=noopener noreferrer; link trong: giữ nguyên href
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { normalizeVi } from './search.mjs';

const domWindow = new JSDOM('<!doctype html><html><body></body></html>').window;
const purify = DOMPurify(domWindow);
purify.addHook('afterSanitizeAttributes', (node) => {
  // link mở tab mới không được để lộ opener
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

const SYMBOL_WORDS = [
  [/&/g, ' va '],
  [/\+/g, ' cong '],
  [/:/g, ' '],
  [/["'“”‘’]/g, ' '],
];

/** slug tiếng Việt cho heading: "Mục hai & phụ" -> "muc-hai-va-phu" */
export function slugifyHeading(text) {
  let s = String(text);
  for (const [re, rep] of SYMBOL_WORDS) s = s.replace(re, rep);
  const norm = normalizeVi(s);
  const slug = norm.replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return slug || 'section';
}

function plainInlineText(tokens) {
  return (tokens ?? [])
    .map((t) => {
      if (t.type === 'text' || t.type === 'strong' || t.type === 'em' || t.type === 'del') {
        return (t.text ?? '') + (t.tokens ? plainInlineText(t.tokens) : '');
      }
      if (t.type === 'codespan') return t.text ?? '';
      if (t.type === 'link') return plainInlineText(t.tokens);
      return t.raw ?? t.text ?? '';
    })
    .join('');
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const EXTERNAL_RE = /^https?:\/\//i;

/**
 * @param {string} markdown
 * @returns {Promise<{html: string, toc: {level:number,text:string,id:string}[]}>}
 */
export async function renderMarkdown(markdown) {
  const toc = [];
  const usedIds = new Map();

  const uniqueId = (base) => {
    const n = usedIds.get(base) ?? 0;
    usedIds.set(base, n + 1);
    return n === 0 ? base : `${base}-${n + 1}`;
  };

  const marked = new Marked(
    markedHighlight({
      langPrefix: 'language-',
      highlight(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
        }
        return hljs.highlightAuto(code).value;
      },
    }),
    {
      gfm: true,
      breaks: false,
      renderer: {
        heading({ tokens, depth }) {
          const text = plainInlineText(tokens);
          const id = uniqueId(slugifyHeading(text));
          if (depth >= 2 && depth <= 4) {
            toc.push({ level: depth, text, id });
          }
          return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>`;
        },
        link({ href, title, tokens }) {
          const inner = this.parser.parseInline(tokens);
          const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
          if (EXTERNAL_RE.test(href ?? '')) {
            return `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer"${titleAttr}>${inner}</a>`;
          }
          return `<a href="${escapeHtml(href ?? '')}"${titleAttr}>${inner}</a>`;
        },
      },
    },
  );

  const raw = await marked.parse(String(markdown ?? ''));
  const html = purify.sanitize(raw, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ['id', 'target'],
    // KHÔNG truyền ALLOWED_URI_REGEXP tùy biến: ở dompurify v3.x nó khiến
    // target/rel bị strip theo (đã kiểm chứng bằng probe); mặc định của thư viện
    // vốn đã chặn javascript: và các scheme lạ.
  });
  return { html, toc };
}
