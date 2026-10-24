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
      'International cards add 1.5% and currency conversion adds 1% on top of the domestic US rate (4.4% or 5.4% + $0.30 combined).',
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
        a: 'Yes. US accounts add 1.5% for international cards (4.4% + $0.30 total) and another 1% if currency conversion applies.',
      },
      {
        q: 'Are Stripe Connect fees included?',
        a: 'This calculator includes base card processing. Platform application fees you configure in Connect are additional.',
      },
    ],
    extraSections: [
      {
        h2: 'Regional Stripe rates in this tool',
        body: 'US and Canada commonly use 2.9% + $0.30. UK and many EU card rates are lower on domestic cards (for example 1.5% + a fixed amount). Australia uses 1.65% + A$0.30 for domestic cards (international cards 3.5% + A$0.30). Always confirm the live table for your country account.',
      },
    ],
  },
  paypal: {
    answerFirst:
      'PayPal US Send/Receive Money for Goods & Services is 2.99% with no fixed fee ($2.99 on $100, net $97.01). PayPal Checkout is a separate product at 3.49% + $0.49 (~$3.98 on $100). Friends & Family from balance/bank is often free—confirm your live rate before invoicing.',
    howItWorks: [
      'Select G&S, Checkout, Friends & Family, international, UK, AUD, India, or micropayments.',
      'Enter the payment amount or the net you need.',
      'Compare the fee and effective rate before you invoice a customer.',
    ],
    formula:
      'Same percent-plus-fixed model as card processors: fee = amount × percent + fixed. Reverse charge = (net + fixed) ÷ (1 − percent).',
    workedExample: {
      title: 'Worked example: PayPal US G&S on $50',
      body: 'Fee = 50 × 0.0299 = $1.50 (rounded). Net ≈ $48.50. Checkout on $50 would be 50 × 0.0349 + 0.49 ≈ $2.24.',
    },
    tips: [
      'Do not confuse Send/Receive Money G&S (2.99%) with PayPal Checkout (3.49% + $0.49).',
      'Goods & Services includes purchase protection for buyers; Friends & Family usually does not.',
      'Micropayments pricing can be cheaper under a low amount threshold when enabled on the account.',
      'Cross-border fees stack on top of domestic commercial rates — use the international schedule for estimates.',
    ],
    mistakes: [
      'Asking customers to send business payments as Friends & Family to dodge fees (policy and protection risk).',
      'Using the Checkout rate when modeling personal G&S Send/Receive Money (or vice versa).',
      'Ignoring currency conversion markups on cross-border balances.',
      'Using US rates for a UK or AU merchant account.',
    ],
    faqs: [
      {
        q: 'How much does PayPal take on Goods & Services?',
        a: 'In the US, Send/Receive Money for Goods & Services is 2.99% with no fixed fee. PayPal Checkout is 3.49% + $0.49.',
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
      'Square Free-plan US online/invoice pricing is 3.3% + $0.30. Plus/API online is often 2.9% + $0.30. In-person tap/chip/swipe is 2.6% + $0.15. Use this calculator to compare channels and plans before you pick a checkout method.',
    howItWorks: [
      'Pick Free online, Plus/API online, in-person, keyed, UK, or Australia schedules.',
      'Run forward or reverse calculations.',
      'Check the fee table sources dated on this page.',
    ],
    formula: 'fee = charge × percent + fixed; reverse charge = (net + fixed) ÷ (1 − percent).',
    workedExample: {
      title: 'Worked example: $75 in-person US',
      body: 'At 2.6% + $0.15: fee = 75 × 0.026 + 0.15 = $2.10; net = $72.90.',
    },
    tips: [
      'Keyed-in cards usually cost more than dipped or tapped cards.',
      'Free-plan online (3.3% + 30¢) is not the same as Plus/API online (2.9% + 30¢).',
      'Square subscriptions and hardware are separate from per-transaction fees.',
    ],
    mistakes: [
      'Comparing only online rates when most of your volume is in person.',
      'Assuming Free-plan online matches Stripe’s 2.9% + $0.30.',
      'Forgetting chargeback or dispute costs outside the base rate.',
    ],
    extraSections: [
      {
        h2: 'Online vs in-person Square fees',
        body: 'Online and invoice payments usually cost more than tap/chip/swipe because card-not-present risk is higher. If most of your volume is in a cafe or market stall, model the in-person schedule (2.6% + 15¢). If you email invoices on the Free plan, use 3.3% + 30¢. Keyed entry is typically the most expensive card-present style rate.',
      },
      {
        h2: 'When Square beats shipping customers to PayPal',
        body: 'Square shines when hardware, POS, and online invoices live in one dashboard. Plus/API online often mirrors other 2.9% + $0.30 processors; Free-plan online is higher. Run identical order amounts through our Square, Stripe, and PayPal calculators before you migrate a stack.',
      },
    ],
    faqs: [
      {
        q: 'What is Square’s online fee?',
        a: 'Free plan online/invoice is 3.3% + $0.30; Plus/API online is commonly 2.9% + $0.30. Confirm on Square pricing.',
      },
      {
        q: 'Is in-person Square cheaper?',
        a: 'Usually yes versus online — US in-person is 2.6% + $0.15 on the Free plan.',
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
    extraSections: [
      {
        h2: 'Business Profile vs personal Venmo',
        body: 'Personal Venmo is built for friends. Selling goods on personal payments can violate policies and leaves you without seller tools. Business Profiles add a published per-payment fee in exchange for a more appropriate seller surface. If you need formal purchase protection workflows, compare Venmo G&S availability with PayPal Goods & Services.',
      },
      {
        h2: 'Instant transfer stacking',
        body: 'Accepting a Business payment and then instantly depositing to a debit card applies two fee layers. Price the acceptance fee first, then decide whether instant transfer is worth its percent. Many sellers keep standard deposits for routine payouts and only instant-transfer emergencies.',
      },
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
      'Cash App for Business charges 2.6% + $0.15 per payment. On $100 that is $2.75 in fees (net $97.25). Instant deposits are a separate 0.5%–2.5% on the deposit amount (min $0.25–$1, max $75), so model both cuts when you need fast access to funds.',
    howItWorks: [
      'Select Business card fee or Instant deposit.',
      'Calculate fee on amount or reverse price to a net target.',
      'Confirm live Cash App Help Center rates for your account type.',
    ],
    formula: 'Business: fee = amount × 0.026 + 0.15 (when using that schedule). Instant deposit: fee = amount × instant percent.',
    workedExample: {
      title: 'Worked example: $40 Business payment',
      body: 'Fee = 40 × 0.026 + 0.15 = $1.19; net = $38.81.',
    },
    tips: [
      'Standard bank deposits are often free; instant deposits trade speed for a fee.',
      'Business features and personal Cash App rules differ — use the business product for selling.',
    ],
    mistakes: [
      'Mixing personal P2P assumptions with Business fee schedules.',
      'Forgetting instant deposit fees when calculating take-home pay.',
    ],
    extraSections: [
      {
        h2: 'Cash App for Business basics',
        body: 'Cash App for Business is aimed at accepting customer payments with a business account feature set. The published rate is 2.6% + $0.15 (Tap to Pay 3%), which can look attractive on mid-size tickets compared with 2.9% + $0.30 style pricing — still verify your account’s live rate.',
      },
      {
        h2: 'Deposits and cash-out',
        body: 'Standard deposits to a linked bank are typically free. Instant deposits trade speed for a percent fee. If your business depends on same-day cash, include that cost in project quotes or accept a slightly higher list price.',
      },
    ],
    faqs: [
      {
        q: 'What is the Cash App Business fee?',
        a: 'A commonly published rate is 2.6% + $0.15 per transaction; verify in Cash App Help for your region.',
      },
      {
        q: 'Does Cash App charge to cash out?',
        a: 'Standard deposits are typically free; instant deposits usually take a percentage fee.',
      },
    ],
  },
  zelle: {
    answerFirst:
      'Zelle transfers through most participating banks have no Zelle network fee (Zelle states 99.4%+ of enrolled accounts charge none). On a $100 send the fee is $0 and the recipient gets $100 at face value, subject to bank send limits and fraud rules. This calculator documents that zero-fee baseline — it is not a classic processor fee tool.',
    howItWorks: [
      'Select the standard Zelle (0%) schedule.',
      'Enter an amount to see that fees stay $0 on the standard schedule.',
      'Compare with Venmo/Cash App if you need seller tools.',
    ],
    formula: 'Standard schedule: fee = 0; net = amount. Your bank may still set send limits or other account fees.',
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
    extraSections: [
      {
        h2: 'What Zelle is (and is not)',
        body: 'Zelle moves money between enrolled bank accounts, usually without a network fee. It is not a full merchant acquirer: you do not get the same chargeback flow as a Visa/Mastercard checkout. That makes it suitable for trusted counterparts and a poor fit for selling to strangers without another contract layer.',
      },
      {
        h2: 'Bank limits',
        body: 'Banks set send limits that can change with history and channel (app vs web). Zelle itself is bank-account based; any extra cost would come from your bank’s policies, not a Zelle network processing schedule.',
      },
    ],
    faqs: [
      {
        q: 'Does Zelle charge fees?',
        a: 'The Zelle network generally does not charge send/receive fees at participating banks; your bank may have other account fees.',
      },
      {
        q: 'Why might a bank transfer still cost money?',
        a: 'Your bank — not the Zelle network — may charge for certain account types or services. Confirm with your bank.',
      },
    ],
  },
  patreon: {
    answerFirst:
      'New Patreon creators (pages published after Aug 4, 2025) pay a 10% platform fee plus payment processing — about 12.9% + $0.30 blended. Legacy Founders/Pro/Pro+Merch pages keep 5%/8%/11% platform plus processing. Always check Patreon’s fee policy for exact processing.',
    howItWorks: [
      'Choose new-creator (10%) or a legacy Founders/Pro/Pro+Merch blended estimate.',
      'Enter pledge/charge amount or desired net.',
      'Review the fee table with source links and last-verified dates.',
    ],
    formula: 'Approximate fee = pledge × blendedPercent + fixedProcessing; net = pledge − fee.',
    workedExample: {
      title: 'Worked example: $10 pledge on new-creator plan (blended ~12.9% + $0.30)',
      body: 'Fee ≈ 10 × 0.129 + 0.30 = $1.59; net ≈ $8.41.',
    },
    tips: [
      'Unpublishing a legacy page can move you onto the 10% standard plan — pause instead if you need to keep legacy rates.',
      'Currency conversion and local payment methods can change processing.',
    ],
    mistakes: [
      'Comparing Patreon percent alone without processing.',
      'Using discontinued Lite/Premium labels — those plans are gone for new creators.',
      'Ignoring chargebacks/failed payments in revenue forecasts.',
    ],
    faqs: [
      {
        q: 'How much does Patreon take from creators?',
        a: 'New creators: 10% platform + processing. Legacy Founders/Pro/Pro+Merch: 5%/8%/11% platform + processing. Confirm on patreon.com/pricing.',
      },
      {
        q: 'Is this calculator exact?',
        a: 'It uses dated blended estimates for planning. Processing varies by method and country.',
      },
    ],
  },
  kofi: {
    answerFirst:
      'Ko-fi Free takes 0% platform fee on one-time tips (processing via PayPal/Stripe still applies). Memberships, shop, and commissions are 5%. Standard mode charges 5% on everything including tips. Gold can remove the tip platform cut. Use forward/reverse modes before you publish a tip goal.',
    howItWorks: [
      'Select free-plan tips, Standard mode, Gold, or shop estimate.',
      'Enter donation/sale amount or target net.',
      'Confirm against Ko-fi’s current help docs.',
    ],
    formula: 'fee = amount × percent + fixed; reverse charge = (net + fixed) ÷ (1 − percent).',
    workedExample: {
      title: 'Worked example: $20 tip on Free plan (0% Ko-fi + Stripe est.)',
      body: 'Ko-fi platform fee = $0. With Stripe-shaped processing (~2.9% + $0.30): fee ≈ $0.88; net ≈ $19.12.',
    },
    tips: [
      'Free plan: 0% on one-time tips; 5% on memberships, shop, and commissions.',
      'New creators often start in Standard mode (5% on tips too) — you can opt out in Settings → Payment.',
      'Gold can remove the tip platform cut; processing still applies.',
    ],
    mistakes: [
      'Assuming Free plan still takes 5% of one-time tips (it does not).',
      'Assuming Gold means zero cost end-to-end (processing can remain).',
      'Not updating prices after a plan change.',
    ],
    extraSections: [
      {
        h2: 'Payout timing on Ko-fi',
        body: 'Ko-fi payouts go directly to your connected PayPal or Stripe account. Deposit timing follows that processor — often a few business days after the tip clears, not instant.',
      },
      {
        h2: 'Donations vs shop vs commissions',
        body: 'One-time tips on Free are 0% platform. Memberships, shop, and commissions are 5% on Free. Standard mode applies 5% to tips as well. Run each mode on your real average order before promising a net goal.',
      },
      {
        h2: 'Regional quirks',
        body: 'Currency conversion and local payout eligibility vary by country. Confirm Ko-fi’s help docs for your payout country before relying on break-even math.',
      },
    ],
    faqs: [
      {
        q: 'Does Ko-fi take a fee?',
        a: 'Free plan: 0% on one-time tips; 5% on memberships, shop, and commissions. Standard mode: 5% on all payment types. Gold can remove tip platform fees.',
      },
      {
        q: 'Are PayPal/Stripe payout fees included?',
        a: 'Schedules note processing where relevant; verify your payout method’s fees separately.',
      },
      {
        q: 'When does Gold pay for itself?',
        a: 'When monthly tip volume × avoided 5% exceeds Gold’s monthly price. Plug your tips into the Standard vs Gold schedules to compare.',
      },
    ],
  },
  bmac: {
    answerFirst:
      'Buy Me a Coffee takes a 5% platform fee plus Stripe processing (~2.9% + $0.30) and a 0.5% payout fee — about 8.4% + $0.30 blended. On a $5 coffee that is roughly $0.72 in fees (net ~$4.28). Memberships can add another 0.5% subscription surcharge.',
    howItWorks: [
      'Pick standard or membership estimate.',
      'Calculate fee on amount or reverse to a net goal.',
      'Read sources in the fee table before you launch a campaign.',
    ],
    formula: 'fee = amount × percent + fixed; reverse as (net + fixed) ÷ (1 − percent).',
    workedExample: {
      title: 'Worked example: $5 support',
      body: 'At ~8.4% + $0.30: fee ≈ 5 × 0.084 + 0.30 = $0.72; net ≈ $4.28.',
    },
    tips: [
      'Itemize platform vs Stripe vs payout when comparing to Ko-fi or Patreon.',
      'Memberships compound monthly — small fee differences matter at scale.',
      'International supporters can add ~1% more.',
    ],
    mistakes: [
      'Quoting only the 5% platform fee and ignoring Stripe + payout.',
      'Quoting supporters a gross goal without fee drag.',
      'Ignoring regional processing differences.',
    ],
    extraSections: [
      {
        h2: 'Support buttons vs memberships',
        body: 'One-off “coffee” tips and recurring memberships behave differently at scale. Memberships can add a 0.5% subscription processing surcharge. Use the calculator on your average tip and on your monthly membership ARPU before you promise net funding goals publicly.',
      },
      {
        h2: 'Compare adjacent platforms',
        body: 'If you are choosing between Buy Me a Coffee, Ko-fi, and Patreon, line up the same $5 and $10 examples in each tool. Feature fit (shop, memberships, posts) may matter more than a half-point of fees, but you should know the fee gap explicitly.',
      },
    ],
    faqs: [
      {
        q: 'What is the Buy Me a Coffee fee percentage?',
        a: '5% platform + Stripe ~2.9% + $0.30 + 0.5% payout (≈8.4% + $0.30 blended). Intl +1% and subscriptions +0.5% may apply. See BMAC’s help article on calculating charges.',
      },
      {
        q: 'How do chargebacks work on Buy Me a Coffee?',
        a: 'Disputes can reverse a support and may include processor fees. Keep delivery records for shop and membership products, and read BMaC’s chargeback help article before large launches.',
      },
      {
        q: 'Are memberships priced the same as one-off coffees?',
        a: 'Platform percent is the same 5%, but subscriptions can add 0.5% processing. Model ARPU × patron count, not only a single $5 tip.',
      },
    ],
  },
  gumroad: {
    answerFirst:
      'Gumroad’s direct sales fee is commonly 10% + $0.50 plus card processing. A blended estimate of ~12.9% + $0.80 on $100 means roughly $13.70 in total fees and about $86.30 net. Discover marketplace sales are 30%. Use platform-only mode if you want to isolate Gumroad’s cut.',
    howItWorks: [
      'Choose direct sales (with processing estimate), platform-only, or Discover.',
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
      'Shopify Payments online rates in the US start at 2.9% + $0.30 on Basic, then Grow 2.7% + $0.30, Advanced 2.5% + $0.30, and Plus 2.25% + $0.30. If you use a third-party gateway, Shopify may add an extra percentage on top of that gateway’s fees.',
    howItWorks: [
      'Select Basic, Grow, Advanced, Plus, or third-party gateway add-on.',
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
      'Wise uses mid-market exchange rates and a transparent transfer fee that varies by corridor and amount. On a $1,000 USD→GBP estimate at 0.43% + $0.50 the fee is about $4.80. Always generate a live quote in Wise before you send money — these figures are planning estimates only.',
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
