# Fee schedule update process

Payment and creator platform fees change without warning. Fresh, cited schedules are the moat for this site. Follow this checklist whenever a provider updates pricing, you receive a correction, or the weekly rate watcher opens a PR.

## Single source of truth

**File:** `src/data/fees.ts`

Every calculator, comparison tool, example page, guide fee table, visible “last verified” stamp, and `/fee-changelog/` entry must read from this file. Do not invent rates in `toolContent.ts`, `guides.ts`, or page copy — derive figures from the schedules (or update the schedule first, then the prose).

Each `FeeComponent` carries:

| Field | Meaning |
|-------|---------|
| `percent` | Decimal (e.g. `0.029` = 2.9%) |
| `fixed` | Fixed amount in schedule currency |
| `currency` | ISO code |
| `notes` | Caveats (international, blended estimate) |
| `sourceUrl` | Official page URL |
| `lastVerified` | `YYYY-MM-DD` when confirmed |
| `verificationStatus` | `verified` \| `unverified` \| `estimated` |

Also bump when material:

- `FEE_DATA_VERSION` — e.g. `2026.10.24`
- `FEE_DATA_UPDATED` — ISO date for site-wide “last updated”
- `feeChangelog` — human summary + before/after rows (powers `/fee-changelog/` and methodology)

## 1. Verify the change

1. Open the official pricing or fee policy URL (linked from the schedule).
2. Screenshot or copy the relevant rate table (date-stamped).
3. Note currency, percent, fixed fee, and footnotes (international, micropayments, plan tier).
4. Treat third-party research (including attached audits) as a **lead**, not gospel.

## 2. Edit the data file

Update the affected `FeeComponent` fields, set `lastVerified` to today, set `verificationStatus` appropriately, and append a `feeChangelog` entry.

## 3. Update visible content

- Tool intros / key takeaways if the default example changed materially (`src/data/toolContent.ts`).
- Guides that cite specific dollar examples (`src/data/guides.ts`).
- Comparison page rebuilds from fees automatically; spot-check copy.

## 4. Test and audit

```bash
npm test          # formulas + freshness + no invented schedules
npm run build
npm run audit
```

Freshness: verified/estimated rates must have `lastVerified` within ~60 days (`FEE_MAX_AGE_DAYS`).

## 5. Weekly GitHub Action (no local machines required)

`.github/workflows/rate-watcher.yml` runs Mondays and on `workflow_dispatch`:

- Fetches each source (Playwright when JS-rendered)
- Compares using `scripts/rate-watcher/extract-rules.json`
- Opens/updates a **single PR** with before/after + source links
- Flags fetch/parse failures in the PR or an issue — **never guesses**
- **Never** auto-merges or commits to `main`

Local dry run: `npm run rate-watch:dry`

## 6. SEO / indexing

- Rebuild after content change (sitemap lastmod follows build).
- Optional: `npm run indexnow` after deploy.

## Blended / estimated schedules

Patreon, Ko-fi, Buy Me a Coffee, Gumroad (processing layer), and Wise corridors use **estimates** when providers split platform vs processing. Label `notes` and `verificationStatus: 'estimated'` (or `'unverified'` when the page cannot be read). Prefer updating the blend when either layer changes.

## Skill

Use the Cursor skill `.cursor/skills/content-refresh/SKILL.md` for agent-assisted refreshes.
