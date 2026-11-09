// Chuẩn hoá tiếng Việt + tìm kiếm toàn văn cục bộ (AND token, prefix token, lọc chủ đề).

/** "Hướng Dẫn" -> "huong dan"; "điều lệ Đệ nhất" -> "dieu le de nhat" */
export function normalizeVi(input) {
  return String(input ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    // giữ chữ thường a-z, số, gạch nối trong token; mọi ký tự khác thành khoảng trắng
    .replace(/[^a-z0-9-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Biến một mục nội dung thành doc tìm kiếm: token hoá title + description + body
 * (bỏ fenced code để không nhiễu kết quả).
 */
export function buildSearchDoc(item) {
  const bodyPlain = String(item.body ?? '')
    .replace(/```[\s\S]*?(?:```|$)/g, ' ')
    .replace(/`([^`\n]*)`/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  const haystack = normalizeVi(
    [item.title, item.description, item.topic, item.level, bodyPlain].join(' '),
  );
  const tokens = new Set(haystack.split(' ').filter(Boolean));
  return {
    id: item.id,
    slug: item.slug,
    type: item.type,
    title: item.title,
    topic: item.topic,
    level: item.level,
    path: item.path,
    description: item.description,
    tokens,
  };
}

/**
 * @param {object[]} docs kết quả buildSearchDoc
 * @param {string} query truy vấn thô (có hay không dấu đều được)
 * @param {{topic?: string}} [filters]
 * @returns {object[]} các doc khớp (mảng rỗng nếu không có — empty state)
 */
export function search(docs, query, filters = {}) {
  const topic = filters?.topic;
  let result = Array.isArray(docs) ? docs : [];
  if (topic) {
    result = result.filter((d) => d.topic === topic);
  }
  const qTokens = normalizeVi(query).split(' ').filter(Boolean);
  if (qTokens.length === 0) return result;
  // AND: mọi token phải khớp ít nhất một token của doc (bằng hoặc tiền tố)
  return result.filter((d) =>
    qTokens.every((q) => {
      for (const t of d.tokens) {
        if (t === q || t.startsWith(q)) return true;
      }
      return false;
    }),
  );
}
