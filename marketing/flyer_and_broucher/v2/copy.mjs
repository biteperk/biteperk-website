/**
 * Every word that prints on the v2 flyer and brochure lives here.
 *
 * NAP, phone, email and the dashboard URL are NOT restated — they are read
 * from `src/data/site.ts` at build time, so print can never drift from the
 * site (the July 2026 flyer shipped a dead `vocotable.` URL for exactly that
 * reason). Prices are deliberately absent (decision, 7 Sep 2026): printed
 * prices cannot be recalled. The demo line is print-only (PRINT_GUIDE.md).
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { loadTS } from "../../../scripts/build/_load-ts.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");

/** Print-only demo line — never on the website or any directory. */
export const DEMO_LINE = "(02) 7501 1140";
/** Sam's direct address for the brochure "Talk to Sam" band. */
export const SAM_EMAIL = "sam@biteperk.com.au";

/**
 * Social proof. `approved` gates the PRINT PDFs: the quote is Camilo and
 * Mauro's to sign off, not ours to invent. Flip to `true` only after they
 * have OK'd these exact words.
 */
export const testimonial = {
  approved: true, // Camilo & Mauro approved the wording, 7 Sep 2026 (via Sam)
  quote:
    "Bella picks up the calls we used to miss. Bookings and takeaway orders just land on our screen.",
  by: "Camilo & Mauro, owners",
  venue: "Mazcina Resto-Bar, Darlinghurst",
  runs: "Runs VoxTable + VoxOrder",
};

export async function getCopy() {
  const { site } = await loadTS(resolve(REPO, "src/data/site.ts"));
  const a = site.address;
  const nap = `${a.street}, ${a.locality} ${a.region} ${a.postalCode}`;
  const host = site.voxtableUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const utm = (source) => `?utm_source=${source}&utm_medium=print`;

  return {
    site: {
      phone: site.phone.display,
      email: site.email.display,
      nap,
      web: site.url.replace(/^https?:\/\//, ""),
      voxtableHost: host,
      flyerUrl: `${site.voxtableUrl.replace(/\/$/, "")}/${utm("flyer")}`,
      brochureUrl: `${site.url.replace(/\/$/, "")}/${utm("brochure")}`,
    },
    demoLine: DEMO_LINE,
    samEmail: SAM_EMAIL,
    testimonial,

    flyer: {
      eyebrow: "For Sydney restaurants",
      product: "VoxTable",
      tagline: "The AI phone host for restaurants",
      headline: ["Never miss", "another booking."],
      support:
        "Bella answers every call in a warm Australian voice and books the table straight into your diary — even when every line is busy and Friday service is flat out.",
      tiles: [
        { big: "24/7", label: "Every call answered" },
        { big: "<1 sec", label: "To pick up. No hold." },
        { big: "48 hrs", label: "From sign-up to live" },
      ],
      photoLine: "Your phone, answered. Your team, on the floor.",
      cta: {
        title: "Start your free week",
        body: "Scan the code, hear Bella, and be live within 48 hours.",
        call: "or call",
        strip: "Month-to-month · No lock-in · Cancel anytime",
        scan: "Scan to start",
      },
      back: {
        howTitle: "How it works",
        steps: [
          {
            title: "Forward your line",
            body: "Five minutes with your phone provider. Keep your number — nothing to install.",
          },
          {
            title: "Bella answers, 24/7",
            body: "Warm Australian voice, tuned for local suburbs. Bookings land in your diary against real availability.",
          },
          {
            title: "You run the floor",
            body: "Transcripts, recordings and no-show tracking in your dashboard. Not sure? She takes a message.",
          },
        ],
        getTitle: "What you get",
        features: [
          { title: "Unlimited inbound calls", body: "Every call, every time. No hold music, no phone menus." },
          { title: "Live bookings, no clashes", body: "Straight into your diary against real availability." },
          { title: "Local Australian voice", body: "Not an overseas call centre. Suburbs said right." },
          { title: "Privacy-first by design", body: "Call records kept in Sydney. Privacy Act compliant." },
        ],
        proofEyebrow: "Live at Mazcina Resto-Bar and across Sydney",
        footerMade: "Made in Sydney",
      },
    },

    brochure: {
      eyebrow: "VoxTable",
      headline: ["Never miss", "another booking."],
      support:
        "Bella, your AI phone host, answers every call to your restaurant in a warm Australian voice — and books the table. 24/7.",
      ticks: ["Answers 24/7, in under a second", "Books straight into your diary", "Warm Australian voice, suburbs said right"],
      demo: {
        title: "Hear her yourself — call Bella now",
        sub: "Answers in under a second · Available 24/7",
      },
      foot: ["Made in Sydney", "Free first week", "biteperk.com.au"],
      back: {
        howTitle: "How it works",
        steps: [
          { title: "Keep your number", body: "Customers call you as they do today, or add a booking line." },
          { title: "Bella answers", body: "Books the table, answers questions or takes a message. Never guesses." },
          { title: "You see everything", body: "Bookings and transcripts appear live in your dashboard." },
        ],
        setupTitle: "Set it up your way",
        setupBody: "Every call or just the missed ones. Your number or a new one. Your greeting, your rules.",
        ticks: ["Privacy Act compliant", "Call records kept in Sydney", "Sydney-based support, 7 days", "No lock-in, month to month"],
        proofEyebrow: "Live at Mazcina Resto-Bar and across Sydney",
        talk: { title: "Talk to Sam", sub: "Free first week. Live within 48 hours." },
        scan: "Scan to learn more",
        legal: "VoxTable is a BitePerk product",
      },
    },
  };
}
