/** Long-form supplemental copy per tool (unique value for SEO / AdSense depth). */

export const toolDepth: Record<string, { sections: { h2: string; body: string }[] }> = {
  stripe: {
    sections: [
      {
        h2: 'When Stripe is the right default',
        body:
          'Stripe is built for developers and growing businesses that want card checkout, subscriptions, invoicing, and Connect marketplaces in one API. The headline US online rate (2.9% + $0.30) is a useful planning number, but Stripe also publishes lower European domestic card rates and higher international card add-ons. If more than a quarter of your customers pay with non-US cards, model the international schedule instead of the domestic one. Stripe Invoicing and Stripe Billing add product fees separate from card processing — this calculator focuses on the card capture layer so you can price products and invoices consistently.',
      },
      {
        h2: 'Stripe Connect and platforms',
        body:
          'Marketplaces often pay standard card processing on the charge, then move money with Connect transfers and optional application fees. If you operate a platform, separate “what the card network costs” from “what you charge sellers.” Many platforms pass processing through at cost and earn on application fees. Use the Connect schedule here as the processing baseline, then add your platform percent in a spreadsheet or second calculator pass.',
      },
      {
        h2: 'Currency conversion',
        body:
          'When you charge in one currency but settle in another, Stripe may apply a conversion fee (often around 1% in addition to processing). Cross-border card fees can stack on top. For global SaaS, run the same net-receive target through both domestic and international schedules to see worst-case pricing.',
      },
    ],
  },
  paypal: {
    sections: [
      {
        h2: 'Goods & Services vs Friends & Family',
        body:
          'Goods & Services (commercial) payments include buyer protections appropriate for selling online. Friends & Family is intended for personal transfers and is often free when funded from balance or bank — but using F&F for business sales can violate policy and removes protections. For client work, invoices, and storefronts, use commercial pricing in your quotes even if the rate is higher.',
      },
      {
        h2: 'Micropayments and small tickets',
        body:
          'PayPal micropayments pricing (when enabled) uses a higher percent and lower fixed fee, which can win on very small amounts where $0.49 fixed dominates standard G&S. If you sell $3–$8 digital items, compare micropayments against standard G&S in this calculator before you publish prices.',
      },
      {
        h2: 'Regional PayPal accounts',
        body:
          'UK, Australia, and India publish different commercial rate cards. A US freelancer invoicing a UK client may still be on US rates depending on account setup — but your buyer’s experience and FX can differ. Select the regional schedule closest to your merchant account country, then verify on PayPal’s business fees page.',
      },
    ],
  },
  square: {
    sections: [
      {
        h2: 'Square for retail and hybrid sellers',
        body:
          'Square bundles POS hardware, inventory, and online checkout. Fee-wise, the important split is card-present vs card-not-present. Markets, food trucks, and salons should prioritize in-person rates; consultants emailing invoices should prioritize online rates. Keyed entry is a fallback when hardware fails — price it separately because it is usually the steepest card-present option.',
      },
      {
        h2: 'International Square merchants',
        body:
          'Square operates in multiple countries with different rate cards. This page includes UK and Australia online examples; always confirm Square’s pricing page for your legal entity. Currency and cross-border buyer cards can add costs beyond the domestic schedule.',
      },
    ],
  },
  venmo: {
    sections: [
      {
        h2: 'Seller expectations on Venmo',
        body:
          'Venmo is familiar to US consumers, which can speed up informal sales. Business Profiles formalize seller fees. Goods & Services flows (when available) align more closely with PayPal-style commercial pricing. Document which flow you require in your invoice terms so buyers do not send personal payments that lack protection.',
      },
    ],
  },
  cashapp: {
    sections: [
      {
        h2: 'Cash App for micro-businesses',
        body:
          'Cash App for Business targets sellers who want simple QR and payment links. Percent-only processing (on the business card schedule) can be competitive on low-dollar sales compared with processors that charge a large fixed fee per transaction. Model instant deposit separately if you rely on same-day access to cash.',
      },
    ],
  },
  zelle: {
    sections: [
      {
        h2: 'Using Zelle in a business context',
        body:
          'Many small service businesses accept Zelle for speed and zero network fees. You should still use contracts, clear scope, and documented delivery because dispute pathways differ from card chargebacks. Zelle is best for trusted repeat clients rather than anonymous ecommerce.',
      },
    ],
  },
  patreon: {
    sections: [
      {
        h2: 'Planning creator revenue on Patreon',
        body:
          'Patreon revenue is recurring, so platform percent compounds monthly. A 3-point plan difference (Lite vs Pro) is not just branding — it is ongoing margin. When setting tier prices, run reverse mode on the tier price to see net per patron, then multiply by expected patron count minus churn. Processing varies by patron payment method; our blended estimates are planning numbers, not tax documents.',
      },
    ],
  },
  kofi: {
    sections: [
      {
        h2: 'Ko-fi shops, commissions, and donations',
        body:
          'Ko-fi mixes one-off donations, memberships, and shop sales. Free-plan commission affects tips and some sales; Gold changes the economics for donations. If you sell physical merch, also budget shipping and payment processing on shop checkouts separately from platform commission.',
      },
    ],
  },
  bmac: {
    sections: [
      {
        h2: 'Buy Me a Coffee for creators',
        body:
          'Buy Me a Coffee optimizes for lightweight tipping and memberships. Platform percent plus processing means a $3 tip does not net $3. Use reverse pricing when you announce funding goals (“help me reach $500 net this month”) so public totals match your bank account.',
      },
    ],
  },
  gumroad: {
    sections: [
      {
        h2: 'Gumroad vs rolling your own checkout',
        body:
          'Gumroad’s direct sales fee bundles discovery, hosting, and payouts with a higher take rate than raw Stripe. The trade is time saved on tax forms, product pages, and affiliate tooling. Compare Gumroad’s blended schedule with Stripe at the same list price — if the gap is small at your price point, Gumroad may still win on speed; if the gap is large at volume, consider a Stripe-powered storefront.',
      },
    ],
  },
  shopify: {
    sections: [
      {
        h2: 'Shopify Payments vs third-party gateways',
        body:
          'Shopify charges subscription fees plus card processing when you use Shopify Payments. Using PayPal or another gateway on Shopify can trigger an additional transaction fee on Shopify’s side. Model the third-party gateway schedule plus your external processor’s fees before you assume Shopify Payments is optional.',
      },
    ],
  },
  wise: {
    sections: [
      {
        h2: 'Wise for freelancer payouts',
        body:
          'Wise is popular for receiving international client payments with transparent FX. Published fees are amount-dependent; our corridor estimates are starting points. Always copy the live quote from Wise for the exact send amount before you promise a client a converted total.',
      },
    ],
  },
};
