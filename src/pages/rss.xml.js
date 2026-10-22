import rss from '@astrojs/rss';
import { getPublishedPosts } from '../lib/posts';
import { SITE } from '../site.config.mjs';

export async function GET(context) {
  const posts = await getPublishedPosts();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      link: `${import.meta.env.BASE_URL.replace(/\/$/, '')}/posts/${p.id}/`,
    })),
  });
}
