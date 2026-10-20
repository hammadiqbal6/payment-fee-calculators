/**
 * Topical sister-site links only — bases come from PUBLIC_SITE_URL_* (see sisterSites.ts).
 */
import { sisterSiteUrls } from '@/config/sisterSites';

const docs = sisterSiteUrls.businessDocs;

export type SisterLink = { href: string; label: string; why: string };

/** Map processor / page id → a few relevant sister links (or none). */
export const sisterLinksByContext: Record<string, SisterLink[]> = {
  stripe: [
    {
      href: `${docs}/tools/contractor-invoice/`,
      label: 'Contractor invoice template',
      why: 'invoice clients after you reverse-price Stripe fees',
    },
  ],
  paypal: [
    {
      href: `${docs}/tools/quote-estimate-generator/`,
      label: 'Quote / estimate generator',
      why: 'send a quote that already nets your PayPal take-home',
    },
  ],
  square: [
    {
      href: `${docs}/tools/cleaning-service-invoice/`,
      label: 'Service invoice template',
      why: 'pair in-person Square rates with a printable invoice',
    },
  ],
  gumroad: [
    {
      href: `${docs}/tools/photography-contract-template/`,
      label: 'Photography contract template',
      why: 'digital product sellers often need a simple contract too',
    },
  ],
  comparison: [
    {
      href: `${docs}/`,
      label: 'Free business document generators',
      why: 'after you pick a processor, generate invoices and estimates',
    },
  ],
  'guide-price': [
    {
      href: `${docs}/tools/quote-estimate-generator/`,
      label: 'Quote / estimate generator',
      why: 'turn reverse-fee pricing into a client-ready estimate',
    },
  ],
};
