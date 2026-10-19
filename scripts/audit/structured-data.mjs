#!/usr/bin/env node
/** Validate JSON-LD in dist/ — used by npm run proof */
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const outDir = path.resolve('docs/proof/structured-data');
const errors = [];

function validate(item, route) {
  const t = item['@type'];
  if (!t) errors.push(`${route}: missing @type`);
  if (t === 'WebApplication' || t === 'SoftwareApplication') {
    if (!item.name) errors.push(`${route}: WebApplication missing name`);
    if (!item.offers) errors.push(`${route}: WebApplication missing offers`);
  }
  if (t === 'Article' && !item.headline) errors.push(`${route}: Article missing headline`);
  if (t === 'BreadcrumbList' && !item.itemListElement) errors.push(`${route}: BreadcrumbList missing items`);
}

function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (ent.name === 'index.html') {
      const route = '/' + path.relative(dist, p).replace(/index\.html$/, '').replace(/\\/g, '/');
      if (route.includes('/embed/')) continue;
      const html = fs.readFileSync(p, 'utf8');
      const blocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
      const parsed = [];
      for (const m of blocks) {
        const data = JSON.parse(m[1]);
        parsed.push(data);
        for (const item of Array.isArray(data) ? data : [data]) validate(item, route);
      }
      const outName = route.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home';
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, `${outName}.json`), JSON.stringify(parsed, null, 2));
    }
  }
}

if (!fs.existsSync(dist)) {
  console.error('dist/ missing');
  process.exit(1);
}
walk(dist);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Structured data validation OK');
