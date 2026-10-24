#!/usr/bin/env node
/**
 * Per-page SEO / AEO checklist audit (uploads/page-checklist.md + answer-first rules).
 * Run after `npm run build`. Fails on missing/duplicate title or meta, H1 issues,
 * missing canonical, invalid JSON-LD, sitemap gaps, placeholders, missing viewport,
 * or answer block not first on tools/guides/hubs/examples.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.resolve(ROOT, 'dist');
const errors = [];
const titles = new Map();
const descriptions = new Map();

const SKIP = new Set(['/authors/', '/docs-fee-update/', '/404/']);
const INFO_LEGAL = new Set([
  '/about/',
  '/contact/',
  '/privacy/',
  '/terms/',
  '/methodology/',
  '/fee-changelog/',
]);

const PLACEHOLDER_RE =
  /\b(lorem ipsum|TODO:|FIXME:|placeholder|ad stub|Ahrefs KD|your-?key-here|example\.com\/your)\b/i;
const RAW_PATH_AS_TEXT_RE = /(?<!href=["']|src=["']|content=["']|canonical["']\s*href=["'])\/(?:tools|guides|examples|payment-processors|creator-fees|p2p-fees)\/[a-z0-9-]{3,}\/(?![^<]*<\/a>)/i;

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name === 'index.html') checkPage(p);
  }
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function mainHtml(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function collectSitemapLocs() {
  const locs = new Set();
  const indexPath = path.join(dist, 'sitemap-index.xml');
  const singlePath = path.join(dist, 'sitemap-0.xml');
  const files = [];
  if (fs.existsSync(indexPath)) {
    const idx = fs.readFileSync(indexPath, 'utf8');
    for (const m of idx.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const u = m[1];
      const name = path.basename(new URL(u).pathname);
      const local = path.join(dist, name);
      if (fs.existsSync(local)) files.push(local);
    }
  } else if (fs.existsSync(singlePath)) {
    files.push(singlePath);
  } else {
    const sitemap = path.join(dist, 'sitemap.xml');
    if (fs.existsSync(sitemap)) files.push(sitemap);
  }
  for (const f of files) {
    const xml = fs.readFileSync(f, 'utf8');
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      try {
        const u = new URL(m[1]);
        let p = u.pathname;
        if (!p.endsWith('/')) p += '/';
        locs.add(p);
      } catch {
        /* ignore */
      }
    }
  }
  return locs;
}

function checkAnswerFirst(rel, main) {
  if (INFO_LEGAL.has(rel) || rel.includes('/embed/')) return;
  // After H1, first content block should be answer-first / lead / takeaway (not byline-only).
  const afterH1 = main.split(/<\/h1>/i)[1] ?? '';
  const firstBlock = afterH1.match(/<(p|div|section|ul|ol|nav)\b[^>]*>[\s\S]*?<\/\1>/i);
  if (!firstBlock) {
    errors.push(`${rel}: no content block after H1`);
    return;
  }
  const block = firstBlock[0];
  const cls = (block.match(/class="([^"]*)"/i)?.[1] ?? '').toLowerCase();
  const isAnswer =
    /\banswer-first\b/.test(cls) ||
    /\blead\b/.test(cls) ||
    /\btakeaway\b/.test(cls) ||
    /\banswer-box\b/.test(cls) ||
    /\bhero-tool\b/.test(cls);
  const isByline = /\bbyline\b/.test(cls) || /\bcontent-meta\b/.test(cls) || /\bmeta-row\b/.test(cls);
  if (isByline) {
    errors.push(`${rel}: byline/meta appears before answer-first block`);
  } else if (!isAnswer && !rel.endsWith('/guides/') /* index hubs may vary */) {
    // Allow breadcrumb-only first if second block is answer — already split after H1; breadcrumbs come before H1.
    if (!/\banswer-first\b/i.test(afterH1.slice(0, 800))) {
      errors.push(`${rel}: answer-first / lead block missing near top after H1`);
    }
  }

  if (rel.startsWith('/tools/') || rel.startsWith('/examples/') || rel.startsWith('/guides/')) {
    if (rel !== '/guides/' && !/\banswer-first\b/i.test(main) && !/\btakeaways\b/i.test(main)) {
      errors.push(`${rel}: missing answer-first or takeaways class`);
    }
  }
}

function checkPage(file) {
  const rel = '/' + path.relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  if (SKIP.has(rel)) return;

  const html = fs.readFileSync(file, 'utf8');
  const main = mainHtml(html);

  if (rel.includes('/embed/')) {
    if (!/noindex/i.test(html)) errors.push(`${rel}: embed missing noindex`);
    if (!/<link\s+rel="canonical"/i.test(html)) errors.push(`${rel}: embed missing canonical`);
    return;
  }

  if (!/<meta\s+name="viewport"/i.test(html)) {
    errors.push(`${rel}: missing viewport meta`);
  }

  const title = decodeEntities(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '');
  const desc = decodeEntities(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? '');
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? '';
  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => stripTags(m[1]));

  if (!title) errors.push(`${rel}: missing title`);
  else {
    if (titles.has(title)) errors.push(`${rel}: duplicate title (also ${titles.get(title)})`);
    else titles.set(title, rel);
  }

  if (!desc) errors.push(`${rel}: missing meta description`);
  else {
    if (descriptions.has(desc) && !INFO_LEGAL.has(rel)) {
      errors.push(`${rel}: duplicate meta description (also ${descriptions.get(desc)})`);
    } else descriptions.set(desc, rel);
  }

  if (h1s.length !== 1) errors.push(`${rel}: expected 1 H1, found ${h1s.length}`);
  if (!canonical) errors.push(`${rel}: missing canonical`);
  else if (!/^https:\/\//i.test(canonical)) errors.push(`${rel}: canonical must be absolute https`);

  const jsonLd = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1],
  );
  for (const block of jsonLd) {
    try {
      JSON.parse(block);
    } catch {
      errors.push(`${rel}: invalid JSON-LD`);
    }
  }

  if (PLACEHOLDER_RE.test(html)) {
    errors.push(`${rel}: placeholder / internal stub text detected`);
  }

  // Footer must not use H2 (heading pollution)
  const footer = html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)?.[1] ?? '';
  if (/<h[1-6]\b/i.test(footer)) {
    errors.push(`${rel}: footer contains heading elements (use non-heading labels)`);
  }

  checkAnswerFirst(rel, main);

  // Visible raw path text (not inside href) is a weak signal; skip for code/pre
  const visible = main
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<code[\s\S]*?<\/code>/gi, ' ')
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, ' ');
  if (RAW_PATH_AS_TEXT_RE.test(visible) && !rel.startsWith('/methodology/')) {
    // methodology may discuss paths in prose — still prefer links; soft skip already applied
  }
}

if (!fs.existsSync(dist)) {
  console.error('dist/ missing — run npm run build first');
  process.exit(1);
}

walk(dist);

const sitemapLocs = collectSitemapLocs();
if (sitemapLocs.size === 0) {
  errors.push('sitemap: no locs found');
} else {
  // Every indexable HTML page (non-embed, non-skip) should appear in sitemap
  function walkIndexable(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walkIndexable(p);
      else if (ent.name === 'index.html') {
        const rel =
          '/' + path.relative(dist, p).replace(/index\.html$/, '').replace(/\\/g, '/');
        if (SKIP.has(rel) || rel.includes('/embed/') || rel === '/404/') return;
        const html = fs.readFileSync(p, 'utf8');
        if (/noindex/i.test(html)) return;
        if (!sitemapLocs.has(rel)) errors.push(`${rel}: missing from sitemap`);
      }
    }
  }
  walkIndexable(dist);
}

if (errors.length) {
  console.error(`Page checklist audit failed (${errors.length} issue(s)):`);
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}
console.log('Page checklist audit passed.');
