# SEO & post-launch guide

Governing playbook: `docs/SEO-PLAYBOOK.md`. Keyword map: `docs/KEYWORD-MAP.md`.

## Launch checklist

### Technical (pre-launch)

- [ ] `PUBLIC_SITE_URL` set to production domain
- [ ] HTTPS live; one canonical host (`www` or apex)
- [ ] `npm run build` → `dist/` deployed
- [ ] `robots.txt` allows search + AI answer bots; sitemap URL correct
- [ ] `sitemap-index.xml` submitted (auto-generated at build)
- [ ] Canonical + title + meta on every page (`npm run audit:seo`)
- [ ] JSON-LD: WebSite, Organization, BreadcrumbList, WebApplication per tool
- [ ] Mobile-friendly (360px); Lighthouse mobile ≥ 95 (`npm run lhci`)
- [ ] Core Web Vitals: reserve ad slot height; inline critical CSS
- [ ] `llms.txt` optional at `/llms.txt`

### Google Search Console

1. Add **domain** or **URL-prefix** property.
2. Verify via DNS TXT (domain) or HTML tag (`PUBLIC_GSC_VERIFICATION`).
3. Submit `https://YOUR_DOMAIN/sitemap-index.xml`.
4. URL Inspection → request indexing for homepage, top 3 tools, `/payment-processors/`.
5. Monitor **Page indexing**, **Core Web Vitals**, **Performance** (queries, impressions).
6. Review **AI** / generative performance reports as they appear in GSC.

### Bing Webmaster Tools

1. Import from GSC or verify separately.
2. Submit same sitemap.
3. Configure **IndexNow** key (`PUBLIC_INDEXNOW_KEY` + `scripts/indexnow/post.mjs`).

### GA4

1. Create property; set `PUBLIC_GA4_ID`.
2. Link to Search Console.
3. Mark key events (optional): outbound clicks to official fee pages.

## Keyword workflow (free tools)

1. Seeds from `docs/KEYWORD-MAP.md` and Google Autocomplete (`[processor] fee calculator`, `how much to charge to receive`).
2. Validate KD/volume manually: Ahrefs free keyword generator, Semrush free (10/day), Keyword Planner (needs Ads account).
3. Pick KD ≤ 30 where SERPs show small tool sites (see `docs/MARKET-RESEARCH.md`).
4. After launch: GSC → Performance → filter by page → expand FAQs/guides for queries at positions 8–30.

## Content calendar (next 20 articles)

1. PayPal micropayments vs standard G&S for digital downloads  
2. Stripe international cards: when the +1% matters  
3. Square in-person vs online for food trucks  
4. Shopify Payments vs Stripe for new stores  
5. Gumroad vs Lemon Squeezy fee comparison (if you add Lemon tool)  
6. Patreon tier pricing worked example ($5 / $10 / $25)  
7. Ko-fi Gold break-even calculator narrative  
8. Wise vs PayPal for UK freelancer client payments  
9. Venmo Business vs PayPal for local services  
10. Cash App Business for pop-up shops  
11. Zelle for contractors: risks and limits  
12. How to invoice clients to cover processing fees  
13. 2026 fee changes watchlist (changelog post)  
14. EU VAT vs processor fees (high level, not tax advice)  
15. Chargebacks cost more than fees — prevention basics  
16. Embedding fee calculators on your site (widget SEO)  
17. Comparing creator platforms at $1k/month gross  
18. Micropayment pricing for $3 ebooks  
19. Multi-currency pricing for Stripe  
20. Annual fee audit checklist for small businesses  

## Link building

- Submit to tool directories (AlternativeTo, SaaSHub “free tools”, indie hacker lists).
- Product Hunt / Show HN when domain is live.
- Reddit/forums: answer fee questions with calculator links (no spam).
- Embeddable iframe with credit link (`/embed/[slug]/`).
- Resource page outreach: “payment fee calculators” roundups.

## AI search (GEO)

- Allow OAI-SearchBot, PerplexityBot, Claude-SearchBot in `robots.txt`.
- Answer-first paragraphs on tool pages (40–60 words).
- Cited official sources + visible last-verified dates.
- Consistent entity name (`siteConfig.siteName`) across pages.

## 90-day plan

| Phase | Days | Actions |
|-------|------|---------|
| Launch | 1–14 | Deploy, GSC/Bing, index key URLs, fix crawl errors |
| Content | 15–45 | Publish 2 guides/month from calendar; refresh fee dates |
| Links | 30–60 | Directory submissions, embed outreach, 5 resource emails/week |
| Monetize | 45–90 | Apply AdSense when traffic + quality bar met; add CMP if needed |
| Optimize | 60–90 | GSC-driven FAQ updates; Lighthouse CI on each PR |

## IndexNow

Not used by Google. Run after material updates:

```bash
PUBLIC_SITE_URL=https://yoursite.com PUBLIC_INDEXNOW_KEY=... node scripts/indexnow/post.mjs /tools/stripe-fee-calculator/
```
