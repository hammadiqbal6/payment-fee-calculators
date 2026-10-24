#!/usr/bin/env node
/**
 * Weekly fee rate watcher (GitHub Actions).
 * Fetches official pricing pages, compares to src/data/fees.ts, and opens/updates
 * a single PR with proposed changes. Never commits to the default branch or auto-merges.
 *
 * Usage:
 *   node scripts/rate-watcher/watch.mjs [--dry-run] [--json]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');
const dryRun = process.argv.includes('--dry-run');
const asJson = process.argv.includes('--json');
const today = new Date().toISOString().slice(0, 10);

const rulesDoc = JSON.parse(readFileSync(join(__dirname, 'extract-rules.json'), 'utf8'));
const feesPath = join(root, 'src/data/fees.ts');
const feesSource = readFileSync(feesPath, 'utf8');
const outDir = join(root, 'docs/rate-watcher');

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

async function fetchText(url, strategy, rule = {}) {
  const key = `${strategy}:${url}`;
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

function nearlyEqual(a, b, eps = 0.00015) {
  return Math.abs(a - b) <= eps;
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

function applyExtract(rule, body) {
  const ex = rule.extract;
  if (!ex) throw new Error('missing extract');

  if (typeof ex.percent === 'number') {
    const patterns = patternList(ex);
    if (patterns.length) {
      const { match, tried } = firstRegexMatch(body, patterns);
      if (!match) throw new Error(`pattern not found: ${tried.join(' | ')}`);
    }
    return { percent: ex.percent, fixed: ex.fixed ?? 0, raw: 'literal' };
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
    };
  }

  const patterns = patternList(ex);
  if (!patterns.length) throw new Error('missing extract pattern(s)');
  const { match: m, tried } = firstRegexMatch(body, patterns, ex.occurrence ?? 0);
  if (!m) throw new Error(`pattern not found: ${tried.join(' | ')}`);

  let percent = ex.percentGroup != null ? Number(m[ex.percentGroup]) / 100 : Number(ex.percent);
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
  return { percent, fixed, raw: m[0] };
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
    body = await fetchText(rule.sourceUrl, rule.strategy || 'fetch', rule);
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
      return {
        rateId: rule.rateId,
        status: 'drift',
        sourceUrl: rule.sourceUrl,
        stored,
        extracted,
        before: { percent: stored.percent, fixed: stored.fixed },
        after: { percent: extracted.percent, fixed: extracted.fixed },
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

function patchFeesTs(drifts) {
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
  return next;
}

function formatPct(p) {
  return `${parseFloat((p * 100).toFixed(4))}%`;
}

function buildReport(results) {
  const drifts = results.filter((r) => r.status === 'drift');
  const errors = results.filter((r) => r.status === 'fetch_error' || r.status === 'error');
  const unverified = results.filter((r) => r.status === 'unverified');
  const ok = results.filter((r) => r.status === 'ok');
  const patchableDrifts = drifts.filter((d) => !d.skipFeesPatch);

  let md = `## Fee rate watcher report (${today})\n\n`;
  md += `Checked ${results.length} rules · ${ok.length} match · ${drifts.length} drift · ${errors.length} errors · ${unverified.length} flagged unverified\n\n`;

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
    '_Opened by the scheduled rate-watcher Action. Never auto-merges. Fix layout changes in `scripts/rate-watcher/extract-rules.json`._\n';
  return { md, drifts, patchableDrifts, errors, unverified, ok };
}

function sh(cmd, args, opts = {}) {
  return spawnSync(cmd, args, { encoding: 'utf8', cwd: root, ...opts });
}

async function maybeOpenPr(report, patched) {
  const branch = `chore/fee-rate-watcher-${today}`;
  const title = `chore: fee rate updates ${today}`;

  if (dryRun) {
    console.log('[dry-run] Would open/update PR:', title);
    return;
  }

  if (!process.env.GITHUB_TOKEN && !process.env.GH_TOKEN) {
    console.warn('No GITHUB_TOKEN — writing local artifacts only');
    return;
  }

  const hasDrift = report.patchableDrifts.length > 0;
  const hasPlatformDrift = report.drifts.some((d) => d.skipFeesPatch);
  const hasErrors = report.errors.length > 0;
  if (!hasDrift && !hasPlatformDrift && !hasErrors) {
    console.log('No drift and no errors — nothing to open');
    return;
  }

  sh('git', ['fetch', 'origin', 'main']);
  const checkout = sh('git', ['checkout', '-B', branch, 'origin/main']);
  if (checkout.status !== 0) throw new Error(checkout.stderr || 'checkout failed');

  if (hasDrift && patched) writeFileSync(feesPath, patched);

  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `report-${today}.md`), report.md);

  sh('git', ['config', 'user.name', 'fee-rate-watcher[bot]']);
  sh('git', ['config', 'user.email', 'fee-rate-watcher[bot]@users.noreply.github.com']);
  sh('git', ['add', 'src/data/fees.ts', 'docs/rate-watcher']);
  const commitMsg = hasDrift
    ? `chore: propose fee rate updates from watcher (${today})`
    : `chore: fee watcher fetch/parse failures (${today})`;
  sh('git', ['commit', '-m', commitMsg]);

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
    'number,title,headRefName',
  ]);
  let existing = null;
  try {
    const arr = JSON.parse(list.stdout || '[]');
    existing = arr.find((p) => String(p.headRefName).startsWith('chore/fee-rate-watcher-')) || null;
  } catch {
    /* ignore */
  }

  if (existing) {
    sh('gh', ['pr', 'edit', String(existing.number), '--title', title, '--body', report.md]);
    console.log(`Updated PR #${existing.number}`);
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
    console.log(created.stdout || created.stderr);
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
}

async function main() {
  console.log(`Fee rate watcher · ${today} · dryRun=${dryRun}`);
  console.log(`Loaded ${rates.length} rates from fees.ts, ${rulesDoc.rules.length} rules`);

  // Process dependencies first (stripe-us before stripe-us-intl)
  const ordered = [...rulesDoc.rules].sort((a, b) => {
    const aDep = a.extract?.combineWithRateId ? 1 : 0;
    const bDep = b.extract?.combineWithRateId ? 1 : 0;
    return aDep - bDep;
  });

  const results = [];
  for (const rule of ordered) {
    process.stderr.write(`… ${rule.rateId}\n`);
    results.push(await checkRule(rule));
  }

  const report = buildReport(results);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'latest-report.md'), report.md);
  writeFileSync(join(outDir, 'latest-report.json'), JSON.stringify({ today, results }, null, 2));

  let patched = null;
  if (report.patchableDrifts.length) {
    patched = patchFeesTs(report.patchableDrifts);
    if (dryRun) {
      writeFileSync(join(outDir, 'fees.proposed.ts'), patched);
      console.log('Wrote docs/rate-watcher/fees.proposed.ts (dry-run)');
    }
  }

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          today,
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

  await maybeOpenPr(report, patched);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
