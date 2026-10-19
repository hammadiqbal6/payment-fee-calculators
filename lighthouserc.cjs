/** @type {import('lighthouse').Config} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npx --yes serve dist -l 4173',
      startServerReadyPattern: 'Accepting connections',
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/payment-processors/',
        'http://localhost:4173/tools/stripe-fee-calculator/',
        'http://localhost:4173/tools/paypal-fee-calculator/',
        'http://localhost:4173/tools/square-fee-calculator/',
        'http://localhost:4173/tools/gumroad-fee-calculator/',
      ],
      numberOfRuns: 1,
      settings: {
        formFactor: 'mobile',
        screenEmulation: { mobile: true },
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'total-blocking-time': ['error', { maxNumericValue: 150 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
