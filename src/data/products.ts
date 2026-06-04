/**
 * Biteperk product catalogue.
 *
 * Single source of truth. Drives the nav dropdown, footer column,
 * products index page, individual product pages, and the JSON-LD on
 * each product page. Adding a fifth product is a 1-block edit here.
 *
 * Status semantics:
 *   - `live`           — shipping, paying customers, full marketing page.
 *   - `in-development` — team actively building. Waitlist form lives on
 *                        the product page.
 *   - `concept`        — vision-only. Single CTA to register interest.
 *
 * `accent` is a CSS colour string used as a subtle border-glow on the
 * product card. Keep it inside the gold/green family so the brand stays
 * coherent.
 */

import { site } from "./site";

export type ProductStatus = "live" | "in-development" | "concept";

/**
 * Packaging role within the Voco product line. Orthogonal to `status`:
 *   - `core`  — Voco itself; every restaurant gets it (currently the Table
 *               capability / bookings, which is `live`).
 *   - `addon` — a capability switched on alongside the same core agent
 *               (takeaway, concierge, drive-thru).
 * `role` describes packaging; `status` describes shipping maturity.
 */
export type ProductRole = "core" | "addon";

export interface ProductFeature {
  readonly title: string;
  readonly body?: string;
}

export interface ProductMetric {
  readonly label: string;
  readonly value: string;
  readonly hint?: string;
}

export interface ProductFAQ {
  readonly q: string;
  readonly a: string;
}

export interface Testimonial {
  readonly quote: string;
  readonly author: string;
  /** Attribution line, e.g. "Owner · Natalia's Bistro, Sydney". */
  readonly role: string;
}

export interface PricingTier {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Display amount, e.g. "$80" or "Let's talk". Use `null` for contact-style. */
  readonly amount: string;
  readonly cadence?: string;
  /** Mark a single tier as the recommended pick. */
  readonly featured?: boolean;
  /** Optional badge above the tier name (e.g. "OUR PICK"). */
  readonly badge?: string;
  /** Bullet features. The first bullet may be an "Everything in X, plus:" reference. */
  readonly features: ReadonlyArray<string>;
  readonly cta: { readonly label: string; readonly href: string };
  /** Footer note under the CTA (e.g. "Live in 48 hours", "Or call 0450…"). */
  readonly footer?: string;
}

export interface Product {
  readonly slug: string;
  readonly name: string;
  /** Wordmark split for typographic treatment (e.g. "Voco" + "Table"). */
  readonly wordmark: { readonly prefix: string; readonly suffix: string };
  readonly tagline: string;
  readonly summary: string;
  readonly status: ProductStatus;
  /** Packaging role in the Voco line — the one `core` product vs `addon` capabilities. */
  readonly role: ProductRole;
  /** Owner-outcome headline for the /products capabilities grid (falls back to `tagline`). */
  readonly outcome?: string;
  readonly accent: string;
  readonly externalUrl?: string;
  readonly hero: {
    readonly headline: string;
    readonly sub: string;
    readonly primaryCta: { readonly label: string; readonly href: string };
    readonly secondaryCta?: { readonly label: string; readonly href: string };
  };
  readonly features: ReadonlyArray<ProductFeature>;
  readonly metrics?: ReadonlyArray<ProductMetric>;
  readonly faq?: ReadonlyArray<ProductFAQ>;
  readonly pricing?: {
    readonly eyebrow?: string;
    readonly headline: string;
    readonly lede?: string;
    readonly tiers: ReadonlyArray<PricingTier>;
    readonly footnote?: string;
  };
  readonly seo: {
    readonly title: string;
    readonly description: string;
  };
}

const vocotable: Product = {
  slug: "vocotable",
  name: "VocoTable",
  wordmark: { prefix: "Voco", suffix: "Table" },
  tagline: "The AI phone host for restaurants.",
  summary:
    "Bella answers every call in a warm Australian voice, books the table, and never sleeps — the AI phone host built for Sydney restaurants.",
  status: "live",
  role: "core",
  outcome: "Never miss another booking — even when every line's busy.",
  accent: "rgba(245, 196, 24, 0.32)",
  externalUrl: site.vocotableUrl,
  hero: {
    headline: "Never miss another booking.",
    sub: "Bella answers every call in a warm Australian voice, books the table, and never sleeps — the AI phone host built for Sydney restaurants.",
    primaryCta: { label: "Start your free week →", href: site.vocotableUrl },
    secondaryCta: { label: "Hear Bella live", href: `${site.vocotableUrl}#meet-bella` },
  },
  features: [
    {
      title: "Unlimited inbound calls",
      body: "Bella answers every line, every time, 24/7 — without hold music or menus.",
    },
    {
      title: "Live bookings, no clashes",
      body: "Reservations land straight in your diary against real availability. No double-bookings.",
    },
    {
      title: "Local Australian voice",
      body: "Trained on Australian English. Sydney suburbs spelt right. No accent that says 'overseas call centre'.",
    },
    {
      title: "Privacy-first by design",
      body: "Australian data residency. Privacy Act compliant. Audio stays inside our walls.",
    },
  ],
  metrics: [
    { label: "always on", value: "24/7", hint: "every call answered" },
    { label: "answer time", value: "<1s", hint: "Bella never holds" },
    { label: "flat pricing", value: "$80/mo", hint: "no per-cover fees" },
  ],
  pricing: {
    eyebrow: "Pricing",
    headline: "Honest pricing. Pick what fits.",
    lede: "Same Bella in every plan. Pay only for the bookings volume and the integrations you actually need.",
    tiers: [
      {
        id: "solo",
        name: "Solo",
        description: "For a single restaurant getting started with AI calls.",
        amount: "$80",
        cadence: "/month",
        features: [
          "Up to 300 booked tables per month",
          "1 phone number, 1 location",
          "24/7 answering in natural Australian voice (Bella)",
          "Live booking into your dashboard",
          "Transcripts & call recordings",
          "Basic analytics & no-show tracking",
          "Unlimited dashboard users",
          "Email support, business hours",
          "After 300 bookings, you'll be invited to upgrade — no surprise charge",
        ],
        cta: { label: "Start with Solo →", href: `${site.vocotableUrl}/?plan=solo` },
        footer: "Live in 48 hours",
      },
      {
        id: "pro",
        name: "Pro",
        description: "For busy restaurants that want every call answered.",
        amount: "$150",
        cadence: "/month",
        featured: true,
        badge: "Our pick",
        features: [
          "Unlimited bookings, 24/7",
          "1 phone number, 1 location",
          "Everything in Solo, plus:",
          "SMS booking confirmations to guests",
          "Integrations: Cal.com, OpenTable, ResDiary",
          "Custom greeting & menu prompts",
          "Deeper analytics, call-quality reports, peak-hour insights",
          "Priority Sydney support, 7 days a week",
        ],
        cta: { label: "Start with Pro →", href: `${site.vocotableUrl}/?plan=pro` },
        footer: "Live in 48 hours",
      },
      {
        id: "group",
        name: "Group",
        description: "For small restaurant groups with 2–3 locations.",
        amount: "$250",
        cadence: "/month",
        features: [
          "Up to 3 locations in one dashboard",
          "Per-site phone numbers & host configuration",
          "Everything in Pro, plus:",
          "Multi-location reporting & roll-up analytics",
          "Cross-location guest history",
          "Dedicated account manager",
          "99.9% uptime SLA",
          "Priority onboarding — we set it up for you",
        ],
        cta: { label: "Start with Group →", href: `${site.vocotableUrl}/?plan=group` },
        footer: "Live in 48 hours",
      },
      {
        id: "enterprise",
        name: "Enterprise",
        description: "For groups with 4+ locations, custom voices, or bespoke integrations.",
        amount: "Let's talk",
        features: [
          "Unlimited locations & numbers",
          "Custom voice persona (your accent, your tone)",
          "Multilingual options (en-AU, zh, vi, ko, ja…)",
          "API access & custom integrations",
          "Dedicated success engineer",
          "Bespoke SLA & 24×7 incident response",
          "Custom onboarding, training & playbooks",
        ],
        cta: { label: "Book a 20-min call →", href: "/contact/?plan=enterprise" },
        footer: `Or call ${site.phone.display}`,
      },
    ],
    footnote: "Every plan is month-to-month. No lock-in. Your bookings stay yours, always.",
  },
  faq: [
    {
      q: "How accurate is Bella with Australian accents and place names?",
      a: "Very. The model is trained on Australian English and we hand-tune it for the suburbs and venues we serve. Edge cases get caught by our Sydney team — not an overseas help desk.",
    },
    {
      q: "Does VocoTable plug into my booking system?",
      a: "Today we sync to your VocoTable diary directly; integrations with the major Australian booking platforms are on the roadmap. Existing bookings stay yours and can be exported at any time.",
    },
    {
      q: "What happens to call recordings and data?",
      a: "Audio is processed in Australia, stored only as long as needed to confirm the booking, and never used to train models outside Biteperk. We are Privacy Act compliant.",
    },
    {
      q: "Can I cancel if it doesn't work for my venue?",
      a: "Yes — VocoTable is month to month, no lock-in. You can cancel any time and your data is exported within 24 hours.",
    },
    {
      q: "How is the price so low?",
      a: "We built VocoTable from the ground up for hospitality, on infrastructure we run ourselves. Flat $80 a month, unlimited calls. No per-cover fees, ever.",
    },
    {
      q: "Where is support based?",
      a: "Sydney. 9am to 9pm AEST, by phone or email, with a human who has answered restaurant phones before.",
    },
  ],
  seo: {
    title: "VocoTable — AI phone host for restaurants · Biteperk",
    description:
      "VocoTable answers every restaurant call in a warm Australian voice and books the table directly into your diary. $80/month flat, no per-cover fees. Made in Sydney.",
  },
};

const vocoorder: Product = {
  slug: "vocoorder",
  name: "VocoOrder",
  wordmark: { prefix: "Voco", suffix: "Order" },
  tagline: "AI phone ordering for takeaway and pickup.",
  summary:
    "A voice agent that takes pickup orders, reads the menu in your accent, and drops the ticket straight into your POS — so no order is ever lost to a busy line.",
  status: "in-development",
  role: "addon",
  outcome: "Never lose a takeaway order to a phone nobody can reach.",
  accent: "rgba(255, 184, 64, 0.28)",
  hero: {
    headline: "Pick up every order, even when your kitchen is on the floor.",
    sub: "VocoOrder is the takeaway twin of VocoTable. A voice agent that handles the order, the modifiers, and the pickup time — and sends a clean ticket to your POS.",
    primaryCta: { label: "Join the waitlist", href: "/contact/?product=vocoorder" },
    secondaryCta: { label: "See VocoTable instead →", href: "/products/vocotable/" },
  },
  features: [
    {
      title: "Menu-aware ordering",
      body: "Bella reads your menu the way your staff would, including the substitutions and the small-print on weekends.",
    },
    {
      title: "POS-integrated tickets",
      body: "Orders land in your point-of-sale as clean tickets, ready to be made. No copy-paste, no misheard milks.",
    },
    {
      title: "Pickup time you can keep",
      body: "Bella checks current kitchen load before quoting a pickup window, so 'twenty minutes' actually means twenty minutes.",
    },
  ],
  seo: {
    title: "VocoOrder — AI phone ordering for hospitality · Biteperk",
    description:
      "VocoOrder is Biteperk's voice agent for takeaway and pickup orders, integrated with your POS. In development — join the waitlist.",
  },
};

const vococoncierge: Product = {
  slug: "vococoncierge",
  name: "VocoConcierge",
  wordmark: { prefix: "Voco", suffix: "Concierge" },
  tagline: "Voice + SMS front-of-house concierge.",
  summary:
    "The bit between the booking and the guest sitting down. Waitlist management, post-booking texts, no-show recovery — quietly handled.",
  status: "in-development",
  role: "addon",
  outcome: "Turn no-shows and waitlists into filled tables.",
  accent: "rgba(74, 138, 72, 0.32)",
  hero: {
    headline: "Everything between the booking and the table — handled.",
    sub: "VocoConcierge nudges the waitlist, confirms tomorrow's covers, recovers the no-shows, and writes back when guests reply. So your front-of-house can run the floor.",
    primaryCta: { label: "Join the waitlist", href: "/contact/?product=vococoncierge" },
    secondaryCta: { label: "See VocoTable instead →", href: "/products/vocotable/" },
  },
  features: [
    {
      title: "Smart waitlist",
      body: "Guests are texted when their table is close, with a confirmation loop so the table isn't held for a no-show.",
    },
    {
      title: "Post-booking touches",
      body: "Confirmations, gentle reminders, allergen and party-size double-checks — all in your venue's voice.",
    },
    {
      title: "No-show recovery",
      body: "Quietly text a holding list when a booking goes quiet. Tables get refilled, not lost.",
    },
  ],
  seo: {
    title: "VocoConcierge — Voice + SMS concierge for hospitality · Biteperk",
    description:
      "VocoConcierge handles waitlist, post-booking texts, and no-show recovery for restaurants and venues. In development — join the waitlist.",
  },
};

const vocodrive: Product = {
  slug: "vocodrive",
  name: "VocoDrive",
  wordmark: { prefix: "Voco", suffix: "Drive" },
  tagline: "Drive-thru voice AI, built for the Australian window.",
  summary:
    "A voice agent for the drive-thru window, built for the Australian morning rush — local accents, local orders, local rhythm. Not a US franchise script bolted onto an Aussie café.",
  status: "concept",
  role: "addon",
  outcome: "Keep the morning drive-thru queue moving.",
  accent: "rgba(245, 196, 24, 0.22)",
  hero: {
    headline: "An order taker that knows the Saturday-morning queue.",
    sub: "We're thinking out loud. VocoDrive imagines a voice agent at the window — fast, polite, Australian, and built around the way a queue actually moves at 8:42am on a Saturday.",
    primaryCta: { label: "Register interest", href: "/contact/?product=vocodrive" },
    secondaryCta: { label: "See what's shipping →", href: "/products/" },
  },
  features: [
    {
      title: "Tuned to the Australian accent",
      body: "Understands how Australians actually order at a window — clipped, quick and accented — where a model trained on US drive-thrus asks them to repeat themselves.",
    },
    {
      title: "Local ordering rhythm",
      body: "Knows 'flat white, two sugars' is one order, not three follow-up questions. Built around the way an Australian queue really moves, not a franchise script.",
    },
    {
      title: "Built for the morning rush",
      body: "Designed for peak-hour throughput, with the order on the kitchen screen the moment the customer stops speaking.",
    },
  ],
  seo: {
    title: "VocoDrive — Drive-thru voice AI for cafes · Biteperk",
    description:
      "VocoDrive is a concept-stage voice AI for cafe and QSR drive-thrus, built for the Australian morning rush. Register your interest.",
  },
};

export const products: ReadonlyArray<Product> = [
  vocotable,
  vocoorder,
  vococoncierge,
  vocodrive,
];

/**
 * Voco is ONE product. `coreProduct` is the always-on agent every venue gets
 * (the live Table/bookings capability); `addonProducts` are the capabilities
 * switched on alongside it. The /products overview renders from these so the
 * page reads as "one product + add-ons", not a grid of four equals.
 */
const _core = products.find((p) => p.role === "core");
if (!_core) {
  throw new Error("products.ts: exactly one product must have role 'core'.");
}
export const coreProduct: Product = _core;
export const addonProducts: ReadonlyArray<Product> = products.filter(
  (p) => p.role === "addon",
);

/**
 * Optional product-line content for the /products overview. Empty/undefined
 * slots render honest placeholders rather than fabricated scale — so the page
 * can grow real proof later without a refactor.
 */
export const vocoProof: {
  readonly testimonials: ReadonlyArray<Testimonial>;
  readonly demo?: { readonly label: string; readonly href: string };
} = {
  testimonials: [
    {
      quote:
        "We used to lose tables every Friday night just because nobody could reach the phone. Bella picks up every single call — and the bookings just appear on our screen. It paid for itself in the first week.",
      author: "Natalia",
      role: "Owner · Natalia's Bistro, Sydney",
    },
  ],
  // Real Bella audio only — points at the live app's demo anchor. Swap to a
  // self-hosted <audio> source here if a standalone clip is produced.
  demo: { label: "Hear Bella take a booking", href: `${site.vocotableUrl}#meet-bella` },
};

/**
 * The optional full-front-of-house bundle: Voco running every line at once.
 * Presented as a single CTA, NOT a fifth product/slug. `name` is a provisional
 * working name — change in one place here when it's locked.
 */
export const vocoBundle = {
  name: "The Lot",
  fallbackName: "Full Service",
  tagline: "Voco running your whole front-of-house — one agent, one voice, one bill.",
  cta: { label: "Book a demo", href: "/contact/?product=general" },
} as const;

/** Product-line FAQ for the /products overview (distinct from per-capability FAQs). */
export const vocoFaq: ReadonlyArray<ProductFAQ> = [
  {
    q: "How hard is it to get started?",
    a: "It's a phone number, not a hardware install. You forward your existing line to Voco — about five minutes with your phone provider — with no new hardware, no apps, and nothing for your team to learn. You keep your number, and most venues are live the same day.",
  },
  {
    q: "What can Voco do today, and what's coming?",
    a: "Today Voco answers your phone and takes bookings — that's live and serving paying venues. Takeaway and pickup ordering and the front-of-house concierge are in active development, and a drive-thru capability is on the drawing board. Start with bookings now and switch the rest on as they ship — same agent, same voice.",
  },
  {
    q: "Can I start with just bookings?",
    a: "Yes — that's exactly how Voco works. Every venue starts with the live bookings capability, then turns on add-ons when they need them. They're capabilities of the same agent, not separate products to buy and wire up again.",
  },
  {
    q: "What happens if Bella isn't sure what a caller wants?",
    a: "She doesn't guess. If a call is unclear — a tricky request, a name she can't quite catch — Bella takes the caller's details and a message and flags your team to call them back, so an uncertain moment becomes a callback rather than a wrong booking.",
  },
  {
    q: "Does Voco actually sound Australian?",
    a: "Yes. Bella speaks natural Australian English and is tuned for local suburb and street names — not an overseas call centre. It's one of the first things owners notice.",
  },
  {
    q: "What does Voco cost?",
    a: "The live bookings capability is flat monthly pricing with a free week to try it — no per-call or per-cover fees. See the VocoTable page for current plans. As new capabilities ship, we'll price them honestly and only for what you switch on.",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function statusLabel(status: ProductStatus): string {
  switch (status) {
    case "live":
      return "Live";
    case "in-development":
      return "In development";
    case "concept":
      return "Concept";
  }
}

export function productUrl(p: Product): string {
  return `/products/${p.slug}/`;
}
