#!/usr/bin/env node
/**
 * Weekly fee rate watcher (GitHub Actions).
 * Fetches official pricing pages, compares to src/data/fees.ts, and opens/updates
 * a single PR with proposed changes. Auto-merges only when every proposed change
 * is verified (clean parse, consistent extraction, within bounds) and local gates pass.
 *
 * Usage:
 *   node scripts/rate-watcher/watch.mjs [--dry-run] [--json] [--no-auto-merge]
 *
 * Env:
 *   AUTO_MERGE=true|false  (default true; workflow_dispatch can override)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import {
  assertAutoMergeDiffAllowed,
  buildAutoVerifiedChangelogEntry,
  evaluateAutoMergeEligibility,
  formatChangelogEntryTs,
  nearlyEqual,
  parseAutoMergeFlag,
  resolveAutoMergeBounds,
} from './verify.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const dryRun = process.argv.includes('--dry-run');
const asJson = process.argv.includes('--json');
const autoMergeCliOff = process.argv.includes('--no-auto-merge');
const autoMergeEnabled =
  !autoMergeCliOff && parseAutoMergeFlag(process.env.AUTO_MERGE, true);
const today = new Date().toISOString().slice(0, 10);

const rulesDoc = JSON.parse(readFileSync(join(__dirname, 'extract-rules.json'), 'utf8'));
const autoMergeBounds = resolveAutoMergeBounds(rulesDoc.defaults?.autoMerge);
const feesPath = join(root, 'src/data/fees.ts');
const feesSource = readFileSync(feesPath, 'utf8');
const outDir = join(root, 'docs/rate-watcher');
const NEEDS_REVIEW_LABEL = 'needs human review';

function loadRatesFromFeesTs(src) {
  const better = [];
  const objRe =
    /\{\s*id:\s*'([^']+)',\s*label:\s*'((?:\\'|[^'])*)',[\s\S]*?percent:\s*([0-9.]+),\s*fixed:\s*([0-9.]+),\s*currency:\s*'([^']+)',[\s\S]*?sourceUrl:\s*'([^']+)',\s*lastVerified:\s*'([^']+)',\s*(?:verificationStatus:\s*'([^']+)',)?/g;
  let om;
  while ((om = objRe.exec(src))) {
    better.push({
      id: om[1],
      label: om[2].replace(/\\'/g, "'"),
      percent: Number(om[3]),
      fixed: Number(om[4]),
      currency: om[5],
      sourceUrl: om[6],
      lastVerified: om[7],
      verificationStatus: om[8] || 'verified',
    });
  }
  return better;
}

const rates = loadRatesFromFeesTs(feesSource);
const rateById = Object.fromEntries(rates.map((r) => [r.id, r]));
const htmlCache = new Map();
/** @type {Record<string, { percent: number, fixed: number }>} */
const extractedById = {};

function patternList(ex) {
  if (Array.isArray(ex.patterns) && ex.patterns.length) return ex.patterns;
  if (typeof ex.pattern === 'string') return [ex.pattern];
  return [];
}

function cacheKey(url, strategy) {
  return `${strategy}:${url}`;
}

function bustFetchCache(url, strategy) {
  htmlCache.delete(cacheKey(url, strategy || 'fetch'));
}

async function fetchText(url, strategy, rule = {}) {
  const key = cacheKey(url, strategy);
  if (htmlCache.has(key)) return htmlCache.get(key);

  if (strategy === 'playwright') {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        userAgent: rulesDoc.defaults.userAgent,
        locale: 'en-US',
        extraHTTPHeaders: {
          'Accept-Language': rulesDoc.defaults.acceptLanguage || 'en-US,en;q=0.9',
        },
      });
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: rulesDoc.defaults.timeoutMs,
      });

      // Soft settle for SPA pricing tables; never fail the fetch solely on networkidle.
      await Promise.race([
        page.waitForLoadState('networkidle').catch(() => {}),
        page.waitForTimeout(3000),
      ]);

      if (rule.waitForText) {
        // Match against full innerText so multi-node copy still counts.
        await page
          .waitForFunction(
            (reSource) => new RegExp(reSource, 'i').test(document.body?.innerText || ''),
            rule.waitForText,
            { timeout: rule.waitForTimeoutMs || 20000 },
          )
          .catch(() => {});
      }

      // Trigger lazy sections that only paint after scroll.
      await page.evaluate(async () => {
        const step = Math.max(300, Math.floor(window.innerHeight * 0.8));
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 150));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(800);

      const text = await page.evaluate(() => document.body?.innerText || '');
      const html = await page.content();
      const combined = `${text}\n${html}`;
      htmlCache.set(key, combined);
      return combined;
    } finally {
      await browser.close();
    }
  }

  const res = await fetch(url, {
    headers: {
      'user-agent': rulesDoc.defaults.userAgent,
      accept: 'text/html',
      'accept-language': rulesDoc.defaults.acceptLanguage || 'en-US,en;q=0.9',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(rulesDoc.defaults.timeoutMs),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const text = await res.text();
  htmlCache.set(key, text);
  return text;
}

function firstRegexMatch(body, patterns, occurrence = 0) {
  const tried = [];
  for (const pattern of patterns) {
    tried.push(pattern);
    const matches = [...body.matchAll(new RegExp(pattern, 'gi'))];
    if (!matches.length) continue;
    const m = matches[occurrence] || matches[0];
    if (m) return { match: m, pattern, tried };
  }
  return { match: null, pattern: null, tried };
}

/**
 * Extract percent/fixed for one pattern string (or literal / platform modes handled in applyExtract).
 */
function extractFromMatch(rule, body, match) {
  const ex = rule.extract;
  let percent = ex.percentGroup != null ? Number(match[ex.percentGroup]) / 100 : Number(ex.percent);
  if (ex.combineWithRateId) {
    const base =
      extractedById[ex.combineWithRateId]?.percent ?? rateById[ex.combineWithRateId]?.percent;
    if (base == null) throw new Error(`missing base rate ${ex.combineWithRateId}`);
    percent = base + percent;
  }
  let fixed = ex.fixed ?? rule.fixedFallback ?? 0;
  if (ex.fixedFromCurrencyTable) {
    const cur = ex.fixedFromCurrencyTable.currency;
    const label = ex.fixedFromCurrencyTable.label;
    const fixedRe = new RegExp(`${label}[^0-9]*([0-9]+\\.[0-9]+)\\s*${cur}`, 'i');
    const fm = body.match(fixedRe);
    if (fm) fixed = Number(fm[1]);
    else if (rule.fixedFallback != null) fixed = rule.fixedFallback;
  }
  if (!Number.isFinite(percent)) throw new Error(`bad percent from ${rule.rateId}`);
  return { percent, fixed, raw: match[0] };
}

/**
 * Collect values from every pattern that matches (for consistency checks).
 */
function extractAllPatternSamples(rule, body) {
  const ex = rule.extract;
  const patterns = patternList(ex);
  const samples = [];
  for (const pattern of patterns) {
    const matches = [...body.matchAll(new RegExp(pattern, 'gi'))];
    if (!matches.length) continue;
    const m = matches[ex.occurrence ?? 0] || matches[0];
    if (!m) continue;
    samples.push(extractFromMatch(rule, body, m));
  }
  return samples;
}

function applyExtract(rule, body) {
  const ex = rule.extract;
  if (!ex) throw new Error('missing extract');

  if (typeof ex.percent === 'number') {
    const patterns = patternList(ex);
    if (patterns.length) {
      const { match, tried } = firstRegexMatch(body, patterns);
      if (!match) throw new Error(`pattern not found: ${tried.join(' | ')}`);
    }
    return {
      percent: ex.percent,
      fixed: ex.fixed ?? 0,
      raw: 'literal',
      patternSamples: [{ percent: ex.percent, fixed: ex.fixed ?? 0 }],
    };
  }

  if (rule.compareMode === 'platformOnly' && (ex.platformPercent != null || ex.platformPercentGroup != null)) {
    const patterns = patternList(ex);
    if (!patterns.length) throw new Error('platformOnly rule missing pattern(s)');
    const { match, tried } = firstRegexMatch(body, patterns);
    if (!match) throw new Error(`platform pattern not found: ${tried.join(' | ')}`);

    let percent = ex.platformPercent;
    if (ex.platformPercentGroup != null) {
      percent = Number(match[ex.platformPercentGroup]) / 100;
      if (!Number.isFinite(percent)) throw new Error(`bad platform percent from ${rule.rateId}`);
    }
    if (percent == null || !Number.isFinite(percent)) {
      throw new Error(`platformOnly rule ${rule.rateId} has no platform percent`);
    }

    return {
      percent,
      fixed: 0,
      raw: match[0],
      platformOnly: true,
      expectedPlatformPercent: ex.platformPercent ?? percent,
      patternSamples: [{ percent, fixed: 0 }],
    };
  }

  const patterns = patternList(ex);
  if (!patterns.length) throw new Error('missing extract pattern(s)');
  const patternSamples = extractAllPatternSamples(rule, body);
  if (!patternSamples.length) {
    throw new Error(`pattern not found: ${patterns.join(' | ')}`);
  }

  // Primary value: first matching pattern (stable with historical behavior).
  const primary = patternSamples[0];
  return { ...primary, patternSamples };
}

function writeDebugSnippet(rateId, body, message) {
  try {
    mkdirSync(outDir, { recursive: true });
    const snippet = (body || '').slice(0, 12000);
    writeFileSync(
      join(outDir, `debug-${rateId}.txt`),
      `error: ${message}\nurl context saved ${today}\n\n--- body head ---\n${snippet}\n`,
    );
  } catch {
    /* ignore debug IO errors */
  }
}

async function checkRule(rule) {
  const stored = rateById[rule.rateId];
  if (!stored) {
    return { rateId: rule.rateId, status: 'error', message: `rate ${rule.rateId} missing from fees.ts` };
  }
  if (rule.expectUnverified) {
    return {
      rateId: rule.rateId,
      status: 'unverified',
      message: rule.note || 'Expected unverified — skipped auto-update',
      sourceUrl: rule.sourceUrl,
      stored,
    };
  }

  let body = '';
  try {
    const strategy = rule.strategy || 'fetch';
    body = await fetchText(rule.sourceUrl, strategy, rule);
    const extracted = applyExtract(rule, body);
    extractedById[rule.rateId] = extracted;

    if (extracted.platformOnly) {
      const expected = extracted.expectedPlatformPercent;
      if (expected != null && !nearlyEqual(extracted.percent, expected)) {
        return {
          rateId: rule.rateId,
          status: 'drift',
          message: `Platform fee changed (expected ${(expected * 100).toFixed(2)}%, found ${(extracted.percent * 100).toFixed(2)}%); blended schedule not auto-updated`,
          sourceUrl: rule.sourceUrl,
          stored,
          extracted,
          before: { percent: expected, fixed: 0 },
          after: { percent: extracted.percent, fixed: 0 },
          skipFeesPatch: true,
          platformOnly: true,
        };
      }
      return {
        rateId: rule.rateId,
        status: 'ok',
        message: `Platform fee pattern confirmed (${(extracted.percent * 100).toFixed(2)}%); blended schedule not auto-updated`,
        sourceUrl: rule.sourceUrl,
        stored,
        extracted,
      };
    }

    const percentDiff = !nearlyEqual(extracted.percent, stored.percent);
    const fixedDiff = !nearlyEqual(extracted.fixed, stored.fixed);
    if (percentDiff || fixedDiff) {
      // Consistency: all matching patterns must agree; re-fetch and compare.
      const patternSamples = (extracted.patternSamples || []).map((s) => ({
        percent: s.percent,
        fixed: s.fixed,
      }));
      bustFetchCache(rule.sourceUrl, strategy);
      const body2 = await fetchText(rule.sourceUrl, strategy, rule);
      const extracted2 = applyExtract(rule, body2);
      const consistencySamples = [
        ...patternSamples.slice(1),
        { percent: extracted2.percent, fixed: extracted2.fixed },
      ];

      return {
        rateId: rule.rateId,
        status: 'drift',
        sourceUrl: rule.sourceUrl,
        stored,
        extracted,
        before: { percent: stored.percent, fixed: stored.fixed },
        after: { percent: extracted.percent, fixed: extracted.fixed },
        consistencySamples,
      };
    }
    return { rateId: rule.rateId, status: 'ok', sourceUrl: rule.sourceUrl, stored, extracted };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    writeDebugSnippet(rule.rateId, body, message);
    return {
      rateId: rule.rateId,
      status: 'fetch_error',
      sourceUrl: rule.sourceUrl,
      stored,
      message,
    };
  }
}

function patchFeesTs(drifts, { includeChangelog = false } = {}) {
  let next = feesSource;
  for (const d of drifts) {
    if (d.status !== 'drift' || d.skipFeesPatch) continue;
    const blockRe = new RegExp(
      `(id:\\s*'${d.rateId}'[\\s\\S]*?percent:\\s*)([0-9.]+)([\\s\\S]*?fixed:\\s*)([0-9.]+)([\\s\\S]*?lastVerified:\\s*')([^']+)(')`,
    );
    if (!blockRe.test(next)) throw new Error(`Could not locate block for ${d.rateId} to patch`);
    next = next.replace(blockRe, `$1${d.after.percent}$3${d.after.fixed}$5${today}$7`);
  }
  next = next.replace(
    /export const FEE_DATA_VERSION = '[^']+'/,
    `export const FEE_DATA_VERSION = '${today.replace(/-/g, '.')}'`,
  );
  next = next.replace(/export const FEE_DATA_UPDATED = '[^']+'/, `export const FEE_DATA_UPDATED = '${today}'`);

  if (includeChangelog) {
    const entry = buildAutoVerifiedChangelogEntry(
      today,
      drifts.filter((d) => d.status === 'drift' && !d.skipFeesPatch),
    );
    const entryTs = formatChangelogEntryTs(entry);
    const marker = 'export const feeChangelog: FeeChangelogEntry[] = [';
    if (!next.includes(marker)) {
      throw new Error('Could not locate feeChangelog array to insert auto-verified entry');
    }
    next = next.replace(marker, `${marker}\n${entryTs},`);
  }

  return next;
}

function formatPct(p) {
  return `${parseFloat((p * 100).toFixed(4))}%`;
}

function buildReport(results, eligibility) {
  const drifts = results.filter((r) => r.status === 'drift');
  const errors = results.filter((r) => r.status === 'fetch_error' || r.status === 'error');
  const unverified = results.filter((r) => r.status === 'unverified');
  const ok = results.filter((r) => r.status === 'ok');
  const patchableDrifts = drifts.filter((d) => !d.skipFeesPatch);

  let md = `## Fee rate watcher report (${today})\n\n`;
  md += `Checked ${results.length} rules · ${ok.length} match · ${drifts.length} drift · ${errors.length} errors · ${unverified.length} flagged unverified\n\n`;

  if (eligibility) {
    if (eligibility.eligible) {
      md += `### Auto-merge\n\nEligible — all proposed changes verified (clean parse, consistent extraction, within bounds).\n\n`;
    } else {
      md += `### Needs human review\n\nAuto-merge blocked:\n\n`;
      for (const reason of eligibility.reasons) {
        md += `- ${reason}\n`;
      }
      md += '\n';
    }
  }

  if (drifts.length) {
    md += `### Proposed rate changes\n\n| Rate | Before | After | Source |\n|---|---|---|---|\n`;
    for (const d of drifts) {
      const note = d.skipFeesPatch ? ' (platform-only; fees.ts not auto-patched)' : '';
      md += `| \`${d.rateId}\`${note} | ${formatPct(d.before.percent)} + ${d.before.fixed} | ${formatPct(d.after.percent)} + ${d.after.fixed} | [link](${d.sourceUrl}) |\n`;
      if (d.message) md += `\n> ${d.message}\n`;
    }
    md += '\n';
  } else {
    md += `### Proposed rate changes\n\nNone — stored schedules match extracted values for parseable rules.\n\n`;
  }

  if (errors.length) {
    md += `### Fetch / parse failures (no guesses applied)\n\n`;
    for (const e of errors) {
      md += `- \`${e.rateId}\`: ${e.message} — [source](${e.sourceUrl || '#'})\n`;
    }
    md += '\n';
  }

  if (unverified.length) {
    md += `### Unverified (left unchanged)\n\n`;
    for (const u of unverified) {
      md += `- \`${u.rateId}\`: ${u.message}\n`;
    }
    md += '\n';
  }

  md +=
    '_Opened by the scheduled rate-watcher Action. Auto-merges only when every proposed change verifies and `npm ci` / `test` / `build` / `audit` pass on the patched tree. Fix layout changes in `scripts/rate-watcher/extract-rules.json`._\n';
  return { md, drifts, patchableDrifts, errors, unverified, ok, eligibility };
}

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', cwd: root, ...opts });
}

function shOk(cmd, args, opts = {}) {
  const r = sh(cmd, args, opts);
  if (r.status !== 0) {
    const detail = (r.stderr || r.stdout || '').trim();
    throw new Error(`${cmd} ${args.join(' ')} failed (${r.status}): ${detail.slice(0, 2000)}`);
  }
  return r;
}

function ensureNeedsReviewLabel() {
  const listed = sh('gh', ['label', 'list', '--json', 'name']);
  let names = [];
  try {
    names = (JSON.parse(listed.stdout || '[]') || []).map((l) => l.name);
  } catch {
    names = [];
  }
  if (!names.includes(NEEDS_REVIEW_LABEL)) {
    sh('gh', [
      'label',
      'create',
      NEEDS_REVIEW_LABEL,
      '--color',
      'D93F0B',
      '--description',
      'Rate watcher could not auto-verify; human review required',
    ]);
  }
}

function runMergeGates() {
  log('Running pre-merge gates: npm ci, test, build, audit');
  shOk('npm', ['ci'], { stdio: 'inherit' });
  shOk('npm', ['test'], { stdio: 'inherit' });
  shOk('npm', ['run', 'build'], { stdio: 'inherit' });
  shOk('npm', ['run', 'audit'], { stdio: 'inherit' });
}

function changedFilesVsMain() {
  const r = sh('git', ['diff', '--name-only', 'origin/main...HEAD']);
  if (r.status !== 0) throw new Error(r.stderr || 'git diff failed');
  return (r.stdout || '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function maybeOpenPr(report, patched, { willAutoMerge }) {
  const branch = `chore/fee-rate-watcher-${today}`;
  const title = `chore: fee rate updates ${today}`;

  if (dryRun) {
    if (willAutoMerge) {
      log('[dry-run] Would auto-merge after gates:', title);
      log('[dry-run] Patchable rates:', report.patchableDrifts.map((d) => d.rateId).join(', '));
    } else if (report.patchableDrifts.length || report.errors.length || report.drifts.length) {
      log('[dry-run] Would open/update PR (no auto-merge):', title);
      if (report.eligibility?.reasons?.length) {
        log('[dry-run] Needs human review because:');
        for (const reason of report.eligibility.reasons) log(`  - ${reason}`);
      }
    } else {
      log('[dry-run] No PR needed');
    }
    return { merged: false, dryRun: true };
  }

  if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
    console.warn('No GITHUB_TOKEN — writing local artifacts only');
    return { merged: false };
  }

  const hasDrift = report.patchableDrifts.length > 0;
  const hasPlatformDrift = report.drifts.some((d) => d.skipFeesPatch);
  const hasErrors = report.errors.length > 0;
  if (!hasDrift && !hasPlatformDrift && !hasErrors) {
    log('No drift and no errors — nothing to open');
    return { merged: false };
  }

  sh('git', ['fetch', 'origin', 'main']);
  const checkout = sh('git', ['checkout', '-B', branch, 'origin/main']);
  if (checkout.status !== 0) throw new Error(checkout.stderr || 'checkout failed');

  if (hasDrift && patched) writeFileSync(feesPath, patched);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `report-${today}.md`), report.md);
  writeFileSync(join(outDir, 'latest-report.md'), report.md);

  sh('git', ['config', 'user.name', 'fee-rate-watcher[bot]']);
  sh('git', ['config', 'user.email', 'fee-rate-watcher[bot]@users.noreply.github.com']);
  sh('git', ['add', 'src/data/fees.ts', 'docs/rate-watcher']);
  const commitMsg = willAutoMerge
    ? `chore: auto-verified fee rate updates (${today})`
    : hasDrift
      ? `chore: propose fee rate updates from watcher (${today})`
      : `chore: fee watcher fetch/parse failures (${today})`;
  const commit = sh('git', ['commit', '-m', commitMsg]);
  if (commit.status !== 0) {
    const out = `${commit.stdout || ''}\n${commit.stderr || ''}`;
    if (!/nothing to commit/i.test(out)) {
      throw new Error(commit.stderr || 'commit failed');
    }
  }

  const push = sh('git', ['push', '-u', 'origin', branch, '--force']);
  if (push.status !== 0) throw new Error(push.stderr || 'push failed');

  const list = sh('gh', [
    'pr',
    'list',
    '--search',
    'fee rate updates in:title',
    '--state',
    'open',
    '--json',
    'number,title,headRefName,url',
  ]);
  let existing = null;
  try {
    const arr = JSON.parse(list.stdout || '[]');
    existing = arr.find((p) => String(p.headRefName).startsWith('chore/fee-rate-watcher-')) || null;
  } catch {
    /* ignore */
  }

  let prNumber = existing ? String(existing.number) : null;
  let prUrl = existing?.url || null;

  if (existing) {
    sh('gh', ['pr', 'edit', prNumber, '--title', title, '--body', report.md]);
    log(`Updated PR #${prNumber}`);
  } else {
    const created = sh('gh', [
      'pr',
      'create',
      '--base',
      'main',
      '--head',
      branch,
      '--title',
      title,
      '--body',
      report.md,
    ]);
    log(created.stdout || created.stderr);
    prUrl = (created.stdout || '').trim();
    const view = sh('gh', ['pr', 'view', branch, '--json', 'number,url']);
    try {
      const meta = JSON.parse(view.stdout || '{}');
      prNumber = String(meta.number);
      prUrl = meta.url || prUrl;
    } catch {
      /* ignore */
    }
  }

  if (!willAutoMerge) {
    ensureNeedsReviewLabel();
    if (prNumber) {
      sh('gh', ['pr', 'edit', prNumber, '--add-label', NEEDS_REVIEW_LABEL]);
    }
  }

  if (hasErrors) {
    const issueTitle = `Fee watcher: ${report.errors.length} source(s) could not be fetched/parsed (${today})`;
    const issues = sh('gh', [
      'issue',
      'list',
      '--search',
      'Fee watcher: in:title',
      '--state',
      'open',
      '--json',
      'number,title',
    ]);
    let issue = null;
    try {
      issue = (JSON.parse(issues.stdout || '[]') || [])[0] || null;
    } catch {
      /* ignore */
    }
    if (issue) sh('gh', ['issue', 'comment', String(issue.number), '--body', report.md]);
    else sh('gh', ['issue', 'create', '--title', issueTitle, '--body', report.md]);
  }

  if (!willAutoMerge || !prNumber) {
    return { merged: false, prNumber, prUrl };
  }

  // Restrict diff before spending CI minutes.
  const files = changedFilesVsMain();
  const diffCheck = assertAutoMergeDiffAllowed(files);
  if (!diffCheck.ok) {
    log('Refusing auto-merge — unexpected paths in diff:', diffCheck.blocked.join(', '));
    ensureNeedsReviewLabel();
    sh('gh', ['pr', 'edit', prNumber, '--add-label', NEEDS_REVIEW_LABEL]);
    const blockBody =
      report.md +
      `\n\n### Auto-merge refused\n\nDiff included non-allowlisted paths: ${diffCheck.blocked.join(', ')}\n`;
    sh('gh', ['pr', 'edit', prNumber, '--body', blockBody]);
    return { merged: false, prNumber, prUrl, refused: 'diff' };
  }

  try {
    runMergeGates();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log('Pre-merge gates failed — leaving PR open:', message);
    ensureNeedsReviewLabel();
    sh('gh', ['pr', 'edit', prNumber, '--add-label', NEEDS_REVIEW_LABEL]);
    const failBody =
      report.md + `\n\n### Auto-merge refused\n\nPre-merge gates failed:\n\n\`\`\`\n${message.slice(0, 3000)}\n\`\`\`\n`;
    sh('gh', ['pr', 'edit', prNumber, '--body', failBody]);
    return { merged: false, prNumber, prUrl, refused: 'gates' };
  }

  const merge = sh('gh', [
    'pr',
    'merge',
    prNumber,
    '--squash',
    '--delete-branch',
    '--subject',
    `chore: auto-verified fee rate updates (${today})`,
  ]);
  if (merge.status !== 0) {
    log('gh pr merge failed:', merge.stderr || merge.stdout);
    ensureNeedsReviewLabel();
    sh('gh', ['pr', 'edit', prNumber, '--add-label', NEEDS_REVIEW_LABEL]);
    return { merged: false, prNumber, prUrl, refused: 'merge' };
  }

  log(`Auto-merged PR #${prNumber}`);
  return { merged: true, prNumber, prUrl };
}

function log(...args) {
  // Keep --json stdout machine-readable; progress/logs go to stderr.
  console.error(...args);
}

async function main() {
  log(`Fee rate watcher · ${today} · dryRun=${dryRun} · autoMerge=${autoMergeEnabled}`);
  log(`Loaded ${rates.length} rates from fees.ts, ${rulesDoc.rules.length} rules`);
  log(
    `Auto-merge bounds: ${autoMergeBounds.maxPercentChangePoints} pp / ${autoMergeBounds.maxFixedMultiplier}× fixed / ±${autoMergeBounds.maxFixedAbsoluteDelta}`,
  );

  // Process dependencies first (stripe-us before stripe-us-intl)
  const ordered = [...rulesDoc.rules].sort((a, b) => {
    const aDep = a.extract?.combineWithRateId ? 1 : 0;
    const bDep = b.extract?.combineWithRateId ? 1 : 0;
    return aDep - bDep;
  });

  const results = [];
  for (const rule of ordered) {
    log(`… ${rule.rateId}`);
    results.push(await checkRule(rule));
  }

  const eligibility = evaluateAutoMergeEligibility(results, autoMergeBounds);
  const report = buildReport(results, eligibility);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'latest-report.md'), report.md);
  writeFileSync(
    join(outDir, 'latest-report.json'),
    JSON.stringify({ today, autoMergeEnabled, eligibility, results }, null, 2),
  );

  const willAutoMerge = autoMergeEnabled && eligibility.eligible;
  let patched = null;
  if (report.patchableDrifts.length) {
    patched = patchFeesTs(report.patchableDrifts, { includeChangelog: willAutoMerge });
    if (dryRun) {
      writeFileSync(join(outDir, 'fees.proposed.ts'), patched);
      log('Wrote docs/rate-watcher/fees.proposed.ts (dry-run)');
      if (willAutoMerge) {
        log('[dry-run] Proposed tree would be auto-merged after npm ci/test/build/audit');
      } else {
        log('[dry-run] Would leave PR open with label:', NEEDS_REVIEW_LABEL);
      }
    }
  } else if (dryRun && !eligibility.eligible && (report.errors.length || report.drifts.length)) {
    log('[dry-run] Would leave PR open with label:', NEEDS_REVIEW_LABEL);
  }

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          today,
          autoMergeEnabled,
          willAutoMerge,
          eligibility,
          summary: {
            ok: report.ok.length,
            drift: report.drifts.length,
            errors: report.errors.length,
            unverified: report.unverified.length,
          },
          results,
        },
        null,
        2,
      ),
    );
  } else {
    console.log(report.md);
  }

  await maybeOpenPr(report, patched, { willAutoMerge });
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
