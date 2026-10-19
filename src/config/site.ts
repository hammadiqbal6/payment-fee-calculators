/**
 * SINGLE owner config file.
 * Replace placeholder values before launch. Prefer env vars in CI/hosting when set.
 */
const env = (key: string, fallback: string) =>
  (typeof import.meta !== 'undefined' && import.meta.env?.[key]) || fallback;

export const siteConfig = {
  /** Canonical site origin — no trailing slash */
  siteUrl: env('PUBLIC_SITE_URL', 'https://feecalculator.example'),
  siteName: env('PUBLIC_SITE_NAME', 'FeeCalc Tools'),
  shortName: env('PUBLIC_SITE_SHORT_NAME', 'FeeCalc'),
  tagline: 'Free payment processor & creator fee calculators',
  description:
    'Calculate Stripe, PayPal, Square, Venmo, Cash App, Patreon, Ko-fi, Gumroad, Shopify Payments and Wise fees. Forward and reverse calculators with dated fee schedules.',
  locale: 'en_US',
  language: 'en',
  contactEmail: env('PUBLIC_CONTACT_EMAIL', 'hello@feecalculator.example'),
  authorName: env('PUBLIC_AUTHOR_NAME', 'FeeCalc Editorial'),
  authorUrl: '/about/',
  twitterHandle: env('PUBLIC_TWITTER_HANDLE', ''),
  /** Leave empty to keep AdSense disabled */
  adsensePublisherId: env('PUBLIC_ADSENSE_PUBLISHER_ID', ''),
  /** Enable Auto ads only after approval + CMP for EEA/UK/CH */
  adsenseAutoAds: false,
  ga4MeasurementId: env('PUBLIC_GA4_ID', ''),
  googleSiteVerification: env('PUBLIC_GSC_VERIFICATION', ''),
  bingSiteVerification: env('PUBLIC_BING_VERIFICATION', ''),
  indexNowKey: env('PUBLIC_INDEXNOW_KEY', '00000000000000000000000000000000'),
  defaultOgImage: '/og-default.png',
  foundedYear: 2026,
  themeColor: '#0b3d2e',
} as const;

export type SiteConfig = typeof siteConfig;
