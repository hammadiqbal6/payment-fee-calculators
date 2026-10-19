export type Guide = {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string;
  published: string;
  modified: string;
  answerFirst: string;
  sections: { h2: string; paragraphs: string[]; list?: string[] }[];
  faqs: { q: string; a: string }[];
  relatedTools: string[];
};

export const guides: Guide[] = [
  {
    slug: 'how-to-price-after-fees',
    title: 'How to Price After Payment Fees (Reverse Calculator Guide)',
    description:
      'Learn the reverse fee formula so your invoice still nets the amount you need after Stripe, PayPal, Square or creator platform fees.',
    primaryKeyword: 'how to price after payment fees',
    published: '2026-10-19',
    modified: '2026-10-19',
    answerFirst:
      'To receive a target net after percent-plus-fixed fees, charge (desiredNet + fixed) ÷ (1 − percent). For Stripe US (2.9% + $0.30) to net $100, charge about $103.30. Always verify your live rate.',
    sections: [
      {
        h2: 'Why reverse math matters',
        paragraphs: [
          'If you set prices at your cost floor and then lose 3% + $0.30, thin margins disappear. Reverse pricing builds the fee into the customer price before you publish.',
        ],
      },
      {
        h2: 'Step-by-step',
        paragraphs: ['Use any calculator on this site in “Charge to receive X” mode.'],
        list: [
          'Decide the net you need after processing (and platform) fees.',
          'Select the correct country/channel schedule.',
          'Read the suggested charge and round sensibly for your market.',
          'Re-check if you add tax on top or absorb tax.',
        ],
      },
      {
        h2: 'Worked examples',
        paragraphs: [
          'PayPal US G&S (3.49% + $0.49) to net $100 → charge ≈ $104.14. Square online at 2.9% + $0.30 matches Stripe’s US online shape on the same $100 net target.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Should I show fees as a surcharge?',
        a: 'Card-network and local rules restrict surcharging in many places. Building fees into prices is usually simpler than adding a checkout surcharge.',
      },
      {
        q: 'Do creator platforms use the same formula?',
        a: 'Yes for planning, but blended platform + processing estimates may differ from exact invoice lines.',
      },
    ],
    relatedTools: ['stripe', 'paypal', 'gumroad', 'comparison'],
  },
  {
    slug: 'stripe-vs-paypal-fees',
    title: 'Stripe vs PayPal Fees in 2026: Which Costs Less?',
    description:
      'Compare typical US online Stripe and PayPal Goods & Services fees, international add-ons, and when each processor wins.',
    primaryKeyword: 'stripe vs paypal fees',
    published: '2026-10-19',
    modified: '2026-10-19',
    answerFirst:
      'On a standard US online card payment, Stripe’s common 2.9% + $0.30 is usually cheaper than PayPal’s common 3.49% + $0.49 Goods & Services rate. PayPal can still win for buyer familiarity, certain buyer segments, or when you already hold PayPal balances.',
    sections: [
      {
        h2: '$100 example',
        paragraphs: [
          'Stripe US: fee $3.20, net $96.80. PayPal US G&S: fee about $3.98, net about $96.02. Difference ≈ $0.78 per $100 — material at volume.',
        ],
      },
      {
        h2: 'International and FX',
        paragraphs: [
          'Both add costs for cross-border cards or currency conversion. Model the international schedules in each calculator rather than assuming domestic rates.',
        ],
      },
      {
        h2: 'Non-fee factors',
        paragraphs: [
          'Dispute tools, payout timing, checkout conversion, and whether customers already have PayPal accounts can outweigh a small rate gap.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Stripe always cheaper than PayPal?',
        a: 'Not always — custom pricing, regions, and product mix matter. Compare with your average order value.',
      },
    ],
    relatedTools: ['stripe', 'paypal', 'comparison'],
  },
  {
    slug: 'patreon-vs-kofi-vs-bmac',
    title: 'Patreon vs Ko-fi vs Buy Me a Coffee Fees',
    description:
      'Compare creator platform commissions and processing estimates for Patreon, Ko-fi and Buy Me a Coffee.',
    primaryKeyword: 'patreon vs ko-fi fees',
    published: '2026-10-19',
    modified: '2026-10-19',
    answerFirst:
      'Patreon fees depend on plan (roughly 5–12% platform plus processing). Ko-fi’s free plan often takes ~5%, while Gold can remove donation commission. Buy Me a Coffee commonly charges ~5% plus processing. Run the same pledge amount through each calculator.',
    sections: [
      {
        h2: 'When Ko-fi Gold pays for itself',
        paragraphs: [
          'If monthly donation volume is high, removing a 5% platform cut can exceed the Gold subscription quickly. Plug your monthly tips into the Ko-fi calculator to estimate.',
        ],
      },
      {
        h2: 'Memberships vs one-off tips',
        paragraphs: [
          'Patreon is membership-native. Ko-fi and Buy Me a Coffee support tips, shops, and memberships with different feature sets — compare fees and tooling, not fees alone.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Which creator platform takes the least?',
        a: 'Often Ko-fi Gold for donations, but processing and payout rails still apply. Verify current policies.',
      },
    ],
    relatedTools: ['patreon', 'kofi', 'bmac'],
  },
  {
    slug: 'what-does-ebay-not-cover',
    title: 'Payment Fees Freelancers Forget to Budget',
    description:
      'Beyond the headline percent: instant payouts, currency conversion, chargebacks, platform commissions and fixed per-transaction fees.',
    primaryKeyword: 'hidden payment processing fees',
    published: '2026-10-19',
    modified: '2026-10-19',
    answerFirst:
      'Headline percent fees are only part of take-home pay. Instant deposits, FX conversion, chargebacks, platform commissions, and fixed per-transaction fees can erase freelancer margins if you price only on the sticker rate.',
    sections: [
      {
        h2: 'Instant payouts',
        paragraphs: [
          'Venmo and Cash App instant transfers charge their own percent. Wire that into reverse pricing if clients expect same-day cash-out.',
        ],
      },
      {
        h2: 'Creator commissions',
        paragraphs: [
          'Gumroad and Patreon stack platform cut + processing. Use blended schedules or separate the layers when forecasting.',
        ],
      },
      {
        h2: 'Disputes',
        paragraphs: [
          'A single chargeback can dwarf months of “saved” fees from picking a slightly cheaper processor. Match tools to risk.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Are Zelle transfers really free?',
        a: 'Usually yes at participating banks, but they are not a full merchant stack with buyer protection.',
      },
    ],
    relatedTools: ['venmo', 'cashapp', 'wise', 'gumroad'],
  },
  {
    slug: 'how-much-to-charge-to-receive-100',
    title: 'How Much to Charge to Receive $100 After Fees',
    description:
      'Reverse fee examples: how much to invoice to receive $100 after Stripe, PayPal, Square, Gumroad and Patreon fees.',
    primaryKeyword: 'how much to charge to receive 100 after fees',
    published: '2026-10-19',
    modified: '2026-10-19',
    answerFirst:
      'Approximate charges to receive $100: Stripe US ≈ $103.30; PayPal US G&S ≈ $104.14; Square online ≈ $103.30; Gumroad blended direct ≈ $115.73; Patreon Pro blended ≈ $112.47. Confirm with each calculator and live provider pricing.',
    sections: [
      {
        h2: 'Use the calculators',
        paragraphs: [
          'Open any tool, switch to “Charge to receive X”, enter 100, and pick your schedule. Share links keep mode, rate, and amount in the query string for teammates.',
        ],
      },
      {
        h2: 'Why fixed fees hurt small invoices',
        paragraphs: [
          'A $0.30–$0.49 fixed fee is 3–5% on a $10 invoice but minor on $500. Bundle work or set minimum invoices when fixed fees dominate.',
        ],
      },
    ],
    faqs: [
      {
        q: 'Do these numbers include sales tax?',
        a: 'No. Tax collection is separate from processor fees.',
      },
    ],
    relatedTools: ['stripe', 'paypal', 'square', 'gumroad', 'patreon'],
  },
];
