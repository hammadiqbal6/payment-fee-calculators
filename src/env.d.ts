/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE_URL?: string;
  readonly PUBLIC_SITE_NAME?: string;
  readonly PUBLIC_SITE_SHORT_NAME?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
  readonly PUBLIC_AUTHOR_NAME?: string;
  readonly PUBLIC_TWITTER_HANDLE?: string;
  readonly PUBLIC_ADSENSE_PUBLISHER_ID?: string;
  /** Preferred GA4 measurement ID (`G-XXXXXXXX`) */
  readonly PUBLIC_GA4_MEASUREMENT_ID?: string;
  /** @deprecated Prefer PUBLIC_GA4_MEASUREMENT_ID */
  readonly PUBLIC_GA4_ID?: string;
  readonly PUBLIC_GSC_VERIFICATION?: string;
  readonly PUBLIC_BING_VERIFICATION?: string;
  readonly PUBLIC_INDEXNOW_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
