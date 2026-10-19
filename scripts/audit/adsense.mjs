#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const required = ['/about/', '/contact/', '/privacy/', '/terms/', '/methodology/'];
const errors = [];

function readRoute(route) {
  const file = path.join(dist, route.replace(/^\//, ''), 'index.html');
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

for (const route of required) {
  const html = readRoute(route);
  if (!html) errors.push(`missing page ${route}`);
}

const privacy = readRoute('/privacy/') ?? '';
if (!/AdSense|adsense|Google/i.test(privacy)) errors.push('privacy: missing AdSense disclosure');
if (!/cookie/i.test(privacy)) errors.push('privacy: missing cookie mention');
if (!/aboutads\.info|Ads Settings/i.test(privacy)) errors.push('privacy: missing ad opt-out links');

if (!fs.existsSync(path.join(dist, 'ads.txt'))) errors.push('missing ads.txt');

const home = readRoute('/') ?? '';
if (!/calculator/i.test(home)) errors.push('home: thin content signal');

if (errors.length) {
  console.error('AdSense audit failures:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}
console.log('AdSense readiness audit OK');
