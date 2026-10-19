---
name: keyword-research
description: Repo-specific keyword research workflow for payment fee calculator site.
---

# keyword-research

## When to use
Apply when working on this repository's fee calculators, SEO, or AdSense readiness.

## Steps
1. Read `AGENTS.md` and `docs/SEO-PLAYBOOK.md`.
2. Run `npm run build` and relevant audit (`npm run audit`).
3. For fee changes: edit `src/data/fees.ts`, follow `docs/FEE-UPDATE.md`, run `npm test`.
4. Update `docs/KEYWORD-MAP.md` if adding URLs.
5. Commit with clear message; update `PROGRESS.md` on long builds.

## Repo paths
- Fees: `src/data/fees.ts`
- Math: `src/lib/fees/calculate.ts`
- Tools: `src/pages/tools/[slug].astro`
- Config: `src/config/site.ts`
