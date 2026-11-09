// Validate schema metadata nội dung + quét HTML/script nguy hiểm ngay trong nguồn Markdown.
// Build phải fail với tên file + lỗi cụ thể (xem spec mục Kỹ thuật).

export const TOPICS = [
  'model-va-ngu-canh',
  'an-toan-du-lieu',
  'quy-trinh-ai-coding',
  'project-instructions-va-skills',
  'tool-calling-va-mcp',
  'harness-va-evals',
];

export const TYPES = ['article', 'lab', 'path'];
export const LEVELS = ['nhap-mon', 'trung-cap', 'nang-cao'];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const HTTPS_RE = /^https:\/\/[^\s]+$/;

const REQUIRED_FIELDS = [
  'id',
  'slug',
  'title',
  'description',
  'type',
  'topic',
  'level',
  'sources',
  'updated',
];

function err(file, msg) {
  return `${file}: ${msg}`;
}

export function validateContentItem(item, file) {
  const errors = [];
  if (item === null || typeof item !== 'object') {
    return [err(file, 'frontmatter không phải object')];
  }
  for (const field of REQUIRED_FIELDS) {
    const v = item[field];
    if (v === undefined || v === null || v === '') {
      errors.push(err(file, `thiếu field bắt buộc "${field}"`));
    }
  }
  for (const field of ['id', 'slug']) {
    const v = item[field];
    if (typeof v === 'string' && v !== '' && !SLUG_RE.test(v)) {
      errors.push(err(file, `${field} "${v}" phải là kebab-case chữ thường (a-z, 0-9, gạch nối)`));
    }
  }
  if (typeof item.type === 'string' && item.type && !TYPES.includes(item.type)) {
    errors.push(err(file, `type "${item.type}" không thuộc ${TYPES.join('|')}`));
  }
  if (typeof item.topic === 'string' && item.topic && !TOPICS.includes(item.topic)) {
    errors.push(err(file, `topic "${item.topic}" không thuộc danh sách chủ đề đã định`));
  }
  if (typeof item.level === 'string' && item.level && !LEVELS.includes(item.level)) {
    errors.push(err(file, `level "${item.level}" không thuộc ${LEVELS.join('|')}`));
  }
  if (typeof item.updated === 'string' && item.updated) {
    if (!DATE_RE.test(item.updated) || Number.isNaN(Date.parse(item.updated))) {
      errors.push(err(file, `updated "${item.updated}" phải theo định dạng YYYY-MM-DD`));
    }
  }
  if (item.prerequisites !== undefined && !Array.isArray(item.prerequisites)) {
    errors.push(err(file, 'prerequisites phải là danh sách id'));
  }
  if (Array.isArray(item.sources)) {
    if (item.sources.length === 0) {
      errors.push(err(file, 'sources phải có ít nhất một nguồn tham khảo'));
    }
    item.sources.forEach((s, i) => {
      if (!s || typeof s !== 'object') {
        errors.push(err(file, `sources[${i}] phải là object {title, url}`));
        return;
      }
      if (!s.title) errors.push(err(file, `sources[${i}] thiếu title`));
      if (typeof s.url !== 'string' || !HTTPS_RE.test(s.url)) {
        errors.push(err(file, `sources[${i}].url "${s.url ?? ''}" phải là URL https tuyệt đối`));
      }
    });
  } else if (item.sources !== undefined && item.sources !== null && item.sources !== '') {
    errors.push(err(file, 'sources phải là danh sách {title, url}'));
  }
  if (item.verified !== undefined && typeof item.verified !== 'boolean') {
    errors.push(err(file, 'verified phải là boolean (đã kiểm thử thật hay chưa)'));
  }
  return errors;
}

export function findDuplicateIds(items) {
  const errors = [];
  for (const key of ['id', 'slug']) {
    const seen = new Map();
    for (const it of items) {
      const v = it?.[key];
      if (v === undefined || v === null) continue;
      seen.set(v, (seen.get(v) ?? 0) + 1);
    }
    for (const [v, count] of seen) {
      if (count > 1) {
        errors.push(`Trùng ${key}: "${v}" xuất hiện ${count} lần`);
      }
    }
  }
  return errors;
}

// Bỏ fenced code block và inline code trước khi quét — trong code fence, <script> chỉ là text.
export function containsUnsafeRawHtml(md) {
  const stripped = String(md)
    .replace(/```[\s\S]*?(?:```|$)/g, ' ')
    .replace(/`[^`\n]*`/g, ' ');
  return /<script\b/i.test(stripped) || /\son[a-z]+\s*=/i.test(stripped) || /javascript\s*:/i.test(stripped);
}
