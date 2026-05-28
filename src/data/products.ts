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

export interface Product {
  readonly slug: string;
  readonly name: string;
  /** Wordmark split for typographic treatment (e.g. "Voco" + "Table"). */
  readonly wordmark: { readonly prefix: string; readonly suffix: string };
  readonly tagline: string;
  readonly summary: string;
  readonly status: ProductStatus;
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
    readonly headline: string;
    readonly amount: string;
    readonly cadence: string;
    readonly notes: ReadonlyArray<string>;
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
    "Bella picks up every call in a warm Australian voice, checks live table availability, and books the reservation while your team stays on the floor.",
  status: "live",
  accent: "rgba(245, 196, 24, 0.32)",
  externalUrl: site.vocotableUrl,
  hero: {
    headline: "Every call. Every time. Every guest booked.",
    sub: "VocoTable answers in a warm Australian voice, checks availability against your live diary, and writes the booking straight into your dashboard. Twenty-four hours a day.",
    primaryCta: { label: "Open VocoTable →", href: site.vocotableUrl },
    secondaryCta: { label: "Book a 15-minute walkthrough", href: "/contact/" },
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
    { label: "uptime", value: "99.9%", hint: "monitored 24/7" },
    { label: "answer time", value: "1.2s", hint: "median pickup" },
    { label: "languages", value: "AU EN", hint: "trained locally" },
  ],
  pricing: {
    headline: "One flat rate. No surprises.",
    amount: "$80",
    cadence: "per month",
    notes: [
      "Unlimited inbound calls",
      "No per-cover or per-booking fees",
      "No lock-in contract — month to month",
      "Cancel any time, your bookings stay yours",
    ],
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
    "An order taker for cafes and quick-service drive-thrus. Built around the rhythms of an Australian morning rush, not a US franchise script.",
  status: "concept",
  accent: "rgba(245, 196, 24, 0.22)",
  hero: {
    headline: "An order taker that knows the Saturday-morning queue.",
    sub: "We're thinking out loud. VocoDrive imagines a voice agent at the window — fast, polite, Australian, and built around the way a queue actually moves at 8:42am on a Saturday.",
    primaryCta: { label: "Register interest", href: "/contact/?product=vocodrive" },
    secondaryCta: { label: "See what's shipping →", href: "/products/" },
  },
  features: [
    {
      title: "Built for the rush",
      body: "Designed around peak-hour throughput. Latency you can hear, not feel.",
    },
    {
      title: "Local cadence",
      body: "Knows that 'flat white, two sugars' is one order, not three follow-up questions.",
    },
    {
      title: "POS + screen sync",
      body: "Order shows on the kitchen screen the moment the customer finishes speaking.",
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
