/**
 * Sister-site base URLs (no trailing slash).
 * Override via PUBLIC_SITE_URL_* so custom domains can replace workers.dev
 * without code changes. Same env names across all five tool repos.
 */

const trim = (url: string) => url.replace(/\/$/, '');

const env = (key: string, fallback: string) => {
  const raw =
    typeof import.meta !== 'undefined' ? import.meta.env?.[key] : undefined;
  if (typeof raw === 'string' && raw.trim() !== '') return trim(raw.trim());
  return trim(fallback);
};

/** Defaults match current workers.dev deployments; overrides never break the build. */
export const sisterSiteUrls = {
  paymentFees: env(
    'PUBLIC_SITE_URL_PAYMENT_FEES',
    'https://payment-fee-calculators.hammadiqbal117.workers.dev',
  ),
  businessDocs: env(
    'PUBLIC_SITE_URL_BUSINESS_DOCS',
    'https://business-document-generators.hammadiqbal117.workers.dev',
  ),
  homeGarden: env(
    'PUBLIC_SITE_URL_HOME_GARDEN',
    'https://home-garden-calculators.hammadiqbal117.workers.dev',
  ),
  fiberArts: env(
    'PUBLIC_SITE_URL_FIBER_ARTS',
    'https://fiber-arts-calculators.hammadiqbal117.workers.dev',
  ),
  pet: env(
    'PUBLIC_SITE_URL_PET',
    'https://pet-calculators.hammadiqbal117.workers.dev',
  ),
} as const;

export type SisterSiteKey = keyof typeof sisterSiteUrls;

/** Human labels for About / listings (exclude self when used from this site). */
export const sisterSiteCatalog: readonly {
  key: SisterSiteKey;
  name: string;
  url: string;
}[] = [
  { key: 'paymentFees', name: 'FeeCalc Tools (payment fees)', url: sisterSiteUrls.paymentFees },
  { key: 'businessDocs', name: 'Business Document Generators', url: sisterSiteUrls.businessDocs },
  { key: 'homeGarden', name: 'Home & Garden Calculators', url: sisterSiteUrls.homeGarden },
  { key: 'fiberArts', name: 'Fiber Arts Calculators', url: sisterSiteUrls.fiberArts },
  { key: 'pet', name: 'Pet Calculators', url: sisterSiteUrls.pet },
];
