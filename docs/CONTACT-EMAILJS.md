# Contact form via EmailJS (free plan)

The `/contact/` page can send messages through [EmailJS](https://www.emailjs.com/) using a tiny inline `fetch` to their REST API. No `@emailjs/browser` SDK.

If any of the three public env vars is empty at **build** time, the page shows a plain **mailto** link instead of the form (graceful fallback). The mailto address stays visible either way.

## Environment variables

Set these in Cloudflare Workers Builds / GitHub Actions / local `.env` (same names as `.env.example`):

| Variable | Purpose |
|----------|---------|
| `PUBLIC_EMAILJS_SERVICE_ID` | EmailJS Email Service ID |
| `PUBLIC_EMAILJS_TEMPLATE_ID` | EmailJS Email Template ID |
| `PUBLIC_EMAILJS_PUBLIC_KEY` | EmailJS **public** key (`user_id` in the API body) |

**Never** commit or set the EmailJS **private** key. Only the public key is used in the browser.

After changing values, run `npm run build` and redeploy so Astro reinlines them.

## EmailJS dashboard setup

1. Create a free EmailJS account and an Email Service (Gmail, Outlook, etc.).
2. Create a template with these variables (double curly braces in the EmailJS editor):

| Template variable | Filled from |
|-------------------|-------------|
| `{{from_name}}` | Name field |
| `{{reply_to}}` | Email field (use as Reply-To in the template) |
| `{{message}}` | Message body |
| `{{page_url}}` | Canonical contact page URL |
| `{{site_name}}` | `siteConfig.siteName` |

Example template body:

```text
From: {{from_name}} <{{reply_to}}>
Site: {{site_name}}
Page: {{page_url}}

{{message}}
```

3. Copy Service ID, Template ID, and Public Key into the three `PUBLIC_EMAILJS_*` vars.

## Client behavior (free-plan friendly)

- POST `https://api.emailjs.com/api/v1.0/email/send` with JSON `{ service_id, template_id, user_id, template_params }`.
- Honeypot field: non-empty → fake success, no request.
- Throttle: one successful send per 60 seconds (`localStorage`).
- Message capped at 2000 characters.
- Button disabled while the request is in flight; inline success/error via `aria-live`.
- CSP (`public/_headers`) allows `connect-src https://api.emailjs.com`.

## Without JavaScript

Use the visible mailto link on the page (`siteConfig.contactEmail`).
