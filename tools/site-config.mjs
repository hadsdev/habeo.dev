// Cấu hình site URL cho canonical/sitemap. Khi đổi domain triển khai, đặt env
// HABEO_SITE_URL — không tự cấu hình DNS hay đoán domain (theo spec).
export const SITE_URL = (process.env.HABEO_SITE_URL ?? 'https://habeo.dev').replace(/\/+$/, '');
