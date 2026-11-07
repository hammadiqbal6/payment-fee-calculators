# Fee rate watcher

GitHub Action (`.github/workflows/rate-watcher.yml`) that runs weekly (and on `workflow_dispatch`) to compare `src/data/fees.ts` against official pricing pages.

## Behavior

1. Load every rate from `src/data/fees.ts`.
2. For each rule in `scripts/rate-watcher/extract-rules.json`, fetch the source URL (`fetch` or Playwright for JS-rendered pages).
3. Extract percent/fixed with the rule’s regex / `patterns` list (or platform-only confirmation for blended creator schedules).
4. If a parseable rate **differs**, propose a patch and open/update a **single** PR. Platform-only drifts are reported but never auto-patched into blended `fees.ts` rows.
5. If a page cannot be fetched or parsed, **do not guess** — flag it in the PR body and open/comment an issue. Debug snippets are written under `docs/rate-watcher/debug-*.txt`.
6. **Safe auto-merge** (optional): when every proposed change in the run verifies, the same workflow runs `npm ci`, `npm test`, `npm run build`, and `npm run audit` on the patched tree, then squash-merges with `gh` + `GITHUB_TOKEN`. It does **not** rely on PR-triggered CI (token-created PRs do not fire workflows).

## Auto-merge verification

A run is eligible only when **all** of the following hold for every proposed (patchable) change:

| Check | Meaning |
|-------|---------|
| Clean parse | Status is a normal drift — not `fetch_error`, unparseable, or `platformOnly` / blended |
| Consistent extraction | All matching `patterns` agree, and a **second fetch** returns the same percent + fixed |
| Sane bounds | Percent move ≤ `maxPercentChangePoints` (default **1.5** pp); fixed fee within **2×** *or* ±`maxFixedAbsoluteDelta` (default **1** currency unit) |
| Diff allowlist | Only `src/data/fees.ts` and `docs/rate-watcher/**` changed |
| Gates | `npm ci` + `test` + `build` + `audit` all pass on the patched tree |

Bounds live under `defaults.autoMerge` in `extract-rules.json` (overridable without code changes).

If **any** proposed change fails a check (or the run has fetch errors / platform-only drifts), the PR stays open with the **`needs human review`** label and the blocking reasons in the body.

On a successful auto-merge the watcher also:

- Bumps `lastVerified` for changed rows
- Updates `FEE_DATA_VERSION` / `FEE_DATA_UPDATED`
- Prepends a `feeChangelog` entry noting **auto-verified by rate watcher** with old → new values and the source URL

### Opt-out / dry-run

| Control | Effect |
|---------|--------|
| Schedule | `AUTO_MERGE=true` by default |
| `workflow_dispatch` → `auto_merge` input | Toggle auto-merge for a manual run (default true) |
| Env `AUTO_MERGE=false` or CLI `--no-auto-merge` | Force proposal-only |
| `--dry-run` | Writes local report / `fees.proposed.ts` and prints whether the run **would** auto-merge or need human review — no GitHub PR/issue/merge |

## Local dry run

```bash
npm ci
npx playwright install chromium
npm run rate-watch:dry
# or:
node scripts/rate-watcher/watch.mjs --dry-run --json
node scripts/rate-watcher/watch.mjs --dry-run --no-auto-merge
```

`--dry-run` writes the report locally and **does not** create GitHub issues or PRs.

Artifacts land in `docs/rate-watcher/`.

Unit tests for bounds / eligibility: `scripts/rate-watcher/verify.test.ts` (included in `npm test`).

## Fixing a broken extractor

When a provider redesigns their pricing page, edit only the matching entry in `extract-rules.json` (`pattern` / `patterns`, `waitForText`, strategy, or `occurrence`). Prefer alternate `patterns` for A/B or table-vs-card layouts. Re-run the dry watcher until the rule reports `ok` or a correct `drift` across several consecutive runs.

## Coverage notes (not every `fees.ts` row has a rule)

The watcher covers the high-traffic / high-drift schedules in `extract-rules.json` (Stripe US/AU/intl, PayPal US/UK/AU/IN, Square US/UK/AU, Venmo, Cash App Business, Shopify Basic/Grow, Patreon platform %, Ko-fi tip 0%, BMAC platform %, Gumroad platform, Wise USD→GBP flag).

**Intentionally not auto-watched** (manual re-verify on content refresh): most regional Stripe variants (UK/CA/EU, FX/manual/Connect/Invoicing), PayPal card/F&F/intl/micro, Square keyed/API/UK-intl, Venmo Instant, Cash App Instant (estimated), Zelle, Patreon legacy blends, Ko-fi blended shop/gold rows, BMAC membership blend, Gumroad Discover/direct blend, Shopify Advanced/Plus/third-party, and Wise corridors beyond the USD→GBP unparseable flag. Blended creator rows use `compareMode: platformOnly` where noted so the watcher does not overwrite processing estimates.

## Limitations

- Auto-merge never updates blended / `platformOnly` schedules even when the platform fee itself drifts — those always need a human to revise the blend.
- Consistency is same-run (multi-pattern + immediate re-fetch), not a multi-day soak.
- `GITHUB_TOKEN` squash-merge requires the default branch to allow merges from Actions (no blocking required checks that only run on `pull_request` from forks/tokens, and no rules that forbid the token). Gates in this workflow are the authority.
- Large legitimate pricing changes outside the configured bounds intentionally stay as review PRs.
