#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const steps = [
  ['SEO audit', 'scripts/audit/seo.mjs'],
  ['AdSense readiness', 'scripts/audit/adsense.mjs'],
  ['JS budget', 'scripts/audit/budget.mjs'],
  ['Internal links', 'scripts/audit/links.mjs'],
  ['Structured data', 'scripts/audit/structured-data.mjs'],
];

let failed = false;
for (const [name, script] of steps) {
  console.log(`\n=== ${name} ===`);
  const r = spawnSync('node', [script], { stdio: 'inherit' });
  if (r.status !== 0) failed = true;
}
if (failed) {
  console.error('\nAudit failed.');
  process.exit(1);
}
console.log('\nAll audits passed.');
