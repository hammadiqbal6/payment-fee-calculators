# Fee rate watcher

GitHub Action (`.github/workflows/rate-watcher.yml`) that runs weekly (and on `workflow_dispatch`) to compare `src/data/fees.ts` against official pricing pages.

## Behavior

1. Load every rate from `src/data/fees.ts`.
2. For each rule in `scripts/rate-watcher/extract-rules.json`, fetch the source URL (`fetch` or Playwright for JS-rendered pages).
3. Extract percent/fixed with the rule’s regex / `patterns` list (or platform-only confirmation for blended creator schedules).
4. If a parseable rate **differs**, propose a patch and open/update a **single** PR (never merge, never push to `main`). Platform-only drifts are reported but never auto-patched into blended `fees.ts` rows.
5. If a page cannot be fetched or parsed, **do not guess** — flag it in the PR body and open/comment an issue. Debug snippets are written under `docs/rate-watcher/debug-*.txt`.

## Local dry run

```bash
npm ci
npx playwright install chromium
npm run rate-watch:dry
# or:
node scripts/rate-watcher/watch.mjs --dry-run --json
```

`--dry-run` writes the report locally and **does not** create GitHub issues or PRs.

Artifacts land in `docs/rate-watcher/`.

## Fixing a broken extractor

When a provider redesigns their pricing page, edit only the matching entry in `extract-rules.json` (`pattern` / `patterns`, `waitForText`, strategy, or `occurrence`). Prefer alternate `patterns` for A/B or table-vs-card layouts. Re-run the dry watcher until the rule reports `ok` or a correct `drift` across several consecutive runs.

## Coverage notes (not every `fees.ts` row has a rule)

The watcher covers the high-traffic / high-drift schedules in `extract-rules.json` (Stripe US/AU/intl, PayPal US/UK/AU/IN, Square US/UK/AU, Venmo, Cash App Business, Shopify Basic/Grow, Patreon platform %, Ko-fi tip 0%, BMAC platform %, Gumroad platform, Wise USD→GBP flag).

**Intentionally not auto-watched** (manual re-verify on content refresh): most regional Stripe variants (UK/CA/EU, FX/manual/Connect/Invoicing), PayPal card/F&F/intl/micro, Square keyed/API/UK-intl, Venmo Instant, Cash App Instant (estimated), Zelle, Patreon legacy blends, Ko-fi blended shop/gold rows, BMAC membership blend, Gumroad Discover/direct blend, Shopify Advanced/Plus/third-party, and Wise corridors beyond the USD→GBP unparseable flag. Blended creator rows use `compareMode: platformOnly` where noted so the watcher does not overwrite processing estimates.
