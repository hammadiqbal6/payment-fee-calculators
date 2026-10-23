#!/usr/bin/env node
/**
 * SEO / AEO guardrail audit (docs/SEO-GUARDRAILS.md).
 * Fails the build on HIGH/MEDIUM/LOW technical findings we can detect statically.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.resolve(ROOT, 'dist');
const errors = [];
const toolPaths = [];
const guidePaths = [];

const DEFAULT_SITE = 'https://payment-fee-calculators.hammadiqbal117.workers.dev';
const siteUrl = (process.env.PUBLIC_SITE_URL || DEFAULT_SITE).replace(/\/$/, '');
const siteHost = new URL(siteUrl).host;

const INDEXNOW_PLACEHOLDERS = /^(placeholder|your-?key|replace_?me|xxx+|changeme|todo|insert.?key)$/i;
const FILE_EXT_SOURCE = /\.\[a-zA-Z0-9\]\{1,16\}/;
/** Mirror worker: extensions 1–16 alphanumeric */
const FILE_EXT = /\.[a-zA-Z0-9]{1,16}$/;

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

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function walkHtml(file) {
  const rel = '/' + path.relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
  const html = fs.readFileSync(file, 'utf8');

  if (rel.includes('/embed/')) {
    const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? '';
    if (!canonical) errors.push(`${rel}: embed missing canonical`);
    if (!/noindex/i.test(html)) errors.push(`${rel}: embed missing noindex`);
    checkInlineImports(html, rel);
    checkForbiddenHosts(html, rel);
    return;
  }

  if (rel === '/authors/' || rel === '/docs-fee-update/') return;

  const title = decodeEntities(html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? '');
  const desc = decodeEntities(html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1] ?? '');
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i)?.[1] ?? '';
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').trim(),
  );
  const jsonLd = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1],
  );
  const ogTitle = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i)?.[1];
  const ogImage = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i)?.[1] ?? '';

  if (!title) errors.push(`${rel}: missing title`);
  else if (title.length > 60) errors.push(`${rel}: title too long (${title.length} > 60)`);

  if (!desc) errors.push(`${rel}: missing meta description`);
  else if (desc.length < 50 || desc.length > 165) {
    errors.push(`${rel}: meta description length ${desc.length} outside 50–165`);
  }

  if (h1s.length !== 1) errors.push(`${rel}: expected 1 H1, found ${h1s.length}`);
  if (!canonical) errors.push(`${rel}: missing canonical`);
  if (!ogTitle) errors.push(`${rel}: missing og:title`);
  if (ogImage.endsWith('/')) errors.push(`${rel}: og:image must not end with /`);

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

  checkInlineImports(html, rel);
  checkForbiddenHosts(html, rel);

  if (rel.startsWith('/tools/') && rel !== '/tools/compare-payment-fees/') {
    toolPaths.push(rel);
    const words = textContent(html).split(' ').filter(Boolean).length;
    if (words < 600) errors.push(`${rel}: tool page word count ${words} < 600`);
    if (!/href="\/guides\/[^"]+"/i.test(html)) {
      errors.push(`${rel}: tool page missing guide link`);
    }
  }

  if (rel === '/tools/compare-payment-fees/') {
    if (!/href="\/guides\/[^"]+"/i.test(html)) {
      errors.push(`${rel}: comparison page missing guide link`);
    }
  }

  if (rel.startsWith('/guides/') && rel !== '/guides/') {
    guidePaths.push(rel);
    const words = textContent(html).split(' ').filter(Boolean).length;
    if (words < 800) errors.push(`${rel}: guide word count ${words} < 800`);
  }
}

function checkInlineImports(html, rel) {
  // Classic inline scripts (not type=module) must not use import — breaks GA etc.
  const scripts = [...html.matchAll(/<script(?![^>]*\btype=["']module["'])[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of scripts) {
    const attrs = m[0].slice(0, m[0].indexOf('>') + 1);
    if (/type=["']application\/ld\+json["']/i.test(attrs)) continue;
    if (/src=/i.test(attrs)) continue;
    const body = m[1];
    if (/\bimport\s+[\s{*]/.test(body) || /\bimport\s*['"]/.test(body)) {
      errors.push(`${rel}: inline script uses import (must be bundled module or data-attrs)`);
    }
  }
}

function checkForbiddenHosts(html, rel) {
  if (/example\.com/i.test(html)) errors.push(`${rel}: contains example.com`);
  const urls = [...html.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)];
  for (const m of urls) {
    const host = m[1].toLowerCase();
    if (host === 'example.com' || host.endsWith('.example.com')) {
      errors.push(`${rel}: hardcoded example.com host`);
    }
    // Flag our own workers.dev only when PUBLIC_SITE_URL points elsewhere
    if (
      host.endsWith('.workers.dev') &&
      host.includes('payment-fee-calculators') &&
      host !== siteHost.toLowerCase()
    ) {
      errors.push(`${rel}: hardcoded workers.dev host ${host} ≠ PUBLIC_SITE_URL host ${siteHost}`);
    }
  }
}

function collectSitemapLocs() {
  const locs = new Set();
  const indexPath = path.join(dist, 'sitemap-index.xml');
  if (!fs.existsSync(indexPath)) return locs;
  const childLocs = [...fs.readFileSync(indexPath, 'utf8').matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)].map(
    (m) => m[1].trim(),
  );
  for (const childUrl of childLocs) {
    let childPath;
    try {
      childPath = path.join(dist, decodeURIComponent(new URL(childUrl).pathname.replace(/^\//, '')));
    } catch {
      continue;
    }
    if (!fs.existsSync(childPath)) continue;
    for (const m of fs.readFileSync(childPath, 'utf8').matchAll(/<loc>\s*([^<]+)\s*<\/loc>/gi)) {
      try {
        const u = new URL(m[1].trim());
        let p = u.pathname;
        if (!p.endsWith('/')) p += '/';
        locs.add(p);
      } catch {
        /* skip */
      }
    }
  }
  return locs;
}

function checkSitemapCoverage() {
  const sitemapPaths = collectSitemapLocs();
  if (!sitemapPaths.size) {
    errors.push('sitemap: no URLs found');
    return;
  }

  function walkPages(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walkPages(p);
      else if (ent.name === 'index.html') {
        const rel =
          '/' + path.relative(dist, p).replace(/index\.html$/, '').replace(/\\/g, '/');
        if (rel.includes('/embed/')) continue;
        if (rel === '/authors/' || rel === '/docs-fee-update/' || rel === '/404/') continue;
        if (!sitemapPaths.has(rel)) errors.push(`${rel}: missing from sitemap`);
      }
    }
  }
  walkPages(dist);
}

function checkIndexNowKey() {
  const envKey = process.env.PUBLIC_INDEXNOW_KEY || process.env.INDEXNOW_KEY || '';
  const siteTs = fs.readFileSync(path.join(ROOT, 'src/config/site.ts'), 'utf8');
  const keyMatch = siteTs.match(/indexNowKey:\s*env\([^,]+,\s*'([a-f0-9]+|[^']+)'\)/i);
  const key = envKey || keyMatch?.[1] || '';
  if (!key || INDEXNOW_PLACEHOLDERS.test(key)) {
    errors.push(`IndexNow key looks like a placeholder: ${key || '(empty)'}`);
  }
  if (key && /^[a-f0-9]{32}$/i.test(key)) {
    const keyFile = path.join(dist, `${key}.txt`);
    const pubFile = path.join(ROOT, 'public', `${key}.txt`);
    if (!fs.existsSync(keyFile) && !fs.existsSync(pubFile)) {
      errors.push(`IndexNow key file missing: public/${key}.txt`);
    }
  }
}

function checkWorkerFileExt() {
  const worker = fs.readFileSync(path.join(ROOT, 'src/worker.ts'), 'utf8');
  if (!FILE_EXT_SOURCE.test(worker.replace(/\s/g, ''))) {
    // Also accept the readable form
    if (!/\[a-zA-Z0-9\]\{1,16\}/.test(worker)) {
      errors.push('src/worker.ts: FILE_EXT must allow {1,16} (webmanifest is 11 chars)');
    }
  }
  // Runtime check: .webmanifest must match; bare paths must not
  const samples = [
    ['/site.webmanifest', true],
    ['/favicon.ico', true],
    ['/about', false],
    ['/tools/stripe-fee-calculator', false],
  ];
  for (const [pathname, isFile] of samples) {
    const matched = FILE_EXT.test(pathname);
    if (matched !== isFile) {
      errors.push(`FILE_EXT mismatch for ${pathname}: expected file=${isFile}, got ${matched}`);
    }
  }
}

function checkOgDefault() {
  const siteTs = fs.readFileSync(path.join(ROOT, 'src/config/site.ts'), 'utf8');
  const og = siteTs.match(/defaultOgImage:\s*'([^']+)'/);
  if (og?.[1]?.endsWith('/')) {
    errors.push('siteConfig.defaultOgImage must not end with /');
  }
}

function checkHardcodedInSrc() {
  const skip = new Set(['sisterSites.ts']); // sister defaults are intentional until custom domains
  const scanDirs = [path.join(ROOT, 'src'), path.join(ROOT, 'scripts')];
  for (const dir of scanDirs) {
    walkSrc(dir);
  }
  function walkSrc(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules') continue;
        walkSrc(p);
        continue;
      }
      if (!/\.(astro|ts|js|mjs|tsx|jsx)$/.test(ent.name)) continue;
      if (skip.has(ent.name)) continue;
      const text = fs.readFileSync(p, 'utf8');
      if (/https?:\/\/example\.com/i.test(text)) {
        errors.push(`${path.relative(ROOT, p)}: hardcoded example.com`);
      }
    }
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
if (!robots.includes(siteHost) && !robots.includes(siteUrl)) {
  errors.push('robots.txt: Sitemap host should match PUBLIC_SITE_URL');
}

const sitemapIndex = path.join(dist, 'sitemap-index.xml');
if (!fs.existsSync(sitemapIndex)) errors.push('missing sitemap-index.xml');

const llms = path.join(dist, 'llms.txt');
if (!fs.existsSync(llms)) errors.push('missing llms.txt');
else {
  const body = fs.readFileSync(llms, 'utf8');
  if (!/^#\s+/m.test(body)) errors.push('llms.txt: missing H1 (# title)');
  if (!/##\s+Tools/i.test(body)) errors.push('llms.txt: missing ## Tools section');
  if (!/##\s+Guides/i.test(body)) errors.push('llms.txt: missing ## Guides section');
  const toolLinks = (body.match(/\/tools\/[a-z0-9-/]+/gi) || []).length;
  if (toolLinks < 10) errors.push(`llms.txt: expected many tool links, found ${toolLinks}`);
}

checkSitemapCoverage();
checkIndexNowKey();
checkWorkerFileExt();
checkOgDefault();
checkHardcodedInSrc();

if (errors.length) {
  console.error('SEO audit failures:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}
console.log(
  `SEO audit OK (${toolPaths.length} tools, ${guidePaths.length} guides, site=${siteHost})`,
);
