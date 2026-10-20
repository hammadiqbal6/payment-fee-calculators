import { processors, type ProcessorSchedule } from '@/data/fees';

export type ToolMeta = {
  id: string;
  slug: string;
  path: string;
  name: string;
  title: string;
  description: string;
  primaryKeyword: string;
  h1: string;
  category: ProcessorSchedule['category'];
  related: string[];
};

const keywordMap: Record<string, { title: string; description: string; primaryKeyword: string; h1: string; related: string[] }> = {
  stripe: {
    title: 'Stripe Fee Calculator 2026: US, UK, EU & Reverse Fees',
    description:
      'Free Stripe fee calculator: see the 2.9% + 30¢ fee and your net payout, or work backward to the price to charge. Covers US, UK, EU, Connect and Invoicing.',
    primaryKeyword: 'stripe fee calculator',
    h1: 'Stripe Fee Calculator',
    related: ['paypal', 'square', 'shopify', 'comparison'],
  },
  paypal: {
    title: 'PayPal Fee Calculator 2026: G&S, Friends & International',
    description:
      'Calculate PayPal Goods & Services, Friends & Family and international fees instantly. See what you keep, or find how much to invoice to receive an exact amount.',
    primaryKeyword: 'paypal fee calculator',
    h1: 'PayPal Fee Calculator',
    related: ['stripe', 'venmo', 'square', 'comparison'],
  },
  square: {
    title: 'Square Fee Calculator – Online & In-Person',
    description:
      'Calculate Square payment fees for online, in-person, keyed entry, UK and Australia. Forward fee math and reverse pricing to receive a target net amount.',
    primaryKeyword: 'square fee calculator',
    h1: 'Square Fee Calculator',
    related: ['stripe', 'paypal', 'shopify', 'comparison'],
  },
  venmo: {
    title: 'Venmo Fee Calculator for Business & G&S',
    description:
      'Estimate Venmo Business Profile and Goods & Services fees, plus instant transfer costs. Free forward and reverse fee calculator for sellers.',
    primaryKeyword: 'venmo fee calculator',
    h1: 'Venmo Business Fee Calculator',
    related: ['paypal', 'cashapp', 'zelle', 'comparison'],
  },
  cashapp: {
    title: 'Cash App Business Fee Calculator',
    description:
      'Calculate Cash App for Business card fees and instant deposit costs. See what you keep and how much to charge to receive a target amount.',
    primaryKeyword: 'cash app fee calculator',
    h1: 'Cash App Business Fee Calculator',
    related: ['venmo', 'zelle', 'paypal', 'comparison'],
  },
  zelle: {
    title: 'Does Zelle Charge Fees? Zelle Fee Calculator & Limits',
    description:
      'Zelle is usually free through your bank. See when fees can apply, typical send limits, and how Zelle compares with Venmo and Cash App on the same payment.',
    primaryKeyword: 'does zelle charge fees',
    h1: 'Does Zelle Charge Fees?',
    related: ['venmo', 'cashapp', 'wise', 'comparison'],
  },
  patreon: {
    title: 'Patreon Fee Calculator – Creator Earnings',
    description:
      'Estimate Patreon Lite, Pro and Premium platform plus processing fees. Calculate what you keep from pledges and how much patrons must pay for you to receive X.',
    primaryKeyword: 'patreon fee calculator',
    h1: 'Patreon Fee Calculator',
    related: ['kofi', 'bmac', 'gumroad', 'comparison'],
  },
  kofi: {
    title: 'Ko-fi Fee Calculator – Donations, Shop & Gold',
    description:
      'Calculate Ko-fi free-plan and Gold fees on donations and shop sales. See payout timing notes, commission quirks, and reverse pricing to hit a net goal.',
    primaryKeyword: 'ko-fi fee calculator',
    h1: 'Ko-fi Fee Calculator',
    related: ['bmac', 'patreon', 'gumroad', 'comparison'],
  },
  bmac: {
    title: 'Buy Me a Coffee Fee Calculator (Tips & Memberships)',
    description:
      'Estimate Buy Me a Coffee platform plus processing fees on tips and memberships. Compare net earnings, chargebacks notes, and reverse pricing in seconds.',
    primaryKeyword: 'buy me a coffee fee calculator',
    h1: 'Buy Me a Coffee Fee Calculator',
    related: ['kofi', 'patreon', 'gumroad', 'comparison'],
  },
  gumroad: {
    title: 'Gumroad Fee Calculator – What You Keep',
    description:
      'Calculate Gumroad direct sales fees (platform plus processing estimate). Find your net payout and the list price to set so you still receive a target amount.',
    primaryKeyword: 'gumroad fee calculator',
    h1: 'Gumroad Fee Calculator',
    related: ['shopify', 'patreon', 'stripe', 'comparison'],
  },
  shopify: {
    title: 'Shopify Payments Fee Calculator by Plan',
    description:
      'Compare Shopify Payments online rates for Basic, Shopify and Advanced plans, plus third-party gateway fees. Forward and reverse fee math.',
    primaryKeyword: 'shopify payments fee calculator',
    h1: 'Shopify Payments Fee Calculator',
    related: ['stripe', 'square', 'paypal', 'comparison'],
  },
  wise: {
    title: 'Wise Transfer Fee Calculator (Estimate)',
    description:
      'Estimate Wise transfer fees for common corridors (USD/GBP/EUR/AUD). Mid-market FX style fee model with reverse amount helpers — verify live quotes.',
    primaryKeyword: 'wise transfer fee calculator',
    h1: 'Wise Transfer Fee Calculator',
    related: ['paypal', 'zelle', 'stripe', 'comparison'],
  },
};

export const comparisonTool: ToolMeta = {
  id: 'comparison',
  slug: 'compare-payment-fees',
  path: '/tools/compare-payment-fees/',
  name: 'Fee Comparison',
  title: 'Payment Processor Fee Comparison: Stripe vs PayPal & More',
  description:
    'Compare Stripe, PayPal, Square, Venmo, Cash App, Shopify and Wise fees side by side on any amount. Free calculator ranks processors by fee and net payout.',
  primaryKeyword: 'payment processor fee comparison',
  h1: 'Payment Processor Fee Comparison',
  category: 'processor',
  related: ['stripe', 'paypal', 'square', 'gumroad'],
};

export function getToolMeta(processor: ProcessorSchedule): ToolMeta {
  const k = keywordMap[processor.id];
  return {
    id: processor.id,
    slug: processor.slug,
    path: `/tools/${processor.slug}/`,
    name: processor.name,
    title: k.title,
    description: k.description,
    primaryKeyword: k.primaryKeyword,
    h1: k.h1,
    category: processor.category,
    related: k.related,
  };
}

export const allTools: ToolMeta[] = [
  ...processors.map(getToolMeta),
  comparisonTool,
];

export function getRelatedTools(ids: string[]): ToolMeta[] {
  return ids
    .map((id) => allTools.find((t) => t.id === id))
    .filter((t): t is ToolMeta => Boolean(t));
}

export const hubCategories = [
  {
    id: 'processors',
    path: '/payment-processors/',
    title: 'Payment Processor Fee Calculators',
    description: 'Card and checkout fees for Stripe, PayPal, Square and Shopify Payments.',
    toolIds: ['stripe', 'paypal', 'square', 'shopify'],
  },
  {
    id: 'p2p',
    path: '/p2p-fees/',
    title: 'P2P & Instant Pay Fee Calculators',
    description: 'Venmo, Cash App, Zelle and Wise transfer fee estimates.',
    toolIds: ['venmo', 'cashapp', 'zelle', 'wise'],
  },
  {
    id: 'creators',
    path: '/creator-fees/',
    title: 'Creator Platform Fee Calculators',
    description: 'Patreon, Ko-fi, Buy Me a Coffee and Gumroad earnings calculators.',
    toolIds: ['patreon', 'kofi', 'bmac', 'gumroad'],
  },
] as const;
