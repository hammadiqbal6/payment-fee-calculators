/**
 * SINGLE owner config file.
 * Replace placeholder values before launch. Prefer env vars in CI/hosting when set.
 *
 * Build-time: Astro inlines `import.meta.env.PUBLIC_*` from the environment
 * (and `.env`). Cloudflare Workers Builds must set these as build env vars.
 */

const DEFAULT_SITE_URL =
  'https://payment-fee-calculators.hammadiqbal117.workers.dev';

/** Read a PUBLIC_* string; empty/unset → fallback. */
const env = (key: string, fallback: string) => {
  const raw =
    typeof import.meta !== 'undefined' ? import.meta.env?.[key] : undefined;
  if (typeof raw === 'string' && raw.trim() !== '') return raw.trim();
  return fallback;
};

/** Prefer primary key; fall back to legacy alias when primary is unset/empty. */
const envWithLegacy = (primary: string, legacy: string, fallback: string) => {
  const a = typeof import.meta !== 'undefined' ? import.meta.env?.[primary] : undefined;
  if (typeof a === 'string' && a.trim() !== '') return a.trim();
  const b = typeof import.meta !== 'undefined' ? import.meta.env?.[legacy] : undefined;
  if (typeof b === 'string' && b.trim() !== '') return b.trim();
  return fallback;
};

const siteUrl = env('PUBLIC_SITE_URL', DEFAULT_SITE_URL).replace(/\/$/, '');

export const siteConfig = {
  /** Canonical site origin — no trailing slash */
  siteUrl,
  siteName: env('PUBLIC_SITE_NAME', 'FeeCalc Tools'),
  shortName: env('PUBLIC_SITE_SHORT_NAME', 'FeeCalc'),
  tagline: 'Free payment processor & creator fee calculators',
  description:
    'Calculate Stripe, PayPal, Square, Venmo, Cash App, Patreon, Ko-fi, Gumroad, Shopify Payments and Wise fees. Forward and reverse calculators with dated fee schedules.',
  locale: 'en_US',
  language: 'en',
  contactEmail: env('PUBLIC_CONTACT_EMAIL', `hello@${new URL(siteUrl).hostname}`),
  authorName: env('PUBLIC_AUTHOR_NAME', 'FeeCalc Editorial'),
  authorUrl: '/about/',
  twitterHandle: env('PUBLIC_TWITTER_HANDLE', ''),
  /** Leave empty to keep AdSense disabled */
  adsensePublisherId: env('PUBLIC_ADSENSE_PUBLISHER_ID', ''),
  /** Enable Auto ads only after approval + CMP for EEA/UK/CH */
  adsenseAutoAds: false,
  /** GA4 measurement ID; empty → no analytics scripts */
  ga4MeasurementId: envWithLegacy('PUBLIC_GA4_MEASUREMENT_ID', 'PUBLIC_GA4_ID', ''),
  googleSiteVerification: env('PUBLIC_GSC_VERIFICATION', ''),
  bingSiteVerification: env('PUBLIC_BING_VERIFICATION', ''),
  /** Documented placeholder all-zeros key until a real IndexNow key is configured */
  indexNowKey: env('PUBLIC_INDEXNOW_KEY', '00000000000000000000000000000000'),
  defaultOgImage: '/og-default.png',
  foundedYear: 2026,
  themeColor: '#0b3d2e',
} as const;

export type SiteConfig = typeof siteConfig;
