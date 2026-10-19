import { siteConfig } from '@/config/site';
import { guides } from '@/data/guides';
import { allTools } from '@/lib/tools';

export function GET() {
  const items = [
    ...guides.map((g) => ({
      title: g.title,
      link: `${siteConfig.siteUrl}/guides/${g.slug}/`,
      date: g.modified,
      description: g.description,
    })),
    ...allTools.slice(0, 8).map((t) => ({
      title: t.h1,
      link: `${siteConfig.siteUrl}${t.path}`,
      date: '2026-10-19',
      description: t.description,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${siteConfig.siteName}</title>
    <link>${siteConfig.siteUrl}/</link>
    <description>${siteConfig.description}</description>
    ${items
      .map(
        (item) => `
    <item>
      <title>${item.title.replace(/&/g, '&amp;')}</title>
      <link>${item.link}</link>
      <pubDate>${new Date(item.date).toUTCString()}</pubDate>
      <description>${item.description.replace(/&/g, '&amp;')}</description>
    </item>`,
      )
      .join('')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
