export type Guide = {
  slug: string;
  title: string; // keep under ~58 chars so page title ≤60
  description: string; // 120–160 chars
  primaryKeyword: string;
  published: string; // YYYY-MM-DD
  modified: string; // use 2026-10-23 for all
  answerFirst: string; // 40–60 words direct answer
  /** 3–5 answer-first bullets with numbers or decision rules */
  takeaways: string[];
  sections: { h2: string; paragraphs: string[]; list?: string[] }[];
  faqs: { q: string; a: string }[]; // 4–6 FAQs each
  relatedTools: string[]; // tool ids: stripe,paypal,square,venmo,cashapp,zelle,patreon,kofi,bmac,gumroad,shopify,wise,comparison
  relatedGuides?: string[]; // other guide slugs
  relatedHubs?: { href: string; label: string }[];
  sources: { label: string; url: string; asOf: string }[]; // asOf: 2026-10-15
  feeTable?: { caption: string; headers: string[]; rows: string[][] };
};

export const guides: Guide[] = [
  {
    slug: "how-to-price-after-fees",
    title: "How to Price After Payment Fees",
    description: "Reverse the fee formula so invoices still net what you need after Stripe, PayPal, Square, or creator fees—including how much to charge to receive $100.",
    primaryKeyword: "how to price after payment fees",
    published: "2026-10-19",
    modified: "2026-10-24",
    answerFirst: "To receive a target net after percent-plus-fixed fees, charge (desiredNet + fixed) ÷ (1 − percent). For Stripe US at 2.9% + $0.30 to net $100, charge about $103.30. PayPal US Goods & Services at 2.99% (no fixed fee) needs about $103.08; PayPal Checkout at 3.49% + $0.49 needs about $104.14. Always verify your live rate on the official pricing page before you publish quotes.",
    takeaways: [
      "Reverse formula: charge = (net + fixed) ÷ (1 − percent).",
      "Stripe US to net $100 ≈ $103.30; PayPal G&S (2.99%) ≈ $103.08; Checkout ≈ $104.14.",
      "Re-run reverse math per ticket size — fixed fees do not scale linearly.",
    ],
    sections: [
      {
        h2: "Why reverse pricing matters",
        paragraphs: [
          "If you set prices at your cost floor and then lose a percent plus a fixed fee, thin margins disappear on every invoice. Reverse pricing builds the processor take into the customer-facing price before you publish a rate card, product page, or proposal.",
          "Freelancers often quote a round number like $500, then feel surprised when roughly $484–$485 lands after Stripe or PayPal. Building fees into the quote avoids awkward change orders and protects your effective hourly rate. The same idea applies to digital products: a $29 Gumroad list price is not a $29 payout when blended platform and processing fees approach the teens.",
          "Reverse math also keeps team rate cards honest. When three people quote the same deliverable, they should use the same schedule version and the same target net. Document the processor, country, and fee data date next to every quote so audits stay simple.",
          "This guide walks through the formula, worked examples at $100 and other ticket sizes, comparison tables you can reuse, and practical tips for rounding, tax, and multi-rail checkout. Use the free calculators at /tools/stripe-fee-calculator/, /tools/paypal-fee-calculator/, and /tools/compare-payment-fees/ to confirm every number against your schedule.",
        ],
      },
      {
        h2: "How to calculate (forward and reverse)",
        paragraphs: [
          "Forward fee math answers “what do I keep if the customer pays X?” For a percent p and fixed fee f on charge amount C: fee = C × p + f, and net = C − fee. Stripe US list pricing uses p = 0.029 and f = 0.30. On a $100 charge: fee = $2.90 + $0.30 = $3.20, net = $96.80.",
          "Reverse fee math answers “what should I charge so I keep N?” Rearrange: C = (N + f) ÷ (1 − p). For Stripe to net $100: C = (100 + 0.30) ÷ (1 − 0.029) ≈ 100.30 ÷ 0.971 ≈ $103.30. For PayPal US Goods & Services (2.99%, no fixed): C = 100 ÷ (1 − 0.0299) ≈ $103.08. For PayPal Checkout (3.49% + $0.49): C = (100 + 0.49) ÷ (1 − 0.0349) ≈ $104.14.",
          "Fixed fees break naive scaling. Doubling the desired net does not exactly double the charge when a fixed component exists. Re-run the calculator for each target instead of multiplying a $100 result by ten. That mistake underprices small invoices and overprices large ones relative to the fixed fee’s true impact.",
        ],
        list: [
          "Decide the net you need after processing (and platform) fees—before tax.",
          "Select the correct country and channel schedule (US online card vs in-person vs international).",
          "Run reverse mode in the matching calculator and note the suggested charge.",
          "Round up to a marketable price; never round down into a shortfall.",
          "Re-check if you add sales tax on top, absorb tax, or stack instant-payout fees.",
          "Record the schedule source URL and as-of date next to the quote.",
        ],
      },
      {
        h2: "Worked example",
        paragraphs: [
          "Scenario: you need $100 net after US online card processing. Stripe at 2.9% + $0.30 suggests a charge near $103.30. PayPal Goods & Services at 2.99% suggests about $103.08; PayPal Checkout at 3.49% + $0.49 suggests about $104.14. Square Free-plan online at 3.3% + $0.30 (Plus/API often 2.9% + $0.30) differs from Stripe’s shape on the same target. Confirm each figure in /tools/stripe-fee-calculator/, /tools/paypal-fee-calculator/, and /tools/square-fee-calculator/.",
          "Forward check on Stripe: charge $103.30 → percent fee ≈ $3.00 → plus $0.30 fixed → total fee ≈ $3.30 → net ≈ $100.00 (rounding pennies may shift by a cent). Forward check on PayPal G&S: charge $103.08 → fee ≈ $3.08 → net ≈ $100.00. Forward check on PayPal Checkout: charge $104.14 → fee ≈ $4.12 → net ≈ $100.02.",
          "Creator example: if you need $1,000 per month net on a Patreon Pro blended estimate near 11% + $0.10, reverse-calculate the pledge total, then divide by expected patron count to see the required average pledge. Gumroad direct sales at a blended ~12.9% + $0.80 need a larger list price still—run /tools/gumroad-fee-calculator/ rather than guessing.",
          "P2P example: Venmo Business at 1.9% + $0.10 to net $250 → charge ≈ (250 + 0.10) ÷ (1 − 0.019) ≈ $255.05. If you also instant-transfer out at 1.75%, model that second fee separately on the amount you withdraw. Instant rails are a second cut, not a substitute for the first.",
        ],
      },
      {
        h2: "Fee comparison at a glance",
        paragraphs: [
          "The table below uses public US list schedules as of 2026-10-24 for planning. Your negotiated rate, card brand mix, or regional schedule can differ. Always re-check official pages linked in Sources.",
          "At volume, small gaps compound. A ~$0.78 difference between Stripe and PayPal G&S on a $100 charge becomes hundreds of dollars per month at $50,000 processed—before disputes, FX, or instant payouts. Compare with your real average order value in /tools/compare-payment-fees/, not only the $100 demo.",
        ],
      },
      {
        h2: "Rounding, psychology, and tax",
        paragraphs: [
          "Customers prefer clean prices. After reverse math, round up to a marketable number ($103.30 → $105 or $109) rather than rounding down and eating the gap. For subscriptions, tiny monthly shortfalls compound across every billing cycle—prefer a slightly higher list price over “close enough” nets.",
          "A $0.30–$0.49 fixed fee is 3–5% on a $10 invoice but minor on a $500 invoice. Bundle work or set minimum invoices when fixed fees dominate effective take rates. If you sell many micro-transactions, processor choice and batching matter as much as the headline percent.",
          "These calculator figures do not include sales tax or VAT. Tax collection is a separate layer. Decide whether tax is added on top of the fee-inclusive price or whether you absorb tax into margin—then re-run reverse math so the post-fee, post-tax net still hits your target.",
          "Card-network and local rules restrict surcharging in many places. Building fees into prices is usually simpler and safer than adding a checkout surcharge. See our guide on passing fees to customers for compliance framing, and treat legal advice as out of scope for this article.",
        ],
        list: [
          "Round up after reverse math; protect margin, then market the clean number.",
          "Set invoice minimums when fixed fees crush small tickets.",
          "Separate tax policy from fee policy in your books.",
          "Prefer fee-inclusive list prices over surprise surcharges where rules are unclear.",
        ],
      },
      {
        h2: "When to choose which pricing approach",
        paragraphs: [
          "Use reverse pricing whenever you care about a fixed net: freelance day rates, retainers, digital downloads with thin margins, and creator memberships with platform cuts. Use forward pricing when the customer-facing price is fixed by the market and you only need to forecast take-home.",
          "Choose Stripe-shaped online rates (2.9% + $0.30) when you control checkout and want predictable US card economics—model them in /tools/stripe-fee-calculator/. Choose PayPal when buyer trust or wallet login conversion outweighs the higher G&S take—model both rails in /tools/compare-payment-fees/. Choose creator platforms when discovery and membership tooling matter more than the lowest possible cut, then reverse-price through /tools/gumroad-fee-calculator/ or Patreon/Ko-fi tools.",
          "If clients insist on Venmo, Cash App, or Zelle, price the correct rail and the correct risk. Zelle is often $0 at participating banks but usually lacks merchant-style buyer protection. Business profiles on Venmo and Cash App carry their own percents. Pair this guide with hidden payment fees and Venmo vs Cash App vs Zelle for P2P pitfalls.",
          "Custom processor pricing beats public list rates for many growing accounts. Start with the closest public schedule, then adjust percent and fixed to match your contract. Re-verify when your processor emails a rate change—stale reverse prices silently erode margin.",
        ],
      },
      {
        h2: "Practical tips checklist",
        paragraphs: [
          "Keep a one-page internal cheat sheet: processor, schedule name, percent, fixed, source URL, last verified date, and reverse charge for your three most common nets ($100, $500, $2,000). Update it when fees.ts or official pricing pages change.",
          "Share calculator links with mode, rate, and amount in the query string so teammates reproduce the same quote. Canonical SEO URLs stay clean; share links are for humans and ops, not for ranking.",
          "Watch stacked fees: platform commission + card processing + instant payout + FX. Each layer needs its own line in the model. Gumroad and Patreon blended schedules already fold platform and processing for planning—still confirm against live invoices.",
        ],
        list: [
          "Bookmark /tools/stripe-fee-calculator/ and /tools/paypal-fee-calculator/ in reverse mode for your default nets.",
          "Re-run math after any plan change (Shopify Basic → Grow/Advanced, Patreon legacy → 10% standard, Ko-fi Free → Standard/Gold).",
          "Exclude dispute and chargeback costs from day-to-day pricing, but reserve margin for them if your category is risky.",
          "Link related reading: passing fees to customers, hidden payment fees, and Stripe vs PayPal fees.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I show fees as a surcharge on the invoice?",
        a: "Card-network and local rules restrict surcharging in many jurisdictions. Building fees into the list price is usually simpler than adding a checkout surcharge. When you do disclose a fee pass-through, confirm it is allowed for your location, card brands, and processor agreement—and still run reverse math so the net lands correctly.",
      },
      {
        q: "Do creator platforms use the same reverse formula?",
        a: "Yes for planning. You still solve charge = (net + fixed) ÷ (1 − percent) when the take is a percent plus fixed. Blended platform-plus-processing estimates (Patreon, Gumroad, Ko-fi) may differ from exact invoice lines, so treat calculator output as a planning figure and spot-check against a real payout.",
      },
      {
        q: "What if my processor gave me custom pricing?",
        a: "Use the closest public schedule, then substitute your contracted percent and fixed fee in the same formula. Custom rates often beat published list rates. Keep the contract PDF and the date you verified the rate next to your rate card.",
      },
      {
        q: "Do these numbers include sales tax?",
        a: "No. Tax collection is separate from processor fees. Decide whether tax is added on top of a fee-inclusive price or absorbed, then re-run reverse mode so post-fee net still matches your target.",
      },
      {
        q: "How much should I charge to receive exactly $100?",
        a: "Approximate US list figures as of 2026-10-24: Stripe ≈ $103.30; PayPal G&S ≈ $103.08; PayPal Checkout ≈ $104.14; Square Plus/API online ≈ $103.30; Free-plan online is higher. Confirm in each calculator and on official pricing pages before you publish.",
      },
      {
        q: "Can I bookmark a pre-filled calculator?",
        a: "Yes. Share links can include mode, rate, and amount. Canonical tags still point at the clean tool URL for SEO, while the query string helps teammates reproduce the quote.",
      },
    ],
    relatedTools: ["stripe", "paypal", "gumroad", "comparison"],
    relatedGuides: ["passing-fees-to-customers", "hidden-payment-fees", "stripe-vs-paypal-fees"],
    relatedHubs: [
      { href: "/payment-processors/", label: "Payment processor fees hub" },
    ],
    sources: [
      { label: "Stripe pricing", url: "https://stripe.com/pricing", asOf: "2026-10-24" },
      { label: "PayPal US business fees", url: "https://www.paypal.com/us/business/paypal-business-fees", asOf: "2026-10-24" },
      { label: "Square pricing", url: "https://squareup.com/us/en/pricing", asOf: "2026-10-24" },
      { label: "Gumroad pricing", url: "https://gumroad.com/pricing", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "Charge needed to net $100 (US list schedules, as of 2026-10-24)",
      headers: ["Processor / schedule", "Rate used", "Charge to net $100", "Fee on $100 charge"],
      rows: [
        ["Stripe US online", "2.9% + $0.30", "~$103.30", "$3.20 (net $96.80)"],
        ["PayPal US G&S", "2.99%", "~$103.08", "$2.99 (net $97.01)"],
        ["PayPal US Checkout", "3.49% + $0.49", "~$104.14", "~$3.98 (net ~$96.02)"],
        ["Square US online", "2.9% + $0.30", "~$103.30", "$3.20 (net $96.80)"],
        ["Gumroad direct (blended est.)", "~12.9% + $0.80", "Use Gumroad calculator", "Higher take—model per sale"],
      ],
    },
  },
  {
    slug: "stripe-vs-paypal-fees",
    title: "Stripe vs PayPal Fees in 2026",
    description: "Compare typical US online Stripe (2.9%+$0.30), PayPal G&S (2.99%), and PayPal Checkout (3.49%+$0.49) fees, $100 examples, FX notes, and when each wins.",
    primaryKeyword: "stripe vs paypal fees",
    published: "2026-10-19",
    modified: "2026-10-24",
    answerFirst: "On a standard US online card payment, Stripe’s common 2.9% + $0.30 is usually cheaper than PayPal Checkout’s common 3.49% + $0.49 rate (G&S Send/Receive Money is 2.99% with no fixed fee). On a $100 charge, Stripe fees $3.20 (net $96.80) versus PayPal G&S $2.99 (net $97.01) or PayPal Checkout about $3.98 (net about $96.02). PayPal can still win for buyer familiarity or wallet conversion.",
    takeaways: [
      "Stripe US online: 2.9% + $0.30 → $3.20 fee on $100 (net $96.80).",
      "PayPal US G&S: 2.99% → $2.99 on $100; Checkout: 3.49% + $0.49 → ~$3.98.",
      "Pick Stripe for API control; keep PayPal when wallet conversion covers the fee gap.",
    ],
    sections: [
      {
        h2: "Headline US rates compared",
        paragraphs: [
          "As of 2026-10-24, public US list pricing commonly cited for online cards is Stripe at 2.9% + $0.30 and PayPal Goods & Services at 2.99% (Send/Receive Money; Checkout is 3.49% + $0.49). Those are planning baselines from official pricing pages—not a promise that your account sees the same rate forever. Amex mixes, international cards, and custom contracts change the blended take.",
          "PayPal Friends & Family is a different product: for eligible personal payments funded from PayPal balance or linked bank, the fee can be $0—but F&F is not a substitute for merchant checkout when you sell goods or services to strangers. Misusing F&F for commercial sales creates policy and protection risk. See our PayPal G&S vs Friends & Family guide before you price on $0 assumptions.",
          "Use /tools/stripe-fee-calculator/, /tools/paypal-fee-calculator/, and /tools/compare-payment-fees/ with your average order value. A winner at $25 may still win at $250, but the absolute dollar gap scales with volume and ticket size.",
        ],
      },
      {
        h2: "Worked example on $100",
        paragraphs: [
          "Forward Stripe US: $100 × 0.029 = $2.90, plus $0.30 fixed = $3.20 fee, net $96.80. Forward PayPal US G&S: $100 × 0.0299 = $2.99 fee, net $97.01. Forward PayPal Checkout: $100 × 0.0349 + $0.49 = $3.98 fee, net $96.02. Versus Stripe’s $3.20, G&S is slightly cheaper and Checkout is about $0.78 more expensive on this $100 demo.",
          "Reverse to keep $100 net: Stripe charge ≈ $103.30; PayPal G&S ≈ $103.08; Checkout ≈ $104.14. If your proposal must show a round customer price, Stripe-shaped economics often land on a slightly lower list price for the same net—or more net at the same list price.",
          "At $50,000 per month processed with a similar mix, a ~0.78% effective gap on $100 demos is hundreds of dollars before disputes, FX, refunds, or instant transfers. Always recompute with your real average ticket in the comparison tool rather than annualizing the $100 demo blindly.",
        ],
      },
      {
        h2: "How to calculate your own blend",
        paragraphs: [
          "Pull last month’s successful charges. Segment by rail (Stripe card, PayPal wallet, PayPal card). Apply the correct percent and fixed fee to each segment’s volume and count of transactions—fixed fees scale with transaction count, not only volume.",
          "Effective rate ≈ total fees ÷ total volume. Compare that blend to list rates. If you are far above list, ask about custom pricing or reduce micro-transactions that amplify fixed fees. If PayPal volume converts enough incremental sales to cover the fee gap, the “more expensive” rail can still be the profit-maximizing choice.",
        ],
        list: [
          "Export volume, transaction count, and refund volume by processor.",
          "Apply list or contracted percent + fixed to each segment.",
          "Add estimated dispute costs separately (fees vary; check each provider).",
          "Compare profit = revenue − fees − refunds − estimated disputes − ops time.",
          "Re-run after any pricing or checkout change.",
        ],
      },
      {
        h2: "International and FX",
        paragraphs: [
          "Both Stripe and PayPal add cost for cross-border cards or currency conversion. Domestic US list rates are the wrong model for an international-heavy audience. Open each calculator’s international or cross-border schedule when your customers pay from other countries.",
          "If you invoice in USD but customers hold other currencies, compare total customer cost and your settlement currency. Sometimes a Wise-centered payout workflow beats holding multi-currency balances in a wallet—see Wise vs PayPal for international. Do not assume the domestic $100 example applies to FX corridors.",
        ],
      },
      {
        h2: "When Stripe wins vs when PayPal wins",
        paragraphs: [
          "Stripe usually fits custom checkouts, subscriptions, and SaaS billing where you want API control and US list economics at 2.9% + $0.30. PayPal fits audiences that already trust the PayPal wallet, marketplaces that expect a PayPal button, and buyers who refuse to enter card details on a small or new site.",
          "Non-fee factors often dominate a sub-1% gap: dispute tooling, payout timing, chargeback rates in your category, and checkout conversion. Measure completion rate with and without a PayPal button before you optimize only for fee tables.",
          "Many stores offer both. Track blended effective fee in your books. Use Square vs Stripe vs Shopify Payments if your question is really “which full commerce stack,” and use hidden payment fees if instant payouts or platform commissions are muddying the comparison.",
        ],
        list: [
          "Choose Stripe-first when you control UX and want lower US list card fees.",
          "Choose PayPal-first when wallet conversion is proven in your niche.",
          "Offer both when incremental conversion covers the PayPal fee gap.",
          "Revisit annually or after custom pricing negotiations.",
        ],
      },
      {
        h2: "Practical tips",
        paragraphs: [
          "Price proposals with reverse mode so net income is stable regardless of which rail the client picks—or publish separate prices per rail if your contracts allow clear disclosure.",
          "Watch refunds: fees may be handled differently by product and region; confirm on official docs rather than assuming full fee refunds. For disputes, fees vary by processor—see chargeback fees by processor and check Stripe and PayPal’s official dispute documentation.",
          "Keep source URLs and as-of dates on your internal rate card. Official pages: stripe.com/pricing and PayPal’s US business fees page. Our fee tables mirror those public schedules as of 2026-10-24.",
        ],
      },
      {
        h2: "Refunds, holds, and operational drag",
        paragraphs: [
          "Fee tables assume successful settled charges. Refunds, payment reviews, and reserve holds change cash timing even when the percent looks fine. Stripe and PayPal document these behaviors differently—read the official policies for your country rather than assuming instant access to every net calculation from our tools.",
          "If PayPal conversion is meaningfully higher in A/B tests, keep PayPal despite the ~$0.78 gap on a $100 US G&S vs Stripe example. Optimize checkout revenue first, then squeeze fees with reverse pricing and custom rate negotiations.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Stripe always cheaper than PayPal?",
        a: "Not always. On common US online list rates, Stripe’s 2.9% + $0.30 beats PayPal G&S 2.99% on a like-for-like card charge, but custom pricing, regions, international cards, and product mix can flip the result. Compare with your average order value in /tools/compare-payment-fees/.",
      },
      {
        q: "Can I offer both Stripe and PayPal?",
        a: "Yes. Many stores offer Stripe (cards) and PayPal as a wallet option. Track the effective blended fee in your books and make sure reverse-priced catalog prices still clear your net target on the more expensive rail you accept.",
      },
      {
        q: "Does PayPal Friends & Family change the comparison?",
        a: "F&F can be $0 for eligible personal payments from balance or bank, but it is the wrong tool for selling goods and services to customers. Commercial sales should use Goods & Services (or another merchant product) despite the higher fee.",
      },
      {
        q: "How big is the gap on $100?",
        a: "About $0.78 in fees on a $100 charge using the US list schedules above (Stripe $3.20 vs PayPal G&S ~$3.98). At volume that gap compounds; at tiny volume conversion differences may matter more than $0.78.",
      },
      {
        q: "What about Square or Shopify Payments?",
        a: "Square online and Shopify Payments Basic also list 2.9% + $0.30 for common online US card pricing, similar to Stripe’s headline shape. For a three-way commerce comparison, read Square vs Stripe vs Shopify Payments.",
      },
    ],
    relatedTools: ["stripe", "paypal", "comparison"],
    relatedGuides: ["square-vs-stripe-vs-shopify", "hidden-payment-fees", "paypal-goods-services-vs-friends-family"],
    relatedHubs: [
      { href: "/payment-processors/", label: "Payment processor fees hub" },
    ],
    sources: [
      { label: "Stripe pricing", url: "https://stripe.com/pricing", asOf: "2026-10-24" },
      { label: "PayPal US business fees", url: "https://www.paypal.com/us/business/paypal-business-fees", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "Stripe vs PayPal US list fees (as of 2026-10-24)",
      headers: ["Schedule", "Rate", "Fee on $100", "Net on $100", "Charge to net $100"],
      rows: [
        ["Stripe US online", "2.9% + $0.30", "$3.20", "$96.80", "~$103.30"],
        ["PayPal US G&S", "2.99%", "$2.99", "$97.01", "~$103.08"],
        ["PayPal US Checkout", "3.49% + $0.49", "~$3.98", "~$96.02", "~$104.14"],
        ["PayPal US F&F (balance/bank)", "$0 (eligible personal)", "$0", "$100", "$100"],
      ],
    },
  },
  {
    slug: "patreon-vs-kofi-vs-bmac",
    title: "Patreon vs Ko-fi vs Buy Me a Coffee",
    description: "Compare creator platform commissions and processing estimates for Patreon, Ko-fi, and Buy Me a Coffee—with worked pledge math and when each platform wins.",
    primaryKeyword: "patreon vs ko-fi fees",
    published: "2026-10-19",
    modified: "2026-10-24",
    answerFirst: "Patreon fees depend on plan: blended estimates near 12.9% + $0.30 for new creators (10% platform) and legacy Founders/Pro/Pro+Merch (~7.9% / 10.9% / 13.9% + $0.30). Ko-fi Free takes 0% on one-time tips (processing separate); Standard is 5% on tips. Buy Me a Coffee lands near 8.4% + $0.30 blended. Run the same pledge through each calculator.",
    takeaways: [
      "New Patreon creators: ~10% platform + processing ≈ 12.9% + $0.30 blended.",
      "Ko-fi Free: 0% on one-time tips (processing separate); Standard is 5% on tips.",
      "Buy Me a Coffee blended estimate ≈ 8.4% + $0.30 including Stripe and payout.",
    ],
    sections: [
      {
        h2: "What each platform is optimized for",
        paragraphs: [
          "Patreon is membership-native: recurring tiers, gated posts, and community tooling for creators who sell ongoing access. Fee impact depends on which Patreon plan you choose. Our planning schedules use blended Lite/Pro/Premium estimates near 8%, 11%, and 15% plus $0.10 per exchange as of 2026-10-24—always confirm on patreon.com/pricing because plan names and cuts change.",
          "Ko-fi supports tips, shop items, and memberships with a free tier that commonly takes about 5% on donations, plus processing. Ko-fi Gold is the lever that can remove donation commission so that roughly processing-shaped economics (often modeled near 2.9% + $0.30) remain. Buy Me a Coffee (BMAC) is tip-and-support oriented with a common planning take near 5% + $0.30.",
          "Fees are only one axis. Compare discovery, payout timing, membership features, shop tooling, and audience expectations. A slightly higher cut on a platform that converts better can still win. Pair fee math with /tools/patreon-fee-calculator/, /tools/kofi-fee-calculator/, and /tools/buy-me-a-coffee-fee-calculator/.",
        ],
      },
      {
        h2: "Fee comparison table",
        paragraphs: [
          "Use the table as a planning snapshot as of 2026-10-24. Blended schedules fold platform commission and typical processing for forecasting; your invoice lines may separate those layers. For digital downloads with a storefront-first motion, also compare Gumroad in our Gumroad fees vs Ko-fi guide.",
        ],
      },
      {
        h2: "Worked example: $100 support payment",
        paragraphs: [
          "Forward estimates on a $100 payment: Patreon Lite blended ~8% + $0.10 → fee ≈ $8.10, net ≈ $91.90. Patreon Pro ~11% + $0.10 → fee ≈ $11.10, net ≈ $88.90. Patreon Premium ~15% + $0.10 → fee ≈ $15.10, net ≈ $84.90. Ko-fi free ~5% → fee ≈ $5.00 before distinguishing exact processing lines on your statement. BMAC ~5% + $0.30 → fee ≈ $5.30, net ≈ $94.70.",
          "Ko-fi Gold donation example: if commission is removed and processing is modeled near 2.9% + $0.30, a $100 tip looks closer to Stripe-shaped economics (fee ≈ $3.20, net ≈ $96.80) than to a 5% platform cut. Confirm current Gold benefits and pricing on Ko-fi before you advertise a net to yourself.",
          "Reverse example: to net $100 on BMAC at 5% + $0.30, charge ≈ (100 + 0.30) ÷ (1 − 0.05) ≈ $105.58. To net $100 on Patreon Pro at 11% + $0.10, charge ≈ (100 + 0.10) ÷ (1 − 0.11) ≈ $112.47. Membership tiers should be reverse-priced so the creator’s target net survives the plan cut.",
        ],
      },
      {
        h2: "How to calculate monthly take-home",
        paragraphs: [
          "Forecast monthly pledges or tips, pick the correct schedule, run forward mode for status quo, then reverse mode for target net. If you are on Ko-fi free today, also model Gold: subtract Gold’s subscription cost from the commission you would save at your tip volume.",
          "Example Gold break-even sketch: $800/month tips × 5% ≈ $40 platform commission. If Gold costs less than the commission you remove—and processing remains—you may come out ahead. Plug live Gold pricing from Ko-fi; do not rely on a remembered subscription price from a blog post.",
        ],
        list: [
          "Estimate monthly volume by platform (pledges vs one-off tips vs shop).",
          "Select Lite/Pro/Premium, Ko-fi free/Gold, or BMAC schedule in the matching calculator.",
          "Compute net and effective percent = fees ÷ volume.",
          "Add payout timing and failed-payment drag for memberships.",
          "Compare feature value if fee gaps are small.",
        ],
      },
      {
        h2: "When to choose Patreon, Ko-fi, or BMAC",
        paragraphs: [
          "Choose Patreon when recurring memberships, tier gating, and community posts are the product. Accept that blended take rises on higher plans that unlock more tools—price tiers with reverse math so fans fund the cut you actually selected.",
          "Choose Ko-fi when you want a lightweight tip jar with an optional Gold upgrade path. Gold tends to pay for itself when donation volume makes a 5% cut expensive relative to the subscription—verify with /tools/kofi-fee-calculator/.",
          "Choose Buy Me a Coffee when your audience already uses BMAC and you want simple support payments with a predictable ~5% + $0.30 planning model via /tools/buy-me-a-coffee-fee-calculator/.",
          "Multi-homing across all three fragments attention. Pick a primary home, then link secondary tip buttons carefully. If you sell downloads as a catalog, compare Gumroad or a Stripe storefront rather than forcing shop behavior into a tip platform.",
        ],
      },
      {
        h2: "Practical tips and pitfalls",
        paragraphs: [
          "Processing is not optional. Even when a platform advertises 0% commission on some donation types, card networks still take a cut through the payment stack. Our Gold schedule includes an approximate processing layer so you do not under-price.",
          "Failed recurring charges, refunds, and currency conversion can move nets away from calculator ideals. Keep a month of real payout CSV data next to the model. Read hidden payment fees for instant payout and FX surprises that also hit creators.",
          "Cite official pages when you update your public “what I earn” graphics: patreon.com/pricing, ko-fi.com, and Buy Me a Coffee help/pricing materials. Our as-of date for embedded schedules is 2026-10-15.",
        ],
        list: [
          "Reverse-price every membership tier after plan selection.",
          "Re-model when you change Patreon plans or buy Ko-fi Gold.",
          "Do not promise fans a net you have not verified on a live payout.",
          "Compare shop/download fees separately (see Gumroad vs Ko-fi).",
        ],
      },
      {
        h2: "Membership math vs tip-jar math",
        paragraphs: [
          "Membership platforms collect recurring pledges that fail, upgrade, and churn. A Patreon Pro blended estimate near 11% + $0.10 on a pledged $100 is not the same as $100 deposited every month—failed cards reduce volume before fees. Build a collection-rate assumption (for example 92–97% of pledged amounts) into forecasts, then apply the fee schedule to collected volume.",
          "Tip jars on Ko-fi and Buy Me a Coffee are spikier: launch weeks and crowdfunding moments dominate averages. Use a trailing three-month average tip volume when deciding whether Ko-fi Gold’s commission removal beats the free plan’s ~5% cut. Shop sales on those platforms deserve a separate line—do not average shop and tips into one misleading effective rate.",
          "If you sell downloads as a primary motion, open the Gumroad vs Ko-fi comparison rather than stretching a tip platform into a full storefront. Creator hubs at /creator-fees/ group the calculators for side-by-side experiments with the same $ amount.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which creator platform takes the least?",
        a: "Often Ko-fi Gold for donations when commission is removed and only processing-like fees remain, but processing and payout rails still apply. On free Ko-fi or BMAC, planning takes near 5% (BMAC also +$0.30) can beat higher Patreon plan blends—verify current policies on official pricing pages.",
      },
      {
        q: "Should I multi-home on several platforms?",
        a: "Possible, but fragmented memberships confuse fans and split messaging. Pick a primary home for recurring support and treat secondary buttons as overflow, not three equal memberships.",
      },
      {
        q: "Do Patreon percentages include processing?",
        a: "Our calculators use blended planning estimates that include platform and typical processing effects for forecasting. Your Patreon statements may show separate lines. Treat blends as planning tools and spot-check against payouts.",
      },
      {
        q: "When does Ko-fi Gold pay for itself?",
        a: "When the donation commission you remove exceeds Gold’s cost at your monthly tip volume, after still paying processing. Run the arithmetic with your real monthly tips and current Gold pricing from Ko-fi.",
      },
      {
        q: "How do I compare a $10 tier across platforms?",
        a: "Enter $10 in each of /tools/patreon-fee-calculator/, /tools/kofi-fee-calculator/, and /tools/buy-me-a-coffee-fee-calculator/ on the correct schedule, then compare net and effective percent. Multiply by patron count for monthly forecasts.",
      },
    ],
    relatedTools: ["patreon", "kofi", "bmac"],
    relatedGuides: ["gumroad-vs-kofi-fees", "hidden-payment-fees"],
    relatedHubs: [
      { href: "/creator-fees/", label: "Creator fees hub" },
    ],
    sources: [
      { label: "Patreon pricing", url: "https://www.patreon.com/pricing", asOf: "2026-10-24" },
      { label: "Ko-fi", url: "https://ko-fi.com", asOf: "2026-10-24" },
      { label: "Buy Me a Coffee", url: "https://www.buymeacoffee.com", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "Creator platform planning fees (as of 2026-10-24)",
      headers: ["Platform / plan", "Planning rate", "Fee on $100", "Approx. net"],
      rows: [
        ["Patreon Lite (blended est.)", "~8% + $0.10", "~$8.10", "~$91.90"],
        ["Patreon Pro (blended est.)", "~11% + $0.10", "~$11.10", "~$88.90"],
        ["Patreon Premium (blended est.)", "~15% + $0.10", "~$15.10", "~$84.90"],
        ["Ko-fi free (typical tips)", "~5%", "~$5.00", "~$95.00"],
        ["Ko-fi Gold (processing est.)", "~2.9% + $0.30", "~$3.20", "~$96.80"],
        ["Buy Me a Coffee", "~5% + $0.30", "~$5.30", "~$94.70"],
      ],
    },
  },
  {
    slug: "hidden-payment-fees",
    title: "Hidden Payment Fees Freelancers Miss (2026)",
    description: "Beyond the headline percent: instant payouts, FX, chargebacks, platform commissions, and fixed per-transaction fees that quietly erase freelancer margins.",
    primaryKeyword: "hidden payment processing fees",
    published: "2026-10-19",
    modified: "2026-10-24",
    answerFirst: "Headline percent fees are only part of take-home pay — a 1.75% Venmo instant transfer or a ~$15–$20 chargeback can erase more margin than the processing cut on a $100 invoice. Instant deposits, FX, platform commissions, and fixed fees stack. Model every layer before you publish a quote.",
    takeaways: [
      "Instant Venmo (~1.75%) or Cash App (0.5–2.5%) can erase a thin margin after the payment fee.",
      "A $15–$30 chargeback fee often costs more than the processing cut on a small invoice.",
      "Price every layer: percent + fixed + instant + FX + platform commission before you quote.",
    ],
    sections: [
      {
        h2: "The sticker rate is not the whole story",
        paragraphs: [
          "Sales pages advertise a clean percent-plus-fixed number. Operations add instant payouts, FX markups, dispute fees that vary by processor, platform commissions, and refund mechanics. Freelancers who price only on the sticker rate systematically undercharge.",
          "Build a fee stack worksheet: base processing, platform cut, payout speed premium, FX, and a dispute reserve. Use calculators for the known percent layers—/tools/venmo-fee-calculator/, /tools/cash-app-fee-calculator/, /tools/wise-transfer-fee-calculator/, /tools/gumroad-fee-calculator/—and treat dispute costs as a separate risk budget because dollar fees vary and change.",
        ],
      },
      {
        h2: "Instant payouts on P2P rails",
        paragraphs: [
          "Venmo Business payments list about 1.9% + $0.10 as of 2026-10-24, and instant transfers add about 1.75% on the amount moved quickly. Cash App Business payments list about 2.6% + $0.15, with instant deposits around 1.5%. If clients expect same-day cash-out, reverse-price both layers.",
          "Standard deposits are often the higher-margin choice. Teach clients your payout schedule up front. Zelle is usually $0 at participating banks, but it is not a full merchant stack with buyer protection—see Venmo vs Cash App vs Zelle for tradeoffs.",
        ],
      },
      {
        h2: "Worked example: $500 invoice with stacked fees",
        paragraphs: [
          "Suppose a client pays $500 via Venmo Business (1.9% + $0.10): fee ≈ $9.50 + $0.10 = $9.60, net ≈ $490.40. If you instant-transfer the ~$490.40 at 1.75%, instant fee ≈ $8.58, cash in hand ≈ $481.82. That is nearly $18 below the sticker invoice before tax—material on thin freelance margins.",
          "Contrast Cash App Business at 2.6% + $0.15 on $500: fee ≈ $13.75, net ≈ $486.25; instant 1.5% on the withdrawal ≈ $7.29; cash ≈ $478.96. Zelle at $0 leaves $500 but shifts risk and lacks merchant tooling. Price the rail you actually accept.",
          "Creator stack: a $500 Gumroad direct sale at blended ~12.9% + $0.80 → fee ≈ $64.50 + $0.80 = $65.30, net ≈ $434.70. The “hidden” part is not secret—it is the platform layer people forget when they copy a Stripe-only reverse price onto a Gumroad product.",
        ],
      },
      {
        h2: "How to calculate a full fee stack",
        paragraphs: [
          "List every cut in order: checkout processing → platform commission → FX → payout speed → estimated dispute reserve. Compute forward on the customer price, then reverse from desired cash-in-bank if you need a target net after all layers you control.",
          "Wise corridor estimates around 0.37–0.45% plus a fixed component can beat wallet FX for cross-border payouts—model in /tools/wise-transfer-fee-calculator/ and compare with PayPal international options in Wise vs PayPal for international.",
        ],
        list: [
          "Write down the customer-facing price and currency.",
          "Apply checkout/processor percent + fixed.",
          "Apply platform commission if any (Gumroad, Patreon, Ko-fi, BMAC).",
          "Apply FX or cross-border add-ons if settlement currency differs.",
          "Apply instant payout percent only if you will use it.",
          "Subtract a dispute reserve appropriate to your refund rate (fees vary; check provider).",
        ],
      },
      {
        h2: "Fixed fees, micro-invoices, and disputes",
        paragraphs: [
          "A $0.49 fixed fee on a $10 invoice is almost 5% by itself. Batch invoices or set a minimum project fee when average tickets are low. Percent-only mental math hides this.",
          "A single chargeback can dwarf months of “saved” fees from picking a slightly cheaper processor. Dispute fees vary by processor and change—check official Stripe, PayPal, and Square documentation rather than relying on a memorized dollar amount. Keep deliverable records and prefer Goods & Services style payments when selling to strangers.",
        ],
      },
      {
        h2: "When each awareness fix pays off",
        paragraphs: [
          "If you cash out instantly every time, switch the default to standard deposits or raise prices with reverse math that includes instant fees. If you sell on Gumroad with Stripe-only pricing instincts, rebuild the catalog with /tools/gumroad-fee-calculator/. If you invoice abroad, compare Wise vs PayPal rather than assuming domestic US card rates.",
          "Practical operating tips: refuse F&F for commercial strangers, publish payout timelines, and keep a monthly reconciliation that explains calculator vs bank deposits. Related reading: how to price after fees, chargeback fees by processor, and Venmo vs Cash App vs Zelle.",
        ],
        list: [
          "Default to standard payouts unless speed is worth the percent.",
          "Reverse-price creator platforms with blended schedules.",
          "Separate dispute reserves from day-to-day fee math.",
          "Re-verify sources when processors email rate changes.",
        ],
      },
      {
        h2: "Currency conversion and cross-border add-ons",
        paragraphs: [
          "Domestic US list rates are the wrong model when invoices settle across borders. PayPal and card processors often add cross-border or FX components on top of the domestic percent. Wise corridor estimates around 0.37–0.45% plus fixed can be clearer for moving already-earned balances—compare paths in /tools/wise-transfer-fee-calculator/ and the Wise vs PayPal international guide.",
          "Ask two questions: what does the customer pay in their currency, and what lands in your bank after conversion? Marketing a USD price while customers pay a marked-up FX rate can hurt conversion even when your processor fee looks fine on a USD spreadsheet.",
          "Keep screenshots of the FX quote at payment time for disputed invoices. Hidden FX is a frequent source of “the calculator was wrong” reports that were actually a different schedule than the domestic one selected.",
        ],
      },
      {
        h2: "Platform commissions that look like processing",
        paragraphs: [
          "Gumroad’s blended direct estimate near 12.9% + $0.80 is easy to misread as “a high Stripe rate.” It is a platform-plus-processing planning blend. Pricing a Gumroad product as if it were Stripe at 2.9% + $0.30 leaves a large silent hole. Always open /tools/gumroad-fee-calculator/ for catalog pricing.",
          "Patreon, Ko-fi, and Buy Me a Coffee similarly stack platform economics on top of cards. Use creator calculators and the Patreon vs Ko-fi vs Buy Me a Coffee guide when memberships fund your business. The “hidden” fee is often the platform layer you forgot because the checkout still shows a familiar card form.",
        ],
      },
    ],
    faqs: [
      {
        q: "Are Zelle transfers really free?",
        a: "Usually yes at participating banks for eligible transfers, but bank policies can vary and Zelle is not a full merchant stack with buyer protection. Confirm on zelle.com/help-center and your bank’s disclosures.",
      },
      {
        q: "Where should freelancers start?",
        a: "Pick one card processor (often Stripe or PayPal), price with reverse mode, and only add P2P rails for trusted clients. Model instant payout and platform commissions before you advertise a net hourly rate.",
      },
      {
        q: "What hidden fee surprises freelancers most?",
        a: "Instant deposit percentages stacked on already-processed payments, FX conversion on international invoices, and creator platform commissions on top of processing. Fixed fees on tiny invoices are a close fourth.",
      },
      {
        q: "How do I budget for chargebacks?",
        a: "Do not invent a single dollar fee. Dispute costs vary by processor and change over time—check official pages. Keep a percentage reserve based on your category’s refund/dispute history and read our chargeback fees by processor guide for framing.",
      },
      {
        q: "Does Wise eliminate hidden FX fees?",
        a: "Wise is often more transparent on corridor pricing (planning estimates ~0.37–0.45% + fixed as of 2026-10-24), but it is still a fee. Compare the full path against PayPal or bank wires for your corridor using /tools/wise-transfer-fee-calculator/.",
      },
    ],
    relatedTools: ["venmo", "cashapp", "wise", "gumroad"],
    relatedGuides: ["chargeback-fees-by-processor", "how-to-price-after-fees", "venmo-vs-cash-app-vs-zelle"],
    relatedHubs: [
      { href: "/p2p-fees/", label: "P2P fees hub" },
      { href: "/creator-fees/", label: "Creator fees hub" },
    ],
    sources: [
      { label: "Venmo fees", url: "https://venmo.com/resources/our-fees", asOf: "2026-10-24" },
      { label: "Cash App", url: "https://cash.app/help", asOf: "2026-10-24" },
      { label: "Wise pricing", url: "https://wise.com/pricing", asOf: "2026-10-24" },
      { label: "Gumroad pricing", url: "https://gumroad.com/pricing", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "Common “second layer” fees freelancers forget (as of 2026-10-24)",
      headers: ["Layer", "Typical planning figure", "Where it shows up"],
      rows: [
        ["Venmo Business checkout", "1.9% + $0.10", "Client pays via Venmo Business"],
        ["Venmo instant transfer", "1.75%", "You cash out instantly"],
        ["Cash App Business", "2.6% + $0.15", "Business profile payments"],
        ["Cash App instant deposit", "1.5%", "Instant transfer out"],
        ["Gumroad direct (blended)", "~12.9% + $0.80", "Digital product checkout"],
        ["Wise corridor (est.)", "~0.37–0.45% + fixed", "Cross-border payouts"],
      ],
    },
  },
  {
    slug: "venmo-vs-cash-app-vs-zelle",
    title: "Venmo vs Cash App vs Zelle fees",
    description: "Compare Venmo Business, Cash App Business, and Zelle fees for freelancers—including instant transfer costs, $100 examples, and when each P2P rail makes sense.",
    primaryKeyword: "venmo vs cash app vs zelle fees",
    published: "2026-10-23",
    modified: "2026-10-24",
    answerFirst: "Venmo Business lists about 1.9% + $0.10, Cash App Business about 2.6% + $0.15, and Zelle is usually $0 at participating banks as of 2026-10-24. Instant cash-outs add roughly 1.75% on Venmo and 1.5% on Cash App. Zelle’s $0 sticker is attractive, but merchant protection and dispute tooling differ sharply—price risk, not only fees.",
    takeaways: [
      "Venmo Business ≈ 1.9% + $0.10 ($2.00 on $100); Cash App Business ≈ 2.6% + $0.15 ($2.75).",
      "Zelle is usually $0 at participating banks — but not a merchant protection stack.",
      "Add instant cash-out (Venmo ~1.75%, Cash App ~1.5%) only if you always withdraw immediately.",
    ],
    sections: [
      {
        h2: "P2P rails are not interchangeable",
        paragraphs: [
          "Freelancers often treat Venmo, Cash App, and Zelle as the same “send me money” button. Fee schedules, business profiles, instant payouts, and consumer protections differ. Using a personal P2P rail for commercial sales can violate policies and leave you exposed when a payment is reversed or a relationship sours.",
          "As of 2026-10-15: Venmo Business 1.9% + $0.10 (instant transfer ~1.75%); Cash App Business 2.6% + $0.15 (instant ~1.5%); Zelle usually $0 via participating banks. Confirm on Venmo’s fee page, Cash App help, and zelle.com/help-center. Model numbers in /tools/venmo-fee-calculator/, /tools/cash-app-fee-calculator/, and /tools/zelle-fee-calculator/.",
        ],
      },
      {
        h2: "Fee comparison",
        paragraphs: [
          "On pure fee math for a business-profile payment, Venmo’s 1.9% + $0.10 often beats Cash App’s 2.6% + $0.15 on mid-size invoices, while Zelle’s $0 wins the sticker contest. Instant layers can reorder the ranking if you always cash out immediately.",
          "Protection and ops matter: card-funded or goods-and-services style products differ from bank-debit P2P. Read each provider’s buyer/seller protection texts. For stranger commerce, a proper merchant processor (Stripe/PayPal/Square) is usually safer even when P2P looks cheaper.",
        ],
      },
      {
        h2: "Worked example on $100 and $500",
        paragraphs: [
          "Venmo Business on $100: fee = $1.90 + $0.10 = $2.00, net = $98.00. Instant on $98 at 1.75% ≈ $1.72, cash ≈ $96.28. Cash App Business on $100: fee = $2.60 + $0.15 = $2.75, net = $97.25; instant ~1.5% ≈ $1.46, cash ≈ $95.79. Zelle on $100: fee usually $0, net $100 if the transfer completes—without merchant dispute tooling.",
          "On $500: Venmo Business fee ≈ $9.60, net ≈ $490.40; with instant ≈ $481.82 cash. Cash App Business fee ≈ $13.15 (2.6% × 500 + $0.15), net ≈ $486.85; with instant ≈ $479.55. Zelle ≈ $500. The $0 rail looks best on fees and worst if you needed seller protections that Zelle does not provide like a merchant processor would.",
        ],
      },
      {
        h2: "How to calculate which rail wins for you",
        paragraphs: [
          "Estimate monthly volume and transaction count per rail. Apply business fees, then apply your actual instant-usage rate (0–100%). Add expected loss from unprotected transfers if you accept stranger P2P—qualitative if you lack data, but do not pretend the risk is zero.",
          "Reverse-price if you need a cash-in-bank target after Venmo or Cash App fees. For Zelle, the fee math is trivial, so focus on policy fit and client trust. Hub overview: /p2p-fees/.",
        ],
        list: [
          "Separate personal vs business profile rules for Venmo and Cash App.",
          "Never assume F&F-style personal payments are OK for commercial invoices.",
          "Model instant percent only if you use instant deposits.",
          "Prefer Stripe/PayPal for strangers; reserve P2P for trusted repeat clients if you use it at all.",
          "Document which rail each client agreed to on the contract.",
        ],
      },
      {
        h2: "When to choose Venmo, Cash App, or Zelle",
        paragraphs: [
          "Choose Venmo Business when your clients already live in Venmo and you want a lower business percent than Cash App’s 2.6% + $0.15, accepting the 1.9% + $0.10 schedule. Choose Cash App Business when that is your audience’s default wallet and you can price for 2.6% + $0.15 plus optional instant 1.5%.",
          "Choose Zelle when both parties use participating banks, the relationship is trusted, and $0 fees matter more than merchant features. Avoid Zelle as your only rail for high-risk digital goods sold to new buyers.",
          "Choose none of them—and use Stripe or PayPal—when you need receipts, chargeback workflows, and clearer commercial terms. Pair with hidden payment fees for stacked instant costs and how to price after fees for reverse math.",
        ],
      },
      {
        h2: "Practical tips",
        paragraphs: [
          "Put accepted payment methods in your contract. If a client switches to personal Venmo to avoid business fees, pause and renegotiate rather than silently accepting unprotected payments.",
          "Turn off instant transfer as a habit. Speed is a product you can sell as a premium, not a default tax on every deposit. Re-check official fee pages whenever the apps push product changes—schedules above are as of 2026-10-24.",
        ],
      },
      {
        h2: "Risk, records, and client communication",
        paragraphs: [
          "Fee tables do not capture the cost of an unpaid dispute when you lack merchant tools. For new clients, prefer PayPal Goods & Services or a card processor even if Venmo Business at 1.9% + $0.10 looks cheaper than PayPal Checkout at 3.49% + $0.49. The protection difference can outweigh a couple of dollars on a $100 invoice.",
          "Send a payment-methods addendum: which rails you accept, whether business profiles are required, payout timing, and that personal P2P for commercial invoices may be declined. When a client sends personal Venmo anyway, refund or return per your policy and request a compliant method rather than delivering on an unprotected payment.",
          "Retain transfer confirmations, invoice IDs in payment notes, and delivery receipts. Zelle’s usual $0 fee does not create an automatic merchant evidence package. If you rely on Zelle for trusted retainers, still issue invoices and written scopes so accounting stays clean.",
        ],
      },
      {
        h2: "Blended monthly scenario",
        paragraphs: [
          "Example mix: $3,000 Venmo Business, $1,000 Cash App Business, $2,000 Zelle, with 50% of Venmo/Cash App nets instant-cashed. Venmo fees ≈ 1.9% × 3000 + 0.10 × transaction_count; approximate percent-only ≈ $57 plus fixed per payment. Cash App ≈ 2.6% + $0.15 × 1000 = $27.50. Zelle ≈ $0. Instant on half the Venmo/Cash nets adds another roughly 1.5–1.75% on those withdrawals.",
          "Spreadsheet that mix once, then decide whether to standardize on one business P2P rail plus one merchant processor. Simplifying rails often saves more ops time than squeezing the last 0.2% of fee math. Explore the hub at /p2p-fees/ for calculator entry points.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Zelle always free?",
        a: "It is usually $0 for eligible transfers at participating banks, but banks can set their own disclosures. Confirm on Zelle’s help center and your bank’s fee schedule. Free does not mean protected like a merchant payment.",
      },
      {
        q: "Which is cheaper for a $100 business payment?",
        a: "Zelle is usually $0. Between business profiles, Venmo Business (~$2.00 on $100) typically beats Cash App Business (~$2.75 at 2.6% + $0.15) on this snapshot—before instant cash-out fees. Verify live rates in the calculators.",
      },
      {
        q: "Do instant transfers change the winner?",
        a: "They can. Venmo instant ~1.75% and Cash App instant ~1.5% apply on top of payment fees when you cash out immediately. If you always use instant, include both layers in reverse pricing.",
      },
      {
        q: "Can I use personal Venmo for freelancing?",
        a: "Commercial activity generally belongs on business profiles/products. Personal rails may lack appropriate protections and can conflict with platform policies. Prefer business profiles or full merchant processors for client work.",
      },
      {
        q: "When should I refuse P2P entirely?",
        a: "Refuse when the buyer is unknown, the deliverable is reversible digital goods with high dispute risk, or the client pushes for personal payments to avoid business fees. Use Stripe or PayPal Goods & Services instead.",
      },
    ],
    relatedTools: ["venmo", "cashapp", "zelle"],
    relatedGuides: ["hidden-payment-fees", "how-to-price-after-fees", "paypal-goods-services-vs-friends-family"],
    relatedHubs: [
      { href: "/p2p-fees/", label: "P2P fees hub" },
    ],
    sources: [
      { label: "Venmo fees", url: "https://venmo.com/resources/our-fees", asOf: "2026-10-24" },
      { label: "Cash App help", url: "https://cash.app/help", asOf: "2026-10-24" },
      { label: "Zelle help center", url: "https://www.zellepay.com/help-center", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "Venmo vs Cash App vs Zelle planning fees (as of 2026-10-24)",
      headers: ["Rail", "Payment fee", "Instant cash-out", "Fee on $100 payment"],
      rows: [
        ["Venmo Business", "1.9% + $0.10", "~1.75%", "$2.00"],
        ["Cash App Business", "2.6% + $0.15", "~1.5%", "$2.75"],
        ["Zelle (typical bank)", "Usually $0", "N/A (bank deposit)", "$0"],
      ],
    },
  },
  {
    slug: "square-vs-stripe-vs-shopify",
    title: "Square vs Stripe vs Shopify Payments",
    description: "Compare Square, Stripe, and Shopify Payments US online and in-person rates—with $100 examples, plan tiers, and guidance on when each commerce stack wins.",
    primaryKeyword: "square vs stripe vs shopify payments",
    published: "2026-10-23",
    modified: "2026-10-24",
    answerFirst: "For common US online cards as of 2026-10-24, Stripe and Square online both list 2.9% + $0.30; Shopify Payments depends on plan—Basic 2.9% + $0.30, Grow 2.7% + $0.30, Advanced 2.5% + $0.30. Square in-person lists 2.6% + $0.15. Choose based on online vs in-person mix, not the online headline alone.",
    takeaways: [
      "Stripe and Square Plus/API online commonly list 2.9% + $0.30; Square Free online is 3.3% + $0.30.",
      "Shopify Payments: Basic 2.9%, Grow 2.7%, Advanced 2.5% (+ $0.30) online in the US.",
      "Square in-person 2.6% + $0.15 often beats online card rates when most sales are face-to-face.",
    ],
    sections: [
      {
        h2: "Three stacks, three jobs",
        paragraphs: [
          "Stripe is a developer-centric payments platform for custom checkouts and subscriptions. Square combines payments with POS hardware and software for mixed online/in-person sellers. Shopify Payments is the native processor inside Shopify’s hosted commerce plans—rates improve as you move Basic → Shopify → Advanced.",
          "Online US list snapshots as of 2026-10-24: Stripe 2.9% + $0.30; Square online 2.9% + $0.30; Square in-person 2.6% + $0.15; Shopify Payments Basic 2.9% + $0.30, Grow plan 2.7% + $0.30, Advanced 2.5% + $0.30. Sources: stripe.com/pricing, squareup.com pricing, shopify.com/pricing.",
        ],
      },
      {
        h2: "Fee comparison table",
        paragraphs: [
          "On a pure online $100 charge, Stripe and Square online both fee $3.20 (net $96.80). Shopify Basic matches that shape; Grow plan saves a bit (2.7% + $0.30 → $3.00 fee, net $97.00); Advanced saves more (2.5% + $0.30 → $2.80 fee, net $97.20)—before Shopify subscription costs.",
          "In-person, Square’s 2.6% + $0.15 on $100 → fee $2.70, net $97.30, beating the online 2.9% + $0.30 shape. If half your volume is in-person, Square’s blended take can beat an online-only Stripe setup even when online rates match.",
        ],
      },
      {
        h2: "Worked example: $100 online and in-person",
        paragraphs: [
          "Online $100: Stripe fee $3.20 net $96.80; Square online same; Shopify Basic same; Grow plan fee $3.00 net $97.00; Advanced fee $2.80 net $97.20. Reverse to net $100 online at 2.9% + $0.30 ≈ $103.30 (Stripe/Square/Basic).",
          "In-person $100 on Square: $2.60 + $0.10 = $2.70 fee, net $97.30. Reverse in-person roughly (100 + 0.10) ÷ (1 − 0.026) ≈ $102.77. Run /tools/square-fee-calculator/, /tools/stripe-fee-calculator/, /tools/shopify-payments-fee-calculator/, and /tools/compare-payment-fees/ with your split of channels.",
          "Remember Shopify subscription fees sit outside the card rate. A move to Advanced only pays off if card savings exceed the higher monthly plan cost at your volume—spreadsheet both sides.",
        ],
      },
      {
        h2: "How to calculate the right stack",
        paragraphs: [
          "Split last month’s volume into online card vs in-person card vs wallet. Apply the matching Square, Stripe, or Shopify schedule. Add Shopify subscription (and any third-party apps) when comparing total cost of ownership—not only the card percent.",
          "Include hardware needs, developer time, and theme/app costs. A “cheaper” card rate with expensive custom engineering can lose to Square’s POS bundle or Shopify’s hosted store.",
        ],
        list: [
          "Measure % of volume in-person vs online.",
          "Apply channel-correct rates from official pricing pages.",
          "Add platform subscription and app costs for Shopify.",
          "Add estimated engineering/maintenance for Stripe-custom stores.",
          "Compare net profit, not only payment fee lines.",
        ],
      },
      {
        h2: "When to choose Square, Stripe, or Shopify Payments",
        paragraphs: [
          "Choose Square when POS hardware, in-person rates (2.6% + $0.15), and simple omnichannel tooling matter. Choose Stripe when you need custom billing logic, APIs, and online economics at 2.9% + $0.30 without committing to Shopify’s hosted paradigm.",
          "Choose Shopify Payments when you want a hosted store and can justify plan tiers that unlock 2.7% or 2.5% + $0.30 online. Compare also against Stripe vs PayPal if wallet buttons are the real question, and use the payment processors hub at /payment-processors/.",
        ],
      },
      {
        h2: "Practical tips",
        paragraphs: [
          "Do not compare Shopify Advanced’s 2.5% + $0.30 to Stripe’s 2.9% + $0.30 without subtracting Advanced’s higher subscription. Do not ignore Square in-person if you swipe cards daily.",
          "Dispute fees vary by processor—check official docs; see chargeback fees by processor. International cards and Amex mixes also move blends away from these US list snapshots (as of 2026-10-24).",
        ],
      },
      {
        h2: "Total cost of ownership beyond the card rate",
        paragraphs: [
          "Shopify’s Advanced rate of 2.5% + $0.30 looks best on a fee table, but Advanced’s subscription is higher than Basic. Compute monthly card fees at your volume under each plan, add subscription, and only then compare to Stripe at 2.9% + $0.30 plus your hosting/engineering costs—or Square with hardware amortization.",
          "Example sketch (illustrative volume only): $40,000 online monthly. Stripe/Square online/Basic fees ≈ 2.9% × 40000 + 0.30 × transactions. If you have 800 orders, fixed fees alone are $240. Grow plan at 2.7% saves 0.2% × 40000 = $80/month before fixed fees and subscription differences—enough to matter, not enough to ignore plan price changes.",
          "Square sellers should weight in-person volume heavily. A shop that is 70% keypad/POS at 2.6% + $0.15 and 30% online at 2.9% + $0.30 will see a blended card take below a pure online Stripe profile at the same online rate. Measure the split before declaring a winner.",
        ],
      },
      {
        h2: "Migration and dual-stack pitfalls",
        paragraphs: [
          "Moving from Square to Shopify (or Stripe checkout on a custom site) changes more than fees: tax apps, gift cards, recurring billing, and staff training. Run a parallel month with /tools/compare-payment-fees/ using actual average tickets before you cut over.",
          "Avoid double-paying: turning off Shopify Payments incorrectly or stacking third-party gateways can introduce extra gateway fees. Read Shopify’s current gateway policy. For wallet-heavy audiences, keep Stripe vs PayPal fees in the decision set even when the primary comparison is Square/Stripe/Shopify.",
        ],
      },
      {
        h2: "Channel mix spreadsheet you can reuse",
        paragraphs: [
          "Build three rows—online card, in-person card, and other wallets—then assign Stripe, Square, or Shopify Payments rates to each row that the stack actually supports. Multiply volume by percent, add fixed fees times transaction count, and add Shopify subscription only on Shopify scenarios. The spreadsheet answer is your true monthly processing cost before disputes.",
          "Refresh the sheet after peak seasons. Holiday volume can shift you from Basic to Advanced break-even on Shopify, or make Square’s in-person rate dominate when pop-up retail spikes. Keep official pricing URLs in the sheet header with the 2026-10-15 snapshot note so teammates know when to re-verify.",
          "If engineering time is your scarce resource, weight Stripe’s flexibility against the calendar cost of building billing portals that Shopify or Square already ship. Fee tables never show the weeks of roadmap you spend reinventing subscriptions.",
        ],
        list: [
          "Columns: channel, volume, transactions, percent, fixed, monthly fee subtotal.",
          "Add subscription and app fees as separate rows for Shopify.",
          "Add hardware amortization for Square terminals over 24–36 months.",
          "Compare net profit after fees, not vanity effective rates alone.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Shopify Payments cheaper than Stripe?",
        a: "On Basic, online list rates often match Stripe at 2.9% + $0.30. Shopify and Advanced plans list lower online card rates (2.7% / 2.5% + $0.30) but higher subscriptions. Compare total cost at your volume.",
      },
      {
        q: "Does Square beat Stripe for cafés?",
        a: "Often on fee mix when most volume is in-person at 2.6% + $0.15 versus online-shaped 2.9% + $0.30. Hardware, software, and payout features still matter—run both calculators on your ticket size.",
      },
      {
        q: "What is the fee on a $100 online charge?",
        a: "Stripe and Square online: $3.20 (net $96.80). Shopify Basic: same shape. Grow plan: $3.00. Advanced: $2.80. Confirm on official pricing and our calculators.",
      },
      {
        q: "Can I use Stripe inside Shopify?",
        a: "Shopify’s ecosystem and third-party gateways have specific rules and possible fees beyond Shopify Payments. Check Shopify’s current gateway documentation; native Shopify Payments rates above assume you use Shopify Payments.",
      },
      {
        q: "Where should I compare side by side?",
        a: "Use /tools/compare-payment-fees/ with your average order value, and read Stripe vs PayPal fees if wallets are in scope.",
      },
    ],
    relatedTools: ["square", "stripe", "shopify", "comparison"],
    relatedGuides: ["stripe-vs-paypal-fees", "how-to-price-after-fees", "hidden-payment-fees"],
    relatedHubs: [
      { href: "/payment-processors/", label: "Payment processor fees hub" },
    ],
    sources: [
      { label: "Stripe pricing", url: "https://stripe.com/pricing", asOf: "2026-10-24" },
      { label: "Square pricing", url: "https://squareup.com/us/en/pricing", asOf: "2026-10-24" },
      { label: "Shopify pricing", url: "https://www.shopify.com/pricing", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "Square vs Stripe vs Shopify Payments US list (as of 2026-10-24)",
      headers: ["Schedule", "Rate", "Fee on $100", "Net on $100"],
      rows: [
        ["Stripe US online", "2.9% + $0.30", "$3.20", "$96.80"],
        ["Square US online", "2.9% + $0.30", "$3.20", "$96.80"],
        ["Square US in-person", "2.6% + $0.15", "$2.70", "$97.30"],
        ["Shopify Payments Basic", "2.9% + $0.30", "$3.20", "$96.80"],
        ["Shopify Payments (Grow plan)", "2.7% + $0.30", "$3.00", "$97.00"],
        ["Shopify Payments Advanced", "2.5% + $0.30", "$2.80", "$97.20"],
      ],
    },
  },
  {
    slug: "gumroad-vs-kofi-fees",
    title: "Gumroad vs Ko-fi Fees (2026): $20 Sale Keep",
    description: "Compare Gumroad’s blended direct fees with Ko-fi free and Gold processing estimates—worked $100 examples, break-evens, and when each creator checkout wins.",
    primaryKeyword: "gumroad vs ko-fi fees",
    published: "2026-10-23",
    modified: "2026-10-24",
    answerFirst: "Gumroad direct sales plan around a blended ~12.9% + $0.80 as of 2026-10-24. Ko-fi Free takes 0% platform on one-time tips (processing ~2.9% + $0.30 still applies); Standard is 5% on tips, and Gold can remove the tip platform cut. Gumroad fits catalog downloads; Ko-fi fits tips and lightweight memberships—compare the job, not only the percent.",
    takeaways: [
      "Gumroad direct blend ≈ 12.9% + $0.80; Discover marketplace is 30%.",
      "Ko-fi Free tips: 0% platform (processing remains); shop/memberships 5%.",
      "On a $100 tip, Ko-fi Free keeps far more than Gumroad’s storefront cut — different jobs.",
    ],
    sections: [
      {
        h2: "Different products behind the fee tables",
        paragraphs: [
          "Gumroad is built as a creator storefront for products, memberships, and paywalled content with a higher blended take that folds platform and processing for planning—about 12.9% + $0.80 on direct sales in our schedule as of 2026-10-24 (see gumroad.com/pricing). Discover marketplace sales are 30%. Ko-fi began as a tip jar and expanded into shop and membership features with Free-plan 0% on one-time tips (5% on shop/memberships) and a Gold path that can eliminate tip commission while processing remains.",
          "Comparing them only on percent misses intent. If fans send gratitude payments, Ko-fi’s lower tip take usually wins. If you sell a $49 PDF with customer support expectations, Gumroad’s tooling may justify its blend—or you may prefer Stripe on your own site at 2.9% + $0.30 plus your hosting time. Use /tools/gumroad-fee-calculator/ and /tools/kofi-fee-calculator/ on the same price point.",
        ],
      },
      {
        h2: "Fee comparison",
        paragraphs: [
          "On a $100 tip-like payment: Ko-fi Free platform $0 + ~$3.20 processing estimate (net ~$96.80); Standard 5% platform ≈ $5 plus processing; Gumroad direct blend ~$12.90 + $0.80 = $13.70 (net ~$86.30). Gumroad is not trying to win the tip-jar fee contest—it is a storefront cut.",
          "On a $100 digital product, the relevant question is whether Gumroad’s conversion and features outperform a Ko-fi shop link or a self-hosted Stripe checkout after you include your time. Feed the same $100 through both calculators, then add Gold’s subscription if you model Ko-fi Gold.",
        ],
      },
      {
        h2: "Worked example and reverse pricing",
        paragraphs: [
          "Forward Gumroad $49 product at ~12.9% + $0.80: percent ≈ $6.32, plus $0.80 ≈ $7.12 fee, net ≈ $41.88. Forward Ko-fi Free tip $49 at 0% platform + ~2.9% + $0.30 processing estimate ≈ $1.72 fee, net ≈ $47.28—different product category than Gumroad’s storefront cut.",
          "Reverse to net $100 on Gumroad: C ≈ (100 + 0.80) ÷ (1 − 0.129) ≈ 100.8 ÷ 0.871 ≈ $115.73. Reverse to net $100 on Ko-fi Free tips (0% platform, processing ~2.9%+$0.30): ≈ $103.30; on Standard 5% platform alone ≈ $105.26 before processing. Reverse Ko-fi Gold processing estimate at 2.9% + $0.30: ≈ $103.30, Stripe-like. Publish list prices from reverse math so net goals survive the platform you actually use.",
          "Gold break-even sketch for tips: monthly tips × 5% ≈ commission saved if Gold removes it. If that exceeds Gold’s price and you still pay processing, Gold can win. Confirm live Gold pricing on Ko-fi; do not freeze an old blog number into your model.",
        ],
      },
      {
        h2: "How to calculate which checkout to keep",
        paragraphs: [
          "Segment revenue into tips vs product sales vs memberships. Apply Ko-fi schedules to tips/memberships and Gumroad’s blend to catalog sales. If one segment is tiny, consolidating platforms may beat dual-maintaining two storefronts even if the fee table prefers a split.",
          "Include refund rates. Higher-touch digital products refund more; a cheaper fee with high refunds can lose to a costlier platform with clearer delivery tooling. Track effective net after refunds, not only after fees.",
        ],
        list: [
          "List each SKU’s price and expected monthly units.",
          "Run Gumroad blended forward/reverse for SKUs.",
          "Run Ko-fi free and Gold scenarios for tip volume.",
          "Add Gold subscription and your support time.",
          "Pick a primary checkout; link the secondary sparingly.",
        ],
      },
      {
        h2: "When Gumroad wins vs when Ko-fi wins",
        paragraphs: [
          "Choose Gumroad when you need a product-centric storefront, discoverability features you value, and are willing to price for ~12.9% + $0.80 blended. Choose Ko-fi when tips dominate and especially when Gold makes processing-shaped economics available on donations.",
          "Choose neither alone when you need full merchant control: a Stripe checkout at 2.9% + $0.30 plus your site may win on fees if you can build and maintain it. Compare also Patreon vs Ko-fi vs Buy Me a Coffee for membership-first creators. Hub: /creator-fees/.",
        ],
      },
      {
        h2: "Practical tips",
        paragraphs: [
          "Do not paste a Stripe reverse price onto a Gumroad SKU. Rebuild every product price with /tools/gumroad-fee-calculator/. Do not assume Ko-fi shop fees equal tip fees—confirm the product type in Ko-fi’s documentation and our schedules.",
          "Keep official sources handy: gumroad.com/pricing and ko-fi.com. Schedules cited here are as of 2026-10-24. Re-verify after platform emails about pricing changes. Related: hidden payment fees for stacked payout surprises.",
        ],
        list: [
          "Reverse-price every Gumroad SKU after fee changes.",
          "Revisit Ko-fi Gold quarterly as tip volume grows.",
          "Separate tip metrics from product metrics in analytics.",
          "Avoid promising fans a payout percent you have not measured on a real statement.",
        ],
      },
      {
        h2: "Catalog design under high take rates",
        paragraphs: [
          "When Gumroad’s blend near 12.9% + $0.80 applies, bundling can neutralize fixed-fee pain better than selling many tiny SKUs. A $9 impulse PDF pays a painful effective rate after $0.80 fixed; a $49 bundle amortizes the fixed component and still reverse-prices cleanly toward your net goal.",
          "Ko-fi tip culture rewards frequent small thanks. That pattern fits ~5% free-tier tips or Gold processing estimates near 2.9% + $0.30, but it is a weak match for a 40-SKU download store. If your analytics show tips out-earning product sales, invest in Ko-fi; if product sales dominate, invest in Gumroad merchandising—or a Stripe storefront.",
          "Publish a public pricing philosophy for fans: “Tips via Ko-fi, premium packs via Gumroad,” so audiences stop asking which link is canonical. Dual links without a story create abandoned carts and support tickets that erase fee savings.",
          "Rehearse refund policy differences too. Platforms handle refunds differently; your calculator nets assume successful settled sales. A 5% refund rate on Gumroad changes the real blend more than a 0.2% pricing tweak.",
        ],
      },
    ],
    faqs: [
      {
        q: "Why is Gumroad so much higher than Ko-fi on $100?",
        a: "Gumroad’s ~12.9% + $0.80 is a storefront blended planning rate; Ko-fi free tips near ~5% (and Gold processing near ~2.9% + $0.30) target different jobs. Compare same-job checkouts, not tip jars vs product platforms blindly.",
      },
      {
        q: "How much should I charge on Gumroad to net $100?",
        a: "About $115.73 using the ~12.9% + $0.80 blend: (100 + 0.80) ÷ (1 − 0.129). Confirm in /tools/gumroad-fee-calculator/ and on gumroad.com/pricing.",
      },
      {
        q: "Does Ko-fi Gold remove all fees?",
        a: "No. Gold can remove donation commission on eligible tips, but card processing-like fees remain. Our Gold schedule models processing near 2.9% + $0.30 for planning—verify current Gold benefits on Ko-fi.",
      },
      {
        q: "Can I use both Gumroad and Ko-fi?",
        a: "Yes. Many creators take tips on Ko-fi and sell downloads on Gumroad. Just reverse-price each catalog correctly and avoid splitting the same SKU across too many storefronts.",
      },
      {
        q: "Should I move products to Stripe instead?",
        a: "If you can host checkout and support customers yourself, Stripe US list at 2.9% + $0.30 is far cheaper than Gumroad’s blend—but you own fraud, hosting, and UX. Model engineering time honestly.",
      },
    ],
    relatedTools: ["gumroad", "kofi"],
    relatedGuides: ["patreon-vs-kofi-vs-bmac", "hidden-payment-fees", "how-to-price-after-fees"],
    relatedHubs: [
      { href: "/creator-fees/", label: "Creator fees hub" },
    ],
    sources: [
      { label: "Gumroad pricing", url: "https://gumroad.com/pricing", asOf: "2026-10-24" },
      { label: "Ko-fi", url: "https://ko-fi.com", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "Gumroad vs Ko-fi planning fees on $100 (as of 2026-10-24)",
      headers: ["Checkout", "Planning rate", "Fee on $100", "Net on $100"],
      rows: [
        ["Gumroad direct (blended)", "~12.9% + $0.80", "~$13.70", "~$86.30"],
        ["Ko-fi free tips", "~5%", "~$5.00", "~$95.00"],
        ["Ko-fi Gold (processing est.)", "~2.9% + $0.30", "~$3.20", "~$96.80"],
      ],
    },
  },
  {
    slug: "wise-vs-paypal-international",
    title: "Wise vs PayPal International Fees (2026)",
    description: "Compare Wise corridor fee estimates with PayPal international pricing for cross-border payouts—worked examples, FX pitfalls, and when each option wins.",
    primaryKeyword: "wise vs paypal international fees",
    published: "2026-10-23",
    modified: "2026-10-24",
    answerFirst: "For moving money across borders, Wise corridor estimates often land around 0.37–0.45% plus a fixed fee depending on route, while PayPal international and FX paths usually cost more than domestic US Goods & Services at 2.99%. Compare the full path—checkout fee plus conversion—using both calculators before you invoice abroad.",
    takeaways: [
      "Wise corridor estimates often land near 0.37–0.45% + a fixed fee (confirm live quotes).",
      "PayPal domestic US G&S is 2.99%; international/FX paths usually cost more than domestic.",
      "Compare the full path — checkout fee plus conversion — before invoicing abroad.",
    ],
    sections: [
      {
        h2: "International fees are a path, not a single percent",
        paragraphs: [
          "Cross-border money movement usually stacks at least two decisions: how the customer pays, and how you settle into your bank currency. PayPal may charge higher cross-border or commercial transaction rates than domestic US G&S, then convert currency at its own rate. Wise focuses on transfer corridors with transparent percent-plus-fixed estimates—our planning band is about 0.37–0.45% + fixed as of 2026-10-24 from wise.com/pricing.",
          "Domestic mental models fail here. A freelancer who prices with Stripe US 2.9% + $0.30 or PayPal US G&S 2.99% will miss FX and cross-border add-ons. Open /tools/wise-transfer-fee-calculator/ and /tools/paypal-fee-calculator/ on international schedules, not only the US defaults.",
        ],
      },
      {
        h2: "Fee comparison overview",
        paragraphs: [
          "PayPal US domestic G&S remains 2.99% for baseline comparison; international commercial payments often price higher (see PayPal’s official fee pages for the exact corridor and product). Wise is typically used after you already have funds—or as a payout rail—rather than as a full customer checkout replacement for card e-commerce.",
          "Practical pattern: collect with a merchant processor in a currency you choose, then pay yourself across borders with Wise when the corridor estimate beats wallet FX. Sometimes receiving with PayPal is still worth it for buyer trust despite pricier FX—if conversion lifts win rates.",
        ],
      },
      {
        h2: "Worked example",
        paragraphs: [
          "Scenario A — customer pays $1,000 USD via PayPal US G&S domestically: fee ≈ $34.90 + $0.49 = $35.39, net ≈ $964.61. If that balance must become EUR with PayPal conversion, additional FX cost applies per PayPal’s rates—model the conversion quote explicitly rather than inventing a markup percent here.",
          "Scenario B — you already hold $1,000 USD and send via Wise on a corridor modeled at 0.43% + $0.50 fixed (illustrative within the 0.37–0.45% band): fee ≈ $4.00 + $1.00 = $5.00, much smaller than a wallet FX surprise—but Wise did not acquire the customer payment. You still needed a collection method.",
          "Scenario C — PayPal international commercial rate example from our schedules can sit near 4.99% + fixed depending on product; always pick the matching schedule in /tools/paypal-fee-calculator/. On $1,000 at 4.99% + $0.49: fee ≈ $50.39, net ≈ $949.61 before any separate FX. Compare total landed cash against a Stripe/Wise combo for your corridor.",
        ],
      },
      {
        h2: "How to calculate landed cash",
        paragraphs: [
          "Write the path as a flowchart: customer currency → processor fee → optional wallet balance → FX conversion → bank deposit fee if any. Compute each step with official quotes the day you invoice. Save the quotes with the invoice ID.",
          "For repeat corridors, build a tiny rate card: average processor take, average Wise fee for that route, and preferred invoice currency. Update monthly. Use hidden payment fees guidance so instant payouts do not sneak into the path unnoticed.",
        ],
        list: [
          "Choose invoice currency intentionally (customer-local vs your home currency).",
          "Select the correct PayPal international schedule in the calculator.",
          "Price Wise transfers with the corridor estimate, not a global flat guess.",
          "Add bank receiving fees if your bank charges for wires/ACH equivalents.",
          "Compare customer conversion friction, not only your net.",
        ],
      },
      {
        h2: "When Wise wins vs when PayPal wins",
        paragraphs: [
          "Choose Wise when the job is moving balances between currencies/countries with transparent corridor pricing and you already have a collection method. Choose PayPal when the customer needs a familiar checkout wallet and will not complete a bank transfer workflow.",
          "Hybrid wins often: PayPal or Stripe to collect, Wise to treasury. Pure PayPal end-to-end can still win for small one-off international invoices where setup cost of a second tool exceeds FX savings. See Stripe vs PayPal fees for collection-side US comparisons.",
        ],
      },
      {
        h2: "Practical tips",
        paragraphs: [
          "Never quote a client a net in their currency without locking the FX assumption. Prefer invoicing in a currency you can hold, then transferring on your schedule with Wise. Watch holding balances for rate drift.",
          "Verify sources: wise.com/pricing and PayPal’s business fees pages (as of 2026-10-24 for our embedded schedules). Corridor prices change; re-run calculators per large invoice.",
        ],
      },
      {
        h2: "Contract language for cross-border invoices",
        paragraphs: [
          "Specify currency, who bears FX, acceptable processors, and when payment is considered received. If you absorb FX, reverse-price with a buffer so a bad conversion week does not wipe margin. If the client absorbs FX, show an estimate and a clause that final local amount follows the processor quote at payment time.",
          "For retainers, collect in a stable currency monthly via Stripe or PayPal G&S, then batch Wise transfers weekly or monthly to reduce fixed-fee drag on tiny corridors. Batching is one of the few true free optimizations in international fee design.",
          "Watch local payout methods Wise supports in your country. A corridor that looks cheap on percent can still lose a day of cash-flow timing versus PayPal balances you already spend in-platform. Timing has a cost even when the fee table looks perfect.",
          "Keep a one-page appendix for clients abroad: screenshots of accepted methods, example fee math on $100 and $1,000, and links to /tools/wise-transfer-fee-calculator/ and /tools/paypal-fee-calculator/. Education reduces “please send F&F” requests that create compliance risk.",
        ],
      },
      {
        h2: "Additional planning notes",
        paragraphs: [
          "Re-verify official pricing before you publish customer-facing numbers for wise vs paypal international fees. Our embedded schedules use an as-of date of 2026-10-15 and are planning aids, not contracts. When your processor negotiates custom pricing, substitute those percent and fixed values into the same forward and reverse formulas used throughout these guides.",
          "Bookmark the related calculators linked from this article and re-run them whenever average order value shifts by more than about 20%. Fixed fees change effective rates sharply on small tickets, which is why $10 invoices and $500 invoices deserve separate reverse-price checks rather than linear scaling from a single $100 demo.",
          "Finally, document the schedule name, source URL, and verification date next to every rate card or membership tier. Stale fee assumptions are one of the most common reasons freelancers and creators miss margin targets even when their headline math once looked correct.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Wise always cheaper than PayPal internationally?",
        a: "For many transfer corridors, Wise’s ~0.37–0.45% + fixed planning band beats typical wallet FX paths, but PayPal may still win as a collection tool. Compare the full path: collection + conversion + payout.",
      },
      {
        q: "Can Wise replace PayPal checkout?",
        a: "Not as a drop-in card wallet for every customer. Wise excels at transfers and borderless accounts; customer card checkout often still needs Stripe, PayPal, or similar.",
      },
      {
        q: "What PayPal rate should I use for US domestic baselines?",
        a: "US Goods & Services (Send/Receive Money) is 2.99% with no fixed fee as of 2026-10-24. International products differ—select the international schedule in /tools/paypal-fee-calculator/.",
      },
      {
        q: "How do I estimate a Wise fee quickly?",
        a: "Use /tools/wise-transfer-fee-calculator/ with the corridor estimate, and confirm the live quote on wise.com/pricing before sending large amounts.",
      },
      {
        q: "Should freelancers invoice in USD or local currency?",
        a: "Invoice in the currency that maximizes paid invoices after fees and friction. Sometimes customer-local pricing converts better even if your FX cost rises—measure completion, then optimize rails.",
      },
    ],
    relatedTools: ["wise", "paypal"],
    relatedGuides: ["hidden-payment-fees", "stripe-vs-paypal-fees", "how-to-price-after-fees"],
    sources: [
      { label: "Wise pricing", url: "https://wise.com/pricing", asOf: "2026-10-24" },
      { label: "PayPal US business fees", url: "https://www.paypal.com/us/business/paypal-business-fees", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "International path planning snapshot (as of 2026-10-24)",
      headers: ["Path element", "Planning figure", "Notes"],
      rows: [
        ["PayPal US G&S (domestic baseline)", "2.99%", "Not an FX-inclusive international total"],
        ["PayPal US Checkout (domestic)", "3.49% + $0.49", "Not an FX-inclusive international total"],
        ["PayPal international commercial (varies)", "See PayPal schedules / calculator", "Pick exact product in calculator"],
        ["Wise corridor estimate", "~0.37–0.45% + fixed", "Confirm live corridor on Wise"],
      ],
    },
  },
  {
    slug: "passing-fees-to-customers",
    title: "Passing Card Fees to Customers (2026 Rules)",
    description: "How to build processor fees into prices or surcharges where rules allow—with Stripe and PayPal reverse math, compliance cautions, and customer-friendly framing.",
    primaryKeyword: "passing payment fees to customers",
    published: "2026-10-23",
    modified: "2026-10-24",
    answerFirst: "Where surcharging is restricted, the reliable approach is to build processor fees into your list prices using reverse math: charge (net + fixed) ÷ (1 − percent). For Stripe US 2.9% + $0.30 to net $100, charge about $103.30; for PayPal G&S 2.99%, about $103.08 (Checkout at 3.49% + $0.49 is about $104.14). Confirm local card-network and legal rules before adding a checkout surcharge.",
    takeaways: [
      "Prefer fee-inclusive list prices: charge = (net + fixed) ÷ (1 − percent).",
      "Stripe US to net $100 ≈ $103.30; PayPal G&S 2.99% ≈ $103.08.",
      "Confirm local surcharging rules before adding a labeled card-fee line at checkout.",
    ],
    sections: [
      {
        h2: "Fee-inclusive pricing vs surcharging",
        paragraphs: [
          "Passing fees can mean two different tactics. Fee-inclusive pricing raises the list price so that after Stripe or PayPal takes their cut, you still net your target. Surcharging adds a line item at checkout labeled as a card fee. Many regions and card networks restrict or regulate surcharging; fee-inclusive pricing is usually the simpler default.",
          "This guide is educational, not legal advice. Before you enable any surcharge product feature, read your processor agreement and local rules. When in doubt, bake fees into prices and disclose total price clearly.",
        ],
      },
      {
        h2: "How to calculate fee-inclusive prices",
        paragraphs: [
          "Use the reverse formula from our how-to-price-after-fees guide: C = (N + f) ÷ (1 − p). Stripe US: p = 0.029, f = 0.30. PayPal US G&S: p = 0.0299, f = 0. PayPal Checkout: p = 0.0349, f = 0.49. Run /tools/stripe-fee-calculator/ and /tools/paypal-fee-calculator/ in “charge to receive” mode.",
          "If you accept both rails at one list price, price for the more expensive rail you still allow—or publish rail-specific prices if your contracts and UX support that clarity. A single $100 list price nets ~$96.80 on Stripe vs ~$97.01 on PayPal G&S (or ~$96.02 on Checkout); the gap is your silent discount to PayPal users unless you adjust.",
        ],
        list: [
          "Set the net you need after fees.",
          "Identify every accepted payment rail and its schedule.",
          "Reverse-calculate per rail; pick publish price from the costliest allowed rail or separate SKUs.",
          "Round up for marketing cleanliness.",
          "Document the as-of date (schedules here use 2026-10-24 sources).",
        ],
      },
      {
        h2: "Worked example",
        paragraphs: [
          "You need $250 net. Stripe: C = (250 + 0.30) ÷ 0.971 ≈ $257.78 → publish $259 or $265. PayPal G&S: C = 250 ÷ 0.9701 ≈ $257.71; Checkout: C = (250 + 0.49) ÷ 0.9651 ≈ $259.55 → publish $265 if you want one price covering Checkout.",
          "Surcharge-style illustration (only where allowed): list $250 + disclosed card fee. The fee line must match permitted calculation methods—some regimes cap surcharges or ban them on certain cards. Do not copy a percent from a blog; follow current network rules and processor docs.",
          "Creator platforms complicate pass-through: Gumroad customers already see a product price that must absorb ~12.9% + $0.80 blended if that is your rail. You cannot “surcharge Gumroad” separately in a way that surprises buyers—set the public price correctly up front.",
        ],
      },
      {
        h2: "Fee comparison when choosing a rail to bake in",
        paragraphs: [
          "Baking in Stripe’s 2.9% + $0.30 yields lower customer prices for the same net than baking in PayPal G&S 2.99%. If PayPal conversion is essential, either accept lower net on PayPal orders or raise the global list price and let Stripe orders carry slightly more margin.",
          "Compare with /tools/compare-payment-fees/. For POS contexts, Square in-person 2.6% + $0.15 may change the bake-in math versus online 2.9% + $0.30—see Square vs Stripe vs Shopify Payments.",
        ],
      },
      {
        h2: "When pass-through tactics win or fail",
        paragraphs: [
          "Fee-inclusive pricing wins when you sell in regulated surcharge environments, sell internationally across mixed rules, or want simpler UX. Explicit surcharging (where legal) can win when buyers frequently choose expensive rails and you want visible incentives to pick ACH or other cheaper methods your processor offers.",
          "Pass-through fails when the disclosure surprises buyers at the last step and kills conversion. It also fails when your math uses the wrong schedule (domestic vs international, G&S vs F&F). Never instruct commercial clients to use PayPal Friends & Family to avoid fees—see PayPal G&S vs Friends & Family.",
        ],
      },
      {
        h2: "Practical tips",
        paragraphs: [
          "Put the total price in proposals, not “plus processing.” Update prices when processors change rates. Keep Stripe and PayPal source links on your internal rate card (as of 2026-10-24 snapshots in our data files).",
          "Train support staff: if a customer asks to switch from card to a $0 P2P rail, explain risk and policy rather than silently accepting unprotected payments. Pair with hidden payment fees for instant-payout traps.",
        ],
      },
      {
        h2: "Messaging that does not sound like a gotcha",
        paragraphs: [
          "Customers accept fee-inclusive prices more readily than last-second surcharges. Present a single total in proposals and checkout. If you itemize for enterprise AP departments, label the line as “processing-inclusive service fee” only when your counsel agrees the wording matches local rules—and still ensure the math matches Stripe 2.9% + $0.30 or PayPal G&S 2.99% as applicable.",
          "For subscriptions, revise prices on renewal notice windows rather than mid-cycle surprises when processor rates change. Keep a changelog of fee-driven price updates with source URLs and as-of dates so finance can audit.",
          "Marketplace sellers sometimes face platform rules that forbid additional surcharges even when local law allows them. Platform policy can be stricter than card-network policy—read both. When blocked from surcharging, reverse-price the listing and move on.",
          "If you operate in multiple countries, maintain country-specific price books. A bake-in that works for US Stripe list rates fails when EU pricing or cross-border add-ons apply. Pair with Wise vs PayPal for international when settlement currency differs from list currency.",
        ],
        list: [
          "Prefer one clear total price in customer-facing docs.",
          "Log fee-driven price changes with official source links.",
          "Check marketplace policies before enabling surcharge toggles.",
          "Localize bake-in math per country schedule.",
        ],
      },
      {
        h2: "Additional planning notes",
        paragraphs: [
          "Re-verify official pricing before you publish customer-facing numbers for passing payment fees to customers. Our embedded schedules use an as-of date of 2026-10-15 and are planning aids, not contracts. When your processor negotiates custom pricing, substitute those percent and fixed values into the same forward and reverse formulas used throughout these guides.",
          "Bookmark the related calculators linked from this article and re-run them whenever average order value shifts by more than about 20%. Fixed fees change effective rates sharply on small tickets, which is why $10 invoices and $500 invoices deserve separate reverse-price checks rather than linear scaling from a single $100 demo.",
          "Finally, document the schedule name, source URL, and verification date next to every rate card or membership tier. Stale fee assumptions are one of the most common reasons freelancers and creators miss margin targets even when their headline math once looked correct.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is surcharging legal?",
        a: "It depends on your country, state, and card-network rules, and on your processor’s acceptable-use terms. Many sellers choose fee-inclusive prices instead. This article is not legal advice—verify current rules before enabling surcharges.",
      },
      {
        q: "How do I pass through Stripe fees mathematically?",
        a: "Charge (desiredNet + 0.30) ÷ (1 − 0.029) for US list Stripe pricing at 2.9% + $0.30. Example: net $100 → about $103.30. Confirm with /tools/stripe-fee-calculator/.",
      },
      {
        q: "What about PayPal?",
        a: "For US Goods & Services at 2.99% (no fixed), charge desiredNet ÷ (1 − 0.0299). Example: net $100 → about $103.08. Checkout uses (net + 0.49) ÷ (1 − 0.0349) ≈ $104.14. Use /tools/paypal-fee-calculator/.",
      },
      {
        q: "Should I show fees as a separate line item?",
        a: "Only if allowed and clearly disclosed before payment authorization. Otherwise, include fees in the listed price to avoid checkout surprises and compliance issues.",
      },
      {
        q: "Can I tell customers to use Friends & Family?",
        a: "No for commercial goods and services. F&F can be $0 for eligible personal payments but lacks appropriate commercial protections and can violate policies. Use G&S or another merchant product.",
      },
    ],
    relatedTools: ["stripe", "paypal"],
    relatedGuides: ["how-to-price-after-fees", "paypal-goods-services-vs-friends-family", "stripe-vs-paypal-fees"],
    sources: [
      { label: "Stripe pricing", url: "https://stripe.com/pricing", asOf: "2026-10-24" },
      { label: "PayPal US business fees", url: "https://www.paypal.com/us/business/paypal-business-fees", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "Bake-in charges to protect target nets (US list, as of 2026-10-24)",
      headers: ["Target net", "Stripe (2.9%+$0.30)", "PayPal G&S (2.99%)", "PayPal Checkout (3.49%+$0.49)"],
      rows: [
        ["$100", "~$103.30", "~$103.08", "~$104.14"],
        ["$250", "~$257.78", "~$257.71", "~$259.55"],
        ["$1,000", "~$1,030.18", "~$1,030.82", "~$1,036.57"],
      ],
    },
  },
  {
    slug: "paypal-goods-services-vs-friends-family",
    title: "PayPal Goods & Services Fee (2.99%) vs F&F",
    description: "PayPal Goods & Services (2.99% US) vs Friends & Family $0: protections, risks, and when each payment type is appropriate.",
    primaryKeyword: "paypal goods and services vs friends and family",
    published: "2026-10-23",
    modified: "2026-10-24",
    answerFirst: "PayPal Goods & Services in the US commonly costs 2.99% (Send/Receive Money; Checkout is 3.49% + $0.49) and includes purchase protection features for eligible commercial payments. Friends & Family can be $0 when paid from PayPal balance or bank for eligible personal transfers, but it is the wrong tool for selling goods or services to customers. Price and protect commercial work on G&S.",
    takeaways: [
      "US Goods & Services Send/Receive Money: 2.99% with no fixed fee ($2.99 on $100).",
      "PayPal Checkout is separate at 3.49% + $0.49 (~$3.98 on $100).",
      "Friends & Family can be $0 from balance/bank — never use it for commercial sales.",
    ],
    sections: [
      {
        h2: "Two products, two intents",
        paragraphs: [
          "Goods & Services (G&S) is PayPal’s commercial payment product. US Send/Receive Money G&S is 2.99% with no fixed fee as of 2026-10-24 (Checkout remains 3.49% + $0.49) on PayPal’s business fees page. Friends & Family (F&F) is meant for personal transfers—splitting dinner, gifts—often $0 when funded from balance or bank, with different protection expectations.",
          "Problems start when sellers ask buyers to “send F&F so I can save fees.” That shifts risk, may violate PayPal policies, and can leave sellers without seller protection pathways that G&S is designed to support. Buyers also lose purchase protection on misuse. Treat F&F as personal only.",
        ],
      },
      {
        h2: "Fee comparison",
        paragraphs: [
          "On a $100 commercial invoice: G&S fee ≈ $3.98, net ≈ $96.02. F&F eligible personal from balance/bank: $0 fee, net $100—but inappropriate for that commercial invoice. On $1,000: G&S fee ≈ $34.90 + $0.49 = $35.39. The fee is the cost of using the commercial product correctly.",
          "Card-funded personal payments can incur different fees even in F&F contexts—confirm on PayPal’s official fee pages rather than assuming every F&F payment is free. Our calculator’s F&F schedule models the $0 balance/bank case for planning.",
        ],
      },
      {
        h2: "Worked example for freelancers",
        paragraphs: [
          "You deliver a $800 website package. Correct path: PayPal G&S invoice or checkout. Fee ≈ 3.49% × 800 + 0.49 ≈ $28.41, net ≈ $771.59. Reverse-price if you need $800 net: charge ≈ (800 + 0.49) ÷ (1 − 0.0349) ≈ $829.39—see /tools/paypal-fee-calculator/ and how to price after fees.",
          "Incorrect path: ask for $800 F&F. You might receive $800 with $0 PayPal fee, but you take on elevated risk if the buyer files complaints, claims unauthorized payment, or PayPal limits the account for commercial misuse. One reversal can erase many months of “saved” G&S fees.",
          "Compare with Stripe at 2.9% + $0.30 on $800: fee = $23.20 + $0.30 = $23.50, net $776.50. Sometimes offering Stripe plus PayPal G&S—never F&F for commerce—is the right pair. See Stripe vs PayPal fees.",
        ],
      },
      {
        h2: "How to calculate and communicate",
        paragraphs: [
          "Put accepted methods in the contract: “PayPal Goods & Services or card via Stripe; Friends & Family not accepted for invoices.” If a client sends F&F anyway, follow a written policy—return funds or refuse to start work until G&S is used.",
          "Bake G&S fees into quotes with reverse math so you do not feel pressured to request F&F. The emotional urge to save the Checkout take (3.49% + $0.49) is strongest on large invoices—exactly when dispute risk dollars are largest.",
        ],
        list: [
          "Default all customer payments to G&S or another merchant rail.",
          "Reserve F&F for true personal transfers with people you know.",
          "Reverse-price G&S so nets stay intact.",
          "Keep invoice numbers in PayPal note fields for evidence.",
          "Train teammates not to coach buyers into F&F.",
        ],
      },
      {
        h2: "When each is appropriate",
        paragraphs: [
          "Use G&S for freelancing, e-commerce, tickets, consulting, and any good or service. Use F&F for personal gifts and shared personal expenses among trusted parties—not for clients.",
          "Zelle or personal Venmo raise similar “$0 but unprotected” themes—read Venmo vs Cash App vs Zelle. Hidden payment fees covers the broader pattern of trading protection for sticker fee savings.",
        ],
      },
      {
        h2: "Practical tips",
        paragraphs: [
          "Enable PayPal’s commercial tools (invoices, checkout) so the product selection is unambiguous. Screenshot confirmations showing G&S. Monitor for clients who repeatedly “accidentally” send F&F.",
          "Source of truth: PayPal US business fees page as of 2026-10-24 for the 2.99% G&S and 3.49% + $0.49 Checkout snapshot and F&F fee descriptions. Re-check after policy emails.",
        ],
      },
      {
        h2: "Account health and audit trails",
        paragraphs: [
          "Heavy F&F volume that looks like business activity can trigger reviews. Even when individual transfers are personal, patterns matter. Keep commercial volume on G&S invoices so your account narrative stays consistent with PayPal’s product intent.",
          "Attach the same invoice PDF you emailed the client when you create a PayPal invoice. Consistency between email, PDF, and PayPal item titles helps if a dispute appears later. G&S fees of 2.99% are easier to justify when your paperwork is complete.",
          "For international clients, F&F misuse is even riskier because cross-border commercial rules still apply and FX confusion increases support load. Collect with G&S or Stripe, then move balances with Wise when needed.",
          "Create an internal escalation: first F&F accidental payment → polite reset instructions; repeated attempts → pause work. Write it down so freelancers on your team do not improvise fee-avoidance deals that create liability.",
        ],
      },
      {
        h2: "Additional planning notes",
        paragraphs: [
          "Re-verify official pricing before you publish customer-facing numbers for paypal goods and services vs friends and family. Our embedded schedules use an as-of date of 2026-10-15 and are planning aids, not contracts. When your processor negotiates custom pricing, substitute those percent and fixed values into the same forward and reverse formulas used throughout these guides.",
          "Bookmark the related calculators linked from this article and re-run them whenever average order value shifts by more than about 20%. Fixed fees change effective rates sharply on small tickets, which is why $10 invoices and $500 invoices deserve separate reverse-price checks rather than linear scaling from a single $100 demo.",
          "Finally, document the schedule name, source URL, and verification date next to every rate card or membership tier. Stale fee assumptions are one of the most common reasons freelancers and creators miss margin targets even when their headline math once looked correct.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is Friends & Family always free?",
        a: "It can be $0 for eligible personal payments funded from PayPal balance or linked bank. Other funding sources can add fees. Confirm on PayPal’s official fees page—do not use F&F for commercial sales to chase $0.",
      },
      {
        q: "How much is Goods & Services on $100?",
        a: "About $2.99 in fees (2.99%, no fixed), net about $97.01, using US G&S Send/Receive Money as of 2026-10-24. Checkout on $100 is about $3.98 (net ~$96.02). Confirm in /tools/paypal-fee-calculator/.",
      },
      {
        q: "Can I offer a discount for F&F?",
        a: "You should not steer commercial buyers to F&F to avoid fees. That practice risks policy issues and protection gaps. Offer discounts for other legitimate methods only if your processor and laws allow.",
      },
      {
        q: "What if a client already sent F&F?",
        a: "Follow your written policy. Many freelancers pause work until funds are resent as G&S or refunded. Document communication. Do not treat accidental F&F as a loophole.",
      },
      {
        q: "Does G&S always protect sellers?",
        a: "Protections depend on eligibility, category, and following PayPal’s requirements (tracking, proof of delivery, etc.). Read PayPal’s seller protection terms for your country—fees buy access to a commercial framework, not a guarantee in every dispute.",
      },
    ],
    relatedTools: ["paypal"],
    relatedGuides: ["stripe-vs-paypal-fees", "passing-fees-to-customers", "hidden-payment-fees", "venmo-vs-cash-app-vs-zelle"],
    sources: [
      { label: "PayPal US business fees", url: "https://www.paypal.com/us/business/paypal-business-fees", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "PayPal G&S vs F&F planning snapshot (US, as of 2026-10-24)",
      headers: ["Product", "Typical fee", "On $100", "Commercial use?"],
      rows: [
        ["Goods & Services (Send/Receive)", "2.99%", "$2.99", "Yes—intended for sales"],
        ["PayPal Checkout", "3.49% + $0.49", "~$3.98", "Yes—merchant checkout"],
        ["Friends & Family (balance/bank)", "$0 eligible personal", "$0", "No—personal transfers"],
      ],
    },
  },
  {
    slug: "chargeback-fees-by-processor",
    title: "Chargeback Fees by Processor (2026 Guide)",
    description: "How chargebacks and disputes affect Stripe, PayPal, and Square sellers—why dollar fees vary, how to budget reserves, and where to verify official dispute costs.",
    primaryKeyword: "chargeback fees by processor",
    published: "2026-10-23",
    modified: "2026-10-24",
    answerFirst: "Chargeback fees often land near $15 on Stripe and about $15–$20 on PayPal (confirm live dispute docs — amounts change). One dispute can cost more than the processing fee on a small order. Budget a risk reserve alongside Stripe’s 2.9% + $0.30, PayPal G&S 2.99%, and Square Free online 3.3% + $0.30 (Plus/API 2.9% + $0.30; in-person 2.6% + $0.15).",
    takeaways: [
      "Stripe dispute fees are commonly cited around $15 (confirm on Stripe’s dispute docs).",
      "PayPal chargeback/dispute fees often land near $20 / $15 depending on product and volume.",
      "Budget a risk reserve — a single dispute can exceed the processing fee on a small order.",
    ],
    sections: [
      {
        h2: "Disputes are a separate cost center",
        paragraphs: [
          "Payment fee calculators answer percent-plus-fixed processing math. Chargebacks add evidence work, possible dispute fees that vary by processor, lost merchandise, and higher reserve risk. A shop that “saves” 0.3% on processing can still lose if dispute rates climb.",
          "Because processors change dispute fee schedules, treat any third-party blog’s dollar figure as stale until you confirm on Stripe, PayPal, and Square’s official pages. We intentionally avoid publishing invented dispute fee amounts here.",
        ],
      },
      {
        h2: "Processing fees still set the baseline",
        paragraphs: [
          "While you verify dispute fees on official docs, you can still compare steady-state processing: Stripe US 2.9% + $0.30; PayPal US G&S 2.99%; Square Free online 3.3% + $0.30; Plus/API 2.9% + $0.30; in-person 2.6% + $0.15 (as of 2026-10-24). Use /tools/stripe-fee-calculator/, /tools/paypal-fee-calculator/, /tools/square-fee-calculator/, and /tools/compare-payment-fees/.",
          "On $100: Stripe/Square online fee $3.20 net $96.80; PayPal G&S ~$3.98 net ~$96.02. Those figures exclude dispute fees. Add your own reserve: for example, if 0.6% of revenue is lost to disputes/refunds historically, bake that into pricing separately from processor percent fees.",
        ],
      },
      {
        h2: "Worked example: processing plus dispute reserve",
        paragraphs: [
          "Suppose you process $20,000/month on Stripe at 2.9% + $0.30 with 400 transactions. Processing fees ≈ $580 + $120 = $700 (illustrative). If your category historically loses 0.8% of revenue to chargebacks/refunds including associated costs, reserve ≈ $160. Total friction ≈ $860 before operating expenses—not just the $700 processing line.",
          "If switching to PayPal G&S raises processing on the same volume but halves fraud on digital goods because of buyer habits in your niche, the net profit can still improve. Run both processing math and dispute-rate scenarios; do not optimize one number in isolation.",
          "For in-person Square volume, lower card-present rates (2.6% + $0.15) often pair with different fraud patterns than card-not-present online. Segment dispute rates by channel before blaming the processor’s headline percent.",
        ],
      },
      {
        h2: "How to calculate a dispute-aware price",
        paragraphs: [
          "Start with reverse processing math for your target net. Then increase the target net (or the list price) by your expected dispute loss rate. Example: want $100 processing-net and expect 1% dispute loss on sales—aim nearer $101.01 processing-net before marketing round-up, then apply Stripe/PayPal reverse formulas.",
          "Track disputes monthly: count, dollars, win rate, and reason codes. Official processor dashboards are the source of truth. When fee schedules for disputes update, note the date beside your reserve policy.",
        ],
        list: [
          "Pull 6–12 months of dispute and refund data.",
          "Compute loss rate = (lost dollars + estimated dispute fees you actually paid) ÷ revenue.",
          "Confirm current dispute fee amounts on official Stripe/PayPal/Square pages (varies).",
          "Reverse-price processing fees with /tools/… calculators.",
          "Add loss-rate margin; round up for clean prices.",
        ],
      },
      {
        h2: "When each processor’s dispute tooling matters",
        paragraphs: [
          "Choose Stripe when you want programmable evidence workflows and online card economics at 2.9% + $0.30. Choose PayPal when wallet buyers and PayPal’s dispute flow match your audience—paying Checkout 3.49% + $0.49 (or G&S 2.99%) may be acceptable if it reduces unpaid claims versus risky P2P.",
          "Choose Square when card-present evidence and POS records help win representments. Avoid shifting high-risk digital sales onto Zelle or F&F to “save fees”—that usually worsens loss rates. See PayPal G&S vs Friends & Family and Venmo vs Cash App vs Zelle.",
        ],
      },
      {
        h2: "Practical tips",
        paragraphs: [
          "Clear refund policies, tracking numbers, and delivery logs lower dispute rates more reliably than hopping processors for a 0.2% rate cut. Item descriptors should match your brand so customers recognize charges.",
          "Sources for processing snapshots: stripe.com/pricing, PayPal business fees, squareup.com pricing (as of 2026-10-24). For dispute fee dollar amounts, use each processor’s current dispute/chargeback documentation only—values vary and change.",
        ],
      },
      {
        h2: "Evidence quality beats fee shopping",
        paragraphs: [
          "Winning representments depends on descriptors, delivery proof, IP logs for digital goods, and clear refund policies—not on finding a processor with a slightly lower dispute fee last year. Invest in evidence automation before you invest in another migration.",
          "Segment products by risk. High-risk digital SKUs may belong only on processors with strong tooling even if processing rates are higher than Square in-person. Low-risk card-present retail can emphasize Square’s 2.6% + $0.15 economics.",
          "Set a monthly dispute review meeting: top reason codes, win rate, and whether pricing or fulfillment changes would help. Tie the meeting to calculator updates only when processing schedules change—dispute fee dollar amounts still come from official docs because they vary.",
          "If a processor emails a dispute fee change, update your reserve model the same week. Processing snapshots in our tables (Stripe 2.9% + $0.30, PayPal G&S 2.99%, Square Plus/API online 2.9% + $0.30) are independent of that dispute line item.",
        ],
        list: [
          "Automate receipt and tracking collection at fulfillment time.",
          "Match billing descriptors to your public brand name.",
          "Review reason codes monthly; fix root causes in UX or shipping.",
          "Re-read official dispute fee pages quarterly—amounts vary.",
        ],
      },
      {
        h2: "Additional planning notes",
        paragraphs: [
          "Re-verify official pricing before you publish customer-facing numbers for chargeback fees by processor. Our embedded schedules use an as-of date of 2026-10-15 and are planning aids, not contracts. When your processor negotiates custom pricing, substitute those percent and fixed values into the same forward and reverse formulas used throughout these guides.",
          "Bookmark the related calculators linked from this article and re-run them whenever average order value shifts by more than about 20%. Fixed fees change effective rates sharply on small tickets, which is why $10 invoices and $500 invoices deserve separate reverse-price checks rather than linear scaling from a single $100 demo.",
          "Finally, document the schedule name, source URL, and verification date next to every rate card or membership tier. Stale fee assumptions are one of the most common reasons freelancers and creators miss margin targets even when their headline math once looked correct.",
        ],
      },
    ],
    faqs: [
      {
        q: "How much is a Stripe chargeback fee?",
        a: "It varies and changes—check Stripe’s official dispute documentation for your country and product. Do not rely on memorized dollar amounts from old articles. Budget a reserve based on your own history plus Stripe’s current published fee.",
      },
      {
        q: "Does PayPal charge for disputes?",
        a: "PayPal’s dispute and chargeback-related costs vary by product and outcome. Confirm on PayPal’s official help and fee pages. Processing for US G&S is 2.99% (no fixed) as of 2026-10-24; Checkout is 3.49% + $0.49, separate from dispute fees.",
      },
      {
        q: "What about Square?",
        a: "Square likewise publishes dispute-related fees that can change. Verify on Square’s official support/pricing materials. Card-present vs online activity can show different dispute patterns even when online processing lists 2.9% + $0.30.",
      },
      {
        q: "Should dispute fees decide my processor?",
        a: "They are one factor beside processing rates, conversion, payout timing, and category fit. Model processing with our calculators, then add your measured dispute loss rate—not a generic internet rumor.",
      },
      {
        q: "How do I price after both fees and chargebacks?",
        a: "Reverse-calculate processing fees for your target net, then increase prices to cover your historical dispute/refund loss rate. See how to price after fees for the processing algebra.",
      },
    ],
    relatedTools: ["stripe", "paypal", "square"],
    relatedGuides: ["hidden-payment-fees", "stripe-vs-paypal-fees", "how-to-price-after-fees"],
    relatedHubs: [
      { href: "/payment-processors/", label: "Payment processor fees hub" },
    ],
    sources: [
      { label: "Stripe pricing", url: "https://stripe.com/pricing", asOf: "2026-10-24" },
      { label: "PayPal US business fees", url: "https://www.paypal.com/us/business/paypal-business-fees", asOf: "2026-10-24" },
      { label: "Square pricing", url: "https://squareup.com/us/en/pricing", asOf: "2026-10-24" },
    ],
    feeTable: {
      caption: "Processing baselines (dispute fees: check official docs; vary)",
      headers: ["Processor schedule", "Processing rate (2026-10-15)", "Fee on $100 charge", "Dispute fee"],
      rows: [
        ["Stripe US online", "2.9% + $0.30", "$3.20", "Varies; check Stripe"],
        ["PayPal US G&S", "2.99%", "$2.99", "Varies; check PayPal"],
        ["PayPal US Checkout", "3.49% + $0.49", "~$3.98", "Varies; check PayPal"],
        ["Square US online", "2.9% + $0.30", "$3.20", "Varies; check Square"],
        ["Square US in-person", "2.6% + $0.15", "$2.70", "Varies; check Square"],
      ],
    },
  }
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return guides.map((g) => g.slug);
}
