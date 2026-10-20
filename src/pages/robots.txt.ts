import type { APIRoute } from 'astro';
import { siteConfig } from '@/config/site';

const disallowBlock = `Allow: /
Disallow: /api/
Disallow: /*?utm_
Disallow: /embed/`;

export const GET: APIRoute = () => {
  // Per-bot groups must repeat Disallows — Google uses only the most specific group.
  // Listing Allow-only groups would cancel the * Disallows for those bots.
  const body = `# ${siteConfig.siteName} robots.txt
# Search and AI-answer crawlers. Training crawlers allowed via same Disallow set.
# Flip training agents to Disallow if you prefer not to contribute to model training.

User-agent: *
${disallowBlock}

User-agent: OAI-SearchBot
${disallowBlock}

User-agent: ChatGPT-User
${disallowBlock}

User-agent: PerplexityBot
${disallowBlock}

User-agent: Claude-SearchBot
${disallowBlock}

User-agent: GPTBot
${disallowBlock}

User-agent: Google-Extended
${disallowBlock}

User-agent: ClaudeBot
${disallowBlock}

User-agent: CCBot
${disallowBlock}

Sitemap: ${siteConfig.siteUrl}/sitemap-index.xml
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
