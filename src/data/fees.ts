/**
 * Single source of truth for every processor fee schedule.
 * Calculators, comparison, examples, guides, and “last verified” stamps must read from here.
 * Update via docs/FEE-UPDATE.md, the content-refresh skill, or the weekly rate-watcher Action.
 */

export type FeeVerificationStatus = 'verified' | 'unverified' | 'estimated';

export type FeeComponent = {
  id: string;
  label: string;
  /** Decimal percent, e.g. 0.029 = 2.9% */
  percent: number;
  /** Fixed fee in the schedule currency */
  fixed: number;
  currency: string;
  notes?: string;
  sourceUrl: string;
  lastVerified: string;
  /** verified = confirmed on source; unverified = could not parse/confirm; estimated = blended */
  verificationStatus?: FeeVerificationStatus;
};

export type ProcessorSchedule = {
  id: string;
  name: string;
  slug: string;
  category: 'processor' | 'p2p' | 'creator' | 'platform' | 'transfer';
  description: string;
  disclaimer?: string;
  rates: FeeComponent[];
  defaultRateId: string;
};

export type FeeChangelogEntry = {
  date: string;
  summary: string;
  changes: {
    rateId: string;
    field: 'percent' | 'fixed' | 'label' | 'notes' | 'added' | 'removed' | 'renamed';
    before?: string;
    after?: string;
    sourceUrl?: string;
  }[];
};

export const FEE_DATA_VERSION = '2026.10.24';
export const FEE_DATA_UPDATED = '2026-10-24';

/** Max age (days) before freshness tests fail for verified rates. */
export const FEE_MAX_AGE_DAYS = 60;

export const feeChangelog: FeeChangelogEntry[] = [
  {
    date: '2026-10-24',
    summary:
      'Corrected stale schedules against official pricing pages (PayPal G&S vs Checkout, Stripe intl/AU, Square Free/online/UK/AU, Patreon 10% plan, Ko-fi tip fees, BMAC blended, Cash App Business, Venmo G&S, Shopify Grow rename). Wise left unverified (JS-rendered).',
    changes: [
      {
        rateId: 'paypal-us-gs',
        field: 'percent',
        before: '3.49% + $0.49 (mislabelled Checkout)',
        after: '2.99% + $0.00 (Send/Receive Money G&S)',
        sourceUrl: 'https://www.paypal.com/us/business/paypal-business-fees',
      },
      {
        rateId: 'paypal-us-checkout',
        field: 'added',
        after: '3.49% + $0.49 PayPal Checkout',
        sourceUrl: 'https://www.paypal.com/us/business/paypal-business-fees',
      },
      {
        rateId: 'paypal-uk',
        field: 'percent',
        before: '2.99% + £0.30',
        after: '2.9% + £0.30',
        sourceUrl: 'https://www.paypal.com/uk/business/paypal-business-fees',
      },
      {
        rateId: 'paypal-au',
        field: 'percent',
        before: '2.60% + A$0.30',
        after: '2.90% + A$0.30',
        sourceUrl: 'https://www.paypal.com/au/business/paypal-business-fees',
      },
      {
        rateId: 'stripe-us-intl',
        field: 'percent',
        before: '3.9% + $0.30',
        after: '4.4% + $0.30 (2.9% + 1.5% intl)',
        sourceUrl: 'https://stripe.com/pricing',
      },
      {
        rateId: 'stripe-au',
        field: 'percent',
        before: '1.75% + A$0.30',
        after: '1.65% + A$0.30',
        sourceUrl: 'https://stripe.com/au/pricing',
      },
      {
        rateId: 'square-us-online',
        field: 'percent',
        before: '2.9% + $0.30',
        after: '3.3% + $0.30 (Free plan online/invoice)',
        sourceUrl: 'https://squareup.com/us/en/pricing',
      },
      {
        rateId: 'square-us-inperson',
        field: 'fixed',
        before: '2.6% + $0.10',
        after: '2.6% + $0.15',
        sourceUrl: 'https://squareup.com/us/en/pricing',
      },
      {
        rateId: 'square-uk',
        field: 'percent',
        before: '2.5% + £0.25',
        after: '1.4% + £0.25 (UK cards online)',
        sourceUrl: 'https://squareup.com/gb/en/pricing',
      },
      {
        rateId: 'square-au',
        field: 'fixed',
        before: '2.2% + A$0.30',
        after: '2.2% + A$0.00',
        sourceUrl: 'https://squareup.com/au/en/payments/our-fees',
      },
      {
        rateId: 'venmo-gs',
        field: 'fixed',
        before: '2.99% + $0.49',
        after: '2.99% + $0.00',
        sourceUrl: 'https://venmo.com/resources/our-fees',
      },
      {
        rateId: 'cashapp-business',
        field: 'percent',
        before: '2.75% + $0.00',
        after: '2.6% + $0.15',
        sourceUrl: 'https://cash.app/help/us/en-us/6521-cash-app-business-fees',
      },
      {
        rateId: 'shopify-grow',
        field: 'renamed',
        before: 'Shopify plan',
        after: 'Grow plan',
        sourceUrl: 'https://www.shopify.com/pricing',
      },
      {
        rateId: 'patreon-standard',
        field: 'added',
        after: '10% platform + processing blended (~12.9% + $0.30)',
        sourceUrl: 'https://www.patreon.com/pricing',
      },
      {
        rateId: 'kofi-free-tips',
        field: 'percent',
        before: '5% platform on donations',
        after: '0% platform on one-time tips (Free plan)',
        sourceUrl: 'https://ko-fi.com/pricing',
      },
      {
        rateId: 'bmac-standard',
        field: 'percent',
        before: '5% + $0.30 understated blend',
        after: '~8.4% + $0.30 (5% + Stripe 2.9% + $0.30 + 0.5% payout)',
        sourceUrl:
          'https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment',
      },
      {
        rateId: 'wise-usd-gbp',
        field: 'notes',
        after: 'Flagged unverified — Wise pricing page is JS-rendered',
        sourceUrl: 'https://wise.com/pricing',
      },
    ],
  },
  {
    date: '2026-10-19',
    summary: 'Initial public fee data version published.',
    changes: [],
  },
];

export const processors: ProcessorSchedule[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    slug: 'stripe-fee-calculator',
    category: 'processor',
    description: 'Card payments via Stripe (domestic, international, Connect, Invoicing).',
    rates: [
      {
        id: 'stripe-us',
        label: 'US domestic cards',
        percent: 0.029,
        fixed: 0.3,
        currency: 'USD',
        sourceUrl: 'https://stripe.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-uk',
        label: 'UK domestic cards',
        percent: 0.015,
        fixed: 0.2,
        currency: 'GBP',
        notes: 'Standard UK online card rate; premium UK cards are higher (often ~2.8%).',
        sourceUrl: 'https://stripe.com/gb/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-ca',
        label: 'Canada domestic cards',
        percent: 0.029,
        fixed: 0.3,
        currency: 'CAD',
        notes: 'International cards typically add ~0.8% in Canada.',
        sourceUrl: 'https://stripe.com/en-ca/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-au',
        label: 'Australia domestic cards',
        percent: 0.0165,
        fixed: 0.3,
        currency: 'AUD',
        notes: 'Domestic cards 1.65% + A$0.30.',
        sourceUrl: 'https://stripe.com/au/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-au-intl',
        label: 'Australia international cards',
        percent: 0.035,
        fixed: 0.3,
        currency: 'AUD',
        notes: 'International cards 3.5% + A$0.30.',
        sourceUrl: 'https://stripe.com/au/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-eu',
        label: 'EU/EEA standard European cards',
        percent: 0.015,
        fixed: 0.25,
        currency: 'EUR',
        sourceUrl: 'https://stripe.com/en-eu/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-us-intl',
        label: 'US + international card',
        percent: 0.044,
        fixed: 0.3,
        currency: 'USD',
        notes: '2.9% + $0.30 plus 1.5% international card fee = 4.4% + $0.30.',
        sourceUrl: 'https://stripe.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-us-fx',
        label: 'US + currency conversion',
        percent: 0.039,
        fixed: 0.3,
        currency: 'USD',
        notes: '2.9% + $0.30 plus 1% currency conversion (domestic card settling in another currency).',
        sourceUrl: 'https://stripe.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-us-intl-fx',
        label: 'US + international card + FX',
        percent: 0.054,
        fixed: 0.3,
        currency: 'USD',
        notes: '2.9% + 1.5% intl + 1% FX = 5.4% + $0.30.',
        sourceUrl: 'https://stripe.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-us-manual',
        label: 'US + manually entered card',
        percent: 0.034,
        fixed: 0.3,
        currency: 'USD',
        notes: '2.9% + $0.30 plus 0.5% manually entered card surcharge.',
        sourceUrl: 'https://stripe.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-connect',
        label: 'Stripe Connect (platform + standard)',
        percent: 0.029,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Base card fee only; platform application fees are separate.',
        sourceUrl: 'https://stripe.com/connect/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'stripe-invoicing',
        label: 'Stripe Invoicing (cards)',
        percent: 0.029,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Card payments on invoices use standard card pricing; Invoicing product fees may apply separately.',
        sourceUrl: 'https://stripe.com/invoicing/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
    ],
    defaultRateId: 'stripe-us',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    slug: 'paypal-fee-calculator',
    category: 'processor',
    description: 'PayPal Goods & Services, Checkout, Friends & Family, international, and regional rates.',
    rates: [
      {
        id: 'paypal-us-gs',
        label: 'US Goods & Services (Send/Receive Money)',
        percent: 0.0299,
        fixed: 0,
        currency: 'USD',
        notes:
          'Personal/commercial Send & Receive Money for Goods and Services: 2.99% with no fixed fee. Not the same as PayPal Checkout.',
        sourceUrl: 'https://www.paypal.com/us/business/paypal-business-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'paypal-us-checkout',
        label: 'US PayPal Checkout',
        percent: 0.0349,
        fixed: 0.49,
        currency: 'USD',
        notes: 'PayPal Checkout / Guest Checkout / Pay with Venmo commercial rate (3.49% + $0.49).',
        sourceUrl: 'https://www.paypal.com/us/business/paypal-business-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'paypal-us-card',
        label: 'US standard credit & debit cards',
        percent: 0.0299,
        fixed: 0.49,
        currency: 'USD',
        notes: 'Standard card processing on PayPal: 2.99% + $0.49.',
        sourceUrl: 'https://www.paypal.com/us/business/paypal-business-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'paypal-us-ff',
        label: 'US Friends & Family (balance/bank)',
        percent: 0,
        fixed: 0,
        currency: 'USD',
        notes: 'Typically free when sending from PayPal balance or linked bank. Card-funded F&F can incur fees.',
        sourceUrl: 'https://www.paypal.com/us/webapps/mpp/paypal-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'paypal-us-intl',
        label: 'US Checkout + international',
        percent: 0.0499,
        fixed: 0.49,
        currency: 'USD',
        notes: 'Checkout 3.49% + 1.50% cross-border = 4.99% + $0.49.',
        sourceUrl: 'https://www.paypal.com/us/business/paypal-business-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'paypal-uk',
        label: 'UK domestic commercial',
        percent: 0.029,
        fixed: 0.3,
        currency: 'GBP',
        notes: 'All Other Commercial Transactions: 2.9% + £0.30. International adds +1.29% EEA / +1.99% other.',
        sourceUrl: 'https://www.paypal.com/uk/business/paypal-business-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'paypal-au',
        label: 'Australia domestic commercial',
        percent: 0.029,
        fixed: 0.3,
        currency: 'AUD',
        notes: 'Commercial Transactions: 2.90% + A$0.30.',
        sourceUrl: 'https://www.paypal.com/au/business/paypal-business-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'paypal-in',
        label: 'India domestic (approximate)',
        percent: 0.023,
        fixed: 0,
        currency: 'INR',
        notes: 'India fee structure varies by product; not fully verified — confirm on PayPal India fee page.',
        sourceUrl: 'https://www.paypal.com/in/webapps/mpp/merchant-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'unverified',
      },
      {
        id: 'paypal-micro',
        label: 'US micropayments',
        percent: 0.0499,
        fixed: 0.09,
        currency: 'USD',
        notes: 'Micropayments pricing (when enabled) for low-value transactions.',
        sourceUrl: 'https://www.paypal.com/us/business/paypal-business-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
    ],
    defaultRateId: 'paypal-us-gs',
  },
  {
    id: 'square',
    name: 'Square',
    slug: 'square-fee-calculator',
    category: 'processor',
    description: 'Square card-present and online payment fees by plan and region.',
    rates: [
      {
        id: 'square-us-online',
        label: 'US Free plan – online / invoice',
        percent: 0.033,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Free plan online checkout / invoices. Plus/Premium online and Online API are often 2.9% + 30¢.',
        sourceUrl: 'https://squareup.com/us/en/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'square-us-online-api',
        label: 'US Plus/API – online',
        percent: 0.029,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Plus plan online and Online API rate. International cards add 1.5%.',
        sourceUrl: 'https://squareup.com/us/en/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'square-us-inperson',
        label: 'US in-person tap/chip/swipe',
        percent: 0.026,
        fixed: 0.15,
        currency: 'USD',
        notes: 'Free plan in-person. Premium plans may list 2.5% or 2.4% + 15¢.',
        sourceUrl: 'https://squareup.com/us/en/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'square-us-keyed',
        label: 'US manually keyed',
        percent: 0.035,
        fixed: 0.15,
        currency: 'USD',
        sourceUrl: 'https://squareup.com/us/en/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'square-uk',
        label: 'UK cards online',
        percent: 0.014,
        fixed: 0.25,
        currency: 'GBP',
        notes: 'UK-issued cards online: 1.4% + 25p. Non-UK cards online: 2.5% + 25p.',
        sourceUrl: 'https://squareup.com/gb/en/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'square-uk-intl',
        label: 'UK non-UK cards online',
        percent: 0.025,
        fixed: 0.25,
        currency: 'GBP',
        sourceUrl: 'https://squareup.com/gb/en/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'square-au',
        label: 'Australia online / card-not-present',
        percent: 0.022,
        fixed: 0,
        currency: 'AUD',
        notes: '2.2% with no fixed fee. In-person (newer sellers) typically 1.6%.',
        sourceUrl: 'https://squareup.com/au/en/payments/our-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
    ],
    defaultRateId: 'square-us-online',
  },
  {
    id: 'venmo',
    name: 'Venmo',
    slug: 'venmo-fee-calculator',
    category: 'p2p',
    description: 'Venmo business / Goods & Services style fees for sellers.',
    rates: [
      {
        id: 'venmo-business',
        label: 'Venmo Business Profile',
        percent: 0.019,
        fixed: 0.1,
        currency: 'USD',
        notes: 'Tap to Pay is 2.29% + $0.09.',
        sourceUrl: 'https://venmo.com/resources/our-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'venmo-gs',
        label: 'Goods & Services (personal)',
        percent: 0.0299,
        fixed: 0,
        currency: 'USD',
        notes: 'Seller fee when a payment is identified as goods and services: 2.99%, no fixed fee.',
        sourceUrl: 'https://venmo.com/resources/our-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'venmo-instant',
        label: 'Instant transfer to debit/bank',
        percent: 0.0175,
        fixed: 0,
        currency: 'USD',
        notes: '1.75% of amount transferred; minimum $0.25, maximum $25. Separate from payment processing.',
        sourceUrl: 'https://venmo.com/resources/our-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
    ],
    defaultRateId: 'venmo-business',
  },
  {
    id: 'cashapp',
    name: 'Cash App',
    slug: 'cash-app-fee-calculator',
    category: 'p2p',
    description: 'Cash App for Business payment and instant deposit fees.',
    rates: [
      {
        id: 'cashapp-business',
        label: 'Cash App for Business',
        percent: 0.026,
        fixed: 0.15,
        currency: 'USD',
        notes: '2.6% + $0.15 per business payment. Tap to Pay is 3%.',
        sourceUrl: 'https://cash.app/help/us/en-us/6521-cash-app-business-fees',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'cashapp-instant',
        label: 'Instant deposit (mid-range est.)',
        percent: 0.015,
        fixed: 0,
        currency: 'USD',
        notes:
          'Official range 0.5%–2.5% (min $0.25–$1, max $75). Mid 1.5% used for planning; exact fee shown before confirm.',
        sourceUrl: 'https://cash.app/us/en/legal/tos',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
    ],
    defaultRateId: 'cashapp-business',
  },
  {
    id: 'zelle',
    name: 'Zelle',
    slug: 'zelle-fee-calculator',
    category: 'p2p',
    description: 'Zelle person-to-person transfers (usually free; bank limits apply).',
    disclaimer:
      'Zelle is typically free through participating banks. This page documents common bank behaviors — not a processing fee schedule.',
    rates: [
      {
        id: 'zelle-standard',
        label: 'Standard Zelle (most banks)',
        percent: 0,
        fixed: 0,
        currency: 'USD',
        notes:
          'No Zelle network fee for most consumer bank transfers (Zelle states 99.4%+ of enrolled accounts charge no fee). Your bank may set send limits.',
        sourceUrl: 'https://www.zellepay.com/faq/will-i-get-charged-fee-send-receive-money-zelle',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
    ],
    defaultRateId: 'zelle-standard',
  },
  {
    id: 'patreon',
    name: 'Patreon',
    slug: 'patreon-fee-calculator',
    category: 'creator',
    description: 'Patreon platform + payment processing fee estimates for creators.',
    rates: [
      {
        id: 'patreon-standard',
        label: 'New creators (10% platform + processing est.)',
        percent: 0.129,
        fixed: 0.3,
        currency: 'USD',
        notes:
          'Creators publishing after Aug 4, 2025: 10% platform + typical US processing ~2.9% + $0.30 ≈ 12.9% + $0.30 blended.',
        sourceUrl: 'https://www.patreon.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
      {
        id: 'patreon-founders',
        label: 'Legacy Founders (5% + processing est.)',
        percent: 0.079,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Legacy 5% platform + ~2.9% + $0.30 processing. Only for continuously published pre-Aug 2025 pages.',
        sourceUrl: 'https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
      {
        id: 'patreon-pro',
        label: 'Legacy Pro (8% + processing est.)',
        percent: 0.109,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Legacy 8% platform + processing estimate. Unavailable to new creators after Aug 4, 2025.',
        sourceUrl: 'https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
      {
        id: 'patreon-pro-merch',
        label: 'Legacy Pro + Merch (11% + processing est.)',
        percent: 0.139,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Legacy 11% platform (Pro + Merch) + processing estimate.',
        sourceUrl: 'https://support.patreon.com/hc/en-us/articles/11111747095181-Creator-fees-overview',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
    ],
    defaultRateId: 'patreon-standard',
  },
  {
    id: 'kofi',
    name: 'Ko-fi',
    slug: 'kofi-fee-calculator',
    category: 'creator',
    description: 'Ko-fi donations, commissions, and shop fees.',
    rates: [
      {
        id: 'kofi-free-tips',
        label: 'Free plan – one-time tips (platform only)',
        percent: 0,
        fixed: 0,
        currency: 'USD',
        notes:
          'Ko-fi takes 0% on one-time tips on the Free plan. PayPal/Stripe processing still applies separately (~2.9% + $0.30).',
        sourceUrl: 'https://ko-fi.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'kofi-free-tips-blended',
        label: 'Free plan – one-time tips (with Stripe est.)',
        percent: 0.029,
        fixed: 0.3,
        currency: 'USD',
        notes: '0% Ko-fi + typical Stripe processing when fans pay by card.',
        sourceUrl: 'https://ko-fi.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
      {
        id: 'kofi-standard',
        label: 'Standard mode – tips (platform + processing est.)',
        percent: 0.079,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Default for many new creators: 5% on all payment types + ~2.9% + $0.30 processing.',
        sourceUrl: 'https://help.ko-fi.com/hc/en-us/articles/360002506494-Does-Ko-fi-take-a-fee',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
      {
        id: 'kofi-gold',
        label: 'Ko-fi Gold – tips (processing est.)',
        percent: 0.029,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Gold can remove Ko-fi service fee on tips; card processing still applies.',
        sourceUrl: 'https://ko-fi.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
      {
        id: 'kofi-shop',
        label: 'Shop / memberships / commissions (free plan est.)',
        percent: 0.079,
        fixed: 0.3,
        currency: 'USD',
        notes: '5% Ko-fi service fee + approximate processing on shop, memberships, and commissions.',
        sourceUrl: 'https://ko-fi.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
    ],
    defaultRateId: 'kofi-free-tips-blended',
  },
  {
    id: 'bmac',
    name: 'Buy Me a Coffee',
    slug: 'buy-me-a-coffee-fee-calculator',
    category: 'creator',
    description: 'Buy Me a Coffee tips, memberships, and shop fees.',
    rates: [
      {
        id: 'bmac-standard',
        label: 'Standard (platform + Stripe + payout est.)',
        percent: 0.084,
        fixed: 0.3,
        currency: 'USD',
        notes:
          '5% platform + Stripe ~2.9% + $0.30 + 0.5% payout ≈ 8.4% + $0.30. Intl +1%, subscriptions +0.5% may apply.',
        sourceUrl:
          'https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
      {
        id: 'bmac-membership',
        label: 'Memberships (platform + Stripe + sub + payout est.)',
        percent: 0.089,
        fixed: 0.3,
        currency: 'USD',
        notes: '5% + 2.9% + 0.5% subscription + 0.5% payout ≈ 8.9% + $0.30.',
        sourceUrl:
          'https://help.buymeacoffee.com/en/articles/8105744-how-to-calculate-charges-on-your-payment',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
    ],
    defaultRateId: 'bmac-standard',
  },
  {
    id: 'gumroad',
    name: 'Gumroad',
    slug: 'gumroad-fee-calculator',
    category: 'creator',
    description: 'Gumroad direct sales and Discover marketplace fees.',
    rates: [
      {
        id: 'gumroad-direct',
        label: 'Direct sales (10% + $0.50 + processing est.)',
        percent: 0.129,
        fixed: 0.8,
        currency: 'USD',
        notes: '10% + $0.50 Gumroad fee plus approximate card processing (~2.9% + $0.30).',
        sourceUrl: 'https://gumroad.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'estimated',
      },
      {
        id: 'gumroad-platform-only',
        label: 'Gumroad platform fee only',
        percent: 0.1,
        fixed: 0.5,
        currency: 'USD',
        notes: 'Platform fee without card processing — useful if comparing platform cut alone.',
        sourceUrl: 'https://gumroad.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'gumroad-discover',
        label: 'Gumroad Discover marketplace',
        percent: 0.3,
        fixed: 0,
        currency: 'USD',
        notes: 'Sales via Discover marketplace: 30% (Merchant of Record style). Confirm on Gumroad pricing.',
        sourceUrl: 'https://gumroad.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
    ],
    defaultRateId: 'gumroad-direct',
  },
  {
    id: 'shopify',
    name: 'Shopify Payments',
    slug: 'shopify-payments-fee-calculator',
    category: 'platform',
    description: 'Shopify Payments online rates by plan (US baseline).',
    rates: [
      {
        id: 'shopify-basic',
        label: 'Basic plan – online',
        percent: 0.029,
        fixed: 0.3,
        currency: 'USD',
        sourceUrl: 'https://www.shopify.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'shopify-grow',
        label: 'Grow plan – online',
        percent: 0.027,
        fixed: 0.3,
        currency: 'USD',
        notes: 'Formerly marketed as the “Shopify” plan; now Grow.',
        sourceUrl: 'https://www.shopify.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'shopify-advanced',
        label: 'Advanced plan – online',
        percent: 0.025,
        fixed: 0.3,
        currency: 'USD',
        sourceUrl: 'https://www.shopify.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'shopify-plus',
        label: 'Plus plan – online',
        percent: 0.0225,
        fixed: 0.3,
        currency: 'USD',
        sourceUrl: 'https://www.shopify.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
      {
        id: 'shopify-thirdparty',
        label: 'Third-party gateway fee (Basic)',
        percent: 0.02,
        fixed: 0,
        currency: 'USD',
        notes: 'Additional Shopify fee when not using Shopify Payments (plan-dependent).',
        sourceUrl: 'https://www.shopify.com/pricing',
        lastVerified: '2026-10-24',
        verificationStatus: 'verified',
      },
    ],
    defaultRateId: 'shopify-basic',
  },
  {
    id: 'wise',
    name: 'Wise',
    slug: 'wise-transfer-fee-calculator',
    category: 'transfer',
    description: 'Wise mid-market FX transfer fee estimates (variable by corridor).',
    disclaimer:
      'Wise quotes live per amount and corridor. Figures below are planning estimates and remain unverified against the JS-rendered pricing page.',
    rates: [
      {
        id: 'wise-usd-gbp',
        label: 'USD → GBP (estimate, unverified)',
        percent: 0.0043,
        fixed: 0.5,
        currency: 'USD',
        notes:
          'UNVERIFIED: Wise pricing is JS-rendered. Approximate low-variable fee corridor — verify in the Wise app or wise.com/pricing.',
        sourceUrl: 'https://wise.com/pricing',
        lastVerified: '2026-10-15',
        verificationStatus: 'unverified',
      },
      {
        id: 'wise-usd-eur',
        label: 'USD → EUR (estimate, unverified)',
        percent: 0.0041,
        fixed: 0.5,
        currency: 'USD',
        notes: 'UNVERIFIED — confirm live quote in Wise.',
        sourceUrl: 'https://wise.com/pricing',
        lastVerified: '2026-10-15',
        verificationStatus: 'unverified',
      },
      {
        id: 'wise-gbp-usd',
        label: 'GBP → USD (estimate, unverified)',
        percent: 0.0037,
        fixed: 0.4,
        currency: 'GBP',
        notes: 'UNVERIFIED — confirm live quote in Wise.',
        sourceUrl: 'https://wise.com/gb/pricing/',
        lastVerified: '2026-10-15',
        verificationStatus: 'unverified',
      },
      {
        id: 'wise-aud-usd',
        label: 'AUD → USD (estimate, unverified)',
        percent: 0.0045,
        fixed: 0.7,
        currency: 'AUD',
        notes: 'UNVERIFIED — confirm live quote in Wise.',
        sourceUrl: 'https://wise.com/au/pricing/',
        lastVerified: '2026-10-15',
        verificationStatus: 'unverified',
      },
    ],
    defaultRateId: 'wise-usd-gbp',
  },
];

export function getProcessor(id: string): ProcessorSchedule | undefined {
  return processors.find((p) => p.id === id);
}

export function getProcessorBySlug(slug: string): ProcessorSchedule | undefined {
  return processors.find((p) => p.slug === slug);
}

export function getRate(processorId: string, rateId: string): FeeComponent | undefined {
  return getProcessor(processorId)?.rates.find((r) => r.id === rateId);
}

export function requireRate(processorId: string, rateId: string): FeeComponent {
  const rate = getRate(processorId, rateId);
  if (!rate) throw new Error(`Missing fee rate ${processorId}/${rateId}`);
  return rate;
}

export function allRates(): FeeComponent[] {
  return processors.flatMap((p) => p.rates);
}

export const comparisonOrder = [
  'stripe',
  'paypal',
  'square',
  'venmo',
  'cashapp',
  'shopify',
  'gumroad',
  'patreon',
  'kofi',
  'bmac',
  'wise',
  'zelle',
] as const;
