/**
 * International (biteperk.com) LANGUAGE-CORE copy — the EN and FR bundles every
 * global locale renders (en/gb-en share `en`; fr/be-fr share `fr`). Market
 * colour (UK/France/Belgium touches, local imagery) is layered on top by
 * src/data/intl/markets.ts via resolveCopy() in src/data/intl/index.ts —
 * keep this file MARKET-NEUTRAL: anything France-specific belongs in the /fr
 * override, or be-fr inherits it. Rendered by src/pages/[...intl].astro
 * inside src/layouts/IntlLayout.astro.
 *
 * Content rules (PLAN.md §8 — Europe-truthful, non-negotiable):
 *   - NO AU pricing ("$80/month" is an Australian fact; EU pricing is a pilot
 *     outcome). The CTA is "book a pilot", never a price.
 *   - NO AU phone number and NO AU NAP on these pages (see site.ts).
 *   - What is LIVE (VoxTable answering real calls for paying Australian
 *     venues) is stated as proof. What is the European build (multilingual,
 *     local numbers) is framed as the pilot programme — never as shipping today.
 *
 * French: professional register (vouvoiement). The FR core in this file was
 * reviewed and SIGNED OFF by Ludovic (native speaker) on 26 Jul 2026 — it no
 * longer gates INTL_LAUNCHED. The rule still stands for French added AFTER
 * that date: new or materially reworded FR copy needs its own native pass.
 * Flag any change here that alters meaning so the two languages stay in sync.
 *
 * The 27 Jul 2026 market-differentiation French (both FR home pages, both
 * about pages, two five-item FAQs) was reviewed and SIGNED OFF by Ludovic on
 * 27 Jul 2026 — DISCHARGED, cleared for prospect-facing use. The standing rule
 * is unchanged and applies to whatever is written next: French added after that
 * date needs its own native pass.
 *
 * The 3 Sep 2026 privacy/cookie French (the whole `privacy.fr` block below, the
 * last sentence of the cookies "Strictement nécessaires" body, and the CNIL /
 * APD-GBA sentences in markets.ts) had a VERBAL pass from Ludovic, confirmed by
 * Sam on 3 Sep 2026 — DISCHARGED. Recorded as verbal deliberately: unlike the
 * two sign-offs above there is no email or document behind it, and that is the
 * provenance if the wording is ever questioned. The standing rule is unchanged
 * for French written after that date.
 */

import type { Lang } from "@/data/locales";
import { categories as consentCategories } from "@/data/consent";
export type { Lang };

const cat = (id: "necessary" | "analytics" | "marketing") => {
  const c = consentCategories.find((x) => x.id === id)!;
  return { title: c.title, body: c.body };
};

type Step = { title: string; body: string };
type Principle = { title: string; body: string };

export type ChromeCopy = {
  tagline: string;
  nav: { home: string; products: string; howItWorks: string; about: string; contact: string };
  cta: string;
  auSite: string;
  footerBlurb: string;
  privacy: string;
  terms: string;
  /** Cookie policy link label. */
  cookies: string;
  /** Re-open the consent modal — GDPR requires withdrawal to be as easy as consent. */
  cookieSettings: string;
  /** Region picker menu heading. */
  regionTitle: string;
  /** Cities nav trigger label + footer Cities column title. Renders only on
      trees with published cities (gb-en today). */
  cities: string;
  /** Cities dropdown menu heading — a <p>, never a heading element. */
  citiesTitle: string;
  /** Footer column titles. NOT "Site"/"Sites" — the header nav landmark is
      already aria-label="Site" and duplicate landmark names trip axe. */
  footerExplore: string;
  footerRegions: string;
  /** Products column title (the links themselves are brand nouns from
      products.ts — deliberately NOT a copy array; merge() replaces arrays
      wholesale and a market override would silently truncate the list). */
  footerProducts: string;
  /** Legal column title (privacy/terms/cookies split out of Explore). */
  footerLegal: string;
  /** Label for the social-profile row. Renders as a <p>, never a heading. */
  footerFollow: string;
  /** Slide-over menu trigger + close, ≤720px (IntlMobileMenu). */
  menu: string;
  menuClose: string;
  /** Locale-suggestion chip: shown in the TARGET locale's language. */
  suggest: string;
  suggestDismiss: string;
  email: string;
  rights: string;
  /**
   * Cookie-consent notice + settings modal (ConsentBanner.astro). Language-
   * scoped here, not hardcoded in the component: until 6 Sep 2026 the banner
   * was English on /fr and /be-fr — GDPR consent has to be informed, and a
   * notice the visitor cannot read is not that. Category ids mirror
   * src/data/consent.ts; the English titles/bodies are taken FROM it so the
   * two cannot drift.
   */
  consent: ConsentCopy;
};

export type ConsentCopy = {
  /** aria-label of the bar's landmark region. */
  region: string;
  body: string;
  policy: string;
  settings: string;
  reject: string;
  accept: string;
  modalTitle: string;
  modalLede: string;
  alwaysOn: string;
  saved: string;
  cancel: string;
  save: string;
  categories: Record<"necessary" | "analytics" | "marketing", { title: string; body: string }>;
};

/**
 * The facts strip of the trust module (TrustPanel.astro) — labels and the
 * three sentences that are true on every tree. Values that differ by market
 * (the UK's "UK GDPR") are overridden in markets.ts, never re-typed here.
 * Everything in `records` must agree with the privacy notice: records in
 * Australia, live calls processed in the United States, safeguards described
 * there. No "Paris", no "EU-hosted", no "human oversight" — check-truthful
 * bans them, and the plan guardrails say why.
 */
/**
 * The call simulation on the locale homes (CallSim.astro).
 *
 * Transcript rules, and they are not stylistic:
 *   - Bella ANNOUNCES SHE IS AN AI in the opening line. The trust strip on
 *     this same page says she does; a transcript that did not would make the
 *     page contradict itself, and the EU AI Act transparency duty is one of
 *     the things the market copy leans on.
 *   - She offers to pass the caller to the venue's own team. That is the
 *     honest shape of "human in the loop" — there is no European staff, so
 *     the hand-off is to the restaurant, never to us.
 *   - Fictional venue, no city, no price, no third-party integration, no
 *     phone number. check-truthful enforces the last three; the first two are
 *     on us.
 */
export type CallSimCopy = {
  eyebrow: string;
  /** The h2 is two lines: a lead and a gold accent. */
  headingLead: string;
  headingAccent: string;
  lede: string;
  note: string;
  /** Label for the link through to the VoxTable product page. */
  ctaLabel: string;
  /** Card chrome. */
  status: string;
  badge: string;
  whoBella: string;
  whoCaller: string;
  written: string;
  replay: string;
  disclaimer: string;
  lines: ReadonlyArray<{ role: "bella" | "caller"; text: string }>;
};

export type TrustFactsCopy = {
  heading: string;
  entityLabel: string;
  /** Register wording for the UK entity ("Company number") and the AU one ("ABN"). */
  registerUk: string;
  registerAu: string;
  transparencyLabel: string;
  transparency: string;
  recordsLabel: string;
  records: string;
  basisLabel: string;
  basis: string;
  privacyLink: string;
};

export type HomeCopy = {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  lede: string;
  ctaPrimary: string;
  ctaSecondary: string;
  proof: { eyebrow: string; heading: string; body: string; points: string[] };
  steps: { eyebrow: string; heading: string; items: Step[] };
  pilot: { eyebrow: string; heading: string; body: string; points: string[]; cta: string };
  trust: { heading: string; items: Principle[] };
  /**
   * Attributed proof. The quote is AUSTRALIAN and must read that way — there is
   * no European customer yet, and implying one breaks the same honesty rule
   * that bans the AU price and phone. Rendered with PullQuote (props-only), not
   * Testimonial.astro, which hardcodes an English image alt and would ship it
   * onto the French trees.
   */
  testimonial: { quote: string; author: string; role: string };
  /**
   * Per-market FAQ. Load-bearing, not decorative: it is the unique-per-market
   * text that pulls the trees apart for check-intl-similarity, and the gate's
   * metric is containment (hits / min), so EVERY market needs one — adding it
   * to only some barely moves the number.
   *
   * Rendered by FAQ.astro (<details> accordion) on the DEFAULT surface. Never
   * inside .intl-band: the band and the accordion items are both var(--ink-1),
   * so the items would disappear into it.
   */
  faq: { heading: string; items: { q: string; a: string }[] };
  closing: { heading: string; body: string; cta: string };
};

export type SimplePageCopy = {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
  cta?: { label: string; sub?: string };
};

export type ContactCopy = {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  form: {
    name: string;
    email: string;
    venue: string;
    venuePlaceholder: string;
    product: string;
    productPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    note: string;
  };
  aside: { heading: string; body: string; emailLabel: string };
};

/**
 * Section labels for the market CITY pages (rendered by the city branch in
 * [...intl].astro). These are the structural strings around the per-city
 * hand-written copy in intl/cities.ts — shared per language so a future
 * be-en or fr city inherits correct labels, not English ones. "{city}" is
 * replaced with the city name at render.
 *
 * Everything persuasive stays in the per-city fields (the anti-doorway gate
 * compares those); these labels are furniture and MAY repeat across cities.
 */
export type CityPageCopy = {
  storyEyebrow: string;
  storyHeading: string;
  scenariosEyebrow: string;
  scenariosHeading: string;
  aiEyebrow: string;
  aiHeading: string;
  districtsEyebrow: string;
  districtsHeading: string;
  /** The honest "pilot isn't drawn by postcode" note under the district chips. */
  districtsNote: string;
  faqEyebrow: string;
  faqHeading: string;
  othersEyebrow: string;
  othersHeading: string;
  closingHeading: string;
  closingBody: string;
};

export const chrome: Record<Lang, ChromeCopy> = {
  en: {
    tagline: "Voice & AI for hospitality",
    nav: { home: "Home", products: "Product", howItWorks: "How it works", about: "About", contact: "Contact" },
    cta: "Book a pilot",
    auSite: "Australia site",
    footerBlurb:
      "BitePerk builds voice and AI tools for hospitality. Vox, our AI phone host, answers restaurant calls in a natural voice and books tables straight into the venue's dashboard.",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    cookieSettings: "Cookie settings",
    regionTitle: "Choose your region",
    cities: "Cities",
    citiesTitle: "Choose a city",
    footerExplore: "Explore",
    footerRegions: "Regions & languages",
    footerProducts: "Products",
    footerLegal: "Legal",
    footerFollow: "Follow us",
    menu: "Menu",
    menuClose: "Close menu",
    suggest: "There's a BitePerk site for your region.",
    suggestDismiss: "Dismiss",
    email: "hello@biteperk.com.au",
    rights: "All rights reserved.",
    consent: {
      region: "Cookie consent",
      body: "We use privacy-first analytics and Google consent mode for ad measurement. Google may receive limited cookieless signals while consent is denied; ad storage and personalisation stay off unless you allow Marketing.",
      policy: "Cookie Policy",
      settings: "Cookie settings",
      reject: "Reject all",
      accept: "Accept all",
      modalTitle: "Cookie settings",
      modalLede: "Choose what you're comfortable with. You can change this any time from Cookie settings in the footer.",
      alwaysOn: "Always on",
      saved: "Preferences saved ✓",
      cancel: "Cancel",
      save: "Save choices",
      categories: { necessary: cat("necessary"), analytics: cat("analytics"), marketing: cat("marketing") },
    },
  },
  fr: {
    tagline: "La voix et l'IA pour l'hôtellerie-restauration",
    nav: { home: "Accueil", products: "Le produit", howItWorks: "Comment ça marche", about: "À propos", contact: "Contact" },
    cta: "Réserver un pilote",
    auSite: "Site Australie",
    footerBlurb:
      "BitePerk conçoit des outils vocaux et d'IA pour l'hôtellerie-restauration. Vox, notre hôte téléphonique IA, répond aux appels d'une voix naturelle et enregistre les réservations directement dans le tableau de bord de l'établissement.",
    privacy: "Confidentialité",
    terms: "Conditions",
    cookies: "Cookies",
    cookieSettings: "Paramètres des cookies",
    regionTitle: "Choisissez votre région",
    // DRAFT French (29 Jul 2026) — needs Ludovic's pass. footerExplore and
    // footerRegions render on /fr and /be-fr immediately; cities/citiesTitle
    // stay dormant until a French city publishes.
    cities: "Villes",
    citiesTitle: "Choisissez une ville",
    footerExplore: "Explorer",
    footerRegions: "Régions et langues",
    // DRAFT French (7 Aug 2026) — needs Ludovic's pass. Column titles only;
    // the product links themselves are brand nouns.
    footerProducts: "Produits",
    footerLegal: "Mentions légales",
    footerFollow: "Suivez-nous",
    // DRAFT French (6 Sep 2026) — needs Ludovic's pass. "Menu" is the same
    // word in French, which is why chrome.menu is in FR_SHARED_WITH_EN.
    menu: "Menu",
    menuClose: "Fermer le menu",
    suggest: "Un site BitePerk existe pour votre région.",
    suggestDismiss: "Fermer",
    email: "hello@biteperk.com.au",
    rights: "Tous droits réservés.",
    // DRAFT French (6 Sep 2026) — needs Ludovic's pass. The category titles
    // match the cookies page (which had his verbal pass on 3 Sep 2026);
    // the bar/modal sentences are new.
    consent: {
      region: "Consentement aux cookies",
      body: "Nous utilisons des statistiques respectueuses de la vie privée et le mode consentement de Google pour la mesure publicitaire. Google peut recevoir des signaux limités, sans cookies, tant que le consentement est refusé ; le stockage publicitaire et la personnalisation restent désactivés sauf si vous autorisez le marketing.",
      policy: "Politique relative aux cookies",
      settings: "Paramètres des cookies",
      reject: "Tout refuser",
      accept: "Tout accepter",
      modalTitle: "Paramètres des cookies",
      modalLede: "Choisissez ce qui vous convient. Vous pouvez modifier ce choix à tout moment via Paramètres des cookies, dans le pied de page.",
      alwaysOn: "Toujours actif",
      saved: "Préférences enregistrées ✓",
      cancel: "Annuler",
      save: "Enregistrer mes choix",
      categories: {
        necessary: {
          title: "Strictement nécessaires",
          body: "Mémorise votre thème et votre choix de cookies dans votre navigateur. Rien d'autre : le formulaire de contact n'utilise aucun CAPTCHA et ne dépose rien sur votre appareil.",
        },
        analytics: {
          title: "Statistiques",
          body: "Statistiques sans cookies et respectueuses de la vie privée (Plausible), qui comptent les visites et les liens utiles aux visiteurs — agrégées, sans cookies, sans suivi entre sites, sans profil personnel.",
        },
        marketing: {
          title: "Marketing",
          body: "Google Ads utilise le mode consentement pour envoyer des signaux de mesure limités, sans cookies, tant que le consentement est refusé. Le stockage publicitaire, l'utilisation des données utilisateur à des fins publicitaires, la personnalisation et le LinkedIn Insight Tag restent désactivés sauf si vous activez le marketing.",
        },
      },
    },
  },
};

export const trustFacts: Record<Lang, TrustFactsCopy> = {
  en: {
    heading: "Where you stand with us",
    entityLabel: "Who you contract with",
    registerUk: "Company number",
    registerAu: "ABN",
    transparencyLabel: "Bella says she is an AI",
    transparency:
      "At the start of every call. Ask for a person and the call is handed to your own team, and every conversation stays reviewable afterwards.",
    recordsLabel: "Where your data goes",
    records:
      "Enquiry and booking records are stored on Google Cloud in Australia. Live calls are processed by our voice platform in the United States. Both are transfers out of Europe, and the safeguards are set out plainly in our privacy notice.",
    basisLabel: "Lawful basis",
    basis:
      "Legitimate interests (Article 6(1)(f) GDPR) for answering the enquiry you send us; consent for optional cookies, withdrawable at any time. Your rights are listed in the privacy notice.",
    privacyLink: "Read the privacy notice",
  },
  // DRAFT French (6 Sep 2026) — needs Ludovic's pass.
  fr: {
    heading: "Où vous en êtes avec nous",
    entityLabel: "Votre cocontractant",
    registerUk: "Numéro de société",
    registerAu: "ABN",
    transparencyLabel: "Bella annonce qu'elle est une IA",
    transparency:
      "Dès le début de chaque appel. Demandez une personne et l'appel est transmis à votre propre équipe ; chaque conversation reste consultable ensuite.",
    recordsLabel: "Où vont vos informations",
    records:
      "Les enregistrements des demandes et des réservations sont conservés sur Google Cloud, en Australie. Les appels en direct sont traités par notre plateforme vocale aux États-Unis. Il s'agit dans les deux cas de transferts hors d'Europe, et les garanties sont exposées clairement dans notre politique de confidentialité.",
    basisLabel: "Base juridique",
    basis:
      "L'intérêt légitime (article 6(1)(f) du RGPD) pour répondre à la demande que vous nous adressez ; le consentement pour les cookies facultatifs, retirable à tout moment. Vos droits sont détaillés dans la politique de confidentialité.",
    privacyLink: "Lire la politique de confidentialité",
  },
};

export const callSim: Record<Lang, CallSimCopy> = {
  en: {
    eyebrow: "The 8pm test",
    headingLead: "This is what a missed call",
    headingAccent: "sounds like instead.",
    lede:
      "Mid-service, every table is seated and the phone is still ringing. Bella answers in under a second, checks what is genuinely free, and writes the booking down.",
    note:
      "And when she is unsure, she does not guess — she offers to put the caller through to your own team. That is by design.",
    ctaLabel: "See how VoxTable works",
    status: "Incoming call · 8:04pm",
    badge: "Answered <1s",
    whoBella: "Bella",
    whoCaller: "Caller",
    written: "Booking written to the venue dashboard",
    replay: "Replay",
    disclaimer: "Illustrative — a fictional venue, but exactly the way Bella handles a call.",
    lines: [
      { role: "bella", text: "Good evening — you've reached The Lantern Room. This is Bella, the AI assistant. How can I help?" },
      { role: "caller", text: "Hi — any chance of a table for four tonight, around eight?" },
      { role: "bella", text: "Let me check the book… eight is full, but I can do 7:15, or 8:30 on the terrace." },
      { role: "caller", text: "8:30 works." },
      { role: "bella", text: "Lovely. Four at 8:30 tonight — what name should I put it under?" },
      { role: "caller", text: "Ellis." },
      { role: "bella", text: "Booked, Ellis. If you would rather speak to someone, I can pass you to the team at any point. A confirmation is on its way." },
    ],
  },
  // DRAFT French (6 Sep 2026) — needs Ludovic's pass. The transcript is the
  // most prospect-facing French on the site after the hero, so it should not
  // be treated as reviewed until he has read it aloud.
  fr: {
    eyebrow: "Le test de 20 h",
    headingLead: "Voici ce qu'un appel manqué",
    headingAccent: "donne à la place.",
    lede:
      "En plein service, toutes les tables sont occupées et le téléphone sonne encore. Bella répond en moins d'une seconde, vérifie ce qui est réellement libre et inscrit la réservation.",
    note:
      "Et quand elle a un doute, elle ne devine pas : elle propose de passer l'appel à votre propre équipe. C'est voulu.",
    ctaLabel: "Voir comment fonctionne VoxTable",
    status: "Appel entrant · 20 h 04",
    badge: "Décroché en <1 s",
    whoBella: "Bella",
    whoCaller: "Appelant",
    written: "Réservation inscrite au tableau de bord de l'établissement",
    replay: "Rejouer",
    disclaimer: "À titre d'illustration — un établissement fictif, mais exactement la façon dont Bella gère un appel.",
    lines: [
      { role: "bella", text: "Bonsoir, vous êtes bien à La Table d'Élise. Je suis Bella, l'assistante IA. Que puis-je pour vous ?" },
      { role: "caller", text: "Bonsoir — auriez-vous une table pour quatre ce soir, vers 20 h ?" },
      { role: "bella", text: "Je regarde le registre… 20 h est complet, mais je peux vous proposer 19 h 15, ou 20 h 30 en terrasse." },
      { role: "caller", text: "20 h 30, très bien." },
      { role: "bella", text: "Parfait. Quatre personnes à 20 h 30 ce soir — à quel nom ?" },
      { role: "caller", text: "Ellis." },
      { role: "bella", text: "C'est noté, Ellis. Si vous préférez parler à quelqu'un, je peux vous passer l'équipe à tout moment. Vous recevez une confirmation." },
    ],
  },
};

export const home: Record<Lang, HomeCopy> = {
  en: {
    title: "BitePerk — Vox, the AI phone host for restaurants",
    description:
      "Vox answers every restaurant call in a natural voice, checks real availability and books the table. Live in Australia today — now opening European pilot partnerships.",
    eyebrow: "Vox · AI phone host",
    h1: "Every call answered. Every booking captured.",
    lede: "Vox answers your restaurant's phone in a warm, natural voice — day and night, mid-service, on the line your guests already call. It checks real availability and writes the booking straight into your dashboard.",
    ctaPrimary: "Book a pilot",
    ctaSecondary: "See how it works",
    proof: {
      eyebrow: "Shipped, not promised",
      heading: "Live in Australia today.",
      body: "Vox isn't a demo. As VoxTable, it answers real calls for paying restaurant venues in Australia — taking bookings end-to-end without a human stepping in.",
      points: [
        "Answers in under a second, 24/7",
        "Books against real availability — no double-bookings",
        "Every call logged with transcript and recording",
        "Live operations dashboard: bookings, calls, analytics",
      ],
    },
    steps: {
      eyebrow: "How it works",
      heading: "Your number stays. Vox picks up.",
      items: [
        {
          title: "Keep your number",
          body: "A simple call-forward connects your existing line to Vox. No hardware, no new number, nothing for your team to install.",
        },
        {
          title: "Vox answers like a host",
          body: "It greets the caller naturally, understands dates, party sizes and special requests, and checks your real availability as it talks.",
        },
        {
          title: "The booking lands in your dashboard",
          body: "Confirmed reservations are written straight to your booking log, with the full transcript and recording of every call.",
        },
      ],
    },
    pilot: {
      eyebrow: "European pilots",
      heading: "We're bringing Vox to Europe — with pilot partners, not promises.",
      body: "The European build — local languages, local numbers, local integrations — is what we develop together with our first pilot venues. Pilot partners get direct access to the team building it and shape what Vox becomes in their market.",
      points: [
        "Structured pilot with clear success criteria, defined together",
        "Direct line to the founding team throughout",
        "Commercial terms agreed per pilot — no rate card, no lock-in",
      ],
      cta: "Talk to us about a pilot",
    },
    trust: {
      heading: "Built carefully, on purpose",
      items: [
        {
          title: "A human stays in the loop",
          body: "Vox hands over gracefully when a call needs a person, and every conversation is reviewable — nothing happens in a black box.",
        },
        {
          title: "Honest about what's live",
          body: "Bookings are in production in Australia. What's still in development says so — on this site and in our pitches.",
        },
        {
          title: "Privacy taken seriously",
          body: "Calls are processed to complete the booking, not to build profiles. European deployments are being designed for GDPR from the ground up.",
        },
      ],
    },
    testimonial: {
      quote:
        "We used to lose tables every Friday night just because nobody could reach the phone. Bella picks up every single call — and the bookings just appear on our screen. It paid for itself in the first week.",
      author: "Natalia",
      role: "Owner · Natalia's Bistro, Sydney, Australia",
    },
    faq: {
      heading: "Questions we get asked",
      items: [
        {
          q: "Is Vox actually running, or is this a prototype?",
          a: "It runs in production in Australia, taking real bookings for paying venues. Europe is where we go next, and pilot partners shape how it lands here.",
        },
        {
          q: "What does a pilot actually involve?",
          a: "A short setup call, a call-forward from your existing line, then Vox answers real calls with success criteria we agree with you in advance. No lock-in.",
        },
        {
          q: "Which booking system do you connect to?",
          a: "In Europe, none yet — that integration is part of what a pilot defines. Tell us what you run and it goes on the list we build against.",
        },
        {
          q: "What does it cost?",
          a: "There is no European rate card. Pilot terms are agreed case by case, because what a first deployment is worth depends on what we learn together.",
        },
        {
          q: "Will callers know they are talking to a machine?",
          a: "Yes. Vox introduces itself as an assistant at the start of the call, and hands over to your team whenever a caller asks or the conversation needs a person.",
        },
      ],
    },
    closing: {
      heading: "Ready to hear it?",
      body: "Tell us about your venue and we'll set up a conversation — and a live demonstration of Vox taking a booking.",
      cta: "Book a pilot",
    },
  },
  fr: {
    title: "BitePerk — Vox, l'hôte téléphonique IA pour les restaurants",
    description:
      "Vox répond à chaque appel de votre restaurant d'une voix naturelle, vérifie les disponibilités réelles et enregistre la réservation. En production en Australie — pilotes européens ouverts.",
    eyebrow: "Vox · Hôte téléphonique IA",
    h1: "Chaque appel décroché. Chaque réservation enregistrée.",
    lede: "Vox répond au téléphone de votre restaurant d'une voix chaleureuse et naturelle — jour et nuit, en plein service, sur la ligne que vos clients connaissent déjà. Il vérifie les disponibilités réelles et inscrit la réservation directement dans votre tableau de bord.",
    ctaPrimary: "Réserver un pilote",
    ctaSecondary: "Voir comment ça marche",
    proof: {
      eyebrow: "En production, pas en promesse",
      heading: "Déjà en service en Australie.",
      body: "Vox n'est pas une démo. Sous le nom VoxTable, il répond à de vrais appels pour des restaurants clients en Australie — et prend les réservations de bout en bout, sans intervention humaine.",
      points: [
        "Décroche en moins d'une seconde, 24 h/24, 7 j/7",
        "Réserve sur les disponibilités réelles — aucun surbooking",
        "Chaque appel journalisé, avec transcription et enregistrement",
        "Tableau de bord en temps réel : réservations, appels, statistiques",
      ],
    },
    steps: {
      eyebrow: "Comment ça marche",
      heading: "Vous gardez votre numéro. Vox décroche.",
      items: [
        {
          title: "Gardez votre numéro",
          body: "Un simple renvoi d'appel relie votre ligne actuelle à Vox. Pas de matériel, pas de nouveau numéro, rien à installer pour votre équipe.",
        },
        {
          title: "Vox répond comme un hôte",
          body: "Il accueille l'appelant naturellement, comprend les dates, le nombre de couverts et les demandes particulières, et vérifie vos disponibilités réelles pendant la conversation.",
        },
        {
          title: "La réservation arrive dans votre tableau de bord",
          body: "Les réservations confirmées sont inscrites directement dans votre registre, avec la transcription et l'enregistrement complets de chaque appel.",
        },
      ],
    },
    pilot: {
      eyebrow: "Pilotes européens",
      heading: "Nous amenons Vox en Europe — avec des partenaires pilotes, pas des promesses.",
      body: "La version européenne — langues locales, numéros locaux, intégrations locales — se construit avec nos premiers établissements pilotes. Les partenaires pilotes travaillent directement avec l'équipe qui la développe et façonnent ce que Vox deviendra sur leur marché.",
      points: [
        "Pilote structuré, avec des critères de réussite définis ensemble",
        "Accès direct à l'équipe fondatrice tout au long du pilote",
        "Conditions commerciales convenues par pilote — sans grille tarifaire, sans engagement",
      ],
      cta: "Parlons de votre pilote",
    },
    trust: {
      heading: "Conçu avec exigence, délibérément",
      items: [
        {
          title: "Un humain reste dans la boucle",
          body: "Vox passe la main avec élégance dès qu'un appel nécessite une personne, et chaque conversation est consultable — rien ne se passe dans une boîte noire.",
        },
        {
          title: "Honnête sur ce qui est en service",
          body: "Les réservations sont en production en Australie. Ce qui est encore en développement est présenté comme tel — sur ce site comme dans nos présentations.",
        },
        {
          title: "La confidentialité prise au sérieux",
          body: "Les appels sont traités pour finaliser la réservation, pas pour constituer des profils. Les déploiements européens sont conçus pour le RGPD dès l'origine.",
        },
      ],
    },
    testimonial: {
      quote:
        "On perdait des tables tous les vendredis soir, simplement parce que personne ne pouvait décrocher. Bella prend chaque appel — et les réservations apparaissent sur notre écran. Elle s'est rentabilisée dès la première semaine.",
      author: "Natalia",
      role: "Propriétaire · Natalia's Bistro, Sydney, Australie",
    },
    faq: {
      heading: "Les questions qu'on nous pose",
      items: [
        {
          q: "Vox fonctionne-t-il vraiment, ou s'agit-il d'un prototype ?",
          a: "Il tourne en production en Australie et prend de vraies réservations pour des établissements clients. L'Europe est l'étape suivante, et les partenaires pilotes en façonnent l'arrivée.",
        },
        {
          q: "En quoi consiste concrètement un pilote ?",
          a: "Un court appel de configuration, un renvoi depuis votre ligne actuelle, puis Vox répond à de vrais appels selon des critères de réussite convenus à l'avance. Sans engagement.",
        },
        {
          q: "À quel logiciel de réservation vous connectez-vous ?",
          a: "En Europe, à aucun pour l'instant : cette intégration fait partie de ce qu'un pilote définit. Dites-nous ce que vous utilisez et nous l'ajoutons à notre feuille de route.",
        },
        {
          q: "Quel est le tarif ?",
          a: "Il n'existe pas de grille tarifaire européenne. Les conditions d'un pilote se conviennent au cas par cas, car la valeur d'un premier déploiement dépend de ce que nous y apprenons ensemble.",
        },
        {
          q: "L'appelant saura-t-il qu'il parle à une machine ?",
          a: "Oui. Vox se présente comme un assistant dès le début de l'appel, et passe la main à votre équipe dès qu'un appelant le demande ou que la conversation l'exige.",
        },
      ],
    },
    closing: {
      heading: "Envie de l'entendre ?",
      body: "Parlez-nous de votre établissement : nous organiserons un échange — et une démonstration en direct de Vox prenant une réservation.",
      cta: "Réserver un pilote",
    },
  },
};

export const howItWorks: Record<Lang, SimplePageCopy> = {
  en: {
    title: "How Vox works — BitePerk",
    description:
      "How Vox answers restaurant calls: keep your number, Vox picks up in a natural voice, checks real availability and writes the booking to your dashboard.",
    eyebrow: "How it works",
    h1: "From ring to booking, without a human on the line.",
    intro:
      "Vox is an AI phone host built for one job: answering a restaurant's phone the way a great front-of-house would. Here's what actually happens on a call.",
    sections: [
      {
        heading: "1 · Your line forwards to Vox",
        body: [
          "Setup is a call-forward on the number you already have — total or overflow-only, so Vox can take every call or only the ones your team can't get to. No hardware, no apps, nothing at the venue.",
        ],
      },
      {
        heading: "2 · Vox answers, instantly",
        body: [
          "Calls are answered in under a second, at any hour. Vox greets callers naturally, in a warm voice, and handles the conversation — dates, covers, timing changes, special requests.",
        ],
      },
      {
        heading: "3 · It books against real availability",
        body: [
          "Vox checks your live availability as it talks, so it never promises a table you don't have. Confirmed bookings are written straight to your booking log.",
        ],
      },
      {
        heading: "4 · You see everything",
        body: [
          "Every call appears in your dashboard with its transcript and recording. Bookings, analytics, live tables — the whole phone line becomes visible, for the first time.",
        ],
      },
      {
        heading: "What a European pilot looks like",
        body: [
          "We set up Vox for your venue together — your menu, your hours, your booking rules — and run it on real calls with clear success criteria we define with you. The European build (local language, local number, local integrations) is developed with pilot partners; you shape it.",
          "There's no rate card at this stage and no lock-in: commercial terms are agreed per pilot.",
        ],
      },
    ],
    cta: { label: "Book a pilot", sub: "Tell us about your venue — we'll come back within a business day." },
  },
  fr: {
    title: "Comment Vox fonctionne — BitePerk",
    description:
      "Comment Vox répond aux appels d'un restaurant : gardez votre numéro, Vox décroche d'une voix naturelle, vérifie les disponibilités réelles et inscrit la réservation dans votre tableau de bord.",
    eyebrow: "Comment ça marche",
    h1: "De la sonnerie à la réservation, sans personne au bout du fil.",
    intro:
      "Vox est un hôte téléphonique IA conçu pour une seule mission : répondre au téléphone d'un restaurant comme le ferait un excellent responsable de salle. Voici ce qui se passe réellement pendant un appel.",
    sections: [
      {
        heading: "1 · Votre ligne est renvoyée vers Vox",
        body: [
          "L'installation se résume à un renvoi d'appel sur votre numéro actuel — total ou en débordement uniquement, pour que Vox prenne tous les appels ou seulement ceux que votre équipe ne peut pas prendre. Pas de matériel, pas d'application, rien dans l'établissement.",
        ],
      },
      {
        heading: "2 · Vox décroche, instantanément",
        body: [
          "Les appels sont décrochés en moins d'une seconde, à toute heure. Vox accueille les appelants naturellement, d'une voix chaleureuse, et mène la conversation — dates, couverts, changements d'horaire, demandes particulières.",
        ],
      },
      {
        heading: "3 · Il réserve sur vos disponibilités réelles",
        body: [
          "Vox consulte vos disponibilités en direct pendant qu'il parle : il ne promet jamais une table que vous n'avez pas. Les réservations confirmées sont inscrites directement dans votre registre.",
        ],
      },
      {
        heading: "4 · Vous voyez tout",
        body: [
          "Chaque appel apparaît dans votre tableau de bord avec sa transcription et son enregistrement. Réservations, statistiques, plan de salle en direct — votre ligne téléphonique devient enfin visible.",
        ],
      },
      {
        heading: "À quoi ressemble un pilote européen",
        body: [
          "Nous configurons Vox pour votre établissement ensemble — votre carte, vos horaires, vos règles de réservation — puis nous le faisons tourner sur de vrais appels, avec des critères de réussite définis avec vous. La version européenne (langue locale, numéro local, intégrations locales) se développe avec les partenaires pilotes ; vous la façonnez.",
          "Pas de grille tarifaire à ce stade et aucun engagement : les conditions commerciales sont convenues pilote par pilote.",
        ],
      },
    ],
    cta: { label: "Réserver un pilote", sub: "Parlez-nous de votre établissement — réponse sous un jour ouvré." },
  },
};

export const about: Record<Lang, SimplePageCopy> = {
  en: {
    title: "About BitePerk — the team behind Vox",
    description:
      "BitePerk is a Sydney-built company shipping voice AI for hospitality. Vox answers real restaurant calls in production today; European pilots are now opening.",
    eyebrow: "About",
    h1: "A shipped product, from a team that answers to restaurants.",
    intro:
      "BitePerk Pty Ltd builds voice and AI tools for hospitality. We started where the pain is sharpest — the phone — and shipped Vox, an AI host that answers restaurant calls and books tables in production, today, in Australia.",
    sections: [
      {
        heading: "Where we are",
        body: [
          "BitePerk was built in Sydney, where Vox answers real calls for paying venues as VoxTable. Europe is our next market: we're opening pilot partnerships with venues in France and Belgium, and building the European version — local languages, local numbers — with them.",
        ],
      },
      {
        heading: "How we operate",
        body: [
          "Three principles run through everything: a human stays in the loop — Vox hands over when a call needs a person, and every conversation is reviewable. We're honest about what's live — production features and in-development features are labelled as what they are. And privacy is a design input, not a retrofit — calls are processed to complete bookings, not to profile guests.",
        ],
      },
      {
        heading: "Why the phone",
        body: [
          "Missed calls are missed revenue — every unanswered ring at 7pm on a Friday is a table that books somewhere else. The phone is still how a huge share of guests book, and it's the one channel restaurants have never been able to see into. Vox answers it, and makes it visible.",
        ],
      },
    ],
    cta: { label: "Talk to us", sub: "hello@biteperk.com.au — or use the contact form." },
  },
  fr: {
    title: "À propos de BitePerk — l'équipe derrière Vox",
    description:
      "BitePerk est une société née à Sydney qui met l'IA vocale au service de la restauration. Vox répond à de vrais appels en production ; les pilotes européens sont ouverts.",
    eyebrow: "À propos",
    h1: "Un produit en service, porté par une équipe au service des restaurants.",
    intro:
      "BitePerk Pty Ltd conçoit des outils vocaux et d'IA pour l'hôtellerie-restauration. Nous avons commencé là où la douleur est la plus vive — le téléphone — et mis en service Vox, un hôte IA qui répond aux appels et prend les réservations, en production, aujourd'hui, en Australie.",
    sections: [
      {
        heading: "Où nous en sommes",
        body: [
          "BitePerk est née à Sydney, où Vox répond à de vrais appels pour des établissements clients sous le nom VoxTable. L'Europe est notre prochain marché : nous ouvrons des partenariats pilotes avec des établissements en France et en Belgique, et construisons la version européenne — langues locales, numéros locaux — avec eux.",
        ],
      },
      {
        heading: "Notre façon de travailler",
        body: [
          "Trois principes guident tout : un humain reste dans la boucle — Vox passe la main dès qu'un appel nécessite une personne, et chaque conversation est consultable. Nous sommes honnêtes sur ce qui est en service — les fonctionnalités en production et celles en développement sont présentées pour ce qu'elles sont. Et la confidentialité est une donnée de conception, pas un correctif — les appels sont traités pour finaliser des réservations, pas pour profiler les clients.",
        ],
      },
      {
        heading: "Pourquoi le téléphone",
        body: [
          "Un appel manqué, c'est du chiffre d'affaires manqué — chaque sonnerie sans réponse un vendredi à 19 h est une table qui se réserve ailleurs. Le téléphone reste le canal de réservation d'une très grande partie des clients, et c'est le seul canal que les restaurants n'ont jamais pu observer. Vox y répond, et le rend visible.",
        ],
      },
    ],
    cta: { label: "Contactez-nous", sub: "hello@biteperk.com.au — ou via le formulaire de contact." },
  },
};

export const contact: Record<Lang, ContactCopy> = {
  en: {
    title: "Contact BitePerk — book a European pilot",
    description:
      "Tell us about your venue and book a pilot of Vox, the AI phone host. Direct access to the founding team.",
    eyebrow: "Contact",
    h1: "Let's talk about your venue.",
    intro:
      "Booking a pilot starts with a short conversation: your venue, your call volume, what your phone costs you today. We'll come back within a business day — with a live demonstration of Vox on the call.",
    form: {
      name: "Your name",
      email: "Work email",
      venue: "Venue or group",
      venuePlaceholder: "e.g. Brasserie Lumière, Paris",
      product: "Product",
      productPlaceholder: "Select a product…",
      message: "Tell us about your venue",
      messagePlaceholder: "Covers, locations, what the phone is like on a busy night…",
      submit: "Request a pilot",
      note: "No rate card at this stage — commercial terms are agreed per pilot. We reply within a business day.",
    },
    aside: {
      heading: "Prefer email?",
      body: "Write to the founding team directly — the same people who built the product answer the inbox.",
      emailLabel: "Email us",
    },
  },
  fr: {
    title: "Contacter BitePerk — réserver un pilote européen",
    description:
      "Parlez-nous de votre établissement et réservez un pilote de Vox, l'hôte téléphonique IA. Accès direct à l'équipe fondatrice.",
    eyebrow: "Contact",
    h1: "Parlons de votre établissement.",
    intro:
      "Un pilote commence par un échange court : votre établissement, votre volume d'appels, ce que le téléphone vous coûte aujourd'hui. Nous revenons vers vous sous un jour ouvré — avec une démonstration en direct de Vox pendant l'appel.",
    form: {
      name: "Votre nom",
      email: "E-mail professionnel",
      venue: "Établissement ou groupe",
      venuePlaceholder: "ex. Brasserie Lumière, Paris",
      product: "Produit",
      productPlaceholder: "Choisissez un produit…",
      message: "Parlez-nous de votre établissement",
      messagePlaceholder: "Couverts, adresses, à quoi ressemble le téléphone un soir de service…",
      submit: "Demander un pilote",
      note: "Pas de grille tarifaire à ce stade — les conditions commerciales sont convenues par pilote. Réponse sous un jour ouvré.",
    },
    aside: {
      heading: "Vous préférez l'e-mail ?",
      body: "Écrivez directement à l'équipe fondatrice — ce sont les personnes qui ont construit le produit qui répondent.",
      emailLabel: "Écrivez-nous",
    },
  },
};

export const privacy: Record<Lang, SimplePageCopy> = {
  en: {
    title: "Privacy notice — BitePerk",
    description: "How BitePerk handles personal data on biteperk.com.",
    eyebrow: "Legal",
    h1: "Privacy notice",
    // Language core — market-neutral. Every sentence here is checked against
    // what functions/index.js actually does (3 Sep 2026): no CAPTCHA, no IP or
    // user agent on the lead, 24-month TTL, Firestore + Zoho CRM + Zoho Mail
    // all in Australia. The supervisory authority is MARKET-scoped and lives
    // in markets.ts overrides (fr → CNIL, be-* → APD/GBA, gb-en → ICO); the
    // x-default /en names none. check-truthful bans "data … stored in
    // Australia"-shaped phrases on global pages — say "to Australia".
    intro:
      "This notice covers biteperk.com, the international site of Biteperk Pty Ltd (Sydney, Australia). It explains what we collect here, why, the legal basis for it, and the rights you have.",
    sections: [
      {
        heading: "Who controls your data",
        body: [
          "Biteperk Pty Ltd (ABN 36 700 831 303), Sydney, Australia, is the controller of the personal data described here. You can reach us about anything on this page at hello@biteperk.com.au.",
        ],
      },
      {
        heading: "What we collect on this site",
        body: [
          "The contact form asks for your name, work email, venue name, the product you are interested in, and your message. We use these to respond to your enquiry and, if you ask about a pilot, to organise it. We do not keep your IP address or browser details with your enquiry; a short-lived, hashed record of your connection is used only to limit repeat submissions. Google Ads consent mode may send limited cookieless measurement signals while advertising storage, user-data use and personalisation are denied. Analytics cookies do not run without consent.",
        ],
      },
      {
        heading: "Our lawful basis",
        body: [
          "We rely on legitimate interests (Article 6(1)(f) GDPR) to answer a business enquiry you have chosen to send us — responding to it is what you asked for, and the data involved is limited to the enquiry itself. Where we place non-essential cookies we rely on your consent instead, which you can withdraw at any time through Cookie settings.",
        ],
      },
      {
        heading: "Where it goes, and international transfers",
        body: [
          "Form submissions are stored with our infrastructure provider, Google Cloud (Firestore, Australia region), entered into our Zoho CRM account (Zoho's Australian data centre) for follow-up, and sent to our team by notification email through Zoho Mail. If you are in the EU/EEA or the United Kingdom, that is a transfer of your personal data to Australia, which has no adequacy decision from the EU or the UK.",
          // TODO(legal): flip this sentence once Zoho's DPA (EU SCCs + UK
          // Addendum, AU data centre) is countersigned — see the ops log.
          "We do not yet have a signed transfer safeguard (the EU standard contractual clauses) in place with Zoho for this transfer. Until it is signed we keep what we send limited to the enquiry itself. If you would rather your details did not leave the EU or the UK, email us instead of using the form and tell us so.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Enquiries are kept for up to 24 months from the day you send them, then deleted automatically. You can ask us to delete your enquiry earlier at any time.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You have the right to ask us for a copy of your personal data, to have it corrected or erased, to have its use restricted, to object to our use of it where we rely on legitimate interests, and to receive it in a portable form. Write to hello@biteperk.com.au and we will act on it within one month.",
          "If you are in the EU/EEA or the United Kingdom, you also have the right to complain to your local data protection supervisory authority. We would rather you came to us first, but you do not have to.",
        ],
      },
    ],
  },
  fr: {
    // Every sentence in this block is new or reworded (3 Sep 2026) — the
    // signed-off French of 26–27 Jul 2026 did not cover it. Verbal pass from
    // Ludovic, confirmed by Sam 3 Sep 2026; see this file's header.
    title: "Politique de confidentialité — BitePerk",
    description: "Comment BitePerk traite les données personnelles sur biteperk.com.",
    eyebrow: "Mentions légales",
    h1: "Politique de confidentialité",
    intro:
      "Cette notice couvre biteperk.com, le site international de Biteperk Pty Ltd (Sydney, Australie). Elle explique ce que nous collectons ici, pourquoi, sur quelle base légale, et les droits dont vous disposez.",
    sections: [
      {
        heading: "Qui est responsable de vos données",
        body: [
          "Biteperk Pty Ltd (ABN 36 700 831 303), Sydney, Australie, est le responsable du traitement des données personnelles décrites ici. Pour toute question sur cette page, écrivez à hello@biteperk.com.au.",
        ],
      },
      {
        heading: "Ce que nous collectons sur ce site",
        body: [
          "Le formulaire de contact demande votre nom, votre e-mail professionnel, le nom de votre établissement, le produit qui vous intéresse et votre message. Nous les utilisons pour répondre à votre demande et, si vous vous renseignez sur un pilote, pour l'organiser. Nous ne conservons ni votre adresse IP ni les caractéristiques de votre navigateur avec votre demande ; une empreinte hachée et temporaire de votre connexion sert uniquement à limiter les envois répétés. Le mode Consentement de Google Ads peut transmettre des signaux de mesure limités et sans cookie lorsque le stockage publicitaire, l'utilisation des données publicitaires et la personnalisation sont refusés. Aucun cookie de mesure d'audience ne fonctionne sans consentement.",
        ],
      },
      {
        heading: "Notre base légale",
        body: [
          "Nous nous appuyons sur l'intérêt légitime (article 6, paragraphe 1, point f du RGPD) pour répondre à une demande professionnelle que vous avez choisi de nous adresser : y répondre est ce que vous nous demandez, et les données concernées se limitent à la demande elle-même. Pour les cookies non essentiels, nous nous appuyons sur votre consentement, que vous pouvez retirer à tout moment depuis « Paramètres des cookies ».",
        ],
      },
      {
        heading: "Où vont vos données, et les transferts internationaux",
        body: [
          "Les envois du formulaire sont stockés chez notre fournisseur d'infrastructure, Google Cloud (Firestore, région Australie), enregistrés dans notre compte Zoho CRM (centre de données australien de Zoho) pour le suivi, et transmis à notre équipe par e-mail de notification via Zoho Mail. Si vous êtes dans l'UE/EEE ou au Royaume-Uni, il s'agit d'un transfert de vos données personnelles vers l'Australie, qui ne bénéficie d'aucune décision d'adéquation de l'UE ni du Royaume-Uni.",
          // TODO(legal): flip once Zoho's DPA is countersigned — see the ops log.
          "Nous ne disposons pas encore d'une garantie de transfert signée (les clauses contractuelles types de l'UE) avec Zoho pour ce transfert. Tant qu'elle n'est pas signée, nous limitons ce que nous transmettons à la demande elle-même. Si vous préférez que vos coordonnées ne quittent pas l'UE ou le Royaume-Uni, écrivez-nous par e-mail plutôt que d'utiliser le formulaire, et dites-le-nous.",
        ],
      },
      {
        heading: "Durée de conservation",
        body: [
          "Les demandes sont conservées au maximum 24 mois à compter de leur envoi, puis supprimées automatiquement. Vous pouvez demander la suppression anticipée de votre demande à tout moment.",
        ],
      },
      {
        heading: "Vos droits",
        body: [
          "Vous avez le droit de nous demander une copie de vos données personnelles, d'en obtenir la rectification ou l'effacement, d'en limiter l'utilisation, de vous opposer à leur traitement lorsqu'il repose sur notre intérêt légitime, et de les recevoir dans un format portable. Écrivez à hello@biteperk.com.au : nous y donnerons suite sous un mois.",
          "Si vous êtes dans l'UE/EEE ou au Royaume-Uni, vous avez également le droit d'introduire une réclamation auprès de votre autorité de contrôle. Nous préférerions que vous vous adressiez d'abord à nous, mais rien ne vous y oblige.",
        ],
      },
    ],
  },
};

export const terms: Record<Lang, SimplePageCopy> = {
  en: {
    title: "Terms of use — BitePerk",
    description: "Terms of use for biteperk.com.",
    eyebrow: "Legal",
    h1: "Terms of use",
    intro:
      "These short terms cover the use of biteperk.com. Service agreements for pilots and deployments are separate documents, agreed per engagement.",
    sections: [
      {
        heading: "The site",
        body: [
          "biteperk.com is operated by BitePerk Pty Ltd (Sydney, Australia). Content is provided for general information about our products and pilot programmes; it isn't an offer capable of acceptance, and product availability differs by market — what's live in Australia is labelled as such.",
        ],
      },
      {
        heading: "Intellectual property",
        body: [
          "BitePerk, Vox, VoxTable and the associated logos and content on this site belong to BitePerk Pty Ltd. Don't reproduce them without permission.",
        ],
      },
      {
        heading: "Liability",
        body: [
          "The site is provided as-is. To the extent permitted by law, BitePerk accepts no liability for decisions made on the basis of this site's content. Full commercial terms live in the pilot and service agreements.",
        ],
      },
      {
        heading: "Contact",
        body: ["Questions about these terms: hello@biteperk.com.au."],
      },
    ],
  },
  fr: {
    title: "Conditions d'utilisation — BitePerk",
    description: "Conditions d'utilisation de biteperk.com.",
    eyebrow: "Mentions légales",
    h1: "Conditions d'utilisation",
    intro:
      "Ces conditions courtes couvrent l'utilisation de biteperk.com. Les contrats de service des pilotes et des déploiements sont des documents distincts, convenus par mission.",
    sections: [
      {
        heading: "Le site",
        body: [
          "biteperk.com est édité par BitePerk Pty Ltd (Sydney, Australie). Son contenu fournit une information générale sur nos produits et nos programmes pilotes ; il ne constitue pas une offre susceptible d'acceptation, et la disponibilité des produits varie selon les marchés — ce qui est en service en Australie est signalé comme tel.",
        ],
      },
      {
        heading: "Propriété intellectuelle",
        body: [
          "BitePerk, Vox, VoxTable ainsi que les logos et contenus associés de ce site appartiennent à BitePerk Pty Ltd. Toute reproduction sans autorisation est interdite.",
        ],
      },
      {
        heading: "Responsabilité",
        body: [
          "Le site est fourni en l'état. Dans la mesure permise par la loi, BitePerk décline toute responsabilité quant aux décisions prises sur la base de son contenu. Les conditions commerciales complètes figurent dans les contrats de pilote et de service.",
        ],
      },
      {
        heading: "Contact",
        body: ["Pour toute question sur ces conditions : hello@biteperk.com.au."],
      },
    ],
  },
};

/**
 * Cookie policy. Emitted for EVERY locale because the consent banner links to
 * it — a notice whose policy link 404s is a compliance failure, and these are
 * the strictest cookie regimes (UK GDPR/PECR, CNIL, Belgian DPA).
 *
 * Kept factually in step with src/data/consent.ts: Google Ads uses denied-by-
 * default advanced consent mode; optional storage and other trackers are opt-in.
 */
export const cookies: Record<Lang, SimplePageCopy> = {
  en: {
    title: "Cookie policy — BitePerk",
    description:
      "How BitePerk uses local storage, cookies and denied-by-default Google consent mode, and how you can change your choice at any time.",
    eyebrow: "Legal",
    h1: "Cookie policy",
    intro:
      "We keep tracking to a minimum. Google Ads starts with every advertising consent signal denied and may send limited cookieless measurement signals in that state. Advertising storage and personalisation stay off unless you allow Marketing; refusing is a single click, and you can change your mind at any time from Cookie settings in the footer of every page.",
    sections: [
      {
        heading: "Strictly necessary",
        body: [
          "One small entry remembers your cookie choice so we don't ask again on every page, and another remembers whether you prefer the light or dark theme. Both stay in your browser, are never transmitted, and cannot be switched off — without them the site cannot honour the choices you have already made. The contact form uses no CAPTCHA and sets nothing on your device.",
        ],
      },
      {
        heading: "Analytics",
        body: [
          "If and when we enable analytics, we use a cookieless product that records page views without cookies, without cross-site tracking and without building a profile of you. It stays off until you allow it, and you can withdraw that permission at any time.",
        ],
      },
      {
        heading: "Marketing",
        body: [
          "Google Ads uses advanced consent mode. Its tag loads with advertising storage, advertising user-data use and personalisation denied, and may send consent status and limited cookieless measurement pings in that state. If you allow Marketing, Google Ads may use advertising cookies and the LinkedIn Insight Tag may load. With Marketing denied, neither may use advertising storage or personalisation.",
        ],
      },
      {
        heading: "Changing or withdrawing your choice",
        body: [
          "Open Cookie settings in the footer of any page to review or change what you have allowed. Withdrawing permission is exactly as easy as giving it, takes effect immediately, and does not affect anything we did while permission was in place.",
          "Questions about this policy, or about the personal data behind it, can go to hello@biteperk.com.au — the same address that handles data requests under our privacy notice.",
        ],
      },
    ],
  },
  fr: {
    title: "Politique relative aux cookies — BitePerk",
    description:
      "Comment BitePerk utilise le stockage local, les cookies et le mode Consentement de Google, refusé par défaut, et comment modifier votre choix à tout moment.",
    eyebrow: "Mentions légales",
    h1: "Politique relative aux cookies",
    intro:
      "Nous limitons le suivi au strict minimum. Google Ads démarre avec tous les signaux de consentement publicitaire refusés et peut transmettre, dans cet état, des signaux de mesure limités et sans cookie. Le stockage publicitaire et la personnalisation restent désactivés sauf si vous autorisez le Marketing ; refuser tient en un clic et vous pouvez modifier votre choix à tout moment depuis « Paramètres des cookies », en bas de chaque page.",
    sections: [
      {
        heading: "Strictement nécessaires",
        body: [
          // The last sentence is new (3 Sep 2026, reCAPTCHA removal) — verbal
          // pass from Ludovic, confirmed by Sam 3 Sep 2026; see file header.
          "Une donnée mémorise votre choix en matière de cookies, afin de ne pas vous solliciter à chaque page, et une autre retient si vous préférez le thème clair ou sombre. Elles restent dans votre navigateur, ne sont jamais transmises et ne peuvent être désactivées : sans elles, le site ne peut pas respecter les choix que vous avez déjà exprimés. Le formulaire de contact n'utilise aucun CAPTCHA et ne dépose rien sur votre appareil.",
        ],
      },
      {
        heading: "Mesure d'audience",
        body: [
          "Si nous activons un jour la mesure d'audience, nous utiliserons un outil sans cookie, qui comptabilise les pages vues sans cookie, sans suivi inter-sites et sans constituer de profil. Elle reste désactivée tant que vous ne l'avez pas autorisée, et votre accord est révocable à tout moment.",
        ],
      },
      {
        heading: "Marketing",
        body: [
          "Google Ads utilise le mode Consentement avancé. Sa balise se charge alors que le stockage publicitaire, l'utilisation des données publicitaires et la personnalisation sont refusés, et peut transmettre l'état du consentement ainsi que des signaux de mesure limités et sans cookie. Si vous autorisez le Marketing, Google Ads peut utiliser des cookies publicitaires et la balise LinkedIn Insight peut se charger. En cas de refus, aucun des deux ne peut utiliser le stockage publicitaire ni la personnalisation.",
        ],
      },
      {
        heading: "Modifier ou retirer votre choix",
        body: [
          "Ouvrez « Paramètres des cookies » en bas de n'importe quelle page pour revoir ou modifier vos autorisations. Retirer votre accord est aussi simple que de le donner, prend effet immédiatement, et ne remet pas en cause ce qui a été fait tant que l'autorisation était valable.",
          "Pour toute question sur cette politique, ou sur les données personnelles qu'elle concerne, écrivez à hello@biteperk.com.au — l'adresse qui traite également les demandes prévues par notre politique de confidentialité.",
        ],
      },
    ],
  },
};

export const cityPage: Record<Lang, CityPageCopy> = {
  en: {
    storyEyebrow: "The missed-call problem, {city}-style",
    storyHeading: "A ringing phone during service is a booking walking out.",
    scenariosEyebrow: "During a {city} service",
    scenariosHeading: "Where the phone loses you money — and what answering it changes.",
    aiEyebrow: "The AI under the hood",
    aiHeading: "Tuned for {city}. A person the moment it matters.",
    districtsEyebrow: "Across {city}",
    districtsHeading: "The neighbourhoods venues call from.",
    districtsNote:
      "Not on the list? The pilot programme isn't drawn by postcode — a venue anywhere in the UK works exactly the same way.",
    faqEyebrow: "{city} questions",
    faqHeading: "Answered plainly.",
    othersEyebrow: "Elsewhere in the UK",
    othersHeading: "Also in pilot conversations with venues in",
    closingHeading: "Put Vox on a {city} line",
    closingBody:
      "Tell us how a busy service sounds at your venue and we'll show you Vox handling a call like it — live, before you commit to anything.",
  },
  // DRAFT French — no fr/be-fr city is published, so nothing renders this yet.
  // RULE (see markets.ts header): French written after 27 Jul 2026 needs its
  // own native-speaker pass before any French city page flips published:true.
  fr: {
    storyEyebrow: "Les appels manqués, version {city}",
    storyHeading: "Un téléphone qui sonne en plein service, c'est une réservation qui s'en va.",
    scenariosEyebrow: "En plein service à {city}",
    scenariosHeading: "Là où le téléphone vous coûte — et ce que change une ligne décrochée.",
    aiEyebrow: "L'IA sous le capot",
    aiHeading: "Réglée pour {city}. Une personne dès que c'est nécessaire.",
    districtsEyebrow: "Dans tout {city}",
    districtsHeading: "Les quartiers d'où appellent les établissements.",
    districtsNote:
      "Votre quartier n'y figure pas ? Le programme pilote ne s'arrête pas à un code postal — un établissement situé ailleurs fonctionne exactement de la même manière.",
    faqEyebrow: "Questions à {city}",
    faqHeading: "Des réponses claires.",
    othersEyebrow: "Ailleurs",
    othersHeading: "Également en discussions pilotes avec des établissements à",
    closingHeading: "Mettez Vox sur une ligne à {city}",
    closingBody:
      "Décrivez-nous un service chargé dans votre établissement et nous vous montrerons Vox au téléphone sur un appel semblable — en direct, avant tout engagement.",
  },
};
