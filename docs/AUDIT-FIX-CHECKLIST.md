# Mobile SEO audit + playbook checklist (payment-fee-calculators)

Live site: https://payment-fee-calculators.hammadiqbal117.workers.dev

## Payment-specific mobile (P1–P6)

| Item | Status | Change |
|------|--------|--------|
| P1 Compare overflow 424→360; input 13px | Fixed | Astro markup for compare shell; `is:global` field styles; `font-size: max(1rem,16px)` |
| P2 Calculator below fold | Fixed | FeeCalculator moved under H1; compact disclaimer `<details>`; meta collapsed |
| P3 Cookie banner ~226px | Fixed | Compact bar (~62–70px) with Accept/Reject |
| P4 Tap targets footer/FAQ/breadcrumbs | Fixed | `--tap: 48px` on footer, FAQ summary, breadcrumbs |
| P5 Long option labels | Fixed | Short schedule labels; rate in helper line |
| P6 Table scroll cue | Fixed | `.table-wrap` + “Swipe →” hint |

## Technical SEO (T1–T5) + shared

| Item | Status | Change |
|------|--------|--------|
| T1 robots per-bot cancel Disallows | Fixed | Per-bot groups repeat Disallows (incl. OAI-SearchBot) |
| T2 `/docs-fee-update/` | Fixed | 301 → `/methodology/`; noindex stub; dropped from sitemap |
| T3 Custom domain | Skipped | Domain unchanged per request (workers.dev) |
| T4 307 trailing slash | Mitigated | Worker `src/worker.ts` issues **308** before assets; note: CF `html_handling` alone is still 307 |
| T5 Favicons / OG dims | Fixed | Playbook set: ico, svg, 96 png, apple 180, manifest 192/512 + maskable, logo-512; og width/height/alt |
| Guide slug mismatch | Fixed | `/guides/hidden-payment-fees/` + 301 from ebay slug |
| Guide cannibalization | Fixed | Merged $100 reverse guide into how-to-price; stripe-vs-paypal stays narrative |
| Suggested titles/meta | Fixed | Stripe/PayPal/Zelle/Compare (+ others trimmed to budget) |

## Playbook (one-person site)

| Item | Status |
|------|--------|
| Author = Hammad Iqbal; no fake “reviewed by” | Done |
| `/about/` first-person + ProfilePage | Done |
| `/methodology/` sources, AI disclosure, changelog, correction log | Done |
| `/authors/` → `/about/#maintainer` | Done |
| TrustBlock + “Checked \<date\> on …” sources | Done |
| Person `@id` = `https://github.com/hammadiqbal6#person` | Done |
| Exact favicon filenames + head tags | Done |
| Fee-breakdown / compare illustrations | Done |
| No invented credentials/headshot | Done (no photo) |

## Extra scope

| Item | Status |
|------|--------|
| Keep GA4; defer + Consent Mode v2; events | Done (`calculation_run`, `compare_used`, `outbound_reference_click`, `embed_copy`) |
| Keep GSC / Bing meta | Unchanged |
| Worked examples / how calculated | Done on tools + examples |
| Long-tail fee-on-$X pages | `/examples/fee-on-{50,100,500,1000}/` |
| Sister-site links (sparing) | `SisterSites` on topical tools/guides only |
| A11y: focus, aria-live, dark mode, reduced motion | Done |
| Embed snippet + copy | Done on tool pages |

## Manual actions needed

1. **Custom domain** — still on `*.workers.dev` (intentionally unchanged).
2. **Deploy Worker** — `main: src/worker.ts` + `run_worker_first` must be deployed for 308 slash redirects.
3. **GitHub repo website URL / topics** — set in GitHub UI (CLI is read-only here).
4. **Ko-fi URLs** — official pages often return 403 to bots; rates still cite `ko-fi.com` / help URLs — re-check in a browser periodically.
5. **Buy Me a Coffee** — `/fees` 404; sources now point to verified help article on calculating charges.

## Verification

- `npm test` — 104 passed
- `npm run build` — OK
- `npm run audit` — OK
- Playwright 360/390/768 — no horizontal overflow; inputs ≥16px; Stripe first input ~y=345 on 740; cookie bar ~62px
