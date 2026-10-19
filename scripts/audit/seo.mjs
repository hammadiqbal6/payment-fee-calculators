#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const errors = [];
const toolPaths = [];

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name === 'index.html') walkHtml(p);
  }
}

function textContent(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function walkHtml(file) {
  const rel = '/' + path.relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');
  if (rel.includes('/embed/')) return;

  const title = html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '';
  const desc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? '';
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? '';
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
  const jsonLd = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i)?.[1];

  if (!title) errors.push(`${rel}: missing title`);
  if (title.length > 70) errors.push(`${rel}: title too long (${title.length})`);
  if (!desc) errors.push(`${rel}: missing meta description`);
  if (desc.length > 165) errors.push(`${rel}: meta description too long (${desc.length})`);
  if (h1s.length !== 1) errors.push(`${rel}: expected 1 H1, found ${h1s.length}`);
  if (!canonical) errors.push(`${rel}: missing canonical`);
  if (!ogTitle) errors.push(`${rel}: missing og:title`);

  for (const block of jsonLd) {
    try {
      JSON.parse(block);
    } catch {
      errors.push(`${rel}: invalid JSON-LD`);
    }
  }

  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  for (const img of imgs) {
    if (!/alt=/.test(img[0])) errors.push(`${rel}: img missing alt`);
  }

  if (rel.startsWith('/tools/') && rel !== '/tools/compare-payment-fees/') {
    toolPaths.push(rel);
    const words = textContent(html).split(' ').filter(Boolean).length;
    if (words < 600) errors.push(`${rel}: tool page word count ${words} < 600`);
  }
}

if (!fs.existsSync(dist)) {
  console.error('dist/ missing — run npm run build first');
  process.exit(1);
}
walk(dist);

const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
if (!/Sitemap:/i.test(robots)) errors.push('robots.txt: missing Sitemap');
if (!/OAI-SearchBot/i.test(robots)) errors.push('robots.txt: missing OAI-SearchBot');

const sitemapIndex = path.join(dist, 'sitemap-index.xml');
if (!fs.existsSync(sitemapIndex)) errors.push('missing sitemap-index.xml');

if (errors.length) {
  console.error('SEO audit failures:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`SEO audit OK (${toolPaths.length} tool pages checked)`);
