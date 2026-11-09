// Parse frontmatter YAML tách khỏi body Markdown. Mọi lỗi phải kèm tên file.
import { parse as parseYaml } from 'yaml';

const OPEN_RE = /^---[ \t]*\r?\n/;

/**
 * @param {string} raw toàn bộ nội dung file
 * @param {string} file đường dẫn phục vụ thông báo lỗi
 * @returns {{data: object, body: string}}
 */
export function parseContentFile(raw, file) {
  if (typeof raw !== 'string' || !OPEN_RE.test(raw)) {
    throw new Error(`${file}: thiếu frontmatter mở đầu bằng dòng "---"`);
  }
  const rest = raw.slice(raw.match(OPEN_RE)[0].length);
  const closeMatch = rest.match(/\r?\n---[ \t]*(\r?\n|$)/);
  if (!closeMatch) {
    throw new Error(`${file}: frontmatter không đóng (thiếu dòng "---" kết thúc)`);
  }
  const yamlText = rest.slice(0, closeMatch.index);
  const body = rest.slice(closeMatch.index + closeMatch[0].length);

  let data;
  try {
    data = parseYaml(yamlText);
  } catch (e) {
    throw new Error(`${file}: YAML frontmatter sai cú pháp: ${e.message}`);
  }
  if (data === null || data === undefined) data = {};
  if (typeof data !== 'object' || Array.isArray(data)) {
    throw new Error(`${file}: frontmatter phải là mapping YAML, không phải ${Array.isArray(data) ? 'danh sách' : typeof data}`);
  }
  return { data, body };
}
