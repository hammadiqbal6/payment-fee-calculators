# SEO guardrails — payment fee calculators

Do/don’t rules from the Oct 2026 multi-site technical SEO + AEO audit. CI (`npm run audit`) fails the build when these are violated.

## Single site URL (custom domains coming soon)

**DO**

- Set the canonical origin with **`PUBLIC_SITE_URL`** only (no trailing slash). Fallback in `src/config/site.ts` is the current `*.workers.dev` URL.
- Use `siteConfig.siteUrl` everywhere: Astro `site`, canonicals, sitemap, robots.txt, llms.txt, Open Graph, JSON-LD, IndexNow (`scripts/indexnow.mjs`).
- Sister sites use `PUBLIC_SITE_URL_*` from `src/config/sisterSites.ts`.

**DON’T**

- Hardcode `example.com`, a preview host, or a second production host in pages, layouts, or scripts.
- Bake a custom domain into source before DNS + Workers custom domain are live.

### Switching to a custom domain (checklist)

1. Set **`PUBLIC_SITE_URL=https://your.domain`** (and matching `PUBLIC_SITE_URL_PAYMENT_FEES`) in Cloudflare Workers Builds **and** GitHub Actions env — then rebuild so Astro reinlines URLs.
2. Attach the custom domain on the Worker (Cloudflare dashboard → Workers → Custom Domains). Do **not** change Cloudflare settings from this repo’s agent runs unless a human asks.
3. **301** the old `*.workers.dev` host to the new domain (Worker route / redirect rule).
4. Update **Google Search Console** property + sitemap; update **GA4** stream URL if needed; resubmit IndexNow after deploy (`npx wrangler deploy && node scripts/indexnow.mjs`).
5. Re-run `npm run build && npm run audit` and confirm canonicals/sitemap/OG/JSON-LD all show the new host.

## Trailing slashes & static files

**DO**

- Keep Astro `trailingSlash: 'always'` and `src/worker.ts` 308 redirects for extensionless paths.
- Treat real files as files: `FILE_EXT` in `src/worker.ts` must allow **up to 16** alphanumeric extension chars so `/site.webmanifest` is **not** redirected to `/site.webmanifest/` (404).

**DON’T**

- Use `{1,8}` (or shorter) for `FILE_EXT` — `.webmanifest` is 11 characters.
- Rely on Workers `html_handling` alone for slash policy (it issues temporary 307).

## Titles, descriptions, H1, canonical

**DO**

- Exactly **one H1** per indexable page.
- Unique `<title>` **≤ 60** characters (final rendered title in HTML).
- Meta description **50–165** characters (prefer 120–160).
- Self-referencing absolute **canonical** on every indexable page; embed pages are `noindex` but still get a canonical to the full tool URL.

**DON’T**

- Ship missing titles, descriptions, or canonicals.
- Let BaseLayout append `| FeeCalc` when that would push the title over 60.

## Direct answers & disclaimers

**DO**

- Open tool pages and the homepage with a **40–60 word** direct answer (not only a brand tagline).
- Keep “Not financial advice” as a visible **disclaimer note** (`Disclaimer.astro`), not as an FAQ `<details>` / FAQPage question.

**DON’T**

- Hide the financial disclaimer inside FAQ schema or FAQ UI.

## Guides & internal linking

**DO**

- Guides ≈ **1,000+ words** (CI floor **800**): worked example, fee table, FAQ + **FAQPage**, author, `dateModified`, official sources with **as-of** dates.
- Reuse rates from `src/data/fees.ts` — never invent fee stats.
- Every tool page includes a topical **Learn more** block (`src/data/relatedGuides.ts`); Stripe / PayPal / Square also link `/examples/fee-on-*`.
- Cross-link guide↔guide and hubs; list every guide on `/guides/`, sitemap, hubs where relevant, and `llms.txt`.

**DON’T**

- Point every tool at the same single guide.
- Leave thin guides (<800 words) or guides missing from the sitemap / llms.txt.

## Structured data & llms.txt

**DO**

- BreadcrumbList **and** visible breadcrumbs on tools, guides, hubs, about, contact, methodology, privacy, terms, guides index.
- CollectionPage / WebPage / ContactPage / Article / FAQPage / WebApplication as appropriate.
- Full `llms.txt`: H1, summary, sections listing **every** tool and guide with one-liners (absolute URLs from `siteConfig.siteUrl`).

**DON’T**

- Ship invalid JSON-LD.
- Keep a stub llms.txt with only a handful of links.

## Open Graph & IndexNow

**DO**

- `og:image` absolute URL that does **not** end in `/`.
- IndexNow key = real 32-char hex matching `public/<key>.txt` (`PUBLIC_INDEXNOW_KEY` / `INDEXNOW_KEY`).

**DON’T**

- Use placeholder IndexNow keys (`REPLACE_ME`, `your-key`, `placeholder`, etc.).
- Point `og:image` at a directory URL.

## Wrangler `vars` vs `npx wrangler preview`

**Lesson (from sibling sites):** putting build-time `PUBLIC_*` values in a **top-level** Wrangler `vars` block can break `npx wrangler preview` / preview builds. Prefer:

- Build-time: Cloudflare Workers Builds environment variables (and GitHub Actions `env`) consumed by Astro as `import.meta.env.PUBLIC_*`.
- If preview-specific vars are required, put them under a **`previews`** block (or document the preview env separately) — do **not** assume top-level `vars` are safe for local preview.

This Worker is static-assets + slash worker only; URL config is build-time, not runtime Worker bindings.

## Caching

**DO**

- Long-cache hashed `/assets/*` (`immutable`).
- Sensible cache for favicons / static images in `public/_headers`.

## Audit / CI enforcement

`npm run audit` (see `scripts/audit/`) fails on:

| Check | Where |
|-------|--------|
| `example.com` or hardcoded host ≠ configured site | `seo.mjs` |
| `og:image` ends with `/` | `seo.mjs` |
| Title missing or >60 | `seo.mjs` |
| Meta description outside 50–165 | `seo.mjs` |
| Missing canonical | `seo.mjs` |
| H1 count ≠ 1 | `seo.mjs` |
| Tool page with no `/guides/` link | `seo.mjs` |
| Guide page <800 words | `seo.mjs` |
| Indexable page missing from sitemap | `seo.mjs` |
| Broken internal links / orphans | `links.mjs` |
| Invalid JSON-LD | `seo.mjs` + `structured-data.mjs` |
| Inline classic scripts containing `import` | `seo.mjs` |
| IndexNow placeholder key | `seo.mjs` |
| Static file ext (e.g. `.webmanifest`) would get slash redirect | `seo.mjs` + worker test |

Also: `npm test`, `npm run build`, `npm run proof:verify`.
