# Deployment guide

This document is a **step-by-step, copy-paste friendly** guide for taking the **payment fee calculators** site from your laptop to a live HTTPS domain. It matches this repository’s real scripts, config files, and static output (`dist/`).

**What you are deploying:** an Astro static site. There is **no Node server** in production—only HTML, CSS, and small client-side JavaScript bundles.

**Primary host:** [Cloudflare Pages](https://pages.cloudflare.com/) (free tier, fast global CDN, `_headers` support). **Alternatives:** Vercel and Netlify (both work with the same build).

---

## Table of contents

1. [Prerequisites](#1-prerequisites)
2. [Local build, preview, test, audit, and proof](#2-local-build-preview-test-audit-and-proof)
3. [Configure the site (env + placeholders)](#3-configure-the-site-env--placeholders)
4. [Custom domain, DNS, www vs apex, HTTPS](#4-custom-domain-dns-www-vs-apex-https)
5. [Deploy on Cloudflare Pages (primary)](#5-deploy-on-cloudflare-pages-primary)
6. [Deploy on Vercel](#6-deploy-on-vercel)
7. [Deploy on Netlify](#7-deploy-on-netlify)
8. [Post-deploy SEO (Search Console, Bing, IndexNow, Rich Results)](#8-post-deploy-seo-search-console-bing-indexnow-rich-results)
9. [Google AdSense (when and how)](#9-google-adsense-when-and-how)
10. [Analytics and weekly monitoring](#10-analytics-and-weekly-monitoring)
11. [Updating, redeploying, and rollback](#11-updating-redeploying-and-rollback)
12. [Troubleshooting](#12-troubleshooting)
13. [Launch checklist](#13-launch-checklist)

---

## 1. Prerequisites

### Accounts and access

| Item | Why you need it |
|------|-----------------|
| **GitHub** (or GitLab) repo with this code | Hosts connect to Git for automatic deploys |
| **Domain registrar** (Cloudflare Registrar, Namecheap, Google Domains, etc.) | Custom domain + DNS |
| **Cloudflare account** (recommended) | Pages hosting + DNS + optional registrar |
| **Google account** | Search Console, Analytics, AdSense (later) |
| **Bing Webmaster Tools** (optional but recommended) | Extra crawl signals + IndexNow |

You do **not** need a paid server. Static hosting free tiers are enough for launch.

### Software on your computer

- **Node.js 20 or newer** (22 LTS is fine). Check:

```bash
node -v   # should print v20.x or v22.x
npm -v
```

- **Git** installed and configured with your remote.

### Before you deploy

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/YOUR_ORG/payment-fee-calculators.git
cd payment-fee-calculators
npm ci
```

2. Confirm the site builds:

```bash
npm run build
```

You should see `dist/` created and a message like `Complete!` with no errors.

---

## 2. Local build, preview, test, audit, and proof

Use these commands **before every production deploy** and in CI (see `.github/workflows/ci.yml`).

| Command | What it does |
|---------|----------------|
| `npm run dev` | Dev server at `http://localhost:4321` (hot reload) |
| `npm run build` | Production static output → `dist/` |
| `npm run preview` | Serves `dist/` locally (production-like) |
| `npm test` | Vitest: all fee formulas + reverse math (104 tests) |
| `npm run audit` | SEO, AdSense readiness, JS budget (≤50 KB gzip/bundle), internal links |
| `npm run proof` | Regenerates **committed** evidence in `docs/proof/` (Lighthouse, screenshots, JSON-LD, etc.) |
| `npm run check` | `build` + `test` + `audit` + `proof` (full gate) |

### First-time proof setup (screenshots)

`npm run proof` uses **Playwright Chromium** for mobile screenshots and horizontal-scroll checks:

```bash
npx playwright install chromium
npm run proof
```

Open `docs/proof/README.md` for the index of generated artifacts. **Do not hand-edit Lighthouse scores**—re-run `npm run proof` instead.

### Quick local preview of production build

```bash
npm run build
npm run preview
# or: npx serve dist -l 4173
```

Visit `http://localhost:4323` (preview default) or the port shown in the terminal.

---

## 3. Configure the site (env + placeholders)

All owner-specific values live in **one place**: `src/config/site.ts`, overridable via environment variables at build time. Copy `.env.example` to `.env` for local builds:

```bash
cp .env.example .env
```

### Environment variables (build time)

These are read when Astro builds. On Cloudflare Pages / Vercel / Netlify, add the same names in the dashboard **Environment variables** for **Production** (and Preview if you want staging).

| Variable | Required at launch? | Purpose |
|----------|---------------------|---------|
| `PUBLIC_SITE_URL` | **Yes** | Canonical origin, **no trailing slash** (e.g. `https://feecalc.example`) |
| `PUBLIC_SITE_NAME` | Yes | Full site name (titles, schema) |
| `PUBLIC_SITE_SHORT_NAME` | Yes | Short brand in header |
| `PUBLIC_CONTACT_EMAIL` | Optional | Contact page, footer, privacy/terms, JSON-LD; default `hammadiqbal117@gmail.com` |
| `PUBLIC_AUTHOR_NAME` | Recommended | Author/reviewer byline |
| `PUBLIC_TWITTER_HANDLE` | Optional | Twitter card `@handle` (without `@`) |
| `PUBLIC_ADSENSE_PUBLISHER_ID` | Later | e.g. `ca-pub-XXXXXXXXXXXXXXXX` — leave empty until AdSense approved |
| `PUBLIC_GA4_ID` | Optional | Google Analytics 4 measurement ID `G-XXXX` |
| `PUBLIC_GSC_VERIFICATION` | Recommended | Google Search Console HTML tag **content** value |
| `PUBLIC_BING_VERIFICATION` | Optional | Bing `msvalidate.01` content |
| `PUBLIC_INDEXNOW_KEY` | Optional | 32-character hex key; must match `public/<key>.txt` |

**Important:** After changing any `PUBLIC_*` value, run **`npm run build`** again and redeploy. Astro bakes these into static HTML at build time.

### Files you must update for production (placeholders)

Some URLs are still **example placeholders** until you set your real domain:

#### `public/robots.txt`

Replace the sitemap line with your live domain:

```text
Sitemap: https://YOUR_DOMAIN/sitemap-index.xml
```

The file already allows Googlebot, Bingbot, and common AI answer crawlers. Training bots (GPTBot, etc.) are documented in comments—change only if you have a policy decision.

#### `llms.txt` (optional)

Generated at build time from `src/pages/llms.txt.ts` using `siteConfig` (`Website` from `PUBLIC_SITE_URL`, `Contact` from `PUBLIC_CONTACT_EMAIL` / default `hammadiqbal117@gmail.com`). Google does not use `llms.txt` for ranking; it is optional for other tools.

#### `public/ads.txt`

Before AdSense serves ads, uncomment and set your publisher line (see [AdSense section](#9-google-adsense-when-and-how)):

```text
google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0
```

#### IndexNow key file

1. Key file is committed at `public/cded36863aa6be8ac5bf690ab6889910.txt` (IndexNow keys are public by design).
2. Optional override: `INDEXNOW_KEY` (script) or `PUBLIC_INDEXNOW_KEY` (site config) — must match the filename/contents.
3. After the key file is **live** on the site, ping IndexNow from the built sitemap (do **not** run this inside `build`):

```bash
npm run build
npx wrangler deploy && node scripts/indexnow.mjs
# or: npm run deploy:indexnow
# dry-run (no POST): node scripts/indexnow.mjs --dry-run
```

Set Workers Builds deploy command to `npx wrangler deploy && node scripts/indexnow.mjs` so the ping runs only after assets are published. Skip with `INDEXNOW_DISABLE=1`. For a handful of paths only, `scripts/indexnow/post.mjs` still works.

### Consent / CMP (EEA, UK, Switzerland)

This repo does **not** bundle a CMP. Before enabling **personalized** AdSense in the EEA/UK/CH, integrate a [Google-certified CMP](https://support.google.com/adsense/answer/13554116) and document it on your Privacy page. See `docs/ADSENSE.md`.

### Ad slots and CLS

`src/components/AdSlot.astro` renders a **fixed-min-height** placeholder when AdSense is disabled. When you enable ads, keep reserved heights to protect Core Web Vitals (see `docs/proof/lighthouse/SUMMARY.md`).

---

## 4. Custom domain, DNS, www vs apex, HTTPS

### Buying a domain

You can buy a domain from any registrar, then either:

- **Use Cloudflare as DNS** (recommended with Cloudflare Pages): add the domain to Cloudflare and update nameservers at your registrar, **or**
- **Keep DNS at registrar** and point records to your host (Pages/Vercel/Netlify docs).

### Apex (`example.com`) vs `www` (`www.example.com`)

Pick **one canonical host** and 301-redirect the other. This repo uses `PUBLIC_SITE_URL` as the canonical origin in:

- `<link rel="canonical">` (via `BaseLayout.astro`)
- XML sitemap URLs (from `@astrojs/sitemap` + `site` in `astro.config.mjs`)

**Example:** canonical = `https://feecalc.example` (apex). Then:

- `https://www.feecalc.example/*` → 301 → `https://feecalc.example/*`

### DNS records (typical)

| Goal | Record type | Name | Value |
|------|-------------|------|--------|
| Apex on Cloudflare Pages | `A` or `CNAME` | `@` | Pages-provided target (dashboard shows exact values) |
| `www` on Cloudflare Pages | `CNAME` | `www` | `your-project.pages.dev` or Pages CNAME target |
| Email (optional) | `MX` | `@` | Your mail provider |

Cloudflare Pages **Custom domains** UI often creates these for you when the domain is on Cloudflare.

### HTTPS

Cloudflare Pages, Vercel, and Netlify issue **free TLS certificates** automatically once DNS is correct. Force HTTPS in the host dashboard. Do not serve the marketing site over plain `http://` without redirecting to `https://`.

### Trailing slashes

`astro.config.mjs` sets `trailingSlash: 'always'`. URLs look like `/tools/stripe-fee-calculator/`. Configure redirects on the host so `/path` and `/path/` do not both index as duplicates (Pages often normalizes; verify in GSC).

---

## 5. Deploy on Cloudflare Pages (primary)

### Step 1 — Push code to GitHub

```bash
git push origin main
# or your production branch
```

### Step 2 — Create a Pages project

1. Log in to [Cloudflare Dashboard](https://dash.cloud.com/) → **Workers & Pages**.
2. **Create application** → **Pages** → **Connect to Git**.
3. Select this repository and branch (e.g. `main`).

### Step 3 — Build configuration

Use these **exact** settings (matches this repo):

| Setting | Value |
|---------|--------|
| **Framework preset** | Astro (or None) |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (repo root) |
| **Node.js version** | 20 or 22 (Environment variable `NODE_VERSION=22` if needed) |

For **CI parity** on Pages (optional advanced): you can set build command to `npm ci && npx playwright install chromium && npm run check` for stricter pre-deploy gates; default production deploy only needs `npm run build`.

### Step 4 — Environment variables

In **Settings → Environment variables**, add at minimum for **Production**:

```text
PUBLIC_SITE_URL=https://your-domain.com
PUBLIC_SITE_NAME=Your Brand Name
PUBLIC_SITE_SHORT_NAME=YourBrand
PUBLIC_CONTACT_EMAIL=hammadiqbal117@gmail.com
PUBLIC_GSC_VERIFICATION=your_google_verification_token
```

Add `PUBLIC_GA4_ID`, `PUBLIC_BING_VERIFICATION`, and `PUBLIC_ADSENSE_PUBLISHER_ID` when ready.

### Step 5 — Deploy

Save and deploy. Note the `*.pages.dev` URL. Test:

```bash
curl -I https://your-project.pages.dev/
```

### Step 6 — Custom domain on Pages

1. **Custom domains** → **Set up a domain** → enter apex and/or `www`.
2. Follow DNS instructions until status is **Active**.
3. Add a **Redirect rule** (Bulk Redirects or Single Redirect):
   - If canonical is apex: `www.your-domain.com/*` → `https://your-domain.com/$1` (301).

### Step 7 — Headers and caching

This repo ships `public/_headers` (copied into `dist/_headers` on build):

- Security headers (`X-Content-Type-Options`, `Referrer-Policy`, etc.)
- Long cache for hashed `/assets/*`

No extra Cloudflare configuration is required unless you override at zone level.

### Step 8 — Redirects

`public/_redirects` includes:

```text
/sitemap.xml /sitemap-index.xml 301
```

After deploy, verify:

```bash
curl -I https://your-domain.com/sitemap.xml
# should 301 to sitemap-index.xml
```

### Step 9 — Preview deployments

Every pull request can get a **preview URL** on Pages. Set the same `PUBLIC_*` vars for **Preview** environment, but use a **staging** `PUBLIC_SITE_URL` only if you want correct canonicals on previews; otherwise previews may show example.com canonicals until merged.

### Step 10 — Bots and WAF

In Cloudflare **Security** settings, avoid blocking:

- `Googlebot`, `Bingbot`
- `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`

Aggressive **Bot Fight Mode** can interfere with legitimate crawlers and Lighthouse audits.

---

## 6. Deploy on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → Import Git repository.
2. **Framework Preset:** Astro.
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm ci`
6. Add the same `PUBLIC_*` environment variables under **Settings → Environment Variables**.
7. Deploy.

This repository includes `vercel.json` for:

- Security headers on all routes
- Immutable cache on `/assets/*`
- Redirect `/sitemap.xml` → `/sitemap-index.xml`

**Custom domain:** Project → **Settings → Domains** → add domain → follow DNS. Configure redirect from `www` to apex (or vice versa) in Domains settings.

---

## 7. Deploy on Netlify

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**.
2. Connect GitHub and select the repo.
3. Build settings:

| Setting | Value |
|---------|--------|
| Build command | `npm run build` |
| Publish directory | `dist` |

4. **Site settings → Environment variables:** add all `PUBLIC_*` vars.
5. Deploy.

Netlify reads `public/_headers` and `public/_redirects` from the publish directory automatically after build.

**Custom domain:** **Domain management** → add domain → update DNS at registrar per Netlify instructions.

---

## 8. Post-deploy SEO (Search Console, Bing, IndexNow, Rich Results)

Detailed strategy: `docs/SEO-GUIDE.md` and `docs/KEYWORD-MAP.md`.

### Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console).
2. **Add property** → **Domain** property (recommended) for `your-domain.com`.
3. Verify via **DNS TXT** record (copy from GSC, add at DNS host, wait, confirm).
4. Alternatively use **URL prefix** property and the HTML tag method—set `PUBLIC_GSC_VERIFICATION` in env, rebuild, redeploy, then verify.

### Submit sitemap

1. GSC → **Sitemaps** → enter: `sitemap-index.xml` (full URL: `https://your-domain.com/sitemap-index.xml`).
2. Confirm **Success** status after crawl.

### Request indexing for key URLs

Use **URL Inspection** for each important URL → **Request indexing**:

- `https://your-domain.com/`
- `https://your-domain.com/payment-processors/`
- `https://your-domain.com/tools/stripe-fee-calculator/`
- `https://your-domain.com/tools/paypal-fee-calculator/`
- `https://your-domain.com/tools/compare-payment-fees/`
- Top guides under `/guides/`

Indexing is not guaranteed; sitemap + internal links help.

### Bing Webmaster Tools

1. [Bing Webmaster Tools](https://www.bing.com/webmasters) → add site.
2. **Import from Google Search Console** (fastest) or verify separately.
3. Submit the same `sitemap-index.xml`.

### IndexNow (Bing and partners—not Google)

After deploy (key file must already be live at `https://<host>/<key>.txt`):

```bash
# Preferred: submit every URL from dist/ sitemaps (safe; exits 0 on errors)
node scripts/indexnow.mjs

# Or single paths:
node scripts/indexnow/post.mjs / /tools/stripe-fee-calculator/
```

Uses `PUBLIC_SITE_URL` for host/`keyLocation`. Override key with `INDEXNOW_KEY`. Disable with `INDEXNOW_DISABLE=1`.

### Rich Results Test (production)

JSON-LD is validated locally in `docs/proof/structured-data/validation.json`. **After deploy**, re-test live URLs:

1. Open [Rich Results Test](https://search.google.com/test/rich-results).
2. Test homepage and one tool URL.
3. Fix any mismatches between visible content and schema.

### PageSpeed Insights (live field + lab)

1. [PageSpeed Insights](https://pagespeed.web.dev/) → enter your homepage and a tool URL.
2. Compare to committed lab scores in `docs/proof/lighthouse/SUMMARY.md` (local `serve dist` is not identical to field data, but should be in the same ballpark).

---

## 9. Google AdSense (when and how)

Full policy checklist: `docs/ADSENSE.md`. Readiness evidence: `docs/proof/adsense-readiness.md`.

### When to apply

Apply when you have:

- Live site on your **own domain** with HTTPS
- **Original content** on tool pages (600+ words each—verified by `npm run audit`)
- About, Contact, Privacy, Terms, Methodology pages
- Some **real traffic** (often weeks after launch—not a hard rule, but improves approval odds)

Do not apply on the default `*.pages.dev` URL alone if your brand domain is different.

### Steps after approval

1. Set `PUBLIC_ADSENSE_PUBLISHER_ID` in host env vars.
2. Update `public/ads.txt` with your `pub-` ID and redeploy.
3. In AdSense, add your site and confirm ownership (often automatic once ads.txt is live).
4. Optionally enable `adsenseAutoAds` in `src/config/site.ts` **after** testing layout impact on mobile.
5. Configure ad slot IDs in `src/components/AdSlot.astro` if using manual units.
6. For EEA/UK/CH: enable a **certified CMP** before personalized ads.

### Consent message

The site includes a lightweight cookie notice (`BaseLayout.astro`). Expand Privacy policy and wire CMP per your legal requirements—especially for EU users.

### Ad placement without hurting rankings

- Keep the **calculator above the fold** on mobile.
- Use reserved-height ad slots (already in `AdSlot.astro`).
- Re-run `npm run proof` after enabling ads to confirm CLS and Lighthouse budgets.

---

## 10. Analytics and weekly monitoring

### Google Analytics 4

1. Create a GA4 property at [analytics.google.com](https://analytics.google.com).
2. Copy **Measurement ID** (`G-XXXXXXXX`).
3. Set `PUBLIC_GA4_ID`, rebuild, redeploy.
4. Link GA4 property to Search Console (Admin → product links).

`BaseLayout.astro` loads gtag with `anonymize_ip: true`. Review GA4 terms and your Privacy policy disclosures.

### Weekly routine (15–30 minutes)

| Source | What to check |
|--------|----------------|
| **GSC → Performance** | Impressions, clicks, average position; new queries to target in FAQs/guides |
| **GSC → Pages** | Indexing status; fix 404s and soft 404s |
| **GSC → Core Web Vitals** | Mobile/desktop URL groups; investigate regressions after deploys |
| **GSC → Sitemaps** | Last read date; errors |
| **GA4** | Top pages, engagement; confirm calculator pages get use |
| **Fee data** | Provider pricing changes—follow `docs/FEE-UPDATE.md`, bump `lastVerified`, run `npm test` and `npm run proof` |

When you change fee tables materially, update on-page **Last updated** dates and redeploy so sitemap `lastmod` refreshes.

---

## 11. Updating, redeploying, and rollback

### Normal content or fee update

```bash
git pull
# edit src/data/fees.ts and/or content
npm test
npm run build
npm run audit
git commit -am "Update Stripe UK rate per official pricing"
git push origin main
```

Git-connected hosts auto-build on push. Wait for deploy to finish, then:

- Spot-check one tool on production
- Optional: IndexNow for changed URLs
- Optional: GSC URL Inspection → request indexing for changed tool pages

### Regenerate proof artifacts (for PRs or records)

```bash
npx playwright install chromium
npm run proof
git add docs/proof && git commit -m "Refresh proof artifacts"
```

### Rollback

| Host | Rollback method |
|------|-----------------|
| **Cloudflare Pages** | Deployments → select previous successful deployment → **Rollback to this deployment** |
| **Vercel** | Deployments → … → **Promote to Production** on an older deployment |
| **Netlify** | Deploys → **Publish deploy** on a previous build |

Also revert the Git commit if the bad change is in source control:

```bash
git revert HEAD
git push origin main
```

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|----------------|-----|
| Canonical URLs show `feecalculator.example` | `PUBLIC_SITE_URL` not set in production build | Set env var on host, rebuild |
| `npm run build` fails on CI/Pages | Wrong Node version | Set Node 20+ |
| Tool pages 404 on host | Wrong publish directory | Must be `dist`, not `.astro` or `public` |
| Sitemap 404 | Build did not run sitemap integration | Run `npm run build`; check `dist/sitemap-index.xml` |
| Duplicate www and apex in Google | No 301 between hosts | Add redirect rule; pick one canonical in `PUBLIC_SITE_URL` |
| Ads never show | Empty `PUBLIC_ADSENSE_PUBLISHER_ID` | Expected until configured; check ad blockers |
| AdSense “site not ready” | Thin pages or missing policy pages | Run `npm run audit:adsense`; read `docs/ADSENSE.md` |
| Lighthouse/CLS worse after ads | No reserved slot height | Keep `AdSlot` min-heights; avoid injecting dynamic iframes above calculator |
| `npm run proof` fails Playwright | Chromium not installed | `npx playwright install chromium` |
| IndexNow errors | Key file missing at `https://domain/<key>.txt` | Deploy first so `public/<key>.txt` is live; then run `node scripts/indexnow.mjs` |
| Crawlers blocked | Cloudflare Bot Fight / WAF | Allowlisted bots or relax rules for SEO |

### Get help from logs

- **Cloudflare Pages:** Deployment → **View build log**
- **Vercel:** Deployment → **Building**
- **Netlify:** Deploy → **Deploy log**

---

## 13. Launch checklist

Copy this into your issue tracker and check off on launch day.

### Code and config

- [ ] `PUBLIC_SITE_URL` set to production `https://` URL (no trailing slash)
- [ ] Contact email and author name set
- [ ] `public/robots.txt` sitemap URL updated to production domain
- [ ] `/llms.txt` contact email correct; `public/ads.txt` reviewed (ads.txt when AdSense ready)
- [ ] IndexNow key file matches `PUBLIC_INDEXNOW_KEY` (if using IndexNow)
- [ ] `npm run check` passes locally

### Deploy

- [ ] Site live on HTTPS with correct canonical host (www or apex)
- [ ] `curl -I https://YOUR_DOMAIN/` returns 200
- [ ] `https://YOUR_DOMAIN/sitemap-index.xml` loads
- [ ] `https://YOUR_DOMAIN/robots.txt` correct
- [ ] Calculator works on mobile (360px)—see `docs/proof/mobile/`

### SEO

- [ ] Google Search Console property verified (domain recommended)
- [ ] Sitemap submitted in GSC
- [ ] URL Inspection requested for homepage + top tools
- [ ] Bing Webmaster Tools configured
- [ ] Rich Results Test run on **live** homepage + one tool
- [ ] PageSpeed Insights run on live URLs

### Monetization (when ready)

- [ ] AdSense applied only after content + traffic thresholds (`docs/ADSENSE.md`)
- [ ] `PUBLIC_ADSENSE_PUBLISHER_ID` + `ads.txt` live
- [ ] CMP configured for EEA/UK/CH if using personalized ads

### Ongoing

- [ ] Calendar reminder for fee schedule reviews (`docs/FEE-UPDATE.md`)
- [ ] Weekly GSC + GA4 check (section 10)

---

## Related docs

- `README.md` — project overview and scripts
- `docs/SEO-GUIDE.md` — 90-day SEO plan and keyword workflow
- `docs/ADSENSE.md` — eligibility and pitfalls
- `docs/FEE-UPDATE.md` — maintaining fee tables
- `docs/proof/README.md` — reproducible SEO/performance/AdSense evidence
- `docs/DEPLOYMENT.md` — this file

When in doubt, rebuild (`npm run build`), redeploy `dist/`, and re-run `npm run proof` before merging production changes.
