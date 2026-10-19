import type { APIRoute } from 'astro';
import { siteConfig } from '@/config/site';

export const GET: APIRoute = () => {
  const body = `# ${siteConfig.siteName} robots.txt
# Allow search and AI-answer crawlers. Training crawlers: currently allowed;
# flip to Disallow if you prefer not to contribute to model training.
# Google Search is unaffected by GPTBot / Google-Extended / ClaudeBot / CCBot choices.

User-agent: *
Allow: /
Disallow: /api/
Disallow: /*?utm_
Disallow: /embed/

# AI search / answer engines (allow to be cited)
User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# AI model training (documented choice: allow)
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${siteConfig.siteUrl}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
