/**
 * Tool → topical guides map for “Learn more” blocks on every tool page.
 * Every processor must list at least one guide (audit enforced).
 */
export type RelatedGuideLink = { slug: string; title: string };

const g = (slug: string, title: string): RelatedGuideLink => ({ slug, title });

/** Primary + secondary guides per tool id (and comparison). */
export const toolGuideMap: Record<string, RelatedGuideLink[]> = {
  stripe: [
    g('stripe-vs-paypal-fees', 'Stripe vs PayPal fees'),
    g('square-vs-stripe-vs-shopify', 'Square vs Stripe vs Shopify Payments'),
    g('how-to-price-after-fees', 'How to price after fees'),
    g('passing-fees-to-customers', 'Passing fees to customers'),
    g('chargeback-fees-by-processor', 'Chargeback fees by processor'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  paypal: [
    g('stripe-vs-paypal-fees', 'Stripe vs PayPal fees'),
    g('paypal-goods-services-vs-friends-family', 'PayPal G&S vs Friends & Family'),
    g('wise-vs-paypal-international', 'Wise vs PayPal international'),
    g('how-to-price-after-fees', 'How to price after fees'),
    g('passing-fees-to-customers', 'Passing fees to customers'),
    g('chargeback-fees-by-processor', 'Chargeback fees by processor'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  square: [
    g('square-vs-stripe-vs-shopify', 'Square vs Stripe vs Shopify Payments'),
    g('how-to-price-after-fees', 'How to price after fees'),
    g('chargeback-fees-by-processor', 'Chargeback fees by processor'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  venmo: [
    g('venmo-vs-cash-app-vs-zelle', 'Venmo vs Cash App vs Zelle fees'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  cashapp: [
    g('venmo-vs-cash-app-vs-zelle', 'Venmo vs Cash App vs Zelle fees'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  zelle: [
    g('venmo-vs-cash-app-vs-zelle', 'Venmo vs Cash App vs Zelle fees'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  patreon: [
    g('patreon-vs-kofi-vs-bmac', 'Patreon vs Ko-fi vs Buy Me a Coffee'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  kofi: [
    g('patreon-vs-kofi-vs-bmac', 'Patreon vs Ko-fi vs Buy Me a Coffee'),
    g('gumroad-vs-kofi-fees', 'Gumroad fees vs Ko-fi'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  bmac: [
    g('patreon-vs-kofi-vs-bmac', 'Patreon vs Ko-fi vs Buy Me a Coffee'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  gumroad: [
    g('gumroad-vs-kofi-fees', 'Gumroad fees vs Ko-fi'),
    g('how-to-price-after-fees', 'How to price after fees'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  shopify: [
    g('square-vs-stripe-vs-shopify', 'Square vs Stripe vs Shopify Payments'),
    g('how-to-price-after-fees', 'How to price after fees'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  wise: [
    g('wise-vs-paypal-international', 'Wise vs PayPal international'),
    g('hidden-payment-fees', 'Hidden payment fees'),
  ],
  comparison: [
    g('stripe-vs-paypal-fees', 'Stripe vs PayPal fees'),
    g('square-vs-stripe-vs-shopify', 'Square vs Stripe vs Shopify Payments'),
    g('hidden-payment-fees', 'Hidden payment fees'),
    g('how-to-price-after-fees', 'How to price after fees'),
  ],
};

export function getGuidesForTool(toolId: string): RelatedGuideLink[] {
  return toolGuideMap[toolId] ?? [g('hidden-payment-fees', 'Hidden payment fees')];
}

/** Processors that should link example amount pages near results. */
export const exampleLinkToolIds = new Set(['stripe', 'paypal', 'square']);
