## Summary

<!-- What changed and why -->

## Checklist

- [ ] `npm run build && npm test` pass locally
- [ ] Heavy gates run locally when needed (`npm run audit`, `npm run proof:verify`, `npm run lhci`) — PR CI is a fast safety net only

## UI/UX Pro Max

Required for any change to how the site looks or behaves:

- [ ] Consulted `.cursor/skills/ui-ux-pro-max/SKILL.md` (and `python3 .cursor/skills/ui-ux-pro-max/scripts/search.py …` when useful)
- [ ] Checked contrast ≥ 4.5:1, 44px touch targets, visible focus, form labels + inline errors
- [ ] Checked dark mode, no horizontal scroll, and `prefers-reduced-motion`
- [ ] Screenshots attached for visual changes (desktop + ~360px mobile when layout changes)
