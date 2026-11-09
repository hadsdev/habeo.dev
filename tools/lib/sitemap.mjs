// Sinh sitemap.xml + robots.txt từ danh sách route + site URL cấu hình.

function xmlEscape(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * @param {string[]} routes các route nội bộ, ví dụ ['/', '/kien-thuc/abc']
 * @param {string} baseUrl canonical base, ví dụ 'https://habeo.dev'
 */
export function generateSitemap(routes, baseUrl) {
  const base = String(baseUrl).replace(/\/+$/, '');
  const urls = (routes ?? [])
    .map((route) => {
      const loc = route === '/' ? `${base}/` : `${base}${route.startsWith('/') ? route : `/${route}`}`;
      return `<url><loc>${xmlEscape(loc)}</loc></url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function generateRobots(baseUrl) {
  const base = String(baseUrl).replace(/\/+$/, '');
  return `User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`;
}
