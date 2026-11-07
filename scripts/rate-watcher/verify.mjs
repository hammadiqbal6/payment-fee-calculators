/**
 * Pure verification / bounds helpers for the fee rate watcher auto-merge gate.
 * Kept free of I/O so unit tests can exercise every path.
 */

/** @typedef {{ percent: number, fixed: number }} FeePair */
/** @typedef {{
 *   maxPercentChangePoints?: number,
 *   maxFixedMultiplier?: number,
 *   maxFixedAbsoluteDelta?: number,
 * }} AutoMergeBounds */

export const DEFAULT_AUTO_MERGE_BOUNDS = {
  maxPercentChangePoints: 1.5,
  maxFixedMultiplier: 2,
  maxFixedAbsoluteDelta: 1,
};

/**
 * @param {Partial<AutoMergeBounds> | null | undefined} defaults
 * @returns {Required<AutoMergeBounds>}
 */
export function resolveAutoMergeBounds(defaults) {
  return {
    maxPercentChangePoints:
      defaults?.maxPercentChangePoints ?? DEFAULT_AUTO_MERGE_BOUNDS.maxPercentChangePoints,
    maxFixedMultiplier:
      defaults?.maxFixedMultiplier ?? DEFAULT_AUTO_MERGE_BOUNDS.maxFixedMultiplier,
    maxFixedAbsoluteDelta:
      defaults?.maxFixedAbsoluteDelta ?? DEFAULT_AUTO_MERGE_BOUNDS.maxFixedAbsoluteDelta,
  };
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} [eps]
 */
export function nearlyEqual(a, b, eps = 0.00015) {
  return Math.abs(a - b) <= eps;
}

/**
 * Percent change must stay within maxPercentChangePoints (e.g. 1.5 → 1.5 pp).
 * Fixed fee must stay within 2× (ratio) OR absolute ±maxFixedAbsoluteDelta.
 *
 * @param {FeePair} before
 * @param {FeePair} after
 * @param {Partial<AutoMergeBounds>} [bounds]
 */
export function changeWithinBounds(before, after, bounds = {}) {
  const b = resolveAutoMergeBounds(bounds);
  const reasons = [];

  const percentDeltaPoints = Math.abs(after.percent - before.percent) * 100;
  if (percentDeltaPoints > b.maxPercentChangePoints + 1e-9) {
    reasons.push(
      `percent change ${percentDeltaPoints.toFixed(4)} pp exceeds max ${b.maxPercentChangePoints} pp`,
    );
  }

  const fixedDelta = Math.abs(after.fixed - before.fixed);
  const absOk = fixedDelta <= b.maxFixedAbsoluteDelta + 1e-9;
  let ratioOk = false;
  if (before.fixed === 0) {
    // 0 → small absolute only (covered by absOk); treat any larger jump as out of bounds.
    ratioOk = after.fixed === 0;
  } else {
    const ratio = after.fixed / before.fixed;
    ratioOk = ratio <= b.maxFixedMultiplier + 1e-9 && ratio >= 1 / b.maxFixedMultiplier - 1e-9;
  }

  if (!absOk && !ratioOk) {
    reasons.push(
      `fixed ${before.fixed} → ${after.fixed} exceeds ${b.maxFixedMultiplier}× and ±${b.maxFixedAbsoluteDelta}`,
    );
  }

  return { ok: reasons.length === 0, reasons, percentDeltaPoints, fixedDelta };
}

/**
 * True when every extracted sample agrees on percent + fixed.
 * @param {FeePair[]} samples
 */
export function extractionsConsistent(samples) {
  if (!Array.isArray(samples) || samples.length === 0) {
    return { ok: false, reasons: ['no extraction samples to compare'] };
  }
  const first = samples[0];
  for (let i = 1; i < samples.length; i++) {
    const s = samples[i];
    if (!nearlyEqual(s.percent, first.percent) || !nearlyEqual(s.fixed, first.fixed)) {
      return {
        ok: false,
        reasons: [
          `inconsistent extracted values: ${formatPair(first)} vs ${formatPair(s)} (sample ${i})`,
        ],
      };
    }
  }
  return { ok: true, reasons: [] };
}

function formatPair(p) {
  return `${(p.percent * 100).toFixed(4)}% + ${p.fixed}`;
}

/**
 * Paths allowed in an auto-merge commit relative to repo root.
 * @param {string} filePath
 */
export function isAllowedAutoMergePath(filePath) {
  const normalized = String(filePath).replace(/\\/g, '/').replace(/^\.\//, '');
  if (normalized === 'src/data/fees.ts') return true;
  if (normalized.startsWith('docs/rate-watcher/')) return true;
  return false;
}

/**
 * @param {string[]} changedFiles
 */
export function assertAutoMergeDiffAllowed(changedFiles) {
  const blocked = (changedFiles || []).filter((f) => !isAllowedAutoMergePath(f));
  return {
    ok: blocked.length === 0,
    blocked,
    reasons: blocked.length
      ? [`diff includes non-allowlisted paths: ${blocked.join(', ')}`]
      : [],
  };
}

/**
 * Parse AUTO_MERGE env / CLI. Default true when unset.
 * @param {string | undefined | null} value
 * @param {boolean} [fallback=true]
 */
export function parseAutoMergeFlag(value, fallback = true) {
  if (value == null || value === '') return fallback;
  const v = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(v)) return true;
  if (['0', 'false', 'no', 'off'].includes(v)) return false;
  return fallback;
}

/**
 * Decide whether a single proposed (patchable) drift is safe to auto-merge.
 *
 * @param {object} change
 * @param {'drift'|'ok'|'fetch_error'|'error'|'unverified'} change.status
 * @param {boolean} [change.skipFeesPatch]
 * @param {boolean} [change.platformOnly]
 * @param {FeePair} [change.before]
 * @param {FeePair} [change.after]
 * @param {FeePair[]} [change.consistencySamples] second fetch / multi-pattern samples
 * @param {string} [change.message]
 * @param {Partial<AutoMergeBounds>} [bounds]
 */
export function verifyProposedChange(change, bounds = {}) {
  const rateId = change.rateId || '(unknown)';
  const fail = (reasons) => ({
    rateId,
    ok: false,
    reasons: reasons.map((r) => `${rateId}: ${r}`),
  });

  if (change.skipFeesPatch || change.platformOnly || change.compareMode === 'platformOnly') {
    return fail(['platformOnly/blended change is never auto-merged']);
  }

  if (change.status === 'fetch_error' || change.status === 'error') {
    return fail([change.message || 'fetch/parse error']);
  }

  if (change.status === 'unverified') {
    return fail([change.message || 'unverified / unparseable']);
  }

  if (change.status !== 'drift') {
    return fail([`expected patchable drift, got status=${change.status}`]);
  }

  if (!change.before || !change.after) {
    return fail(['missing before/after values']);
  }

  const samples = Array.isArray(change.consistencySamples) ? change.consistencySamples : [];
  // Always include the primary after value so a single second-fetch sample still compares.
  const consistency = extractionsConsistent([{ ...change.after }, ...samples]);
  if (!consistency.ok) {
    return fail(consistency.reasons);
  }

  const boundsCheck = changeWithinBounds(change.before, change.after, bounds);
  if (!boundsCheck.ok) {
    return fail(boundsCheck.reasons);
  }

  return { rateId, ok: true, reasons: [] };
}

/**
 * Run-level gate: every patchable proposed change must verify; any error /
 * platform-only drift / failed verification blocks auto-merge.
 *
 * @param {object[]} results full watcher results
 * @param {Partial<AutoMergeBounds>} [bounds]
 */
export function evaluateAutoMergeEligibility(results, bounds = {}) {
  const list = results || [];
  const patchable = list.filter((r) => r.status === 'drift' && !r.skipFeesPatch);
  const platformDrifts = list.filter((r) => r.status === 'drift' && r.skipFeesPatch);
  const errors = list.filter((r) => r.status === 'fetch_error' || r.status === 'error');

  /** @type {string[]} */
  const reasons = [];

  if (patchable.length === 0) {
    reasons.push('no patchable rate changes to merge');
  }

  if (errors.length) {
    for (const e of errors) {
      reasons.push(`${e.rateId}: ${e.message || e.status}`);
    }
  }

  if (platformDrifts.length) {
    for (const d of platformDrifts) {
      reasons.push(
        `${d.rateId}: platformOnly/blended drift needs human review (fees.ts not auto-patched)`,
      );
    }
  }

  const verifications = patchable.map((d) => verifyProposedChange(d, bounds));
  for (const v of verifications) {
    if (!v.ok) reasons.push(...v.reasons);
  }

  return {
    eligible: reasons.length === 0 && patchable.length > 0,
    reasons,
    patchable,
    verifications,
  };
}

/**
 * Build a feeChangelog entry for auto-verified merges.
 * @param {string} date ISO date
 * @param {object[]} patchableDrifts
 */
export function buildAutoVerifiedChangelogEntry(date, patchableDrifts) {
  const changes = [];
  for (const d of patchableDrifts) {
    const before = `${formatPct(d.before.percent)} + ${d.before.fixed}`;
    const after = `${formatPct(d.after.percent)} + ${d.after.fixed}`;
    const percentChanged = !nearlyEqual(d.before.percent, d.after.percent);
    const fixedChanged = !nearlyEqual(d.before.fixed, d.after.fixed);
    if (percentChanged) {
      changes.push({
        rateId: d.rateId,
        field: 'percent',
        before,
        after,
        sourceUrl: d.sourceUrl,
      });
    }
    if (fixedChanged && !percentChanged) {
      changes.push({
        rateId: d.rateId,
        field: 'fixed',
        before,
        after,
        sourceUrl: d.sourceUrl,
      });
    } else if (fixedChanged && percentChanged) {
      // percent row already carries both; add fixed only when percent unchanged above.
    } else if (!percentChanged && !fixedChanged) {
      changes.push({
        rateId: d.rateId,
        field: 'percent',
        before,
        after,
        sourceUrl: d.sourceUrl,
      });
    }
  }

  const ids = patchableDrifts.map((d) => d.rateId).join(', ');
  return {
    date,
    summary: `Auto-verified by rate watcher: ${ids}`,
    changes,
  };
}

function formatPct(p) {
  return `${parseFloat((p * 100).toFixed(4))}%`;
}

/**
 * Serialize a FeeChangelogEntry into a TypeScript object literal for fees.ts insertion.
 * @param {ReturnType<typeof buildAutoVerifiedChangelogEntry>} entry
 */
export function formatChangelogEntryTs(entry) {
  const changeLines = entry.changes
    .map((c) => {
      const parts = [
        `        rateId: '${c.rateId}'`,
        `        field: '${c.field}'`,
        c.before != null ? `        before: ${JSON.stringify(c.before)}` : null,
        c.after != null ? `        after: ${JSON.stringify(c.after)}` : null,
        c.sourceUrl != null ? `        sourceUrl: ${JSON.stringify(c.sourceUrl)}` : null,
      ].filter(Boolean);
      return `      {\n${parts.join(',\n')},\n      }`;
    })
    .join(',\n');

  return `  {
    date: '${entry.date}',
    summary:
      ${JSON.stringify(entry.summary)},
    changes: [
${changeLines}
    ],
  }`;
}
