// Kiểm tra liên kết nội bộ trong Markdown body + bước của lộ trình trỏ đúng id bài.

const LINK_RE = /\]\(\s*(\/[^)\s]*)\s*(?:["'][^"']*["'])?\s*\)/g;

/**
 * Lấy mọi link nội bộ (bắt đầu bằng "/") từ body Markdown, bỏ external, bỏ "#anchor" trần.
 * Giữ nguyên phần #anchor trong kết quả trả về.
 */
export function collectInternalLinks(body) {
  const out = new Set();
  const re = new RegExp(LINK_RE.source, 'g');
  let m;
  while ((m = re.exec(String(body ?? ''))) !== null) {
    out.add(m[1]);
  }
  return [...out];
}

/**
 * @param {{file: string, body: string}} item
 * @param {Set<string>} known các route nội bộ hợp lệ (không tính anchor)
 */
export function validateInternalLinks(item, known) {
  const errors = [];
  for (const link of collectInternalLinks(item.body)) {
    const route = link.split('#')[0];
    if (route === '' || route === '#') continue;
    if (!known.has(route)) {
      errors.push(`${item.file}: liên kết nội bộ hỏng -> ${link}`);
    }
  }
  return errors;
}

/**
 * @param {{id: string, steps?: string[]}} pathItem
 * @param {Set<string>} articleIds tập id bài/lab đã xuất bản
 * @param {string} file tên file để báo lỗi
 */
export function validatePathSteps(pathItem, articleIds, file) {
  const errors = [];
  for (const step of pathItem.steps ?? []) {
    if (!articleIds.has(step)) {
      errors.push(`${file}: bước lộ trình "${step}" (id) không khớp bài nào đã xuất bản`);
    }
  }
  return errors;
}
