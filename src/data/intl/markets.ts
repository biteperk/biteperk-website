/**
 * Per-market content overrides — the "local feel" layer of the locale matrix.
 *
 * Keyed by Locale.base (NOT by market: be-en and be-fr differ by language, so
 * nothing is shareable at market granularity — even the shared Brussels image
 * slugs need language-specific alt text). Each entry layers over the language
 * core in ./copy.ts via resolveCopy() — see ./index.ts for the merge contract
 * (arrays replace wholesale).
 *
 * Content rules (PLAN.md §8 — Europe-truthful, enforced by
 * scripts/gates/check-truthful.mjs on every built global page):
 *   - NO AU pricing, NO AU phone numbers, NO AU NAP (Surry Hills — see site.ts).
 *   - NO fake local offices — market pages localise the *conversation*
 *     (pilot framing, city imagery, spelling), never invent a presence.
 *   - What is live is Australia; Europe is the pilot programme.
 *
 * The /fr and /be-fr overrides are French. Reviewed and signed off by Ludovic
 * (26 Jul 2026), same pass as the FR core and the product copy — the launch
 * gate this comment used to carry is DISCHARGED. New French here needs a fresh
 * pass; the sign-off covers what existed at that date.
 *
 * The 27 Jul 2026 market-differentiation French (both FR home pages, both
 * about pages, two five-item FAQs) was reviewed and SIGNED OFF by Ludovic on
 * 27 Jul 2026 — DISCHARGED, cleared for prospect-facing use. The standing rule
 * is unchanged and applies to whatever is written next: French added after that
 * date needs its own native pass.
 *
 * The 7 Sep 2026 batch (this file's /fr about-page intro, and the EU AI Act
 * article-50 citation clause on BOTH the /fr and /be-fr trust cards) had a
 * VERBAL pass from Ludovic, confirmed by Sam on 7 Sep 2026 — DISCHARGED, no
 * corrections. Unlike the two sign-offs above there is no email behind it; the
 * review filed at docs/ops-records/2026-09-07-french-review-ludovic.md
 * is the record of what it covered. The two citation clauses are worded
 * differently on purpose — check-intl-similarity measures /fr against /be-fr —
 * so do not converge them when editing. Standing rule unchanged after that date.
 */
import type { Locale } from "@/data/locales";
import type { CopyBundle, Override } from "./index";
import { privacy as privacyCore, type Lang, type SimplePageCopy } from "./copy";

/**
 * A market's privacy notice = its language core with the supervisory
 * authority named. The core's final "Your rights" paragraph says "your local
 * data protection supervisory authority" — true on the x-default /en, which
 * serves no single market — and each market replaces exactly that sentence
 * and nothing else. Deriving (rather than restating six sections three
 * times) keeps the SHAPE identical to the core, which the bundle-parity unit
 * test requires of every tree except /gb-en, and means the French is
 * reviewed once, in copy.ts. merge() still replaces the array wholesale, so
 * the full list is what ships. /gb-en keeps its own literal override below
 * because it names a different controller, not just a different authority.
 */
function privacyNaming(lang: Lang, authority: string): SimplePageCopy["sections"] {
  const sections = privacyCore[lang].sections;
  const last = sections[sections.length - 1];
  return [...sections.slice(0, -1), { ...last, body: [...last.body.slice(0, -1), authority] }];
}

/** A market's imagery band on the locale home (rendered by [...intl].astro). */
export type MarketMedia = {
  /** Establishing city shot — public/images/<slug>-{768,1280,1920}.{avif,webp,jpg}. */
  cityscape: { slug: string; alt: string };
  /** Hospitality scene, same slug contract. */
  hospitality: { slug: string; alt: string };
  /** The band's section copy, in the locale's language. */
  eyebrow: string;
  heading: string;
  body: string;
};

/**
 * The locale hero — one image per tree, so the five markets are visually
 * distinct instead of sharing a look (amber bar / blue banquette / red velvet /
 * light wood). Deliberately NOT a landmark: the AU hero (table-set-candles) is
 * geography-neutral too, and localness comes from the pill and copy, with the
 * cityscape band doing the geographic work. A landmark here would also push
 * against art-direction rule 3.
 *
 * `pill` is the honest equivalent of AU's "Sydney, Australia" chip. It names
 * the MARKET, never a premises — we have no European office, and inventing one
 * breaks the same rule that bans the NAP and phone (check-truthful.mjs).
 * Omit it (as /en does) and the hero renders without a chip.
 */
export type MarketHero = {
  slug: string;
  alt: string;
  pill?: string;
};

/**
 * A single supporting photo on the locale home, rendered after the steps.
 *
 * This exists for /en and, as things stand, only /en. The four market trees get
 * their second and third images from the `media` band; /en deliberately has no
 * band (it is the x-default and must not look European), which left it with ONE
 * image against their three — 617 words per image versus ~260, i.e. 2.4× more
 * text per picture on the tree served to everyone outside the four named
 * markets.
 *
 * A single image is the right fix and a band is the wrong one: the band's job
 * is to say "here is your city", which is precisely the claim /en cannot make.
 * So this is one geography-neutral photo that breaks the longest prose run and
 * nothing more — the home stays at 8 sections.
 */
export type MarketSupport = {
  slug: string;
  alt: string;
};

/**
 * The city-links strip on the locale home — the intl analogue of the AU
 * CityStrip. Copy only; the links themselves derive from
 * intlCitiesForBase(locale.base), and the home renders the section only when
 * that list is non-empty AND this copy exists. Lives here, NOT in CopyBundle:
 * the bundle-parity unit test asserts all five trees resolve one shape, and a
 * strip only some markets have belongs in the market layer with media/hero.
 */
export type MarketCities = {
  eyebrow: string;
  heading: string;
  body: string;
};

/**
 * Whether this market's home carries the call simulation (CallSim).
 *
 * OPT-IN, and deliberately not on all five. The transcript plus its framing is
 * ~150 words of identical copy, and check-intl-similarity pools pages BY
 * LANGUAGE: putting it on every English home pushed /en vs /gb-en from 26% to
 * 41% against a 35% ceiling, and the French pair from 34% to 46%. That gate is
 * the anti-doorway guard and it was right — five homes reciting the same demo
 * is the templated-copy shape it exists to catch.
 *
 * On one home per language pool it does the opposite: the block is on one side
 * of every comparison, so it DIFFERENTIATES. Measured with it on /gb-en + /fr:
 * English unchanged at 26/27/28%, French 34% → 33%.
 *
 * So this is an editorial choice with a measurement behind it — the demo lands
 * on the flagship of each language (the UK tree, which carries the cities and
 * the Ltd entity; and France). Before adding a third, re-run
 * `node scripts/gates/check-intl-similarity.mjs` and look at the pool it joins.
 */
export type MarketContent = {
  copy?: Override<CopyBundle>;
  /** Home carries the call simulation. See the note above before adding one. */
  callSim?: true;
  /** Absent (e.g. /en) → the home renders no market band. */
  media?: MarketMedia;
  /** Absent → the hero renders text-only, as every tree did before Jul 2026. */
  hero?: MarketHero;
  /** Absent → no supporting image. Only trees WITHOUT a `media` band need one. */
  support?: MarketSupport;
  /** Absent → no city strip on the home. See MarketCities above. */
  cities?: MarketCities;
};

/**
 * International English x-default (/en). Carries a hero but deliberately no
 * market band and no pill: it serves the US and every unclaimed region, so it
 * must read as neither European nor Australian. Before Jul 2026 this tree had
 * no imagery at all — zero images on every page — while being the x-default.
 */
const enNeutral: MarketContent = {
  hero: {
    slug: "table-set-neutral",
    alt: "Tables laid in warm light, ready for service",
  },
  // The one tree with no market band, so the one tree that needs this. Slug is
  // already graded into public/images (no new photography) and geography-
  // neutral, because /en serves every unclaimed region — a London or Paris
  // landmark here would be worse than no picture. Never `priority` and never
  // preloaded: the LCP element on these trees is TEXT, so prioritising an image
  // only steals throttled bandwidth from the thing being measured.
  support: {
    slug: "busy-service-night",
    alt: "A dining room mid-service, every table occupied",
  },
};

// ── United Kingdom (/gb-en) ─────────────────────────────────────────
const gbEn: MarketContent = {
  callSim: true,
  hero: {
    // FOURTH iteration, art-directed by Sam: v3 (white-linen evening room)
    // was premium but read "night and shady" — the brief flipped to blossoms
    // and freshness. A soft-morning pavement café, lilies in jars down a line
    // of tables. Still a restaurant waiting for service, which is what the
    // headline needs it to be; no face, no legible signage, no landmark.
    // The source is film-grain and encodes via a pinned CDN blur — see the
    // catalogue entry (fetch-images.mjs) before touching the asset.
    slug: "cafe-terrace-flowers",
    alt: "A pavement café at morning, fresh lilies in jars on the front tables",
    pill: "United Kingdom · Pilot programme",
  },
  media: {
    cityscape: {
      slug: "london-skyline",
      alt: "Aerial view of London — Tower Bridge and the Thames winding toward the City",
    },
    hospitality: {
      // Was `bar-moody`: a US craft-beer bar with legible DOLLAR prices on its
      // chalkboard, on the tree that serves the UK. Signage is worse than a
      // stray vehicle in shot — it is readable, and it prices the venue in the
      // wrong currency. This frame is expensive to encode (Edison bulbs and
      // backlit bottles are worst-case for AVIF) and was rejected for the hero
      // for that reason; it is fine here because the band is below the fold and
      // lazy, so it never competes with the text LCP.
      slug: "bar-brass-evening",
      alt: "A bar mid-service, glassware and spirits lit under filament bulbs",
    },
    eyebrow: "For UK venues",
    heading: "Built for the pace of UK hospitality.",
    body: "From district pubs to West End dining rooms, the phone keeps ringing through service. Vox answers it — every time — so your team can stay on the floor.",
  },
  cities: {
    // Honest framing: these are the cities we're having pilot CONVERSATIONS
    // in, not cities we operate from. The links derive from intl/cities.ts.
    eyebrow: "Where we're starting",
    heading: "Pilot conversations, city by city.",
    body: "Vox works the same anywhere a phone rings, but hospitality doesn't sound the same in every city. These pages talk about yours specifically.",
  },
  copy: {
    // The UK regime is its own statute since Brexit (UK GDPR + DPA 2018); the
    // core facts strip says "GDPR", which on this tree would be the wrong law.
    trustFacts: {
      basis:
        "Legitimate interests (Article 6(1)(f) UK GDPR) for answering the enquiry you send us; consent for optional cookies, withdrawable at any time. Your rights are listed in the privacy notice.",
    },
    home: {
      title: "BitePerk — Vox, the AI phone host for UK restaurants",
      description:
        "Vox answers every restaurant call in a natural voice, checks real availability and books the table. Live in Australia today — now opening UK pilot partnerships.",
      h1: "The phone rings all through service. Let it be answered.",
      lede: "Sunday lunch, a full diary and three lines going at once — that is exactly when a booking gets missed. Vox picks up every call in a warm, natural voice, checks what you actually have free, and writes it straight into your diary.",
      proof: {
        eyebrow: "Shipped, not promised",
        heading: "Already answering, on the other side of the world.",
        body: "Vox is not a prototype waiting for a first customer. It runs live in Australia under the name VoxTable, handling real bookings for venues that pay for it — which is the only reason we are comfortable offering it here.",
        points: [
          "Picks up on the first ring, including at 9pm on a Saturday",
          "Checks the real diary before it promises a table",
          "Every call kept with a transcript, so nothing is hearsay",
          "One place to see what the phone did all week",
        ],
      },
      pilot: {
        eyebrow: "UK pilots",
        heading: "We're bringing Vox to the UK — with pilot partners, not promises.",
        body: "A British voice, a UK number and the diary software your venue already runs on are things we build with the first venues who put us on a real line — not things we claim before they exist.",
        points: [
          "You keep your number; a call-forward is the whole installation",
          "We agree what success looks like before the first call is answered",
          "Terms settled venue by venue — no rate card, nothing to cancel",
        ],
      },
      trust: {
        heading: "What we will and won't do",
        items: [
          {
            title: "Your team takes over the moment it matters",
            body: "A complaint, a large party, anything unusual — Vox hands the call to a person rather than improvising. Every conversation stays reviewable afterwards.",
          },
          {
            title: "UK GDPR, on its own terms",
            body: "The UK regime went its own way after Brexit and we treat it that way rather than assuming an EU answer covers it. Call data is processed to complete a booking, never to build a profile.",
          },
          {
            title: "We say what isn't built yet",
            body: "There is no UK number and no diary integration today. Those arrive through pilots, and you will hear that from us before you hear a pitch.",
          },
        ],
      },
      steps: {
        eyebrow: "How it works",
        heading: "Three things change. Nothing else does.",
        items: [
          {
            title: "Your number stays exactly as it is",
            body: "No new line, no handset, no app for the team to learn. You forward the calls you want covered — all of them, or only the ones that ring out — and that is the installation finished.",
          },
          {
            title: "Vox answers like a good host would",
            body: "It greets the caller, works out the date, the size of the party and anything awkward about it, and checks the diary while it talks rather than promising first and apologising later.",
          },
          {
            title: "The booking is in the diary before they hang up",
            body: "Confirmed covers land where your team already looks. The call, the transcript and the recording sit alongside them, so a disputed booking stops being one person's word against another's.",
          },
        ],
      },
      closing: {
        heading: "Put it on a real line",
        body: "Tell us how your Friday service actually sounds and we'll show you Vox handling a call like it.",
        cta: "Book a pilot",
      },
      faq: {
        heading: "What UK venues ask us",
        items: [
          {
            q: "Do you have a UK phone number yet?",
            a: "Not yet. Numbers here need an approved regulatory bundle, and that lands through the pilot programme. Until it does, a call-forward from your existing line does the job.",
          },
          {
            q: "Does it work with my diary software?",
            a: "Not today. No UK booking integration is built, and which one comes first is decided by the venues who join early. Tell us what you run.",
          },
          {
            q: "How do you handle the UK GDPR?",
            a: "That is a live piece of work, not a checkbox we have already ticked. The UK regime is separate from the EU one and we are treating it separately.",
          },
          {
            q: "Can it cope with a British accent?",
            a: "The voice and the listening are both tuned per market, and the UK build starts from pilot calls rather than from an Australian model we assume travels.",
          },
          {
            q: "Will my guests know it isn't a person?",
            a: "Yes — Vox says so when it answers. In our experience guests mind far less about that than about the phone ringing out.",
          },
        ],
      },
    },
    about: {
      title: "About BitePerk — who is behind Vox",
      h1: "A phone that gets answered, made by people who watched it ring out.",
      intro:
        "We are a small company in Sydney with one product and no ambition to turn it into a suite. Vox exists because missed calls are the most boring and most expensive problem in hospitality, and nobody had built a tool that simply picks up.",
      sections: [
        {
          heading: "What we actually sell",
          body: [
            "An answered phone. Not a platform, not a suite, not a transformation. A guest rings, something competent responds, the booking exists — that is the whole product, and it is deliberately narrow.",
          ],
        },
        {
          heading: "Why we're talking to British venues",
          body: [
            "Because the trade here runs thin on staff, keeps unforgiving hours, and never abandoned the telephone the way some markets did. The problem Vox solves is sharper in Britain than it is at home, which is a strange sort of compliment.",
          ],
        },
        {
          heading: "The unglamorous part",
          body: [
            // Still literally true after the UK incorporation — a registered
            // office is not staff — but beside a "Registered in England and
            // Wales" footer it read as a contradiction. Says both facts now.
            "No number here. No diary integration. No British staff — Biteperk Ltd is registered in London, but the people who answer you are in Sydney. What exists is software that provably works in another timezone and a short list of venues helping us make it work in this one. We would rather be dull about that now than impressive and wrong.",
          ],
        },
      ],
    },
    contact: {
      form: { venuePlaceholder: "e.g. The Copper Larder, Shoreditch" },
      title: "Contact BitePerk — UK restaurant pilots",
      description:
        "Tell us about your UK venue and we'll set up a conversation — and a live demonstration of Vox taking a booking.",
      intro:
        "Tell us about your venue and where in the UK you operate. We'll come back within a working day with a conversation — and a live demonstration of Vox taking a booking.",
    },

    // ── UK legal overrides ────────────────────────────────────────────────
    // Biteperk Ltd (company 17379647, registered in England and Wales) is the
    // contracting party and data controller for UK customers. That decision is
    // what these two overrides encode, and it is why they exist only here:
    // /be-en shares the EN core and correctly keeps Biteperk Pty Ltd, because
    // there is no Belgian entity.
    //
    // Review status (3 Sep 2026): COUNSEL-CONFIRMED. Checked sentence-by-
    // sentence against what functions/index.js does, then reviewed by Natalia
    // (Integrant) via the contact-form privacy packet — item 15 of legal pack
    // v3.0 — and passed as drafted on 3 Sep 2026, including all four questions
    // put to her (lawful basis Art 6(1)(f); publishing the honest "no
    // safeguard signed yet" transfer line rather than suspending the Zoho
    // push; the IDTA/TRA wording below; and 24-month retention without a
    // further review criterion). Verbal pass relayed by Sam — no written
    // opinion, which is the provenance if it is ever questioned.
    // The 2 Sep reCAPTCHA sentence is gone with the widget itself.
    //
    // NOTE: this does NOT discharge the TODO(legal) below. That one is gated
    // on the IDTA / UK Addendum + TRA actually being executed, not on review.
    //
    // `sections` is restated IN FULL rather than patched. merge() replaces
    // arrays wholesale (tests/unit/intl-merge.test.mjs) — supplying a partial
    // list would silently drop the sections it omits.
    privacy: {
      intro:
        "This notice covers biteperk.com for visitors in the United Kingdom. Biteperk Ltd is the controller of the personal data described here. It explains what we collect, why, the legal basis for it, and the rights you have under the UK GDPR.",
      sections: [
        {
          heading: "Who controls your data",
          body: [
            "Biteperk Ltd, a company registered in England and Wales (company number 17379647), registered office 124 City Road, London, England, EC1V 2NX, is the data controller for enquiries made through this site from the United Kingdom.",
            "Biteperk Ltd is a subsidiary of Biteperk Pty Ltd (Sydney, Australia), which operates this website and builds the Vox product. You can reach us about anything on this page at sales@biteperk.com.",
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
            "We rely on legitimate interests (Article 6(1)(f) UK GDPR) to answer a business enquiry you have chosen to send us — responding to it is what you asked for, and the data involved is limited to the enquiry itself. Where we place non-essential cookies we rely on your consent instead, which you can withdraw at any time through Cookie settings.",
          ],
        },
        {
          heading: "Where it goes, and transfers out of the UK",
          body: [
            "Form submissions are stored with our infrastructure provider, Google Cloud (Firestore, Australia region), entered into our Zoho CRM account (Zoho's Australian data centre) for follow-up, and sent to our team by notification email through Zoho Mail. That is a transfer of your personal data out of the United Kingdom, to Australia.",
            // TODO(legal): flip once the IDTA / UK Addendum + TRA are executed.
            "The United Kingdom has no adequacy regulations for Australia, so the transfer needs a safeguard under Article 46 UK GDPR. We are putting an International Data Transfer Agreement (or the UK Addendum to the EU standard contractual clauses) in place together with the transfer risk assessment that must accompany it. Until that is complete we keep the transfer limited to the enquiry itself. If you would rather not have your details leave the UK, email us instead of using the form and tell us so.",
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
            "Under the UK GDPR you have the right to ask us for a copy of your personal data, to have it corrected or erased, to have its use restricted, to object to our use of it where we rely on legitimate interests, and to receive it in a portable form. Write to sales@biteperk.com and we will act on it within one month.",
            "You also have the right to complain to the Information Commissioner's Office, the UK supervisory authority, at ico.org.uk or on 0303 123 1113. We would rather you came to us first, but you do not have to.",
          ],
        },
      ],
    },
    // The cookie policy is language-scoped in copy.ts, but its contact line
    // must match the UK controller story above (sales@biteperk.com, not the
    // AU hello@ address). Only the last section's email differs from the core.
    cookies: {
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
            "Questions about this policy, or about the personal data behind it, can go to sales@biteperk.com — the same address that handles data requests under our privacy notice.",
          ],
        },
      ],
    },
    terms: {
      intro:
        "These short terms cover the use of biteperk.com in the United Kingdom. Service agreements for pilots and deployments are separate documents, agreed per engagement.",
      sections: [
        {
          heading: "Who you are dealing with",
          body: [
            "For customers in the United Kingdom, the contracting party is Biteperk Ltd, a company registered in England and Wales (company number 17379647), registered office 124 City Road, London, England, EC1V 2NX. Full registered particulars are on our company details page.",
            "This website is operated by its parent, Biteperk Pty Ltd (Sydney, Australia). Content is provided for general information about our products and pilot programmes; it isn't an offer capable of acceptance, and product availability differs by market — what's live in Australia is labelled as such.",
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            "BitePerk, Vox, VoxTable and the associated logos and content on this site belong to Biteperk Pty Ltd. Don't reproduce them without permission.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "The site is provided as-is. To the extent permitted by law, BitePerk accepts no liability for decisions made on the basis of this site's content. Nothing in these terms limits liability that cannot lawfully be limited. Full commercial terms live in the pilot and service agreements.",
          ],
        },
        {
          heading: "Governing law",
          body: [
            "These terms and any dispute arising from them are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction.",
          ],
        },
        {
          heading: "Contact",
          body: ["Questions about these terms: sales@biteperk.com."],
        },
      ],
    },
  },
};

// ── France (/fr) — France-specific touches over the neutral FR core ─
const frFr: MarketContent = {
  callSim: true,
  hero: {
    slug: "bistro-red-velvet",
    alt: "Salle de bistrot aux murs rouges, une table dressée près de la fenêtre",
    pill: "France · Programme pilote",
  },
  media: {
    cityscape: {
      // Was `paris-skyline` (Eiffel Tower) until 7 Sep 2026 — Ludovic asked for
      // restaurant over tourism on the FR tree. Shares the Paris city page's
      // café-terrace shot, exactly as gb-en's market cityscape is london-skyline
      // (the flagship city's establishing shot); the home hides this slot once a
      // city is published (band goes hospitality-only), so a slug unique to this
      // slot would render nowhere and only add weight.
      slug: "paris-cafe-terrace",
      alt: "Terrasse de café parisien — store rayé et chaises de bistrot en rotin vert",
    },
    // Was `brasserie-banquette` until 7 Sep 2026 (still the Paris page's story
    // shot). A plated fine-dining dish is the "gastronomy" half of Ludovic's
    // brief. Below the fold and lazy, so its encode cost never competes with
    // the text LCP.
    hospitality: {
      slug: "french-gastronomy-plate",
      alt: "Assiette gastronomique dressée dans une lumière contrastée",
    },
    eyebrow: "Pour les établissements français",
    heading: "Pensé pour le rythme des services à la française.",
    body: "Du bistrot de quartier à la grande table, le téléphone sonne en plein coup de feu. Vox décroche — à chaque fois — pour que votre équipe reste en salle.",
  },
  // La bande de liens vers les villes. Texte propre, jamais une paraphrase de
  // beFr.cities : le pool français (/fr vs /be-fr) est déjà proche du plafond
  // de check-intl-similarity, et deux accueils qui récitent la même bande, c'est
  // ce qui grignote la marge. L'ajout déplace aussi le cityscape de la bande
  // marché dans les cartes ([...intl].astro) — la bande passe en mode
  // hospitalité seule, comme sur /gb-en.
  cities: {
    eyebrow: "Là où tout commence",
    heading: "Une ville après l'autre, sur de vraies lignes.",
    body: "Un pilote, c'est une conversation avec une salle précise dans une rue précise, pas un lancement. Voici les villes où ces conversations sont ouvertes.",
  },
  copy: {
    home: {
      title: "BitePerk — Vox, l'hôte téléphonique IA pour les restaurants en France",
      description:
        "Vox répond à chaque appel de votre restaurant d'une voix naturelle, vérifie les disponibilités réelles et enregistre la réservation. En production en Australie — pilotes ouverts en France.",
      h1: "Le téléphone sonne pendant le service. Qu'il trouve une réponse.",
      lede: "Au plus fort du service, le téléphone continue de sonner — et c'est précisément là qu'une réservation se perd. Vox décroche d'une voix posée, vérifie ce qui reste réellement disponible et inscrit le couvert au registre.",
      proof: {
        eyebrow: "En service, pas en promesse",
        heading: "Déjà à l'œuvre, à l'autre bout du monde.",
        body: "Vox n'attend pas son premier client. Sous le nom VoxTable, il tourne en Australie et prend de vraies réservations pour des établissements qui le paient — c'est la seule raison pour laquelle nous osons le proposer ici.",
        points: [
          "Décroche dès la première sonnerie, y compris un samedi à 21 h",
          "Consulte le registre avant de promettre une table",
          "Chaque appel conservé, avec sa transcription",
          "Une vue d'ensemble de ce que le téléphone a réellement produit",
        ],
      },
      pilot: {
        eyebrow: "Pilotes en France",
        heading: "Nous amenons Vox en France — avec des partenaires pilotes, pas des promesses.",
        body: "Une voix française naturelle, un numéro français et le logiciel de réservation que vous utilisez déjà : ce sont des choses que nous construisons avec les premiers établissements qui nous mettent sur une vraie ligne, pas des choses que nous annonçons avant qu'elles existent.",
        points: [
          "Vous gardez votre numéro : un simple renvoi suffit à l'installation",
          "Nous définissons ensemble ce qu'est une réussite, avant le premier appel",
          "Conditions arrêtées établissement par établissement — ni grille, ni engagement",
        ],
      },
      trust: {
        heading: "Ce que nous faisons, et ce que nous ne ferons pas",
        items: [
          {
            title: "La main repasse à votre équipe quand il le faut",
            body: "Une réclamation, un grand groupe, une demande inhabituelle : Vox transmet l'appel plutôt que d'improviser. Chaque conversation reste consultable ensuite.",
          },
          {
            title: "RGPD, et le règlement européen sur l'IA",
            // French DISCHARGED — citation clause; verbal pass from Ludovic,
            // confirmed by Sam 7 Sep 2026; see this file's header.
            body: "Un agent vocal qui parle à des clients relève des obligations de transparence du règlement européen sur l'IA (article 50 du règlement (UE) 2024/1689). Nous le traitons comme une contrainte de conception, pas comme une mention en bas de page.",
          },
          {
            title: "Nous disons ce qui n'existe pas encore",
            body: "Aujourd'hui : pas de numéro français, aucune intégration à un logiciel de réservation. Cela arrive par les pilotes, et vous l'entendrez de nous avant d'entendre un argumentaire.",
          },
        ],
      },
      steps: {
        eyebrow: "Comment ça marche",
        heading: "Trois choses changent. Rien d'autre.",
        items: [
          {
            title: "Votre numéro ne bouge pas",
            body: "Aucune nouvelle ligne, aucun poste, aucune application à faire adopter à l'équipe. Vous renvoyez les appels que vous souhaitez couvrir — tous, ou seulement ceux qui sonnent dans le vide.",
          },
          {
            title: "Vox répond comme le ferait un bon maître d'hôtel",
            body: "Il accueille l'appelant, établit la date, le nombre de couverts et les détails délicats, et consulte le registre pendant qu'il parle — plutôt que de promettre d'abord et s'excuser ensuite.",
          },
          {
            title: "La réservation est inscrite avant que l'appelant raccroche",
            body: "Les couverts confirmés arrivent là où votre équipe regarde déjà. L'appel, sa transcription et son enregistrement les accompagnent : une réservation contestée cesse d'être parole contre parole.",
          },
        ],
      },
      closing: {
        heading: "Mettez-le sur une vraie ligne",
        body: "Racontez-nous à quoi ressemble vraiment un vendredi soir chez vous, et nous vous ferons entendre Vox sur un appel de ce genre.",
        cta: "Réserver un pilote",
      },
      faq: {
        heading: "Ce que nous demandent les restaurateurs",
        items: [
          {
            q: "Avez-vous déjà un numéro français ?",
            a: "Pas encore. Un numéro en France exige un dossier réglementaire validé, et cela passe par le programme pilote. En attendant, un renvoi depuis votre ligne actuelle suffit.",
          },
          {
            q: "Vous connectez-vous à mon logiciel de réservation ?",
            a: "Pas aujourd'hui. Aucune intégration française n'est développée, et l'ordre de priorité sera décidé par les établissements qui rejoignent le programme les premiers.",
          },
          {
            q: "Où sont hébergées les données des appels ?",
            a: "Aujourd'hui hors de l'Union européenne, ce qui suppose un encadrement contractuel. Un hébergement européen fait partie de ce que nous mettons en place pour ce marché.",
          },
          {
            q: "Le client saura-t-il qu'il parle à une IA ?",
            a: "Oui, dès le début de l'appel. Le règlement européen sur l'IA l'exige, et nous considérons de toute façon que c'est la seule façon correcte de procéder.",
          },
          {
            q: "Vox comprend-il vraiment le français parlé au téléphone ?",
            a: "C'est précisément ce qu'un pilote mesure. La voix et la compréhension sont réglées marché par marché, à partir d'appels réels et non d'un modèle australien supposé voyager.",
          },
        ],
      },
    },
    about: {
      title: "À propos de BitePerk — qui construit Vox",
      h1: "Un téléphone auquel on répond, conçu par des gens qui l'ont vu sonner dans le vide.",
      // French DISCHARGED — the "aucune envie d'en avoir cinq" → suite rewording;
      // verbal pass from Ludovic, confirmed by Sam 7 Sep 2026; see this file's header.
      intro:
        "Nous sommes une petite maison sydneysienne avec un seul produit et aucune envie d'en faire une suite. Vox est né d'un constat sans gloire : l'appel manqué est ce qui coûte le plus cher en salle, et personne n'avait fait l'outil qui se contente de décrocher.",
      sections: [
        {
          heading: "Ce que nous vendons, très exactement",
          body: [
            "Un téléphone auquel on répond. Ni plateforme, ni suite logicielle, ni transformation numérique. Quelqu'un appelle, une voix compétente répond, la réservation existe : c'est tout le produit, et cette étroitesse est volontaire.",
          ],
        },
        {
          heading: "Pourquoi nous frappons à la porte des restaurateurs français",
          body: [
            "Parce qu'ici le téléphone n'a jamais cédé la place au tout-numérique, que le service se joue à quelques minutes près, et qu'une réservation prise de travers se paie en salle le soir même. Le problème que Vox résout y est plus aigu qu'ailleurs.",
          ],
        },
        {
          heading: "La partie sans panache",
          body: [
            "Aucun numéro français. Aucune intégration. Aucune équipe sur place. Ce qui existe : un logiciel qui fonctionne réellement à l'autre bout du monde, et quelques établissements qui nous aident à le faire fonctionner ici. Autant l'annoncer platement maintenant.",
          ],
        },
      ],
    },
    // CNIL is the French supervisory authority; this is the only sentence that
    // differs from the FR core (see privacyNaming). New French of 3 Sep 2026 —
    // verbal pass from Ludovic, confirmed by Sam 3 Sep 2026 (see copy.ts header).
    privacy: {
      sections: privacyNaming(
        "fr",
        "Vous avez également le droit d'introduire une réclamation auprès de la CNIL, l'autorité de contrôle française, sur cnil.fr. Nous préférerions que vous vous adressiez d'abord à nous, mais rien ne vous y oblige.",
      ),
    },
    contact: {
      title: "Contacter BitePerk — pilotes en France",
      description:
        "Parlez-nous de votre établissement en France : nous organiserons un échange et une démonstration en direct de Vox.",
      intro:
        "Parlez-nous de votre établissement et de votre ville. Nous revenons vers vous sous un jour ouvré, avec un échange — et une démonstration en direct de Vox prenant une réservation.",
    },
  },
};

// ── Belgium — English (/be-en) ──────────────────────────────────────
const beEn: MarketContent = {
  hero: {
    slug: "brasserie-banquette",
    alt: "A blue velvet banquette and marble tables laid for service",
    pill: "Belgium · Pilot programme",
  },
  media: {
    cityscape: {
      slug: "brussels-grand-place",
      alt: "The guild houses of the Grand-Place in Brussels",
    },
    hospitality: {
      slug: "cafe-continental",
      alt: "A relaxed continental café interior between services",
    },
    eyebrow: "For venues in Belgium",
    heading: "Built for Belgium's table culture.",
    body: "From Brussels brasseries to canal-side cafés, the phone rings right through service. Vox answers it — in French or English — so your team can stay with their guests.",
  },
  // The city-links strip. Fresh copy, NOT a paraphrase of gbEn.cities: the
  // English home pool (/en vs /gb-en vs /be-en) runs 26–28% against a 35%
  // ceiling in check-intl-similarity, and three homes reciting one strip is
  // how that margin gets spent. Adding this also moves the market band's
  // cityscape into the cards ([...intl].astro:323) — the band goes
  // hospitality-only here, exactly as /gb-en's does.
  cities: {
    eyebrow: "Where it starts",
    heading: "One city at a time, on real lines.",
    body: "A pilot is a conversation with a particular room in a particular street, not a launch. This is where those conversations are open.",
  },
  copy: {
    // cityPage.en was written when cities were a /gb-en-only feature and says
    // "the UK" in two visible places. merge() recurses plain objects, so this
    // overrides three keys and inherits the rest.
    //
    // othersEyebrow/othersHeading are dead while Brussels is the only Belgian
    // city — CityBody gates that section on otherCities.length — but they are
    // set now so a future Antwerp cannot silently inherit UK copy.
    cityPage: {
      districtsNote:
        "Not on the list? The pilot programme isn't drawn on a map — a venue anywhere in Belgium works exactly the same way.",
      othersEyebrow: "Elsewhere in Belgium",
      othersHeading: "Also in pilot conversations with venues in",
    },
    home: {
      title: "BitePerk — Vox, the AI phone host for restaurants in Belgium",
      description:
        "Vox answers every restaurant call in a natural voice, checks real availability and books the table. Live in Australia today — now opening pilot partnerships in Belgium.",
      h1: "One line. Two languages. Every booking taken.",
      lede: "A Brussels dining room answers in French to one caller and English to the next, and nobody knows which is coming. Vox handles that switch mid-service, checks what is genuinely free, and records the booking.",
      proof: {
        eyebrow: "Shipped, not promised",
        heading: "Already answering, on the other side of the world.",
        body: "Vox is not waiting for its first customer. As VoxTable it runs in Australia, taking real bookings for venues that pay for it — which is why we are willing to bring it to a market as demanding as this one.",
        points: [
          "Answers on the first ring, at any hour of service",
          "Checks the real book before promising a table",
          "Every call kept, with a transcript to settle any dispute",
          "One view of what the phone actually did this week",
        ],
      },
      pilot: {
        eyebrow: "Belgium pilots",
        heading: "We're bringing Vox to Belgium — with pilot partners, not promises.",
        body: "Two languages on one number, Belgian numbering and the booking software your venue already runs are things we build alongside the first venues willing to put us on a live line — not claims we make in advance of them.",
        points: [
          "Keep your number; a forward is the entire installation",
          "We agree what a good result looks like before the first call",
          "Terms settled venue by venue — no price list, nothing to cancel",
        ],
      },
      trust: {
        heading: "What we will and won't do",
        items: [
          {
            title: "A person takes over when the call needs one",
            body: "Complaints, large tables, anything out of the ordinary — Vox passes the call rather than guessing. Every conversation stays reviewable afterwards.",
          },
          {
            title: "GDPR and the EU AI Act",
            body: "A voice agent speaking to consumers falls squarely under the AI Act's transparency duties (Article 50, Regulation (EU) 2024/1689). We treat that as a design constraint rather than a footnote, and call data serves the booking, not a profile.",
          },
          {
            title: "Language is not an afterthought here",
            body: "Belgium is not a French market with English bolted on, and we will not ship it that way. Which languages a venue actually needs is one of the first things a pilot establishes.",
          },
        ],
      },
      steps: {
        eyebrow: "How it works",
        heading: "One forward, and the line is covered.",
        items: [
          {
            title: "Keep the number your guests already have",
            body: "Nothing is installed in the venue and nobody has to learn a new screen. You choose whether Vox covers every call or only the ones nobody reaches in time.",
          },
          {
            title: "It answers, and it picks up the language",
            body: "The caller speaks; Vox follows them into French or English and stays there. It works out the date, the number of people and the awkward details, checking what is free as the conversation goes.",
          },
          {
            title: "It lands in the book, with the recording attached",
            body: "Confirmed covers arrive where your staff already look, each one carrying the call, the transcript and the recording — so a contested reservation has an answer.",
          },
        ],
      },
      closing: {
        heading: "Try it on a bilingual line",
        body: "Tell us which languages arrive on your phone in a normal week, and we'll put Vox on a call that sounds like one.",
        cta: "Book a pilot",
      },
      faq: {
        heading: "What Belgian venues ask us",
        items: [
          {
            q: "Can it really switch between French and English?",
            a: "Handling both on one line is the specific thing a Belgian pilot is built to prove. We would rather demonstrate it on your calls than assert it on a website.",
          },
          {
            q: "What about Dutch?",
            a: "Not built. Serving Flanders properly means Dutch, and that is a real commitment rather than a toggle — it follows demand from venues, not the other way round.",
          },
          {
            q: "Do you have a Belgian number?",
            a: "Not yet. Numbers here need an approved regulatory bundle, which comes through the pilot programme. A forward from your existing line works in the meantime.",
          },
          {
            q: "Where is call data stored?",
            a: "Outside the EU today, which requires contractual safeguards. A European data path is part of what we are putting in place for this market.",
          },
          {
            q: "Will guests be told it's an AI?",
            a: "Yes, at the start of the call. The EU AI Act requires it for consumer-facing agents, and we would do it regardless.",
          },
        ],
      },
    },
    about: {
      title: "About BitePerk — and why we chose a hard market",
      h1: "Most voice tools assume one language. That assumption breaks here.",
      intro:
        "BitePerk is a Sydney company with a single product: an AI that answers a restaurant's telephone. Bringing it to a country where a caller might open in either of two languages is the most demanding test we could have picked, which is rather the point.",
      sections: [
        {
          heading: "The test we set ourselves",
          body: [
            "Elsewhere, multilingual handling is a feature request filed for later. In a Brussels dining room it is an ordinary Tuesday lunchtime. Software that copes here copes almost anywhere — and software that does not deserves to be found out early.",
          ],
        },
        {
          heading: "Small enough that your feedback lands",
          body: [
            "You would be speaking to the people who write the code. At this stage the partner list is short enough that one venue's account of a bilingual service genuinely reorders what gets built the following week.",
          ],
        },
        {
          heading: "What does not exist yet",
          body: [
            "A Belgian number. Any booking integration. Dutch. Those are absences, not roadmap items with dates attached, and you will hear about them from us rather than discovering them in month two.",
          ],
        },
      ],
    },
    // The Belgian supervisory authority (APD/GBA) is the only sentence that
    // differs from the EN core (see privacyNaming).
    privacy: {
      sections: privacyNaming(
        "en",
        "You also have the right to complain to the Belgian Data Protection Authority (APD/GBA), the supervisory authority in Belgium, at dataprotectionauthority.be. We would rather you came to us first, but you do not have to.",
      ),
    },
    contact: {
      form: { venuePlaceholder: "e.g. Maison Verte, Brussels" },
      title: "Contact BitePerk — Belgium restaurant pilots",
      description:
        "Tell us about your venue in Belgium and we'll set up a conversation — and a live demonstration of Vox taking a booking.",
      intro:
        "Tell us about your venue and where in Belgium you operate. We'll come back within a working day with a conversation — and a live demonstration of Vox taking a booking.",
    },
  },
};

// ── Belgique — Français (/be-fr) ────────────────────────────────────
const beFr: MarketContent = {
  hero: {
    slug: "brasserie-banquette",
    alt: "Banquette en velours bleu et tables en marbre dressées pour le service",
    pill: "Belgique · Programme pilote",
  },
  media: {
    cityscape: {
      slug: "brussels-grand-place",
      alt: "Les maisons de guilde de la Grand-Place de Bruxelles",
    },
    hospitality: {
      slug: "cafe-continental",
      alt: "L'intérieur d'un café continental entre deux services",
    },
    eyebrow: "Pour les établissements belges",
    heading: "Pensé pour la culture de table belge.",
    body: "De la brasserie bruxelloise au café de quartier, le téléphone sonne en plein service. Vox décroche — en français comme en anglais — pour que votre équipe reste auprès de ses clients.",
  },
  // Texte propre, distinct de frFr.cities : les deux accueils français
  // ( /fr et /be-fr ) sont comparés ensemble par check-intl-similarity, donc
  // cette bande ne doit pas reprendre les mots de la version française.
  cities: {
    eyebrow: "Nos premières adresses",
    heading: "Un établissement à la fois, sur la ligne bien réelle.",
    body: "Le pilote se joue au téléphone d'une adresse précise, jamais dans une annonce. Ces pages parlent de la vôtre en particulier.",
  },
  copy: {
    home: {
      title: "BitePerk — Vox, l'hôte téléphonique IA pour les restaurants en Belgique",
      description:
        "Vox répond à chaque appel de votre restaurant d'une voix naturelle, vérifie les disponibilités réelles et enregistre la réservation. En production en Australie — pilotes ouverts en Belgique.",
      h1: "Une seule ligne. Deux langues. Aucune réservation perdue.",
      lede: "Une salle bruxelloise répond en français à un appel et en anglais au suivant, sans jamais savoir lequel arrive. Vox gère ce basculement en plein service, vérifie ce qui reste réellement libre et enregistre la réservation.",
      proof: {
        eyebrow: "Une preuve, pas un argumentaire",
        heading: "Un produit qui tourne, ailleurs, depuis un moment.",
        body: "Rien ici n'est une maquette. VoxTable prend chaque jour des réservations pour des restaurants australiens qui paient pour ce service — et c'est cette expérience, pas une promesse, que nous proposons d'éprouver dans une salle bilingue.",
        points: [
          "Répond immédiatement, même au plus fort du coup de feu",
          "Vérifie la disponibilité réelle avant d'engager une table",
          "Conserve l'appel et sa transcription, utile en cas de contestation",
          "Restitue enfin ce que le téléphone rapporte, semaine après semaine",
        ],
      },
      pilot: {
        eyebrow: "Pilotes en Belgique",
        heading: "Nous amenons Vox en Belgique — avec des partenaires pilotes, pas des promesses.",
        body: "Deux langues sur un même numéro, une numérotation belge et le logiciel de réservation que vous utilisez déjà : nous les construisons avec les premiers établissements qui acceptent de nous mettre sur une ligne réelle, et non avant.",
        points: [
          "Vous gardez votre numéro : un renvoi constitue toute l'installation",
          "Nous convenons de ce qu'est un bon résultat avant le premier appel",
          "Conditions arrêtées établissement par établissement — ni tarif affiché, ni engagement",
        ],
      },
      trust: {
        heading: "Ce que nous faisons, et ce que nous ne ferons pas",
        items: [
          {
            title: "Un humain reprend l'appel quand il le faut",
            body: "Réclamation, grande tablée, demande inhabituelle : Vox transmet plutôt que de deviner. Chaque conversation reste consultable ensuite.",
          },
          {
            title: "RGPD et règlement européen sur l'IA",
            // French DISCHARGED — citation clause; verbal pass from Ludovic,
            // confirmed by Sam 7 Sep 2026; see this file's header.
            body: "Un agent vocal qui s'adresse à des consommateurs relève pleinement des obligations de transparence du règlement sur l'IA — son article 50, dans le règlement (UE) 2024/1689. Nous en faisons une contrainte de conception, et les données d'appel servent la réservation, pas un profil.",
          },
          {
            title: "Ici, la langue n'est pas un détail",
            body: "La Belgique n'est pas un marché français avec de l'anglais ajouté par-dessus, et nous refusons de la traiter ainsi. Les langues réellement nécessaires à votre salle sont l'une des premières choses qu'un pilote établit.",
          },
        ],
      },
      steps: {
        eyebrow: "Comment ça marche",
        heading: "Un renvoi, et la ligne est couverte.",
        items: [
          {
            title: "Gardez le numéro que vos clients connaissent",
            body: "Rien n'est installé dans l'établissement et personne n'a de nouvel écran à apprendre. Vous décidez si Vox prend tous les appels ou seulement ceux que personne n'atteint à temps.",
          },
          {
            title: "Il décroche, et suit la langue de l'appelant",
            body: "L'appelant parle ; Vox le suit en français ou en anglais et s'y tient. Il établit la date, le nombre de personnes et les détails délicats, en vérifiant au fil de la conversation ce qui reste libre.",
          },
          {
            title: "Tout arrive au registre, enregistrement compris",
            body: "Les couverts confirmés apparaissent là où votre équipe regarde déjà, chacun accompagné de l'appel, de sa transcription et de son enregistrement — une réservation contestée trouve donc sa réponse.",
          },
        ],
      },
      closing: {
        heading: "Essayez-le sur une ligne bilingue",
        body: "Dites-nous quelles langues arrivent sur votre téléphone en une semaine ordinaire, et nous mettrons Vox sur un appel qui y ressemble.",
        cta: "Réserver un pilote",
      },
      faq: {
        heading: "Ce que nous demandent les établissements belges",
        items: [
          {
            q: "Peut-il vraiment passer du français à l'anglais ?",
            a: "Gérer les deux sur une même ligne est précisément ce qu'un pilote belge doit démontrer. Nous préférons le prouver sur vos appels plutôt que l'affirmer sur un site.",
          },
          {
            q: "Et le néerlandais ?",
            a: "Pas développé. Servir correctement la Flandre suppose le néerlandais, et c'est un engagement réel, pas une case à cocher : il suivra la demande des établissements.",
          },
          {
            q: "Avez-vous un numéro belge ?",
            a: "Pas encore. Un numéro belge exige un dossier réglementaire validé, obtenu via le programme pilote. Un renvoi depuis votre ligne actuelle fait l'affaire entre-temps.",
          },
          {
            q: "Où sont hébergées les données d'appel ?",
            a: "Hors de l'Union européenne aujourd'hui, ce qui impose un encadrement contractuel. Un hébergement européen fait partie de ce que nous mettons en place pour ce marché.",
          },
          {
            q: "Le client sera-t-il informé qu'il parle à une IA ?",
            a: "Oui, dès le début de l'appel. Le règlement européen sur l'IA l'impose pour les agents destinés au public, et nous le ferions de toute manière.",
          },
        ],
      },
    },
    about: {
      title: "À propos de BitePerk — et pourquoi un marché difficile",
      h1: "La plupart des outils vocaux supposent une seule langue. Ici, l'hypothèse tombe.",
      intro:
        "BitePerk est une société sydneysienne dotée d'un unique produit : une IA qui répond au téléphone d'un restaurant. L'amener dans un pays où l'appelant peut ouvrir la conversation dans l'une ou l'autre langue constitue l'épreuve la plus sévère que nous pouvions choisir — et c'est précisément l'intérêt.",
      sections: [
        {
          heading: "L'épreuve que nous nous sommes imposée",
          body: [
            "Ailleurs, le multilingue est une demande d'évolution repoussée à plus tard. Dans une salle bruxelloise, c'est un mardi midi comme les autres. Un logiciel qui tient ici tient à peu près partout ; celui qui ne tient pas mérite d'être démasqué tôt.",
          ],
        },
        {
          heading: "Assez petits pour que votre avis pèse",
          body: [
            "Vous parleriez aux personnes qui écrivent le code. À ce stade, la liste des partenaires est assez courte pour qu'un seul récit de service bilingue réordonne ce qui sera développé la semaine suivante.",
          ],
        },
        {
          heading: "Ce qui n'existe pas encore",
          body: [
            "Un numéro belge. La moindre intégration. Le néerlandais. Ce sont des absences, non des jalons datés sur une feuille de route, et vous l'apprendrez de nous plutôt qu'au deuxième mois.",
          ],
        },
      ],
    },
    // The Belgian supervisory authority (APD/GBA) is the only sentence that
    // differs from the FR core (see privacyNaming). New French of 3 Sep 2026 —
    // verbal pass from Ludovic, confirmed by Sam 3 Sep 2026 (see copy.ts header).
    privacy: {
      sections: privacyNaming(
        "fr",
        "Vous avez également le droit d'introduire une réclamation auprès de l'Autorité de protection des données (APD/GBA), l'autorité de contrôle belge, sur autoriteprotectiondonnees.be. Nous préférerions que vous vous adressiez d'abord à nous, mais rien ne vous y oblige.",
      ),
    },
    contact: {
      form: { venuePlaceholder: "ex. Maison Verte, Bruxelles" },
      title: "Contacter BitePerk — pilotes en Belgique",
      description:
        "Parlez-nous de votre établissement en Belgique : nous organiserons un échange et une démonstration en direct de Vox.",
      intro:
        "Parlez-nous de votre établissement et de votre ville. Nous revenons vers vous sous un jour ouvré, avec un échange — et une démonstration en direct de Vox prenant une réservation.",
    },
  },
};

/**
 * Market content per locale base. /en now has an entry — a hero only, no band
 * and no pill — so the x-default is no longer the one tree with zero imagery.
 */
export const marketContent: Partial<Record<Locale["base"], MarketContent>> = {
  "/en": enNeutral,
  "/gb-en": gbEn,
  "/fr": frFr,
  "/be-en": beEn,
  "/be-fr": beFr,
};
