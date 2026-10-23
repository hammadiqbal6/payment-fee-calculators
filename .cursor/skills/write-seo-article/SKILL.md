---
name: write-seo-article
description: Repo-specific write seo article workflow for payment fee calculator site.
---

# write-seo-article

## When to use
Writing or expanding guides under `/guides/`.

## Steps
1. Read `docs/SEO-GUARDRAILS.md`, `docs/KEYWORD-MAP.md`, and `src/data/fees.ts` for accurate rates.
2. Add/update a `Guide` in `src/data/guides.ts`:
   - Title ≤58 chars; description 120–160 chars; `answerFirst` 40–60 words
   - ~1000+ words (CI ≥800): worked example, `feeTable`, FAQ (4–6), `sources` with as-of dates
   - `relatedTools`, `relatedGuides`, optional `relatedHubs`
3. Wire tools in `src/data/relatedGuides.ts`; update KEYWORD-MAP.
4. Guides index, sitemap, and llms.txt pick up data automatically.
5. Run `npm run build && npm run audit`.

## Do not
- Invent fee statistics — copy from `fees.ts` / official pricing URLs only.
- Omit FAQPage (rendered from `faqs` in `guides/[slug].astro`).
