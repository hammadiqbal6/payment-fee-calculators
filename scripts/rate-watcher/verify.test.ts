import { describe, expect, it } from 'vitest';
import {
  assertAutoMergeDiffAllowed,
  buildAutoVerifiedChangelogEntry,
  changeWithinBounds,
  evaluateAutoMergeEligibility,
  extractionsConsistent,
  isAllowedAutoMergePath,
  parseAutoMergeFlag,
  resolveAutoMergeBounds,
  verifyProposedChange,
} from './verify.mjs';

describe('resolveAutoMergeBounds', () => {
  it('uses documented defaults', () => {
    expect(resolveAutoMergeBounds({})).toEqual({
      maxPercentChangePoints: 1.5,
      maxFixedMultiplier: 2,
      maxFixedAbsoluteDelta: 1,
    });
  });

  it('allows overrides from extract-rules defaults', () => {
    expect(
      resolveAutoMergeBounds({
        maxPercentChangePoints: 0.5,
        maxFixedMultiplier: 3,
        maxFixedAbsoluteDelta: 0.25,
      }),
    ).toEqual({
      maxPercentChangePoints: 0.5,
      maxFixedMultiplier: 3,
      maxFixedAbsoluteDelta: 0.25,
    });
  });
});

describe('changeWithinBounds', () => {
  it('accepts small percent and fixed moves', () => {
    const r = changeWithinBounds(
      { percent: 0.029, fixed: 0.3 },
      { percent: 0.034, fixed: 0.3 },
    );
    expect(r.ok).toBe(true);
  });

  it('rejects percent jumps above 1.5 pp', () => {
    const r = changeWithinBounds(
      { percent: 0.029, fixed: 0.3 },
      { percent: 0.05, fixed: 0.3 },
    );
    expect(r.ok).toBe(false);
    expect(r.reasons[0]).toMatch(/percent change/);
  });

  it('accepts fixed change within absolute +1', () => {
    const r = changeWithinBounds(
      { percent: 0.029, fixed: 0.3 },
      { percent: 0.029, fixed: 1.2 },
    );
    expect(r.ok).toBe(true);
  });

  it('accepts fixed doubling even when absolute delta > 1', () => {
    const r = changeWithinBounds(
      { percent: 0.029, fixed: 2 },
      { percent: 0.029, fixed: 4 },
    );
    expect(r.ok).toBe(true);
  });

  it('rejects fixed jumps beyond 2× and ±1', () => {
    const r = changeWithinBounds(
      { percent: 0.029, fixed: 0.3 },
      { percent: 0.029, fixed: 2 },
    );
    expect(r.ok).toBe(false);
    expect(r.reasons[0]).toMatch(/fixed/);
  });

  it('treats 0 → large fixed as out of bounds', () => {
    const r = changeWithinBounds({ percent: 0.029, fixed: 0 }, { percent: 0.029, fixed: 5 });
    expect(r.ok).toBe(false);
  });

  it('allows 0 → small fixed within absolute delta', () => {
    const r = changeWithinBounds({ percent: 0.029, fixed: 0 }, { percent: 0.029, fixed: 0.49 });
    expect(r.ok).toBe(true);
  });
});

describe('extractionsConsistent', () => {
  it('requires at least one sample', () => {
    expect(extractionsConsistent([]).ok).toBe(false);
  });

  it('passes when all samples match', () => {
    expect(
      extractionsConsistent([
        { percent: 0.029, fixed: 0.3 },
        { percent: 0.029, fixed: 0.3 },
      ]).ok,
    ).toBe(true);
  });

  it('fails when a sample disagrees', () => {
    const r = extractionsConsistent([
      { percent: 0.029, fixed: 0.3 },
      { percent: 0.039, fixed: 0.3 },
    ]);
    expect(r.ok).toBe(false);
  });
});

describe('verifyProposedChange', () => {
  const base = {
    rateId: 'stripe-us',
    status: 'drift' as const,
    before: { percent: 0.029, fixed: 0.3 },
    after: { percent: 0.031, fixed: 0.3 },
    consistencySamples: [{ percent: 0.031, fixed: 0.3 }],
    sourceUrl: 'https://stripe.com/pricing',
  };

  it('passes a clean consistent in-bounds drift', () => {
    expect(verifyProposedChange(base).ok).toBe(true);
  });

  it('rejects platformOnly / blended', () => {
    expect(verifyProposedChange({ ...base, skipFeesPatch: true }).ok).toBe(false);
    expect(verifyProposedChange({ ...base, platformOnly: true }).ok).toBe(false);
  });

  it('rejects fetch errors and unverified', () => {
    expect(
      verifyProposedChange({ rateId: 'x', status: 'fetch_error', message: 'HTTP 500' }).ok,
    ).toBe(false);
    expect(verifyProposedChange({ rateId: 'x', status: 'unverified' }).ok).toBe(false);
  });

  it('rejects inconsistent second-fetch samples', () => {
    const r = verifyProposedChange({
      ...base,
      consistencySamples: [{ percent: 0.04, fixed: 0.3 }],
    });
    expect(r.ok).toBe(false);
    expect(r.reasons.join(' ')).toMatch(/inconsistent/);
  });

  it('rejects out-of-bounds moves', () => {
    const r = verifyProposedChange({
      ...base,
      after: { percent: 0.06, fixed: 0.3 },
      consistencySamples: [{ percent: 0.06, fixed: 0.3 }],
    });
    expect(r.ok).toBe(false);
  });
});

describe('evaluateAutoMergeEligibility', () => {
  it('is eligible when every patchable drift verifies and nothing else is wrong', () => {
    const r = evaluateAutoMergeEligibility([
      {
        rateId: 'a',
        status: 'ok',
      },
      {
        rateId: 'b',
        status: 'drift',
        before: { percent: 0.029, fixed: 0.3 },
        after: { percent: 0.03, fixed: 0.3 },
        consistencySamples: [{ percent: 0.03, fixed: 0.3 }],
      },
    ]);
    expect(r.eligible).toBe(true);
    expect(r.reasons).toEqual([]);
  });

  it('blocks when any change fails verification', () => {
    const r = evaluateAutoMergeEligibility([
      {
        rateId: 'b',
        status: 'drift',
        before: { percent: 0.029, fixed: 0.3 },
        after: { percent: 0.08, fixed: 0.3 },
        consistencySamples: [{ percent: 0.08, fixed: 0.3 }],
      },
    ]);
    expect(r.eligible).toBe(false);
    expect(r.reasons.length).toBeGreaterThan(0);
  });

  it('blocks on fetch errors even if another drift looks fine', () => {
    const r = evaluateAutoMergeEligibility([
      {
        rateId: 'b',
        status: 'drift',
        before: { percent: 0.029, fixed: 0.3 },
        after: { percent: 0.03, fixed: 0.3 },
        consistencySamples: [{ percent: 0.03, fixed: 0.3 }],
      },
      { rateId: 'c', status: 'fetch_error', message: 'timeout' },
    ]);
    expect(r.eligible).toBe(false);
    expect(r.reasons.join(' ')).toMatch(/timeout/);
  });

  it('blocks platform-only drifts', () => {
    const r = evaluateAutoMergeEligibility([
      {
        rateId: 'patreon-standard',
        status: 'drift',
        skipFeesPatch: true,
        before: { percent: 0.1, fixed: 0 },
        after: { percent: 0.12, fixed: 0 },
      },
    ]);
    expect(r.eligible).toBe(false);
  });

  it('is not eligible with no patchable changes', () => {
    expect(evaluateAutoMergeEligibility([{ rateId: 'a', status: 'ok' }]).eligible).toBe(false);
  });
});

describe('auto-merge path allowlist', () => {
  it('allows fees.ts and rate-watcher reports only', () => {
    expect(isAllowedAutoMergePath('src/data/fees.ts')).toBe(true);
    expect(isAllowedAutoMergePath('docs/rate-watcher/latest-report.md')).toBe(true);
    expect(isAllowedAutoMergePath('src/data/guides.ts')).toBe(false);
  });

  it('assertAutoMergeDiffAllowed reports blocked paths', () => {
    const r = assertAutoMergeDiffAllowed([
      'src/data/fees.ts',
      'docs/rate-watcher/report.md',
      'package.json',
    ]);
    expect(r.ok).toBe(false);
    expect(r.blocked).toEqual(['package.json']);
  });
});

describe('parseAutoMergeFlag', () => {
  it('defaults to true when unset', () => {
    expect(parseAutoMergeFlag(undefined)).toBe(true);
    expect(parseAutoMergeFlag('')).toBe(true);
  });

  it('parses common truthy/falsy strings', () => {
    expect(parseAutoMergeFlag('false')).toBe(false);
    expect(parseAutoMergeFlag('0')).toBe(false);
    expect(parseAutoMergeFlag('true')).toBe(true);
  });
});

describe('buildAutoVerifiedChangelogEntry', () => {
  it('notes auto-verified with old → new and source', () => {
    const entry = buildAutoVerifiedChangelogEntry('2026-11-07', [
      {
        rateId: 'stripe-us',
        before: { percent: 0.029, fixed: 0.3 },
        after: { percent: 0.031, fixed: 0.3 },
        sourceUrl: 'https://stripe.com/pricing',
      },
    ]);
    expect(entry.summary).toMatch(/Auto-verified by rate watcher/);
    expect(entry.changes[0]?.before).toMatch(/2\.9/);
    expect(entry.changes[0]?.after).toMatch(/3\.1/);
    expect(entry.changes[0]?.sourceUrl).toBe('https://stripe.com/pricing');
  });
});
