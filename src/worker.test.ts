import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/** Same rule as src/worker.ts — static files must not get trailing-slash redirects. */
const FILE_EXT = /\.[a-zA-Z0-9]{1,16}$/;

describe('worker FILE_EXT', () => {
  it('treats .webmanifest and common static files as files', () => {
    expect(FILE_EXT.test('/site.webmanifest')).toBe(true);
    expect(FILE_EXT.test('/favicon.ico')).toBe(true);
    expect(FILE_EXT.test('/og-default.png')).toBe(true);
    expect(FILE_EXT.test('/cded36863aa6be8ac5bf690ab6889910.txt')).toBe(true);
  });

  it('does not treat HTML routes as files', () => {
    expect(FILE_EXT.test('/about')).toBe(false);
    expect(FILE_EXT.test('/tools/stripe-fee-calculator')).toBe(false);
    expect(FILE_EXT.test('/guides/how-to-price-after-fees')).toBe(false);
  });

  it('source uses {1,16} so extensions longer than 8 chars work', () => {
    const src = fs.readFileSync(path.resolve('src/worker.ts'), 'utf8');
    expect(src).toMatch(/\[a-zA-Z0-9\]\{1,16\}/);
  });
});
