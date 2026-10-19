import type { APIRoute } from 'astro';
import { siteConfig } from '@/config/site';

export const GET: APIRoute = () => {
  const body = `# Optional llms.txt for ${siteConfig.siteName}
# Note: Google ignores llms.txt. Kept as a cheap optional hint for other tools.

Name: ${siteConfig.siteName}
Description: Free payment processor and creator fee calculators (Stripe, PayPal, Square, Venmo, Cash App, Zelle, Patreon, Ko-fi, Buy Me a Coffee, Gumroad, Shopify Payments, Wise) with forward/reverse math and dated fee schedules.
Website: ${siteConfig.siteUrl}/
Contact: ${siteConfig.contactEmail}
Disclaimer: Not financial advice. Verify fees on provider sites.

Key pages:
- /tools/stripe-fee-calculator/
- /tools/paypal-fee-calculator/
- /tools/compare-payment-fees/
- /methodology/
- /guides/
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
