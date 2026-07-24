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
 *   - NO AU pricing, NO AU phone numbers, NO Haymarket NAP.
 *   - NO fake local offices — market pages localise the *conversation*
 *     (pilot framing, city imagery, spelling), never invent a presence.
 *   - What is live is Australia; Europe is the pilot programme.
 *
 * ⚠️ The /fr and /be-fr overrides are French — Ludovic's native review gates
 * launch, same as the FR core.
 */
import type { Locale } from "@/data/locales";
import type { CopyBundle, Override } from "./index";

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

export type MarketContent = {
  copy?: Override<CopyBundle>;
  /** Absent (e.g. /en) → the home renders no market band. */
  media?: MarketMedia;
};

// ── United Kingdom (/gb-en) ─────────────────────────────────────────
const gbEn: MarketContent = {
  media: {
    cityscape: {
      slug: "london-skyline",
      alt: "Aerial view of London — Tower Bridge and the Thames winding toward the City",
    },
    hospitality: {
      slug: "bar-moody",
      alt: "A moody bar counter set and quiet before evening service",
    },
    eyebrow: "For UK venues",
    heading: "Built for the pace of UK hospitality.",
    body: "From district pubs to West End dining rooms, the phone keeps ringing through service. Vox answers it — every time — so your team can stay on the floor.",
  },
  copy: {
    home: {
      title: "BitePerk — Vox, the AI phone host for UK restaurants",
      description:
        "Vox answers every restaurant call in a natural voice, checks real availability and books the table. Live in Australia today — now opening UK pilot partnerships.",
      lede: "Vox answers your restaurant's phone in a warm, natural voice — day and night, mid-service, on the line your guests already call. It checks real availability and writes the booking straight into your diary.",
      pilot: {
        eyebrow: "UK pilots",
        heading: "We're bringing Vox to the UK — with pilot partners, not promises.",
        body: "The UK build — British voice, UK numbers, the integrations your venue already runs on — is what we develop together with our first pilot venues. Pilot partners get direct access to the team building it and shape what Vox becomes in the UK market.",
        points: [
          "Structured pilot with clear success criteria, defined together",
          "Direct line to the founding team throughout",
          "Commercial terms agreed per pilot — no rate card, no lock-in",
        ],
      },
    },
    contact: {
      title: "Contact BitePerk — UK restaurant pilots",
      description:
        "Tell us about your UK venue and we'll set up a conversation — and a live demonstration of Vox taking a booking.",
      intro:
        "Tell us about your venue and where in the UK you operate. We'll come back within a working day with a conversation — and a live demonstration of Vox taking a booking.",
    },
  },
};

// ── France (/fr) — France-specific touches over the neutral FR core ─
const frFr: MarketContent = {
  media: {
    cityscape: {
      slug: "paris-skyline",
      alt: "La tour Eiffel au-dessus de la Seine au crépuscule",
    },
    hospitality: {
      slug: "paris-street",
      alt: "Une rue pavée de Paris au pied de la tour Eiffel",
    },
    eyebrow: "Pour les établissements français",
    heading: "Pensé pour le rythme des services à la française.",
    body: "Du bistrot de quartier à la grande table, le téléphone sonne en plein coup de feu. Vox décroche — à chaque fois — pour que votre équipe reste en salle.",
  },
  copy: {
    home: {
      title: "BitePerk — Vox, l'hôte téléphonique IA pour les restaurants en France",
      description:
        "Vox répond à chaque appel de votre restaurant d'une voix naturelle, vérifie les disponibilités réelles et enregistre la réservation. En production en Australie — pilotes ouverts en France.",
      pilot: {
        eyebrow: "Pilotes en France",
        heading: "Nous amenons Vox en France — avec des partenaires pilotes, pas des promesses.",
        body: "La version française — voix française naturelle, numéros français, intégrations locales — se construit avec nos premiers établissements pilotes en France. Les partenaires pilotes travaillent directement avec l'équipe qui la développe.",
        points: [
          "Pilote structuré, avec des critères de réussite définis ensemble",
          "Accès direct à l'équipe fondatrice tout au long du pilote",
          "Conditions commerciales convenues par pilote — sans grille tarifaire, sans engagement",
        ],
      },
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
  media: {
    cityscape: {
      slug: "belgium-dinant",
      alt: "Riverside townhouses on the Meuse at Dinant, Belgium",
    },
    hospitality: {
      slug: "cafe-continental",
      alt: "A relaxed continental café interior between services",
    },
    eyebrow: "For venues in Belgium",
    heading: "Built for Belgium's table culture.",
    body: "From Brussels brasseries to canal-side cafés, the phone rings right through service. Vox answers it — in French or English — so your team can stay with their guests.",
  },
  copy: {
    home: {
      title: "BitePerk — Vox, the AI phone host for restaurants in Belgium",
      description:
        "Vox answers every restaurant call in a natural voice, checks real availability and books the table. Live in Australia today — now opening pilot partnerships in Belgium.",
      pilot: {
        eyebrow: "Belgium pilots",
        heading: "We're bringing Vox to Belgium — with pilot partners, not promises.",
        body: "The Belgian build — French and English on one line, Belgian numbers, local integrations — is what we develop together with our first pilot venues in Brussels and beyond. Pilot partners get direct access to the team building it.",
        points: [
          "Structured pilot with clear success criteria, defined together",
          "Direct line to the founding team throughout",
          "Commercial terms agreed per pilot — no rate card, no lock-in",
        ],
      },
    },
    contact: {
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
  media: {
    cityscape: {
      slug: "belgium-dinant",
      alt: "Maisons en bord de Meuse à Dinant, en Belgique",
    },
    hospitality: {
      slug: "cafe-continental",
      alt: "L'intérieur d'un café continental entre deux services",
    },
    eyebrow: "Pour les établissements belges",
    heading: "Pensé pour la culture de table belge.",
    body: "De la brasserie bruxelloise au café de quartier, le téléphone sonne en plein service. Vox décroche — en français comme en anglais — pour que votre équipe reste auprès de ses clients.",
  },
  copy: {
    home: {
      title: "BitePerk — Vox, l'hôte téléphonique IA pour les restaurants en Belgique",
      description:
        "Vox répond à chaque appel de votre restaurant d'une voix naturelle, vérifie les disponibilités réelles et enregistre la réservation. En production en Australie — pilotes ouverts en Belgique.",
      pilot: {
        eyebrow: "Pilotes en Belgique",
        heading: "Nous amenons Vox en Belgique — avec des partenaires pilotes, pas des promesses.",
        body: "La version belge — le français et l'anglais sur une même ligne, numéros belges, intégrations locales — se construit avec nos premiers établissements pilotes, à Bruxelles et au-delà. Les partenaires pilotes travaillent directement avec l'équipe qui la développe.",
        points: [
          "Pilote structuré, avec des critères de réussite définis ensemble",
          "Accès direct à l'équipe fondatrice tout au long du pilote",
          "Conditions commerciales convenues par pilote — sans grille tarifaire, sans engagement",
        ],
      },
    },
    contact: {
      title: "Contacter BitePerk — pilotes en Belgique",
      description:
        "Parlez-nous de votre établissement en Belgique : nous organiserons un échange et une démonstration en direct de Vox.",
      intro:
        "Parlez-nous de votre établissement et de votre ville. Nous revenons vers vous sous un jour ouvré, avec un échange — et une démonstration en direct de Vox prenant une réservation.",
    },
  },
};

/** Market content per locale base. /en has no entry — it stays the neutral x-default. */
export const marketContent: Partial<Record<Locale["base"], MarketContent>> = {
  "/gb-en": gbEn,
  "/fr": frFr,
  "/be-en": beEn,
  "/be-fr": beFr,
};
