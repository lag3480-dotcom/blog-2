import { SITE } from '../site.config.mjs';
export function GET() {
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(import.meta.env.BASE_URL.replace(/\/$/, '') + '/sitemap-index.xml', SITE.url)}\n`);
}
