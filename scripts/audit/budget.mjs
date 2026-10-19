#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const distAssets = path.resolve('dist/assets');
const MAX_GZIP_KB = 50;
const errors = [];

if (!fs.existsSync(distAssets)) {
  console.error('dist/assets missing');
  process.exit(1);
}

const jsFiles = fs.readdirSync(distAssets).filter((f) => f.endsWith('.js'));
for (const file of jsFiles) {
  const buf = fs.readFileSync(path.join(distAssets, file));
  const gz = zlib.gzipSync(buf);
  const kb = gz.length / 1024;
  if (kb > MAX_GZIP_KB) errors.push(`${file}: ${kb.toFixed(1)} KB gzip > ${MAX_GZIP_KB} KB`);
}

if (errors.length) {
  console.error('JS budget failures:\n' + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`JS budget OK (${jsFiles.length} bundles, each <= ${MAX_GZIP_KB} KB gzip)`);
