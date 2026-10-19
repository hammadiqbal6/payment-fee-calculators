# Fee schedule update process

Payment and creator platform fees change without warning. Fresh, cited schedules are the moat for this site. Follow this checklist whenever a provider updates pricing or you receive a correction.

## 1. Verify the change

1. Open the official pricing or fee policy URL (linked from `src/data/fees.ts` for that schedule).
2. Screenshot or copy the relevant rate table (date-stamped).
3. Note currency, percent, fixed fee, and any footnotes (international, micropayments, plan tier).

## 2. Edit the data file

File: `src/data/fees.ts`

For each affected `FeeComponent`:

| Field | Action |
|-------|--------|
| `percent` | Decimal (e.g. `0.029` = 2.9%) |
| `fixed` | Fixed amount in schedule currency |
| `currency` | ISO code |
| `notes` | Caveats (international, blended estimate) |
| `sourceUrl` | Official page URL |
| `lastVerified` | `YYYY-MM-DD` (today when confirmed) |

Bump when material:

- `FEE_DATA_VERSION` — semver-ish tag (e.g. `2026.11.01`)
- `FEE_DATA_UPDATED` — ISO date for site-wide “last updated”

## 3. Update visible content

- Tool page intro / key takeaways if the default example changed materially.
- Guides that cite specific dollar examples (e.g. “charge $103.30 to receive $100”).
- Comparison page static table (rebuild updates automatically; spot-check copy).

## 4. Test and audit

```bash
npm test          # every rate forward + reverse
npm run build
npm run audit     # SEO word counts, links, AdSense pages
```

## 5. SEO / indexing

- Update `<lastmod>` via build (sitemap integration uses build date; for surgical updates, rebuild after content change).
- Optional: run `scripts/indexnow/post.mjs` with changed URLs (Bing/Yandex — not Google).

## 6. Communicate

- Add a line to the PR description: processor, old → new rate, source URL.
- If you maintain a public changelog later, link the commit.

## Blended / estimated schedules

Patreon, Ko-fi, Buy Me a Coffee, Gumroad (processing layer), and Wise corridors use **estimates** when providers split platform vs processing. Label `notes` clearly. Prefer updating the blend when either layer changes.

## Skill

Use the Cursor skill `.cursor/skills/content-refresh/SKILL.md` for agent-assisted refreshes.
