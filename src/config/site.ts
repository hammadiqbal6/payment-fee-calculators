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

/** Same Person @id across all five tool sites (playbook). */
export const CANONICAL_PERSON_URL = 'https://github.com/hammadiqbal6';
export const PERSON_ID = `${CANONICAL_PERSON_URL}#person`;

const defaultAuthorName = 'Hammad Iqbal';
const defaultAuthorBio =
  'Independent developer who builds free, browser-based fee calculators. I copy rates from official pricing pages, record when I checked them, and show the formula on every tool. I am not a financial advisor, CPA, or employee of any payment brand.';

export const siteConfig = {
  /** Canonical site origin — no trailing slash */
  siteUrl,
  siteName,
  shortName: env('PUBLIC_SITE_SHORT_NAME', 'FeeCalc'),
  tagline: 'Free payment processor & creator fee calculators',
  description:
    'Calculate Stripe, PayPal, Square, Venmo, Cash App, Patreon, Ko-fi, Gumroad, Shopify Payments and Wise fees. Forward and reverse calculators with dated fee schedules.',
  locale: 'en_US',
  language: 'en',
  contactEmail,
  authorName: env('PUBLIC_AUTHOR_NAME', defaultAuthorName),
  authorBio: env('PUBLIC_AUTHOR_BIO', defaultAuthorBio),
  /** Author landing on this site (ProfilePage) */
  authorUrl: '/about/',
  authorHash: '#maintainer',
  authorSameAs: [CANONICAL_PERSON_URL] as readonly string[],
  personId: PERSON_ID,
  calculatorVersion: '1.0',
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
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: 'FeeCalc Tools — free payment processor and creator fee calculators',
  logoPath: '/logo-512.png',
  foundedYear: 2026,
  /** First public release of the site (ISO date; timezone +05:00 for PKT) */
  dateCreated: '2026-10-18T00:00:00+05:00',
  themeColor: '#0b3d2e',
} as const;

export type SiteConfig = typeof siteConfig;
