/**
 * SINGLE owner config file.
 * Prefer env vars in CI/hosting when set (Cloudflare Workers Builds).
 *
 * Build-time: Astro inlines `import.meta.env.PUBLIC_*` from the environment
 * (and `.env`). See `.env.example` for every variable the code reads.
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
const siteName = env('PUBLIC_SITE_NAME', 'FeeCalc Tools');
const contactEmail = env('PUBLIC_CONTACT_EMAIL', 'hammadiqbal117@gmail.com');

const defaultAuthorName = 'Hammad Iqbal';
const defaultAuthorBio = `${defaultAuthorName} builds and maintains ${siteName}. Fee schedules are taken from each payment processor’s published pricing pages, recorded with source URLs and last-verified dates, and re-checked when providers announce changes. For questions or corrections, contact ${contactEmail}.`;

export const siteConfig = {
  /** Canonical site origin — no trailing slash */
  siteUrl,
  siteName,
  shortName: env('PUBLIC_SITE_SHORT_NAME', 'FeeCalc'),
  tagline: 'Free payment processor & creator fee calculators',
  description:
    'Free Stripe, PayPal, Square, Venmo, Cash App, Patreon, Ko-fi, Gumroad, Shopify and Wise fee calculators. Forward and reverse math with dated schedules.',
  locale: 'en_US',
  language: 'en',
  contactEmail,
  authorName: env('PUBLIC_AUTHOR_NAME', defaultAuthorName),
  authorBio: env('PUBLIC_AUTHOR_BIO', defaultAuthorBio),
  authorUrl: '/authors/',
  authorGithub: env('PUBLIC_AUTHOR_GITHUB', 'https://github.com/hammadiqbal6'),
  authorLinkedIn: env('PUBLIC_AUTHOR_LINKEDIN', ''),
  twitterHandle: env('PUBLIC_TWITTER_HANDLE', ''),
  /** Leave empty to keep AdSense disabled */
  adsensePublisherId: env('PUBLIC_ADSENSE_PUBLISHER_ID', ''),
  /** Enable Auto ads only after approval + CMP for EEA/UK/CH */
  adsenseAutoAds: false,
  /** GA4 measurement ID; empty → no analytics scripts */
  ga4MeasurementId: envWithLegacy(
    'PUBLIC_GA4_MEASUREMENT_ID',
    'PUBLIC_GA4_ID',
    'G-QG36XZRHPK',
  ),
  googleSiteVerification: env(
    'PUBLIC_GSC_VERIFICATION',
    '0-q_NxhBgfgCm4WOLfbe9VrHrjbLzaxh8SXsbo2Q-UU',
  ),
  bingSiteVerification: env('PUBLIC_BING_VERIFICATION', ''),
  /** IndexNow key; must match public/<key>.txt (committed; public by design) */
  indexNowKey: env('PUBLIC_INDEXNOW_KEY', 'cded36863aa6be8ac5bf690ab6889910'),
  defaultOgImage: '/og-default.png',
  foundedYear: 2026,
  themeColor: '#0b3d2e',
} as const;

export type SiteConfig = typeof siteConfig;
