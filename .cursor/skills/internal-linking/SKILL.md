---
name: internal-linking
description: Repo-specific internal linking workflow for payment fee calculator site.
---

# internal-linking

## When to use
Adding tools/guides or fixing thin topical clusters.

## Map (payment)

- Every tool → `src/data/relatedGuides.ts` (`toolGuideMap`) Learn more block
- Stripe / PayPal / Square → also `/examples/fee-on-{50,100,500,1000}/`
- compare-payment-fees ↔ stripe-vs-paypal-fees, square-vs-stripe-vs-shopify, hidden-payment-fees
- patreon / kofi / bmac ↔ patreon-vs-kofi-vs-bmac; gumroad ↔ gumroad-vs-kofi-fees
- All tools ↔ hidden-payment-fees (at least as secondary)
- Guide ↔ guide via `relatedGuides` on each Guide; hubs link cluster guides
- New guides appear on `/guides/`, sitemap, hubs, `llms.txt` (data-driven)

## Steps
1. Update `relatedGuides.ts` and guide `relatedGuides` / `relatedHubs`.
2. Build + `npm run audit` (fails if a tool page has no `/guides/` link).
3. Update KEYWORD-MAP for new URLs.
