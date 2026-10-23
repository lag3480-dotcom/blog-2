import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE } from './src/site.config.mjs';
import { satteri } from '@astrojs/markdown-satteri';
import { affiliateLinks } from './src/lib/affiliate.mjs';

export default defineConfig({
  site: SITE.url,
  base: SITE.base,
  integrations: [sitemap()],
  build: { format: 'directory' },
  markdown: { processor: satteri({ hastPlugins: [affiliateLinks] }) },
});
