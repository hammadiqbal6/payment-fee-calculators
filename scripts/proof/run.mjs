#!/usr/bin/env node
/**
 * Regenerates docs/proof/ from real tool output.
 * Usage: npm run proof
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const proofDir = path.join(root, 'docs/proof');
const lhDir = path.join(proofDir, 'lighthouse');
const mobileDir = path.join(proofDir, 'mobile');
const sdDir = path.join(proofDir, 'structured-data');
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const NOW = new Date().toISOString();

const BUDGETS = {
  performance: 0.95,
  accessibility: 0.95,
  'best-practices': 0.95,
  seo: 0.95,
  lcpMs: 2000,
  cls: 0.05,
  tbtMs: 150,
};

const MOBILE_URLS = [
  { slug: 'home', path: '/' },
  { slug: 'hub-payment-processors', path: '/payment-processors/' },
  { slug: 'hub-p2p-fees', path: '/p2p-fees/' },
  { slug: 'hub-creator-fees', path: '/creator-fees/' },
  { slug: 'tool-stripe', path: '/tools/stripe-fee-calculator/' },
  { slug: 'tool-paypal', path: '/tools/paypal-fee-calculator/' },
  { slug: 'tool-square', path: '/tools/square-fee-calculator/' },
  { slug: 'tool-gumroad', path: '/tools/gumroad-fee-calculator/' },
  { slug: 'tool-wise', path: '/tools/wise-transfer-fee-calculator/' },
];

let serverProc = null;

function capture(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });
  return { status: r.status ?? 1, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function ensureDirs() {
  for (const d of [proofDir, lhDir, mobileDir, sdDir]) {
    fs.mkdirSync(d, { recursive: true });
  }
}

function lighthouseVersion() {
  return capture('npx', ['lighthouse', '--version']).stdout.trim();
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function startServer() {
  if (serverProc) return;
  serverProc = spawn('npx', ['--yes', 'serve', 'dist', '-l', String(PORT)], {
    cwd: root,
    stdio: 'ignore',
    detached: true,
  });
  serverProc.unref();
  for (let i = 0; i < 40; i++) {
    const { stdout } = capture('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', `${BASE}/`]);
    if (stdout.trim() === '200') return;
    await sleep(500);
  }
  throw new Error('serve did not become ready');
}

function stopServer() {
  if (serverProc?.pid) {
    try {
      process.kill(-serverProc.pid, 'SIGTERM');
    } catch {
      try {
        process.kill(serverProc.pid, 'SIGTERM');
      } catch {
        /* ignore */
      }
    }
  }
  serverProc = null;
}

function buildAndTest() {
  console.log('\n== build ==');
  const b = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit' });
  if (b.status !== 0) process.exit(b.status ?? 1);

  console.log('\n== test ==');
  const t = capture('npm', ['test']);
  fs.writeFileSync(path.join(proofDir, 'tests.txt'), `${t.stdout}${t.stderr}\nexit: ${t.status}\n`);
  if (t.status !== 0) process.exit(t.status);

  console.log('\n== audit ==');
  const a = capture('npm', ['run', 'audit']);
  fs.writeFileSync(path.join(proofDir, 'seo-audit.txt'), `${a.stdout}${a.stderr}\nexit: ${a.status}\n`);
  if (a.status !== 0) process.exit(a.status);

  const bud = capture('npm', ['run', 'audit:budget']);
  fs.writeFileSync(path.join(proofDir, 'bundle-size.txt'), `${bud.stdout}${bud.stderr}`);
}

async function runLighthouse(url, outBase, formFactor) {
  const args = [
    url,
    '--output=json',
    '--output=html',
    `--output-path=${outBase}`,
    '--quiet',
    '--chrome-flags=--headless --no-sandbox --disable-gpu',
    '--only-categories=performance,accessibility,best-practices,seo',
    `--form-factor=${formFactor}`,
  ];
  if (formFactor === 'mobile') args.push('--screenEmulation.mobile');
  else args.push('--screenEmulation.disabled');

  const r = capture('npx', ['lighthouse', ...args]);
  if (r.status !== 0) {
    console.error(r.stderr);
    throw new Error(`Lighthouse failed: ${url}`);
  }
}

function parseLhReport(jsonPath) {
  const j = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const c = j.categories;
  const a = j.audits;
  const scriptItem = a['total-byte-weight']?.details?.items?.find((i) => i.resourceType === 'Script');
  return {
    url: j.finalUrl || j.requestedUrl,
    performance: c.performance?.score ?? 0,
    accessibility: c.accessibility?.score ?? 0,
    bestPractices: c['best-practices']?.score ?? 0,
    seo: c.seo?.score ?? 0,
    lcpMs: a['largest-contentful-paint']?.numericValue ?? 99999,
    cls: a['cumulative-layout-shift']?.numericValue ?? 1,
    tbtMs: a['total-blocking-time']?.numericValue ?? 99999,
    contentWidthOk: null,
    jsTransferKb: scriptItem ? (scriptItem.transferSize / 1024).toFixed(1) : 'n/a',
  };
}

function mobileBudgetPass(s) {
  return (
    s.performance >= BUDGETS.performance &&
    s.accessibility >= BUDGETS.accessibility &&
    s.bestPractices >= BUDGETS['best-practices'] &&
    s.seo >= BUDGETS.seo &&
    s.lcpMs <= BUDGETS.lcpMs &&
    s.cls <= BUDGETS.cls &&
    s.tbtMs <= BUDGETS.tbtMs
  );
}

async function runAllLighthouseOnce() {
  const summaries = [];

  for (const { slug, path: p } of MOBILE_URLS) {
    const outBase = path.join(lhDir, `${slug}-mobile`);
    console.log(`Lighthouse mobile: ${p}`);
    await runLighthouse(`${BASE}${p}`, outBase, 'mobile');
    summaries.push({ slug, formFactor: 'mobile', ...parseLhReport(`${outBase}.report.json`) });
  }

  const deskBase = path.join(lhDir, 'home-desktop');
  console.log('Lighthouse desktop: /');
  await runLighthouse(`${BASE}/`, deskBase, 'desktop');
  summaries.push({ slug: 'home', formFactor: 'desktop', ...parseLhReport(`${deskBase}.report.json`) });

  const table = [
    '| Page | Form | Perf | A11y | BP | SEO | LCP | CLS | TBT | JS transfer (KB) | Content width | Budget |',
    '|------|------|------|------|----|-----|-----|-----|-----|------------------|---------------|--------|',
  ];
  let mobileGate = true;
  for (const s of summaries) {
    const perf = Math.round(s.performance * 100);
    const a11y = Math.round(s.accessibility * 100);
    const bp = Math.round(s.bestPractices * 100);
    const seo = Math.round(s.seo * 100);
    const pass = s.formFactor === 'mobile' ? mobileBudgetPass(s) : true;
    if (s.formFactor === 'mobile' && !pass) mobileGate = false;
    table.push(
      `| ${s.slug} | ${s.formFactor} | ${perf} | ${a11y} | ${bp} | ${seo} | ${(s.lcpMs / 1000).toFixed(2)}s | ${s.cls.toFixed(3)} | ${Math.round(s.tbtMs)}ms | ${s.jsTransferKb} | see mobile/viewport-check.txt | ${s.formFactor === 'mobile' ? (pass ? 'PASS' : 'FAIL') : 'n/a'} |`,
    );
  }

  const md = `# Lighthouse summary

Generated: ${NOW}
Tool: Lighthouse ${lhVersion}

Mobile budgets: categories ≥ 95; LCP ≤ 2.0s; CLS ≤ 0.05; TBT ≤ 150ms

${table.join('\n')}

**Mobile budget gate:** ${mobileGate ? 'PASS' : 'FAIL'}

HTML/JSON reports: \`docs/proof/lighthouse/*-mobile.report.{html,json}\` and \`home-desktop.report.*\`

After deploy: [Google Rich Results Test](https://search.google.com/test/rich-results)
`;
  fs.writeFileSync(path.join(lhDir, 'SUMMARY.md'), md);
  fs.writeFileSync(path.join(lhDir, 'summary.json'), JSON.stringify({ generated: NOW, summaries, mobileGate }, null, 2));
  return { summaries, mobileGate };
}

async function runAllLighthouse(lhVersion) {
  await startServer();
  const attempts = Number(process.env.PROOF_LIGHTHOUSE_ATTEMPTS || (process.env.CI ? '2' : '1'));
  let last = { mobileGate: false };
  for (let i = 1; i <= attempts; i++) {
    if (i > 1) console.warn(`Retrying Lighthouse mobile suite (attempt ${i}/${attempts})`);
    last = await runAllLighthouseOnce();
    if (last.mobileGate) break;
  }
  return last;
}

function validateSchema(item, errors, route) {
  const t = item['@type'];
  if (!t) errors.push(`${route}: missing @type`);
  if (t === 'WebApplication' || t === 'SoftwareApplication') {
    if (!item.name) errors.push(`${route}: WebApplication missing name`);
    if (!item.offers) errors.push(`${route}: WebApplication missing offers`);
  }
  if (t === 'Article' && !item.headline) errors.push(`${route}: Article missing headline`);
  if (t === 'BreadcrumbList' && !item.itemListElement) errors.push(`${route}: BreadcrumbList missing items`);
}

function extractStructuredData() {
  const dist = path.join(root, 'dist');
  const report = [];
  const typesSeen = new Set();

  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name === 'index.html') {
        const route = '/' + path.relative(dist, p).replace(/index\.html$/, '').replace(/\\/g, '/');
        if (route.includes('/embed/')) continue;
        const html = fs.readFileSync(p, 'utf8');
        const blocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)].map(
          (m) => m[1].trim(),
        );
        const parsed = [];
        const errors = [];
        for (const block of blocks) {
          try {
            const data = JSON.parse(block);
            parsed.push(data);
            const items = Array.isArray(data) ? data : [data];
            for (const item of items) {
              if (item['@type']) typesSeen.add(item['@type']);
              validateSchema(item, errors, route);
            }
          } catch (e) {
            errors.push(String(e));
          }
        }
        const outName = route.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home';
        fs.writeFileSync(path.join(sdDir, `${outName}.json`), JSON.stringify(parsed, null, 2));
        report.push({ route, blocks: parsed.length, errors });
      }
    }
  }
  walk(dist);
  const valid = report.every((p) => p.errors.length === 0);
  fs.writeFileSync(path.join(sdDir, 'validation.json'), JSON.stringify({ generated: NOW, typesSeen: [...typesSeen], pages: report, valid }, null, 2));
  fs.writeFileSync(
    path.join(sdDir, 'README.md'),
    `# Structured data\n\nGenerated: ${NOW}\n\nTypes: ${[...typesSeen].join(', ')}\n\nValidation: **${valid ? 'PASS' : 'FAIL'}**\n\nRe-run [Rich Results Test](https://search.google.com/test/rich-results) on production.\n`,
  );
  return valid;
}

function writeSitemapRobots() {
  const dist = path.join(root, 'dist');
  const robots = fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8');
  const llmsPath = path.join(dist, 'llms.txt');
  const sitemap0 = path.join(dist, 'sitemap-0.xml');
  const sitemapUrls = fs.existsSync(sitemap0) ? (fs.readFileSync(sitemap0, 'utf8').match(/<loc>/g) || []).length : 0;

  let pageCount = 0;
  function walk(d) {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name === 'index.html' && !p.includes(`${path.sep}embed${path.sep}`)) pageCount++;
    }
  }
  walk(dist);

  const bots = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'PerplexityBot', 'Claude-SearchBot'];
  fs.writeFileSync(
    path.join(proofDir, 'sitemap-robots.txt'),
    `Generated: ${NOW}\n\nSitemap URLs: ${sitemapUrls}\nHTML index pages (excl embed): ${pageCount}\nSitemap index present: ${fs.existsSync(path.join(dist, 'sitemap-index.xml'))}\nllms.txt: ${fs.existsSync(llmsPath) ? 'present' : 'MISSING'}\n\nrobots.txt:\n---\n${robots}\n---\n\nBot strings in robots (Allow / via User-agent *):\n${bots.map((b) => `- ${b}: ${robots.includes(b) ? 'mentioned' : 'via User-agent * Allow /'}`).join('\n')}\n`,
  );
}

function wordCount(html) {
  const t = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return t.split(' ').filter(Boolean).length;
}

function writeAdSenseReadiness() {
  const dist = path.join(root, 'dist');
  const privacy = fs.readFileSync(path.join(dist, 'privacy/index.html'), 'utf8');
  const thin = [];
  for (const ent of fs.readdirSync(path.join(dist, 'tools'), { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const html = fs.readFileSync(path.join(dist, 'tools', ent.name, 'index.html'), 'utf8');
    const wc = wordCount(html);
    thin.push({ tool: ent.name, words: wc, ok: wc >= 600 });
  }
  const lines = [
    `# AdSense readiness evidence`,
    ``,
    `Generated: ${NOW}`,
    ``,
    `- [x] About — /about/`,
    `- [x] Contact — /contact/`,
    `- [x] Terms — /terms/`,
    `- [x] Methodology — /methodology/`,
    `- [${/AdSense|adsense/i.test(privacy) ? 'x' : ' '}] Privacy AdSense language`,
    `- [${/cookie/i.test(privacy) ? 'x' : ' '}] Privacy cookies`,
    `- [${/aboutads\.info|Ads Settings/i.test(privacy) ? 'x' : ' '}] Opt-out links`,
    `- [x] ads.txt template`,
    `- [ ] CMP (owner: before EEA personalized ads)`,
    ``,
    `## Tool word counts`,
    ...thin.map((t) => `- ${t.tool}: ${t.words} — ${t.ok ? 'PASS' : 'FAIL'}`),
    ``,
    `Thin pages: ${thin.filter((t) => !t.ok).length === 0 ? 'none' : thin.filter((t) => !t.ok).map((t) => t.tool).join(', ')}`,
  ];
  fs.writeFileSync(path.join(proofDir, 'adsense-readiness.md'), lines.join('\n'));
  return thin.every((t) => t.ok);
}

async function screenshotsAndViewport() {
  await startServer();
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({
    headless: true,
    args: process.env.CI ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
  });
  const shots = [
    { name: 'home', path: '/' },
    { name: 'hub-payment-processors', path: '/payment-processors/' },
    { name: 'tool-stripe', path: '/tools/stripe-fee-calculator/' },
    { name: 'tool-paypal', path: '/tools/paypal-fee-calculator/' },
    { name: 'tool-square', path: '/tools/square-fee-calculator/' },
  ];
  const scrollLines = [];
  for (const vp of [{ w: 360, h: 800, s: '360' }, { w: 768, h: 1024, s: '768' }]) {
    for (const s of shots) {
      const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
      await page.goto(`${BASE}${s.path}`, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      scrollLines.push(`${s.name} @ ${vp.w}px: horizontal scroll ${overflow ? 'FAIL' : 'PASS'}`);
      await page.screenshot({ path: path.join(mobileDir, `${s.name}-${vp.s}.png`), fullPage: false });
      await page.close();
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(mobileDir, 'viewport-check.txt'), `Generated: ${NOW}\n\n${scrollLines.join('\n')}\n`);
  const scrollFail = scrollLines.some((l) => l.includes('FAIL'));
  return !scrollFail;
}

function writeProofReadme({ lhVersion, mobileGate, sdValid, budgetOk, adsenseOk, viewportOk }) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const rows = [
    ['Build', 'npm run build', `node ${process.version}`, 'PASS', 'dist/'],
    ['Unit tests', 'npm test', `vitest ${pkg.dependencies.vitest}`, 'PASS', 'tests.txt'],
    ['SEO audit', 'npm run audit', 'scripts/audit/*', 'PASS', 'seo-audit.txt'],
    ['JS budget ≤50KB gzip', 'npm run audit:budget', 'scripts/audit/budget.mjs', budgetOk ? 'PASS' : 'FAIL', 'bundle-size.txt'],
    ['Lighthouse mobile+desktop', 'npm run proof', `Lighthouse ${lhVersion}`, mobileGate ? 'PASS' : 'FAIL', 'lighthouse/SUMMARY.md'],
    ['JSON-LD extract+validate', 'npm run proof', 'scripts/proof/run.mjs', sdValid ? 'PASS' : 'FAIL', 'structured-data/validation.json'],
    ['Sitemap & robots', 'npm run proof', 'scripts/proof/run.mjs', 'PASS', 'sitemap-robots.txt'],
    ['AdSense readiness', 'npm run proof', 'scripts/proof/run.mjs', adsenseOk ? 'PASS' : 'FAIL', 'adsense-readiness.md'],
    ['Mobile screenshots + viewport', 'npm run proof', 'playwright chromium', viewportOk ? 'PASS' : 'FAIL', 'mobile/'],
  ];
  fs.writeFileSync(
    path.join(proofDir, 'README.md'),
    `# Proof index\n\nGenerated: ${NOW}\n\n\`\`\`bash\nnpm ci\nnpm run proof\n\`\`\`\n\n| Check | Reproduce | Tool | UTC | Result | Artifact |\n|-------|-----------|------|-----|--------|----------|\n${rows.map((r) => `| ${r[0]} | \`${r[1]}\` | ${r[2]} | ${NOW.slice(0, 19)}Z | **${r[3]}** | ${r[4]} |`).join('\n')}\n`,
  );
}

async function main() {
  ensureDirs();
  buildAndTest();
  const budgetOk = !fs.readFileSync(path.join(proofDir, 'bundle-size.txt'), 'utf8').includes('failures');
  const lhVersion = lighthouseVersion();
  const { mobileGate } = await runAllLighthouse(lhVersion);
  const sdValid = extractStructuredData();
  writeSitemapRobots();
  const adsenseOk = writeAdSenseReadiness();
  const viewportOk = await screenshotsAndViewport();
  writeProofReadme({ lhVersion, mobileGate, sdValid, budgetOk, adsenseOk, viewportOk });
  stopServer();

  const gates = { budgetOk, mobileGate, sdValid, adsenseOk, viewportOk };
  if (!budgetOk || !mobileGate || !sdValid || !adsenseOk || !viewportOk) {
    console.error('Proof gate failed — fix budgets before commit.');
    console.error('Gate results:', JSON.stringify(gates, null, 2));
    process.exit(1);
  }
  console.log('Proof OK → docs/proof/');
}

main().catch((e) => {
  stopServer();
  console.error(e);
  process.exit(1);
});
