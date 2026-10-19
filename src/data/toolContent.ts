/**
 * Unique long-form content per tool page (answer-first, formula, examples, FAQ).
 */

export type ToolContent = {
  answerFirst: string;
  howItWorks: string[];
  formula: string;
  workedExample: { title: string; body: string };
  tips: string[];
  mistakes: string[];
  faqs: { q: string; a: string }[];
  extraSections?: { h2: string; body: string }[];
};

export const toolContent: Record<string, ToolContent> = {
  stripe: {
    answerFirst:
      'Stripe’s common US online card rate is 2.9% + $0.30 per successful charge. On a $100 payment that is a $3.20 fee, so you keep $96.80. Use the reverse mode to find the charge amount that nets a target payout after fees.',
    howItWorks: [
      'Choose a fee schedule (US, UK, Canada, Australia, EU, international, Connect, or Invoicing).',
      'Enter the charge amount (forward) or the net amount you want to receive (reverse).',
      'Read the fee, net, customer charge, and effective rate instantly in your browser.',
    ],
    formula:
      'Forward: fee = charge × percent + fixed; net = charge − fee. Reverse: charge = (desiredNet + fixed) ÷ (1 − percent). Amounts are rounded to the nearest cent.',
    workedExample: {
      title: 'Worked example: receive $100 after Stripe US fees',
      body: 'Desired net = $100, percent = 2.9%, fixed = $0.30. Charge = (100 + 0.30) ÷ (1 − 0.029) = 100.30 ÷ 0.971 ≈ $103.30. Fee ≈ $3.30, net ≈ $100.00.',
    },
    tips: [
      'International cards and currency conversion usually add about 1% each on top of the domestic rate.',
      'Stripe Connect platform application fees are separate from card processing — model them as an extra percent if you charge one.',
      'Invoicing product fees (if any) are not the same as card processing; check Stripe Invoicing pricing for your volume.',
    ],
    mistakes: [
      'Pricing products at your cost floor without reverse-calculating fees.',
      'Assuming UK/EU rates match US 2.9% + $0.30.',
      'Forgetting that declined or disputed payments can have other costs not shown here.',
    ],
    faqs: [
      {
        q: 'What is the Stripe fee on $100 in the US?',
        a: 'At 2.9% + $0.30, the fee is $3.20 and you receive $96.80 on a $100 charge.',
      },
      {
        q: 'How much should I charge to receive $100 after Stripe fees?',
        a: 'About $103.30 using the US domestic card rate (2.9% + $0.30), then verify on Stripe’s pricing page.',
      },
      {
        q: 'Does Stripe charge more for international cards?',
        a: 'Yes. International cards typically add an extra percentage (often about 1%) on top of the domestic rate.',
      },
      {
        q: 'Are Stripe Connect fees included?',
        a: 'This calculator includes base card processing. Platform application fees you configure in Connect are additional.',
      },
    ],
    extraSections: [
      {
        h2: 'Regional Stripe rates in this tool',
        body: 'US and Canada commonly use 2.9% + $0.30. UK and many EU card rates are lower on domestic cards (for example 1.5% + a fixed amount). Australia often uses 1.75% + A$0.30 for domestic cards. Always confirm the live table for your country account.',
      },
    ],
  },
  paypal: {
    answerFirst:
      'PayPal US Goods & Services fees are commonly 3.49% + $0.49. On $100 that is about $3.98 in fees ($96.02 net). Friends & Family from balance/bank is often free, while international and micropayments use different schedules.',
    howItWorks: [
      'Select G&S, Friends & Family, international, UK, AUD, India, or micropayments.',
      'Enter the payment amount or the net you need.',
      'Compare the fee and effective rate before you invoice a customer.',
    ],
    formula:
      'Same percent-plus-fixed model as card processors: fee = amount × percent + fixed. Reverse charge = (net + fixed) ÷ (1 − percent).',
    workedExample: {
      title: 'Worked example: PayPal US G&S on $50',
      body: 'Fee = 50 × 0.0349 + 0.49 = 1.745 + 0.49 = $2.24 (rounded). Net ≈ $47.76.',
    },
    tips: [
      'Goods & Services includes purchase protection for buyers; Friends & Family usually does not.',
      'Micropayments pricing can be cheaper under a low amount threshold when enabled on the account.',
      'Cross-border fees stack on top of domestic commercial rates — use the international schedule for estimates.',
    ],
    mistakes: [
      'Asking customers to send business payments as Friends & Family to dodge fees (policy and protection risk).',
      'Ignoring currency conversion markups on cross-border balances.',
      'Using US rates for a UK or AU merchant account.',
    ],
    faqs: [
      {
        q: 'How much does PayPal take on Goods & Services?',
        a: 'In the US, a common published rate is 3.49% + $0.49 per transaction; regional rates differ.',
      },
      {
        q: 'Is PayPal Friends & Family free?',
        a: 'Often yes when funded from PayPal balance or a linked bank. Card-funded F&F can incur a fee.',
      },
      {
        q: 'What about PayPal fees in India, UK, or Australia?',
        a: 'Use the regional schedules in this calculator, then verify on the PayPal business fees page for that country.',
      },
    ],
  },
  square: {
    answerFirst:
      'Square’s common US online/invoice rate is 2.9% + $0.30 — the same headline shape as many online processors. In-person tap/chip/swipe is often lower (for example 2.6% + $0.10). Use this calculator to compare channels before you pick a checkout method.',
    howItWorks: [
      'Pick online, in-person, keyed, UK, or Australia schedules.',
      'Run forward or reverse calculations.',
      'Check the fee table sources dated on this page.',
    ],
    formula: 'fee = charge × percent + fixed; reverse charge = (net + fixed) ÷ (1 − percent).',
    workedExample: {
      title: 'Worked example: $75 in-person US',
      body: 'At 2.6% + $0.10: fee = 75 × 0.026 + 0.10 = $2.05; net = $72.95.',
    },
    tips: [
      'Keyed-in cards usually cost more than dipped or tapped cards.',
      'Square subscriptions and hardware are separate from per-transaction fees.',
    ],
    mistakes: [
      'Comparing only online rates when most of your volume is in person.',
      'Forgetting chargeback or dispute costs outside the base rate.',
    ],
    faqs: [
      {
        q: 'What is Square’s online fee?',
        a: 'A common US online rate is 2.9% + $0.30 per transaction; confirm on Square pricing.',
      },
      {
        q: 'Is in-person Square cheaper?',
        a: 'Usually yes versus online — many US in-person rates are around 2.6% + $0.10.',
      },
    ],
  },
  venmo: {
    answerFirst:
      'Venmo Business Profile fees are commonly about 1.9% + $0.10 per transaction. That is often lower than PayPal Goods & Services, but personal Venmo payments lack the same seller protections. Instant transfers to debit can add a separate percentage fee.',
    howItWorks: [
      'Choose Business Profile, Goods & Services, or instant transfer.',
      'Enter amount or desired net.',
      'Review effective rate before you rely on Venmo for sales.',
    ],
    formula: 'Standard percent + fixed (instant transfer uses percent on the transferred amount).',
    workedExample: {
      title: 'Worked example: $200 Venmo Business',
      body: 'Fee = 200 × 0.019 + 0.10 = $3.90; net = $196.10.',
    },
    tips: [
      'Use a Business Profile for selling; personal payments for goods can violate policies.',
      'Instant transfer fees are independent of payment acceptance fees.',
    ],
    mistakes: [
      'Treating personal Venmo as a card processor with buyer protection.',
      'Ignoring payout/instant transfer costs when quoting customers.',
    ],
    faqs: [
      {
        q: 'Does Venmo charge sellers fees?',
        a: 'Business Profiles typically pay a per-payment fee (often 1.9% + $0.10). Personal P2P is usually free.',
      },
      {
        q: 'How do Venmo Goods & Services fees compare to PayPal?',
        a: 'When G&S is available, rates often align closely with PayPal commercial pricing — verify in-app.',
      },
    ],
  },
  cashapp: {
    answerFirst:
      'Cash App for Business commonly charges about 2.75% per payment with no fixed cents fee on that schedule. On $100 you would pay about $2.75 and keep $97.25. Instant deposits are a separate percentage on the deposit amount.',
    howItWorks: [
      'Select Business card fee or Instant deposit.',
      'Calculate fee on amount or reverse price to a net target.',
      'Confirm live Cash App Help Center rates for your account type.',
    ],
    formula: 'Business: fee = amount × 0.0275 (when using that schedule). Instant deposit: fee = amount × instant percent.',
    workedExample: {
      title: 'Worked example: $40 Business payment',
      body: 'Fee = 40 × 0.0275 = $1.10; net = $38.90.',
    },
    tips: [
      'Standard bank deposits are often free; instant deposits trade speed for a fee.',
      'Business features and personal Cash App rules differ — use the business product for selling.',
    ],
    mistakes: [
      'Mixing personal P2P assumptions with Business fee schedules.',
      'Forgetting instant deposit fees when calculating take-home pay.',
    ],
    faqs: [
      {
        q: 'What is the Cash App Business fee?',
        a: 'A commonly published rate is 2.75% per transaction; verify in Cash App Help for your region.',
      },
      {
        q: 'Does Cash App charge to cash out?',
        a: 'Standard deposits are typically free; instant deposits usually take a percentage fee.',
      },
    ],
  },
  zelle: {
    answerFirst:
      'Zelle transfers through most participating banks have no Zelle network fee. You usually send and receive at face value, subject to bank send limits and fraud rules. This calculator documents that zero-fee baseline and rare credit-card funding caveats — it is not a classic processor fee tool.',
    howItWorks: [
      'Select standard Zelle (0%) or a bank-specific credit-funded caveat schedule.',
      'Enter an amount to see that fees stay $0 on the standard schedule.',
      'Compare with Venmo/Cash App if you need seller tools.',
    ],
    formula: 'Standard schedule: fee = 0; net = amount. Credit-funded caveats may behave like a percent cash-advance cost at the bank.',
    workedExample: {
      title: 'Worked example: $250 standard Zelle',
      body: 'Fee = $0; recipient receives $250 (timing depends on bank enrollment).',
    },
    tips: [
      'Zelle is typically for people you trust; purchase protection is limited compared with cards.',
      'Businesses should confirm whether their bank supports Zelle for business accounts.',
    ],
    mistakes: [
      'Assuming Zelle offers the same dispute rights as credit cards.',
      'Sending large amounts without checking bank limits and scams guidance.',
    ],
    faqs: [
      {
        q: 'Does Zelle charge fees?',
        a: 'The Zelle network generally does not charge send/receive fees at participating banks; your bank may have other account fees.',
      },
      {
        q: 'Why might a Zelle payment cost money?',
        a: 'Funding from a credit card (if allowed) can trigger cash-advance interest or fees from the issuer.',
      },
    ],
  },
  patreon: {
    answerFirst:
      'Patreon takes a platform percentage that depends on your plan (commonly about 5%, 8%, or 12%) plus payment processing. This calculator uses blended estimates so creators can see approximate net pledges — always check Patreon’s fee policy for exact processing.',
    howItWorks: [
      'Choose Lite, Pro, or Premium blended estimate.',
      'Enter pledge/charge amount or desired net.',
      'Review the fee table with source links and last-verified dates.',
    ],
    formula: 'Approximate fee = pledge × blendedPercent + fixedProcessing; net = pledge − fee.',
    workedExample: {
      title: 'Worked example: $10 pledge on Pro (blended ~11% + $0.10)',
      body: 'Fee ≈ 10 × 0.11 + 0.10 = $1.20; net ≈ $8.80.',
    },
    tips: [
      'Higher plans cost more percent but unlock features — model revenue before upgrading.',
      'Currency conversion and local payment methods can change processing.',
    ],
    mistakes: [
      'Comparing Patreon percent alone without processing.',
      'Ignoring chargebacks/failed payments in revenue forecasts.',
    ],
    faqs: [
      {
        q: 'How much does Patreon take from creators?',
        a: 'Platform fees commonly range about 5–12% by plan, plus payment processing. Use Patreon’s fee policy for authoritative numbers.',
      },
      {
        q: 'Is this calculator exact?',
        a: 'It uses dated blended estimates for planning. Processing varies by method and country.',
      },
    ],
  },
  kofi: {
    answerFirst:
      'Ko-fi’s free plan commonly takes about 5% platform commission on tips and sales, while Ko-fi Gold can remove the platform cut on donations (card processing may still apply). Use forward/reverse modes to price commissions and shop items.',
    howItWorks: [
      'Select free plan, Gold, or shop estimate.',
      'Enter donation/sale amount or target net.',
      'Confirm against Ko-fi’s current help docs.',
    ],
    formula: 'fee = amount × percent + fixed; reverse charge = (net + fixed) ÷ (1 − percent).',
    workedExample: {
      title: 'Worked example: $20 tip on free plan at 5%',
      body: 'Fee = $1.00; net = $19.00 (processing may apply depending on payout setup).',
    },
    tips: [
      'Gold is often worth it above a modest monthly tip volume — run the numbers here.',
      'Shop and commissions may have different rules than simple donations.',
    ],
    mistakes: [
      'Assuming Gold means zero cost end-to-end (processing can remain).',
      'Not updating prices after a plan change.',
    ],
    faqs: [
      {
        q: 'Does Ko-fi take a fee?',
        a: 'Yes on the free plan (commonly ~5%). Gold can remove Ko-fi’s commission on donations.',
      },
      {
        q: 'Are PayPal/Stripe payout fees included?',
        a: 'Schedules note processing where relevant; verify your payout method’s fees separately.',
      },
    ],
  },
  bmac: {
    answerFirst:
      'Buy Me a Coffee commonly charges about 5% platform fees plus payment processing. On a $5 “coffee” with a blended 5% + $0.30 model, the fee is about $0.55 and you keep about $4.45 — useful for membership and shop planning too.',
    howItWorks: [
      'Pick standard or membership estimate.',
      'Calculate fee on amount or reverse to a net goal.',
      'Read sources in the fee table before you launch a campaign.',
    ],
    formula: 'fee = amount × percent + fixed; reverse as (net + fixed) ÷ (1 − percent).',
    workedExample: {
      title: 'Worked example: $5 support',
      body: 'At 5% + $0.30: fee = 0.25 + 0.30 = $0.55; net = $4.45.',
    },
    tips: [
      'Memberships compound monthly — small fee differences matter at scale.',
      'Compare with Ko-fi Gold and Patreon if you are choosing a stack.',
    ],
    mistakes: [
      'Quoting supporters a gross goal without fee drag.',
      'Ignoring regional processing differences.',
    ],
    faqs: [
      {
        q: 'What is the Buy Me a Coffee fee percentage?',
        a: 'Platform fees are commonly around 5%, plus processing. Check Buy Me a Coffee’s fees page for current details.',
      },
    ],
  },
  gumroad: {
    answerFirst:
      'Gumroad’s direct sales fee is commonly 10% + $0.50 plus card processing. A blended estimate of ~12.9% + $0.80 on $100 means roughly $13.70 in total fees and about $86.30 net. Use platform-only mode if you want to isolate Gumroad’s cut.',
    howItWorks: [
      'Choose direct sales (with processing estimate) or platform-only.',
      'Run forward or reverse calculations for product pricing.',
      'Verify on Gumroad pricing before publishing.',
    ],
    formula: 'Blended fee = price × percent + fixed. Reverse list price = (net + fixed) ÷ (1 − percent).',
    workedExample: {
      title: 'Worked example: $29 digital download',
      body: 'At 12.9% + $0.80: fee ≈ 29 × 0.129 + 0.80 = $4.54; net ≈ $24.46.',
    },
    tips: [
      'Higher price points amortize the fixed portion of fees.',
      'Compare Gumroad with Stripe Checkout + your own storefront for volume products.',
    ],
    mistakes: [
      'Forgetting sales tax collection obligations (separate from Gumroad fees).',
      'Comparing Gumroad percent to Stripe percent without including Gumroad’s fixed fee.',
    ],
    faqs: [
      {
        q: 'How much does Gumroad take?',
        a: 'Direct sales commonly cost 10% + $0.50 plus processing. This tool’s default blends an estimate of processing for take-home math.',
      },
      {
        q: 'How do I price a product to receive $50 net on Gumroad?',
        a: 'Use reverse mode with the direct-sales schedule; then confirm against Gumroad’s live fee docs.',
      },
    ],
  },
  shopify: {
    answerFirst:
      'Shopify Payments online rates in the US often start near 2.9% + $0.30 on Basic and fall as you move to Shopify or Advanced plans. If you use a third-party gateway, Shopify may add an extra percentage on top of that gateway’s fees.',
    howItWorks: [
      'Select Basic, Shopify, Advanced, or third-party gateway add-on.',
      'Calculate fees on an order total or reverse to a margin target.',
      'Remember subscription plan costs are separate from card rates.',
    ],
    formula: 'Card fee = order × planPercent + fixed. Third-party add-on = order × gatewayPercent (plus the external processor’s own fees).',
    workedExample: {
      title: 'Worked example: $120 order on Basic',
      body: 'Fee = 120 × 0.029 + 0.30 = $3.78; net from processing perspective ≈ $116.22 (before Shopify subscription).',
    },
    tips: [
      'In-person Shopify Payments rates differ from online — this tool focuses on online baselines.',
      'Negotiate or upgrade plans when card volume makes lower percent worthwhile.',
    ],
    mistakes: [
      'Ignoring the third-party gateway fee when not using Shopify Payments.',
      'Comparing only percent and forgetting the $0.30 fixed fee on small AOV stores.',
    ],
    faqs: [
      {
        q: 'What are Shopify Payments fees?',
        a: 'They vary by plan and country. US online rates commonly range from about 2.5%–2.9% + $0.30.',
      },
      {
        q: 'Does Shopify charge extra for PayPal or external gateways?',
        a: 'Often yes — an additional percentage can apply when you do not use Shopify Payments. Check your plan.',
      },
    ],
  },
  wise: {
    answerFirst:
      'Wise uses mid-market exchange rates and a transparent transfer fee that varies by corridor and amount. This calculator applies simple percent + fixed estimates for common routes (for example USD→GBP). Always generate a live quote in Wise before you send money.',
    howItWorks: [
      'Pick a corridor estimate (USD/GBP/EUR/AUD pairs).',
      'Enter send amount or desired receive amount.',
      'Treat results as planning estimates, not guaranteed quotes.',
    ],
    formula: 'Estimated fee = amount × variablePercent + fixed. Reverse send ≈ (receive + fixed) ÷ (1 − percent) when modeling fee-on-send.',
    workedExample: {
      title: 'Worked example: send $1,000 USD→GBP estimate',
      body: 'At 0.43% + $0.50: fee ≈ $4.80; amount after fee estimate ≈ $995.20 before FX conversion at mid-market.',
    },
    tips: [
      'Fees are usually cheaper percentage-wise on larger transfers — Wise’s own UI shows the curve.',
      'Compare total cost (fee + FX) against PayPal currency conversion for creator payouts.',
    ],
    mistakes: [
      'Treating static estimates as live Wise prices.',
      'Forgetting recipient bank quirks or local taxes outside Wise’s fee.',
    ],
    faqs: [
      {
        q: 'How much does Wise charge?',
        a: 'It depends on currencies, route, and amount. Wise shows the exact fee before you confirm a transfer.',
      },
      {
        q: 'Is Wise cheaper than PayPal for international transfers?',
        a: 'Often for bank-to-bank FX, but run both quotes. PayPal may be simpler for goods payments with buyer protection.',
      },
    ],
  },
};
