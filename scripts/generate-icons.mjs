/**
 * Rasterize favicon.svg into apple-touch-icon + PWA PNGs via Playwright.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('.');
const svg = fs.readFileSync(path.join(root, 'public/favicon.svg'), 'utf8');
const sizes = [
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
];

const browser = await chromium.launch();
const page = await browser.newPage();

for (const { file, size } of sizes) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<!doctype html><html><head><style>
      html,body{margin:0;width:${size}px;height:${size}px;background:#0b3d2e}
      svg{width:${size}px;height:${size}px;display:block}
    </style></head><body>${svg}</body></html>`,
    { waitUntil: 'load' },
  );
  await page.locator('svg').screenshot({
    path: path.join(root, 'public', file),
    omitBackground: false,
  });
  console.log('wrote', file, size);
}

await browser.close();
