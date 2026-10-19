---
name: content-refresh
description: Repo-specific content refresh workflow for payment fee calculator site.
---

# content-refresh

## When to use
Apply when working on this repository's fee calculators, SEO, or AdSense readiness.

## Steps
1. Read `AGENTS.md` and `docs/SEO-PLAYBOOK.md`.
2. Run `npm run build` and relevant audit (`npm run audit`).
3. For fee/rate changes: follow `docs/FEE-UPDATE.md` — edit `src/data/fees.ts` (`lastVerified`, `sourceUrl`, bump `FEE_DATA_VERSION`), update affected guide examples, run `npm test`.
4. Regenerate evidence: `npx playwright install chromium && npm run proof` → commit `docs/proof/`.
5. Update `docs/KEYWORD-MAP.md` if adding URLs.
6. Commit with clear message; update `PROGRESS.md` on long builds.

## Repo paths
- Fees: `src/data/fees.ts`
- Math: `src/lib/fees/calculate.ts`
- Tools: `src/pages/tools/[slug].astro`
- Config: `src/config/site.ts`
