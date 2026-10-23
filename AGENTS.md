# AGENTS.md — Payment fee calculators site

## Overview

Static Astro site (`src/`) with client-side fee math (`src/lib/fees/`), versioned schedules (`src/data/fees.ts`), 12 processor tools + comparison, guides, and SEO/AdSense infrastructure.

## Architecture

```mermaid
flowchart TB
  subgraph data [Data layer]
    fees[fees.ts schedules]
    content[toolContent + toolDepth]
    guides[guides.ts + relatedGuides.ts]
  end
  subgraph build [Astro build]
    pages[pages/tools + guides]
    layout[BaseLayout + JSON-LD]
  end
  subgraph client [Browser]
    calc[FeeCalculator island script]
  end
  fees --> pages
  content --> pages
  guides --> pages
  pages --> layout
  calc --> fees
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev server |
| `npm run build` | Static `dist/` |
| `npm test` | Vitest fee formulas + worker ext guard |
| `npm run audit` | SEO, AdSense, JS budget, links, structured data |
| `npm run lhci` | Lighthouse CI mobile budgets |
| `npm run check` | build + test + audit |

## Config (single owner file)

`src/config/site.ts` — domain via **`PUBLIC_SITE_URL`** (workers.dev fallback), brand, AdSense, GA4, verification tokens, IndexNow key.

**All** canonicals, sitemap, robots.txt, llms.txt, OG, JSON-LD, and IndexNow must use `siteConfig.siteUrl`. See `docs/SEO-GUARDRAILS.md` for custom-domain cutover (env var → Workers custom domain → 301 workers.dev → Search Console / GA).

## Add a new tool page

1. Add `ProcessorSchedule` in `src/data/fees.ts` (rates + `sourceUrl` + `lastVerified`).
2. Add keyword meta in `src/lib/tools.ts` (`keywordMap` entry).
3. Add `toolContent` + `toolDepth` entries in `src/data/`.
4. Add topical guides in `src/data/relatedGuides.ts` (`toolGuideMap`).
5. Page auto-generates via `src/pages/tools/[slug].astro` from `processors` list.
6. Add to `comparisonOrder` if needed; link from relevant hub in `hubCategories`.
7. Add embed route automatically via `src/pages/embed/[slug].astro` (canonical → tool; noindex).
8. Update `docs/KEYWORD-MAP.md`, `llms.txt` (auto from data), run `npm test` and `npm run audit`.
9. Follow `.cursor/skills/add-new-tool/SKILL.md`.

## Add / expand a guide

1. Add or expand entry in `src/data/guides.ts` (~1000+ words; CI requires ≥800).
2. Include worked example, `feeTable`, FAQ (FAQPage), `sources` with as-of dates, `relatedTools` / `relatedGuides` / hubs.
3. Reuse fee numbers from `src/data/fees.ts` only.
4. Wire tools via `relatedGuides.ts`; update KEYWORD-MAP.
5. Follow `.cursor/skills/write-seo-article/SKILL.md` and `docs/SEO-GUARDRAILS.md`.

## Content / SEO rules

- Governing docs: `docs/SEO-PLAYBOOK.md`, **`docs/SEO-GUARDRAILS.md`**, `.cursor/rules/seo-guardrails.mdc`
- One primary keyword per URL: `docs/KEYWORD-MAP.md`
- Tool pages: calculator above fold, 600–1200 words, formula, worked example, FAQ, sources, **Learn more** guides
- Direct-answer intro 40–60 words; disclaimer is not an FAQ item
- Visible breadcrumbs + BreadcrumbList on hubs, guides, about, contact, methodology, privacy, terms
- Worker `FILE_EXT` must allow `.webmanifest` (11+ char extensions)
- Fee freshness: `docs/FEE-UPDATE.md` + content-refresh skill

## AdSense

- `docs/ADSENSE.md`, `npm run audit:adsense`
- Financial disclaimer on tools: `src/components/Disclaimer.astro` (note, not FAQ)

## Subagents (`.cursor/agents/`)

| Agent | Role |
|-------|------|
| `seo-auditor` | On-page + technical SEO after build |
| `content-writer` | Guides and tool prose |
| `adsense-reviewer` | Policy + page readiness |
| `performance-auditor` | Lighthouse / CWV |
| `link-builder-researcher` | Outreach ideas |
| `fee-fact-checker` | Verify rates against official URLs |

## Definition of done

- All tools work forward + reverse; tests pass for every schedule
- `npm run build`, `npm test`, `npm run audit`, `npm run lhci` pass
- Docs, skills, CI, README complete; SEO guardrails green
- PR to `main` with Lighthouse scores and 360px screenshots
