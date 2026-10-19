#!/usr/bin/env node
/** Fast CI check: committed docs/proof matches quality gates (no Lighthouse regen). */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '../..');
const proof = path.join(root, 'docs/proof');
const errors = [];

function req(file) {
  const p = path.join(proof, file);
  if (!fs.existsSync(p)) errors.push(`missing ${file}`);
}

for (const f of [
  'README.md',
  'seo-audit.txt',
  'tests.txt',
  'bundle-size.txt',
  'sitemap-robots.txt',
  'adsense-readiness.md',
  'lighthouse/SUMMARY.md',
  'lighthouse/summary.json',
  'structured-data/validation.json',
  'mobile/viewport-check.txt',
]) {
  req(f);
}

const summary = JSON.parse(fs.readFileSync(path.join(proof, 'lighthouse/summary.json'), 'utf8'));
if (!summary.mobileGate) errors.push('lighthouse summary mobileGate is not PASS');

const sd = JSON.parse(fs.readFileSync(path.join(proof, 'structured-data/validation.json'), 'utf8'));
if (!sd.valid) errors.push('structured-data validation failed');

if (/Thin pages: none/.test(fs.readFileSync(path.join(proof, 'adsense-readiness.md'), 'utf8')) === false) {
  if (/FAIL/.test(fs.readFileSync(path.join(proof, 'adsense-readiness.md'), 'utf8'))) {
    errors.push('adsense-readiness has FAIL markers');
  }
}

const audit = spawnSync('npm', ['run', 'audit'], { cwd: root, encoding: 'utf8' });
if (audit.status !== 0) {
  errors.push('npm run audit failed in verify');
  console.error(audit.stdout, audit.stderr);
}

if (errors.length) {
  console.error('Proof verify failed:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}
console.log('Proof verify OK (committed docs/proof + audit)');
