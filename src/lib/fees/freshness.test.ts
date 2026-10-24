import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FEE_MAX_AGE_DAYS,
  allRates,
  processors,
  feeChangelog,
  FEE_DATA_UPDATED,
} from '@/data/fees';
import { formatSchedule } from './format';

const ROOT = join(import.meta.dirname, '../../..');

function daysBetween(isoDate: string, now = new Date()): number {
  const then = new Date(`${isoDate}T00:00:00Z`);
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === 'dist' || name === '.git' || name === 'docs') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.(ts|astro|mjs|js|md)$/.test(name)) out.push(p);
  }
  return out;
}

describe('fee data integrity', () => {
  it('has unique rate ids across processors', () => {
    const ids = allRates().map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every processor defaultRateId exists', () => {
    for (const p of processors) {
      expect(p.rates.some((r) => r.id === p.defaultRateId)).toBe(true);
    }
  });

  it('every rate has sourceUrl, currency, and lastVerified', () => {
    for (const r of allRates()) {
      expect(r.sourceUrl.startsWith('http')).toBe(true);
      expect(r.currency.length).toBeGreaterThanOrEqual(3);
      expect(r.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(r.percent).toBeGreaterThanOrEqual(0);
      expect(r.percent).toBeLessThan(1);
      expect(r.fixed).toBeGreaterThanOrEqual(0);
    }
  });

  it(`verified/estimated rates are fresher than ${FEE_MAX_AGE_DAYS} days`, () => {
    const stale: string[] = [];
    for (const r of allRates()) {
      const status = r.verificationStatus ?? 'verified';
      const maxAge = status === 'unverified' ? FEE_MAX_AGE_DAYS + 30 : FEE_MAX_AGE_DAYS;
      const age = daysBetween(r.lastVerified);
      if (age > maxAge) {
        stale.push(`${r.id} lastVerified=${r.lastVerified} age=${age}d status=${status}`);
      }
    }
    expect(stale, stale.join('\n')).toEqual([]);
  });

  it('fee changelog exists and matches FEE_DATA_UPDATED head entry', () => {
    expect(feeChangelog.length).toBeGreaterThan(0);
    expect(feeChangelog[0]?.date).toBe(FEE_DATA_UPDATED);
  });
});

describe('no hardcoded duplicate fee schedules outside fees.ts', () => {
  const allowPath = [
    'src/data/fees.ts',
    'scripts/rate-watcher/',
    'src/lib/fees/freshness.test.ts',
    'src/lib/fees/calculate.test.ts',
    'docs/FEE-UPDATE.md',
    'docs/rate-watcher/',
  ];

  function canon(s: string): string {
    return s
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/30¢/g, '$0.30')
      .replace(/15¢/g, '$0.15')
      .replace(/10¢/g, '$0.10')
      .replace(/25p/g, '£0.25')
      .replace(/20p/g, '£0.20')
      .replace(/\+(\d)(?!\.)/g, '+$$$1') // "3.3% + 30" → treat cents shorthand separately
      .replace(/\+\$?(0?\.\d+|30|15|10|25|20)$/g, (m) => {
        if (m.includes('.')) return m.startsWith('+$') || m.startsWith('+£') ? m : m.replace('+', '+$');
        // bare cents like +30 meaning $0.30
        const n = m.replace(/^\+\$?/, '');
        if (n === '30') return '+$0.30';
        if (n === '15') return '+$0.15';
        if (n === '10') return '+$0.10';
        return m;
      });
  }

  function scheduleKeys(r: { percent: number; fixed: number; currency: string }): string[] {
    const pct = `${parseFloat((r.percent * 100).toFixed(4))}%`;
    const keys = new Set<string>();
    keys.add(canon(formatSchedule(r as never)));
    if (r.fixed === 0) {
      keys.add(canon(pct));
      return [...keys];
    }
    const sym =
      r.currency === 'USD'
        ? '$'
        : r.currency === 'GBP'
          ? '£'
          : r.currency === 'AUD'
            ? 'A$'
            : r.currency === 'CAD'
              ? 'C$'
              : r.currency === 'EUR'
                ? '€'
                : '';
    keys.add(canon(`${pct} + ${sym}${r.fixed.toFixed(2)}`));
    keys.add(canon(`${pct}+${sym}${r.fixed.toFixed(2)}`));
    if (r.currency === 'USD' && (r.fixed === 0.3 || r.fixed === 0.15 || r.fixed === 0.1)) {
      keys.add(canon(`${pct} + ${Math.round(r.fixed * 100)}¢`));
      keys.add(canon(`${pct} + ${Math.round(r.fixed * 100)}`));
    }
    return [...keys];
  }

  const known = new Set(allRates().flatMap(scheduleKeys));

  /** Matches "2.9% + $0.30", "2.6% + 15¢", "3.49%+$0.49", "2.90% + A$0.30", "3.3% + 30" */
  const RATE_RE =
    /\d{1,2}(?:\.\d{1,4})%\s*\+\s*(?:A\$|C\$|£|€|\$)?\s*\d+(?:\.\d{1,2})?(?:¢|p)?/g;

  it('content files do not invent percent+fixed schedules absent from fees.ts', () => {
    const files = walk(join(ROOT, 'src')).concat(walk(join(ROOT, 'scripts')));
    const offenders: string[] = [];

    for (const file of files) {
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (allowPath.some((a) => rel === a || rel.startsWith(a))) continue;
      const text = readFileSync(file, 'utf8');
      const matches = text.match(RATE_RE) || [];
      for (const m of matches) {
        if (!known.has(canon(m))) offenders.push(`${rel}: "${m}"`);
      }
    }

    expect(offenders, offenders.join('\n')).toEqual([]);
  });

  it('does not present 3.49%+$0.49 as Goods & Services without naming Checkout', () => {
    const files = walk(join(ROOT, 'src'));
    const bad: string[] = [];
    for (const file of files) {
      const rel = relative(ROOT, file).replace(/\\/g, '/');
      if (rel === 'src/data/fees.ts' || rel.endsWith('freshness.test.ts')) continue;
      const text = readFileSync(file, 'utf8');
      const re =
        /Goods\s*&\s*Services(?![^.\n]{0,80}Checkout)[^.\n]{0,40}3\.49%\s*\+\s*\$0\.49|3\.49%\s*\+\s*\$0\.49(?![^.\n]{0,80}Checkout)[^.\n]{0,40}Goods\s*&\s*Services/gi;
      let m;
      while ((m = re.exec(text))) {
        bad.push(`${rel}: …${m[0].slice(0, 80)}…`);
      }
    }
    expect(bad, bad.join('\n')).toEqual([]);
  });
});
