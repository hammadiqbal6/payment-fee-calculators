# Proof index

Generated: 2026-10-19T06:37:45.071Z

```bash
npm ci
npm run proof
```

| Check | Reproduce | Tool | UTC | Result | Artifact |
|-------|-----------|------|-----|--------|----------|
| Build | `npm run build` | node v22.14.0 | 2026-10-19T06:37:45Z | **PASS** | dist/ |
| Unit tests | `npm test` | vitest ^5.0.5 | 2026-10-19T06:37:45Z | **PASS** | tests.txt |
| SEO audit | `npm run audit` | scripts/audit/* | 2026-10-19T06:37:45Z | **PASS** | seo-audit.txt |
| JS budget ≤50KB gzip | `npm run audit:budget` | scripts/audit/budget.mjs | 2026-10-19T06:37:45Z | **PASS** | bundle-size.txt |
| Lighthouse mobile+desktop | `npm run proof` | Lighthouse 12.1.0 | 2026-10-19T06:37:45Z | **PASS** | lighthouse/SUMMARY.md |
| JSON-LD extract+validate | `npm run proof` | scripts/proof/run.mjs | 2026-10-19T06:37:45Z | **PASS** | structured-data/validation.json |
| Sitemap & robots | `npm run proof` | scripts/proof/run.mjs | 2026-10-19T06:37:45Z | **PASS** | sitemap-robots.txt |
| AdSense readiness | `npm run proof` | scripts/proof/run.mjs | 2026-10-19T06:37:45Z | **PASS** | adsense-readiness.md |
| Mobile screenshots + viewport | `npm run proof` | playwright chromium | 2026-10-19T06:37:45Z | **PASS** | mobile/ |
