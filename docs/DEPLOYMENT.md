# Deployment guide

Static Astro output (`dist/`) deploys to any static host. **Primary:** Cloudflare Pages. Alternatives: Vercel, Netlify.

## Prerequisites

- Node.js 20+
- `npm ci && npm run build` succeeds locally
- Domain DNS access (for custom domain)
- Environment variables from `.env.example` configured on the host

## 1. Configure site identity

Edit `src/config/site.ts` or set env vars:

| Variable | Purpose |
|----------|---------|
| `PUBLIC_SITE_URL` | Canonical origin, no trailing slash |
| `PUBLIC_SITE_NAME` / `PUBLIC_SITE_SHORT_NAME` | Branding |
| `PUBLIC_CONTACT_EMAIL` | Contact & footer |
| `PUBLIC_ADSENSE_PUBLISHER_ID` | Enables ad slots when set |
| `PUBLIC_GA4_ID` | Google Analytics 4 |
| `PUBLIC_GSC_VERIFICATION` | Search Console meta tag |
| `PUBLIC_BING_VERIFICATION` | Bing Webmaster meta tag |
| `PUBLIC_INDEXNOW_KEY` | 32-char hex; file at `public/<key>.txt` |

Rebuild after changing env vars.

## 2. Cloudflare Pages (recommended)

1. Push repo to GitHub.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → Connect Git.
3. Build settings:
   - **Framework preset:** Astro (or None)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** 20+
4. Add environment variables (Production + Preview).
5. Deploy. Note the `*.pages.dev` URL.
6. **Custom domain:** Pages project → Custom domains → add apex and `www`.
7. **HTTPS:** Automatic. Set **one canonical host**:
   - Redirect `www` → apex (or apex → `www`) in Cloudflare **Rules** or **Bulk Redirects**.
8. **Headers:** `public/_headers` is copied to `dist/_headers` for Cloudflare.
9. **Redirects:** `public/_redirects` for `/sitemap.xml` → sitemap index.

### Bot / AI crawlers

Ensure **Bot Fight Mode** or aggressive WAF rules do not block `Googlebot`, `Bingbot`, `OAI-SearchBot`, `PerplexityBot`, or `Claude-SearchBot`.

## 3. Vercel

1. Import Git repository.
2. Framework: Astro; output `dist`.
3. Add env vars in Project Settings.
4. `vercel.json` in repo sets security headers and asset caching.
5. Configure domain and redirect `www`/non-`www` in Vercel Domains.

## 4. Netlify

1. New site from Git.
2. Build: `npm run build`, publish `dist`.
3. Env vars in Site settings.
4. `public/_redirects` and `_headers` apply automatically.

## 5. Post-deploy checks

```bash
curl -I https://YOUR_DOMAIN/
curl https://YOUR_DOMAIN/robots.txt
curl https://YOUR_DOMAIN/sitemap-index.xml
npm run audit   # against local dist before deploy; re-run after first deploy manually
```

- Submit sitemap in Google Search Console and Bing Webmaster Tools.
- See `docs/SEO-GUIDE.md` for indexing workflow.

## 6. ads.txt

After AdSense approval, edit `public/ads.txt` with your `pub-` ID and redeploy.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Wrong canonical URLs | Set `PUBLIC_SITE_URL` to production origin |
| 404 on deep links | Ensure `trailingSlash: 'always'` matches host trailing-slash policy |
| Sitemap 404 | Confirm `@astrojs/sitemap` build; check `dist/sitemap-index.xml` |
| Ads not showing | Publisher ID empty by design until configured; check CMP for EEA/UK/CH |
