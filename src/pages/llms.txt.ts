import type { APIRoute } from 'astro';
import { siteConfig } from '@/config/site';
import { guides } from '@/data/guides';
import { allTools, hubCategories } from '@/lib/tools';

export const GET: APIRoute = () => {
  const base = siteConfig.siteUrl;
  const toolLines = allTools
    .map((t) => `- [${t.h1}](${base}${t.path}): ${t.description}`)
    .join('\n');
  const guideLines = guides
    .map((g) => `- [${g.title}](${base}/guides/${g.slug}/): ${g.description}`)
    .join('\n');
  const hubLines = hubCategories
    .map((h) => `- [${h.title}](${base}${h.path}): ${h.description}`)
    .join('\n');
  const exampleAmounts = [50, 100, 500, 1000];
  const exampleLines = exampleAmounts
    .map((n) => `- [Fee on $${n}](${base}/examples/fee-on-${n}/): Example fees across processors on a $${n} charge`)
    .join('\n');

  const body = `# ${siteConfig.siteName}
> ${siteConfig.description}

## Tools
${toolLines}

## Guides
${guideLines}

## Hubs
${hubLines}

## Examples
${exampleLines}

## About
- [Methodology](${base}/methodology/): How schedules are sourced, verified, and updated
- [About](${base}/about/): Maintainer, independence, and funding
- [Contact](${base}/contact/): Corrections and questions (${siteConfig.contactEmail})
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
