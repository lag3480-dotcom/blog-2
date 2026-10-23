import { SITE } from '../site.config.mjs';
export function GET() {
  const daum = SITE.daumWebmasterPin ? `\n${SITE.daumWebmasterPin}\n` : '';
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(import.meta.env.BASE_URL.replace(/\/$/, '') + '/sitemap-index.xml', SITE.url)}\n${daum}`);
}
