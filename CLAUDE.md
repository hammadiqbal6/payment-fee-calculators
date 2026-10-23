# CLAUDE.md — Payment fee calculators

Follow **AGENTS.md** and **docs/SEO-GUARDRAILS.md** for all SEO, content, and deploy work.

## Quick rules

- Site URL: `PUBLIC_SITE_URL` → `src/config/site.ts` (`siteConfig.siteUrl`) only.
- Fees: `src/data/fees.ts` + tests; never invent rates.
- New tools: `.cursor/skills/add-new-tool/SKILL.md`.
- New/expanded guides: existing `Guide` shape in `src/data/guides.ts`; link via `src/data/relatedGuides.ts`.
- Before PR: `npm run build && npm test && npm run audit`.

Custom domains: document-only until live — see “Switching to a custom domain” in `docs/SEO-GUARDRAILS.md`.
