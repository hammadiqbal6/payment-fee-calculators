#!/usr/bin/env node
/**
 * IndexNow URL submission (Bing, Yandex, etc. — NOT Google).
 * Usage:
 *   PUBLIC_SITE_URL=https://yoursite.com PUBLIC_INDEXNOW_KEY=your32hex node scripts/indexnow/post.mjs /tools/stripe-fee-calculator/
 */
const site = process.env.PUBLIC_SITE_URL || 'https://feecalculator.example';
const key = process.env.PUBLIC_INDEXNOW_KEY || '00000000000000000000000000000000';
const paths = process.argv.slice(2);
if (!paths.length) {
  console.error('Pass one or more paths, e.g. /tools/stripe-fee-calculator/');
  process.exit(1);
}
const host = new URL(site).host;
const urlList = paths.map((p) => new URL(p, site).toString());
const body = { host, key, urlList };
const endpoint = 'https://api.indexnow.org/indexnow';
const res = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});
console.log('IndexNow status', res.status, await res.text());
