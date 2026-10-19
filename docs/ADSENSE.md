# Google AdSense readiness

This site is structured for AdSense review but **ads stay disabled** until you set `PUBLIC_ADSENSE_PUBLISHER_ID` in `src/config/site.ts` (or env).

## Eligibility checklist

- [ ] Site owner is 18+ with a single AdSense account
- [ ] You can edit site HTML / deploy updates
- [ ] **Original content:** each tool page has 600+ words, formula, examples, FAQ (see `npm run audit`)
- [ ] **Working tools** above the fold; no deceptive interstitials
- [ ] Required pages: About, Contact, Privacy (AdSense cookie disclosure), Terms, Methodology
- [ ] Clear navigation; no broken internal links (`npm run audit:links`)
- [ ] `public/ads.txt` template ready for your `pub-` ID after approval
- [ ] **CMP:** certified consent management platform for EEA, UK, and Switzerland before personalized ads
- [ ] Traffic is organic; no incentivized clicks

## When to apply

Apply after the site has **~20–30 quality URLs** indexed and some real traffic (often a few weeks post-launch). This repo ships 40+ pages including guides and hubs — still wait until content is live on your domain with Search Console verified.

## Enabling ads

1. Approve AdSense account for your domain.
2. Set `PUBLIC_ADSENSE_PUBLISHER_ID` (format `ca-pub-XXXXXXXXXXXXXXXX`).
3. Update `public/ads.txt` with the same publisher ID.
4. Configure ad slots in `src/components/AdSlot.astro` (slot IDs from AdSense UI).
5. Optional: set `adsenseAutoAds: true` in `siteConfig` after testing layout / CLS.
6. Integrate a **Google-certified CMP** before serving personalized ads in EEA/UK/CH.

## Policy pitfalls for tool sites

- Tool-only pages with no explanatory prose → “low value content” risk
- Mass duplicate regional pages without unique data
- Misleading financial claims — keep “not financial advice” disclaimers
- Ads pushing the calculator below the fold on mobile

Run `npm run audit:adsense` before applying.

## Privacy requirements

`src/pages/privacy.astro` includes AdSense/third-party cookie language and opt-out links (`google.com/settings/ads`, `aboutads.info`). Contact email defaults to `hammadiqbal117@gmail.com` via `siteConfig.contactEmail` (override with `PUBLIC_CONTACT_EMAIL`).
