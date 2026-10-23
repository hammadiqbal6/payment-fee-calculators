---
name: seo-audit
description: Repo-specific seo audit workflow for payment fee calculator site.
---

# seo-audit

## When to use
Apply when working on this repository's fee calculators, SEO, or AdSense readiness.

## Steps
1. Read `AGENTS.md`, `docs/SEO-PLAYBOOK.md`, and **`docs/SEO-GUARDRAILS.md`**.
2. Run `npm run build` and `npm run audit` (SEO titles/descriptions/canonicals/H1, guide word counts, tool→guide links, sitemap coverage, JSON-LD, IndexNow key, worker FILE_EXT, AdSense, JS budget, links).
3. For fee changes: edit `src/data/fees.ts`, follow `docs/FEE-UPDATE.md`, run `npm test`.
4. Update `docs/KEYWORD-MAP.md` if adding URLs; ensure `llms.txt` lists new tools/guides (generated from data).
5. Commit with clear message; update `PROGRESS.md` on long builds.

## Repo paths
- Fees: `src/data/fees.ts`
- Math: `src/lib/fees/calculate.ts`
- Tools: `src/pages/tools/[slug].astro`
- Guides: `src/data/guides.ts`, `src/data/relatedGuides.ts`
- Config: `src/config/site.ts` (`PUBLIC_SITE_URL`)
- Guardrails: `docs/SEO-GUARDRAILS.md`, `scripts/audit/seo.mjs`
