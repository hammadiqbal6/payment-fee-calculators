#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const pages = new Map();
const errors = [];

function routeFromFile(file) {
  return '/' + path.relative(dist, file).replace(/index\.html$/, '').replace(/\\/g, '/');
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name === 'index.html') {
      const route = routeFromFile(p);
      if (route.includes('/embed/')) continue;
      pages.set(route, fs.readFileSync(p, 'utf8'));
    }
  }
}

walk(dist);

const allRoutes = new Set(pages.keys());
const linked = new Set(['/']);

for (const [route, html] of pages) {
  const withoutScripts = html.replace(/<script[\s\S]*?<\/script>/gi, ' ');
  const hrefs = [...withoutScripts.matchAll(/<a\s+[^>]*href="(\/[^"#?]*)"/gi)].map((m) => {
    let r = m[1];
    if (/\.[a-z0-9]+$/i.test(r)) return r;
    if (!r.endsWith('/')) r += '/';
    return r;
  });
  for (const href of hrefs) {
    linked.add(href);
    if (!allRoutes.has(href) && !href.startsWith('/assets/')) {
      errors.push(`${route}: broken internal link ${href}`);
    }
  }
}

const redirectStubs = new Set(['/authors/', '/docs-fee-update/']);
for (const route of allRoutes) {
  if (route === '/404/') continue;
  if (redirectStubs.has(route)) continue;
  if (!linked.has(route)) errors.push(`orphan page: ${route}`);
}

if (errors.length) {
  console.error('Link audit failures:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`Link audit OK (${pages.size} pages, no orphans)`);
