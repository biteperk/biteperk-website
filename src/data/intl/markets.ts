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

export type MarketContent = {
  copy?: Override<CopyBundle>;
  /** Absent (e.g. /en) → the home renders no market band. */
  media?: MarketMedia;
  /** Absent → the hero renders text-only, as every tree did before Jul 2026. */
  hero?: MarketHero;
  /** Absent → no supporting image. Only trees WITHOUT a `media` band need one. */
  support?: MarketSupport;
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
  hero: {
    // Was `pub-amber-evening`: chairs stacked on tables under a heavy red cast,
    // shot through glass with the reflections still in frame. A venue shut for
    // the night, sitting beside a headline that promises the phone gets
    // answered DURING service — the picture argued against the copy.
    slug: "dining-room-pendants",
    alt: "A dining room open for service, pendant lights over set tables",
    pill: "United Kingdom · Pilot programme",
  },
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
            q: "Is this UK GDPR compliant?",
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
        "We are a small company in Sydney with one product and no ambition to have five. Vox exists because missed calls are the most boring and most expensive problem in hospitality, and nobody had built a tool that simply picks up.",
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
            "No number here. No diary integration. No British staff. What exists is software that provably works in another timezone and a short list of venues helping us make it work in this one. We would rather be dull about that now than impressive and wrong.",
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
  },
};

// ── France (/fr) — France-specific touches over the neutral FR core ─
const frFr: MarketContent = {
  hero: {
    slug: "bistro-red-velvet",
    alt: "Salle de bistrot aux murs rouges, une table dressée près de la fenêtre",
    pill: "France · Programme pilote",
  },
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
            body: "Un agent vocal qui parle à des clients relève des obligations de transparence du règlement européen sur l'IA. Nous le traitons comme une contrainte de conception, pas comme une mention en bas de page.",
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
      intro:
        "Nous sommes une petite maison sydneysienne avec un seul produit et aucune envie d'en avoir cinq. Vox est né d'un constat sans gloire : l'appel manqué est ce qui coûte le plus cher en salle, et personne n'avait fait l'outil qui se contente de décrocher.",
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
  copy: {
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
            body: "A voice agent speaking to consumers falls squarely under the AI Act's transparency duties. We treat that as a design constraint rather than a footnote, and call data serves the booking, not a profile.",
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
            body: "Un agent vocal qui s'adresse à des consommateurs relève pleinement des obligations de transparence du règlement sur l'IA. Nous en faisons une contrainte de conception, et les données d'appel servent la réservation, pas un profil.",
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
