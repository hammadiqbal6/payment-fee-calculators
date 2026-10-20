/**
 * Topical sister-site links only. Domains follow the Workers pattern used by all five repos.
 */

const workers = (repo: string) => `https://${repo}.hammadiqbal117.workers.dev`;

export type SisterLink = { href: string; label: string; why: string };

/** Map processor / page id → a few relevant sister links (or none). */
export const sisterLinksByContext: Record<string, SisterLink[]> = {
  stripe: [
    {
      href: `${workers('business-document-generators')}/tools/contractor-invoice/`,
      label: 'Contractor invoice template',
      why: 'invoice clients after you reverse-price Stripe fees',
    },
  ],
  paypal: [
    {
      href: `${workers('business-document-generators')}/tools/quote-estimate-generator/`,
      label: 'Quote / estimate generator',
      why: 'send a quote that already nets your PayPal take-home',
    },
  ],
  square: [
    {
      href: `${workers('business-document-generators')}/tools/cleaning-service-invoice/`,
      label: 'Service invoice template',
      why: 'pair in-person Square rates with a printable invoice',
    },
  ],
  gumroad: [
    {
      href: `${workers('business-document-generators')}/tools/photography-contract-template/`,
      label: 'Photography contract template',
      why: 'digital product sellers often need a simple contract too',
    },
  ],
  comparison: [
    {
      href: `${workers('business-document-generators')}/`,
      label: 'Free business document generators',
      why: 'after you pick a processor, generate invoices and estimates',
    },
  ],
  'guide-price': [
    {
      href: `${workers('business-document-generators')}/tools/quote-estimate-generator/`,
      label: 'Quote / estimate generator',
      why: 'turn reverse-fee pricing into a client-ready estimate',
    },
  ],
};
