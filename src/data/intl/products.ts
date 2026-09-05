/**
 * Product copy for the international locale trees.
 *
 * STRUCTURE comes from src/data/products.ts (the SSOT: slugs, order, status,
 * which capability is `core`); only the PROSE lives here. Adding a product
 * there and forgetting it here fails the build — see PRODUCT_PAGES in
 * locales.ts and the registry check in [...intl].astro.
 *
 * ── Language-level, not market-level, and that is deliberate ─────────────────
 * A VoxTable page says the same thing in Cardiff and in Antwerp; the market
 * colour on these trees comes from the chrome, the imagery band and (Phase 2)
 * the city pages. So `/gb-en`, `/be-en` and `/en` render byte-identical product
 * prose and declare each other as hreflang alternates — which is precisely what
 * hreflang is for: one page, several regional audiences. Do NOT fork this by
 * market to look busier; near-duplicate market variants are the doorway risk
 * check-cities exists to prevent, and hreflang already solves the real problem.
 *
 * ── Europe-truthful (PLAN.md §8), enforced by check-truthful ─────────────────
 * NO price of any kind. AU tiers are an Australian fact and European pricing is
 * a pilot outcome, so these pages carry no `pricing` field at all — the type
 * has no slot for one. No AU phone, no NAP. "Live" always means live IN
 * AUSTRALIA, said explicitly; Europe is always the pilot programme. Status
 * language must match products.ts honestly: two capabilities ship today, two are
 * in development, one is a concept — say so rather than implying five products.
 *
 * French: reviewed and signed off by Ludovic (26 Jul 2026) — product copy as
 * well as the copy.ts core. Any NEW French added here needs a fresh pass; this
 * sign-off covers the copy present at that date, not the file in perpetuity.
 */
import type { Lang } from "../locales";

export type IntlProductFeature = {
  readonly title: string;
  readonly body: string;
};

export type IntlProductFaq = {
  readonly q: string;
  readonly a: string;
};

/** One /products/<slug>/ page. No pricing slot — see the header. */
export type IntlProductCopy = {
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly h1: string;
  readonly lede: string;
  /** Short status pill, e.g. "Live in Australia". */
  readonly statusLabel: string;
  /** One honest sentence on what that means for a European venue. */
  readonly statusNote: string;
  readonly featuresHeading: string;
  readonly features: readonly IntlProductFeature[];
  readonly faqHeading: string;
  readonly faqs: readonly IntlProductFaq[];
  readonly ctaHeading: string;
  readonly ctaLabel: string;
};

/** The /products/ overview. */
export type IntlProductsOverviewCopy = {
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly h1: string;
  readonly lede: string;
  readonly intro: readonly string[];
  readonly capabilitiesHeading: string;
  /** Per-slug one-liner for the capability grid. */
  readonly capabilities: Readonly<Record<string, { readonly outcome: string; readonly body: string }>>;
  readonly pilotHeading: string;
  readonly pilotBody: string;
  readonly ctaLabel: string;
};

// ── English ──────────────────────────────────────────────────────────────────
const overviewEn: IntlProductsOverviewCopy = {
  title: "Vox — one AI phone host, five capabilities · BitePerk",
  description:
    "Vox answers your restaurant's phone in a natural voice, checks real availability and writes the booking down. Live in Australia today; opening pilot partnerships in Europe.",
  eyebrow: "The product",
  h1: "One AI phone host. Five things it can do.",
  lede:
    "Vox is a single product, not a suite. It answers your phone. What you switch on beyond bookings is up to you.",
  intro: [
    "Most venues lose the same covers the same way: the phone rings in the middle of service, nobody can reach it, and the caller books somewhere else. Vox picks up — every time, in under a second, in a voice that sounds like a person rather than a phone tree.",
    "Everything below is the same product answering the same line. Start with bookings; add the rest when it earns its place.",
  ],
  capabilitiesHeading: "What Vox can handle",
  capabilities: {
    voxtable: {
      outcome: "Never lose a table to an unanswered phone.",
      body:
        "Takes the booking on the call — date, covers, timing, the awkward requests — against your real availability, and writes it straight to your diary.",
    },
    voxorder: {
      outcome: "Takeaway orders without tying up a member of staff.",
      body:
        "Reads the menu, takes the order accurately, repeats it back, and sends a clean ticket through. No handwriting, no mis-heard modifiers.",
    },
    voxconcierge: {
      outcome: "The twenty questions that aren't bookings.",
      body:
        "Opening hours, parking, dietary questions, where the entrance is. Answered correctly, at 11pm, without waking anyone up.",
    },
    voxstay: {
      outcome: "A room booked in the caller's own language.",
      body:
        "Understands the stay, offers rooms, quotes the real price with taxes and texts a secure payment link. Built for hotels; in development, with the first pilots in Europe.",
    },
    voxdrive: {
      outcome: "Order-point conversation, minus the crackle.",
      body:
        "A drive-thru concept we are actively designing rather than shipping. Listed because we would rather show the roadmap than pretend it is finished.",
    },
  },
  pilotHeading: "How this works outside Australia",
  pilotBody:
    "Vox is in production in Australia and answers real calls for real venues every day. In Europe we are running it as a pilot programme with a small number of partner venues — local language, local phone numbers and local integrations are built with those partners rather than promised in advance. If that is the sort of thing you would rather shape than inherit, talk to us.",
  ctaLabel: "Book a pilot conversation",
};

const featureFaqCtaEn = {
  featuresHeading: "What it actually does",
  faqHeading: "Questions we get asked",
  ctaHeading: "Interested in a pilot?",
  ctaLabel: "Book a pilot conversation",
};

const productsEn: Record<string, IntlProductCopy> = {
  voxtable: {
    ...featureFaqCtaEn,
    title: "VoxTable — AI phone bookings for restaurants · BitePerk",
    description:
      "VoxTable answers your restaurant's phone and takes the booking against real availability. Live in production in Australia; opening pilot partnerships in Europe.",
    eyebrow: "Bookings",
    h1: "The call gets answered. The table gets booked.",
    lede:
      "VoxTable is the part of Vox that handles reservations — the one most venues switch on first, because it is where the lost money is easiest to count.",
    statusLabel: "Live in Australia",
    statusNote:
      "In production today, answering real calls for Australian venues. European venues join through the pilot programme.",
    features: [
      {
        title: "Books against availability that is actually real",
        body:
          "VoxTable checks your live capacity while it is still talking, so it never promises an eight-o'clock four-top you cannot seat. The confirmed booking lands in your diary before the caller has hung up.",
      },
      {
        title: "Handles the messy half of a booking call",
        body:
          "Date changes mid-sentence, a party that grows by two, a high chair, a birthday, an allergy, \"do you do anything for vegetarians\". It follows the conversation rather than reading a script at the caller.",
      },
      {
        title: "Hands over when it should",
        body:
          "When a call needs a human — a complaint, a large private booking, anything it is not confident about — it says so and passes it on, rather than guessing. Confidence gating is a design rule, not a setting we hope you find.",
      },
      {
        title: "Leaves a record you can audit",
        body:
          "Every call has a transcript and a recording attached to the booking it produced. If a guest insists they asked for something, you can check instead of arguing.",
      },
    ],
    faqs: [
      {
        q: "Do we have to change our phone number?",
        a: "No. You keep the number you already have and forward it — either every call, or only the ones your team does not reach in a few rings. Nothing is installed at the venue.",
      },
      {
        q: "Will callers know it is not a person?",
        a: "Many do not, and we do not think that is the interesting question. If a caller asks, it tells them. What matters is whether the call got handled properly.",
      },
      {
        q: "What happens to a booking if your system is down?",
        a: "Call-forwarding falls back to your line, so the phone rings at the venue as it did before. You are never worse off than not having it.",
      },
      {
        q: "Which booking systems does it write to?",
        a: "It writes to the BitePerk dashboard today. Integrations with the diary systems common in your market are exactly the kind of thing built with pilot partners rather than guessed at.",
      },
    ],
  },
  voxorder: {
    ...featureFaqCtaEn,
    title: "VoxOrder — AI phone ordering for takeaway · BitePerk",
    description:
      "VoxOrder takes takeaway and pickup orders over the phone, reads them back and sends a clean ticket. Live in production in Australia; European venues join via the pilot programme.",
    eyebrow: "Takeaway & pickup",
    h1: "Takeaway orders that don't hold up the pass.",
    lede:
      "The phone order is the one nobody wants: it takes four minutes, it pulls someone off the floor, and it is the order most likely to be wrong.",
    statusLabel: "Live in Australia",
    statusNote:
      "In production today for Australian venues. Menu structure and ticket format for European kitchens are built with pilot partners.",
    features: [
      {
        title: "Knows your menu, including the awkward parts",
        body:
          "Sizes, extras, swaps, the thing that is only available at lunch, the item you took off last week. It orders from the menu you actually have rather than a PDF from March.",
      },
      {
        title: "Reads the order back",
        body:
          "Every order is repeated to the caller before it is sent. That single step removes most of the disputes that phone orders generate.",
      },
      {
        title: "Sends a ticket, not a note",
        body:
          "The kitchen gets a clean, structured ticket in the same format every time — no handwriting, no \"no onions?\" written across two lines.",
      },
      {
        title: "Takes several calls at once",
        body:
          "Friday at seven is precisely when one phone and one person is not enough. Vox has no queue of its own.",
      },
    ],
    faqs: [
      {
        q: "Can it take payment?",
        a: "Not over the phone, deliberately. Payment happens at pickup or through your existing flow — we are not going to have an AI read card numbers back over a phone line.",
      },
      {
        q: "What if someone orders something we're out of?",
        a: "If the item is marked unavailable it says so on the call and offers what you do have, rather than sending the kitchen an order it cannot make.",
      },
      {
        q: "Does it work alongside our delivery platforms?",
        a: "Yes — it handles your own phone line. The platforms keep doing what they do, minus their commission on the orders that come to you directly.",
      },
    ],
  },
  voxconcierge: {
    ...featureFaqCtaEn,
    title: "VoxConcierge — AI front-of-house for enquiries · BitePerk",
    description:
      "VoxConcierge answers the questions that are not bookings: hours, parking, access, dietary. In development — not yet available to book.",
    eyebrow: "Front-of-house enquiries",
    h1: "The questions that aren't bookings.",
    lede:
      "A large share of a venue's calls never become a reservation. They are questions — and every one of them still costs someone thirty seconds mid-service.",
    statusLabel: "In development",
    statusNote:
      "Being built now, not yet available — including in Australia. Listed so you can see where Vox is going, not so you can buy it today.",
    features: [
      {
        title: "Answers from what you told it, not from the internet",
        body:
          "Hours, address, parking, step-free access, whether the terrace is heated, what the kitchen can do about a gluten allergy. Sourced from your own answers so it cannot invent a policy you do not have.",
      },
      {
        title: "Says \"I don't know\" out loud",
        body:
          "Anything outside what it has been told goes to a human rather than a plausible guess. For access and allergy questions, a confident wrong answer is the worst possible outcome.",
      },
      {
        title: "Shows you what people keep asking",
        body:
          "The questions that recur are usually a sign of something missing from your listing or your website. You get to see them instead of only your staff hearing them.",
      },
    ],
    faqs: [
      {
        q: "When can we have it?",
        a: "We are not giving a date we cannot hold. Pilot partners hear about it first and help decide what it needs to answer.",
      },
      {
        q: "Is it separate from the rest of Vox?",
        a: "No — it is the same phone host handling a different kind of call. There is nothing extra to install.",
      },
    ],
  },
  voxstay: {
    ...featureFaqCtaEn,
    title: "VoxStay — AI phone receptionist for hotels · BitePerk",
    description:
      "VoxStay answers a hotel's booking call in eight languages, quotes the real price with taxes and texts a secure payment link. In development — not yet available to book.",
    eyebrow: "Hotel reception",
    h1: "Room bookings, answered in eight languages.",
    lede:
      "A hotel's phone rings in eight languages and the front desk speaks two. VoxStay is Bella at reception: she understands the stay, offers rooms, quotes the real price including taxes and texts a secure payment link — never a card number on the call.",
    statusLabel: "In development",
    statusNote:
      "Being built now, not yet available — including in Australia. Built EU-first: it is designed so a European hotel's guest data is hosted in the EU (Paris region). Listed so you can see where Vox is going, not so you can buy it today.",
    features: [
      {
        title: "Eight languages, one receptionist",
        body:
          "French, English, Flemish, Italian, German, Spanish, Mandarin and Japanese. Bella answers in the language the caller opens with, so a guest is never asked to switch.",
      },
      {
        title: "A price it cannot invent",
        body:
          "Every number Bella says out loud has to come from your live rates; if it is not there, she cannot say it. She confirms the room, the dates and the price with taxes before anything is booked.",
      },
      {
        title: "Card details never touch the call",
        body:
          "Bella takes the guest's name and mobile and texts a secure payment link. Nobody reads a card number down the phone, and your team never hears one.",
      },
    ],
    faqs: [
      {
        q: "What happens if it breaks?",
        a: "The call rings the front desk, exactly as it did before. A caller never hears dead air — the failure mode is the old behaviour.",
      },
      {
        q: "Where is guest data processed?",
        a: "VoxStay is designed for EU hosting, in the Paris region, so a European hotel's guest data is meant to stay in the EU. That is a design commitment we will document in full with pilot partners, not a claim about a system you can buy today.",
      },
      {
        q: "Does it write into our hotel system?",
        a: "The first version captures the booking — dates, room, price, guest details — and hands the guest a pre-filled link, which works at any property regardless of what runs behind the desk. Writing directly into a hotel system is a later step, built with pilot partners.",
      },
    ],
  },
  voxdrive: {
    ...featureFaqCtaEn,
    title: "VoxDrive — drive-thru voice ordering (concept) · BitePerk",
    description:
      "VoxDrive is an early concept for drive-thru order-point conversation. Not built, not available — published so the roadmap is honest.",
    eyebrow: "Concept",
    h1: "Drive-thru, thought through.",
    lede:
      "The order point is the hardest voice problem in hospitality: engine noise, a queue behind, and a customer who will not repeat themselves twice.",
    statusLabel: "Concept",
    statusNote:
      "Not built and not available anywhere. This page exists because we would rather show you the roadmap than let you find out later that it was marketing.",
    features: [
      {
        title: "The problem is noise, not language",
        body:
          "Order-point audio is engine, weather and a speaker designed in the nineties. Getting that right is a different engineering problem from answering a phone, and we are treating it as one.",
      },
      {
        title: "Speed is the whole product",
        body:
          "A drive-thru is judged in seconds per car. An assistant that is pleasant but slower than the teenager it replaced is not worth deploying.",
      },
      {
        title: "Where it sits",
        body:
          "Behind bookings, ordering, concierge and hotel reception — all of which serve far more venues. We would rather ship the rest properly than everything partly.",
      },
    ],
    faqs: [
      {
        q: "Can we pilot it?",
        a: "Not yet — there is nothing to pilot. If you operate drive-thru sites we would genuinely like to hear what the current setup gets wrong.",
      },
    ],
  },
};

// ── Français ─────────────────────────────────────────────────────────────────
const overviewFr: IntlProductsOverviewCopy = {
  title: "Vox — un seul hôte téléphonique IA, cinq usages · BitePerk",
  description:
    "Vox répond au téléphone de votre établissement d'une voix naturelle, vérifie les disponibilités réelles et enregistre la réservation. En production en Australie ; partenariats pilotes ouverts en Europe.",
  eyebrow: "Le produit",
  h1: "Un seul hôte téléphonique IA. Cinq usages.",
  lede:
    "Vox est un produit unique, pas une suite. Il répond au téléphone. Ce que vous activez au-delà des réservations ne dépend que de vous.",
  intro: [
    "La plupart des établissements perdent les mêmes couverts de la même façon : le téléphone sonne en plein service, personne ne peut décrocher, et l'appelant réserve ailleurs. Vox décroche — à chaque fois, en moins d'une seconde, d'une voix qui ressemble à une personne et non à un serveur vocal.",
    "Tout ce qui suit, c'est le même produit sur la même ligne. Commencez par les réservations ; ajoutez le reste quand cela se justifie.",
  ],
  capabilitiesHeading: "Ce que Vox sait traiter",
  capabilities: {
    voxtable: {
      outcome: "Ne plus perdre une table faute d'avoir décroché.",
      body:
        "Prend la réservation pendant l'appel — date, couverts, horaire, demandes délicates — en tenant compte de vos disponibilités réelles, et l'inscrit directement à votre cahier.",
    },
    voxorder: {
      outcome: "Les commandes à emporter sans mobiliser quelqu'un.",
      body:
        "Lit la carte, prend la commande correctement, la répète à l'appelant et transmet un ticket propre. Sans écriture manuscrite ni option mal comprise.",
    },
    voxconcierge: {
      outcome: "Les vingt questions qui ne sont pas des réservations.",
      body:
        "Horaires, stationnement, allergènes, où se trouve l'entrée. Des réponses justes, à 23 h, sans réveiller personne.",
    },
    // DRAFT French (5 Sep 2026) — needs Ludovic's pass.
    voxstay: {
      outcome: "Une chambre réservée dans la langue de l'appelant.",
      body:
        "Comprend le séjour, propose des chambres, annonce le vrai prix taxes comprises et envoie un lien de paiement sécurisé par SMS. Conçu pour les hôtels ; en développement, premiers pilotes en Europe.",
    },
    voxdrive: {
      outcome: "La borne de commande, sans les grésillements.",
      body:
        "Un concept de drive que nous concevons activement, sans le livrer. Nous préférons montrer la feuille de route plutôt que laisser croire qu'elle est terminée.",
    },
  },
  pilotHeading: "Comment cela fonctionne hors d'Australie",
  pilotBody:
    "Vox est en production en Australie et répond chaque jour à de vrais appels pour de vrais établissements. En Europe, nous le déployons sous forme de programme pilote auprès d'un petit nombre d'établissements partenaires : la langue locale, les numéros locaux et les intégrations locales se construisent avec ces partenaires plutôt qu'ils ne se promettent à l'avance. Si vous préférez façonner cela plutôt que d'en hériter, parlons-en.",
  ctaLabel: "Demander un entretien pilote",
};

const featureFaqCtaFr = {
  featuresHeading: "Ce qu'il fait concrètement",
  faqHeading: "Les questions qu'on nous pose",
  ctaHeading: "Intéressé par un pilote ?",
  ctaLabel: "Demander un entretien pilote",
};

const productsFr: Record<string, IntlProductCopy> = {
  voxtable: {
    ...featureFaqCtaFr,
    title: "VoxTable — réservations par téléphone en IA · BitePerk",
    description:
      "VoxTable répond au téléphone de votre établissement et prend la réservation selon vos disponibilités réelles. En production en Australie ; partenariats pilotes ouverts en Europe.",
    eyebrow: "Réservations",
    h1: "L'appel trouve une réponse. La table est réservée.",
    lede:
      "VoxTable, c'est la partie de Vox qui gère les réservations — celle que les établissements activent en premier, parce que c'est là que le manque à gagner se compte le plus facilement.",
    statusLabel: "En production en Australie",
    statusNote:
      "En service aujourd'hui, sur de vrais appels pour des établissements australiens. Les établissements européens y accèdent par le programme pilote.",
    features: [
      {
        title: "Réserve sur des disponibilités réellement à jour",
        body:
          "VoxTable consulte votre capacité en direct pendant qu'il parle encore : il ne promet donc jamais une table de quatre à vingt heures que vous ne pouvez pas placer. La réservation confirmée arrive dans votre cahier avant que l'appelant ait raccroché.",
      },
      {
        title: "Gère la moitié désordonnée d'un appel",
        body:
          "Une date qui change en cours de phrase, une tablée qui grandit de deux, une chaise haute, un anniversaire, une allergie, « vous faites quelque chose pour les végétariens ? ». Il suit la conversation au lieu de réciter un script.",
      },
      {
        title: "Passe la main quand il le faut",
        body:
          "Dès qu'un appel demande un humain — une réclamation, une grande privatisation, tout ce dont il n'est pas sûr — il le dit et transfère, plutôt que de deviner. Ce seuil de confiance est une règle de conception, pas une option à trouver dans les réglages.",
      },
      {
        title: "Laisse une trace vérifiable",
        body:
          "Chaque appel a une transcription et un enregistrement rattachés à la réservation qu'il a produite. Si un client affirme avoir demandé autre chose, vous pouvez vérifier au lieu de discuter.",
      },
    ],
    faqs: [
      {
        q: "Faut-il changer de numéro ?",
        a: "Non. Vous gardez votre numéro et vous le faites suivre — soit tous les appels, soit uniquement ceux que votre équipe ne décroche pas au bout de quelques sonneries. Rien à installer dans l'établissement.",
      },
      {
        q: "Les appelants savent-ils que ce n'est pas une personne ?",
        a: "Beaucoup ne s'en aperçoivent pas, et ce n'est pas la question la plus intéressante. Si l'appelant pose la question, il répond franchement. Ce qui compte, c'est que l'appel ait été bien traité.",
      },
      {
        q: "Que devient une réservation si votre système tombe ?",
        a: "Le renvoi d'appel revient sur votre ligne : le téléphone sonne dans l'établissement comme avant. Vous n'êtes jamais dans une situation pire qu'aujourd'hui.",
      },
      {
        q: "Vers quels logiciels de réservation écrit-il ?",
        a: "Aujourd'hui vers le tableau de bord BitePerk. Les intégrations avec les logiciels courants de votre marché sont précisément ce qui se construit avec les partenaires pilotes plutôt que de se deviner.",
      },
    ],
  },
  voxorder: {
    ...featureFaqCtaFr,
    title: "VoxOrder — prise de commande à emporter en IA · BitePerk",
    description:
      "VoxOrder prend les commandes à emporter par téléphone, les répète et transmet un ticket propre. En production en Australie ; l'Europe passe par le programme pilote.",
    eyebrow: "À emporter",
    h1: "Des commandes à emporter qui ne bloquent pas le passe.",
    lede:
      "La commande par téléphone est celle dont personne ne veut : elle prend quatre minutes, elle retire quelqu'un de la salle, et c'est celle qui a le plus de chances d'être fausse.",
    statusLabel: "En production en Australie",
    statusNote:
      "En service aujourd'hui pour des établissements australiens. La structure de carte et le format de ticket pour les cuisines européennes se construisent avec les partenaires pilotes.",
    features: [
      {
        title: "Connaît votre carte, y compris ses subtilités",
        body:
          "Les tailles, les suppléments, les substitutions, le plat qui n'existe qu'au déjeuner, celui que vous avez retiré la semaine dernière. Il commande sur la carte que vous avez vraiment, pas sur un PDF de mars.",
      },
      {
        title: "Répète la commande",
        body:
          "Chaque commande est relue à l'appelant avant d'être envoyée. Cette seule étape élimine l'essentiel des litiges que génèrent les commandes téléphoniques.",
      },
      {
        title: "Envoie un ticket, pas un pense-bête",
        body:
          "La cuisine reçoit un ticket propre et structuré, dans le même format à chaque fois — sans écriture manuscrite ni « sans oignons ? » barrant deux lignes.",
      },
      {
        title: "Prend plusieurs appels à la fois",
        body:
          "Le vendredi à dix-neuf heures est exactement le moment où un téléphone et une personne ne suffisent plus. Vox n'a pas de file d'attente.",
      },
    ],
    faqs: [
      {
        q: "Peut-il encaisser ?",
        a: "Pas par téléphone, et c'est délibéré. Le paiement se fait au retrait ou par votre parcours habituel — il n'est pas question qu'une IA se fasse dicter un numéro de carte au téléphone.",
      },
      {
        q: "Et si l'on commande un plat épuisé ?",
        a: "Si le plat est marqué indisponible, il le dit pendant l'appel et propose ce que vous avez, plutôt que d'envoyer en cuisine une commande impossible.",
      },
      {
        q: "Cela fonctionne-t-il avec nos plateformes de livraison ?",
        a: "Oui — il s'occupe de votre propre ligne. Les plateformes continuent leur travail, sans leur commission sur les commandes qui vous arrivent en direct.",
      },
    ],
  },
  voxconcierge: {
    ...featureFaqCtaFr,
    title: "VoxConcierge — accueil téléphonique IA pour les demandes · BitePerk",
    description:
      "VoxConcierge répond aux questions qui ne sont pas des réservations : horaires, stationnement, accessibilité, allergènes. En développement — pas encore disponible.",
    eyebrow: "Demandes d'information",
    h1: "Les questions qui ne sont pas des réservations.",
    lede:
      "Une bonne part des appels d'un établissement ne deviendra jamais une réservation. Ce sont des questions — et chacune coûte encore trente secondes à quelqu'un, en plein service.",
    statusLabel: "En développement",
    statusNote:
      "En cours de construction, pas encore disponible — y compris en Australie. Présenté pour montrer où va Vox, pas pour être vendu aujourd'hui.",
    features: [
      {
        title: "Répond à partir de ce que vous lui avez dit",
        body:
          "Horaires, adresse, stationnement, accès de plain-pied, terrasse chauffée ou non, ce que la cuisine peut faire face à une allergie au gluten. Les réponses viennent de vous : il ne peut pas inventer une politique que vous n'avez pas.",
      },
      {
        title: "Dit « je ne sais pas » à voix haute",
        body:
          "Tout ce qui sort de ce qu'on lui a appris part vers un humain plutôt que vers une supposition vraisemblable. Sur l'accessibilité et les allergies, une réponse fausse énoncée avec assurance est le pire résultat possible.",
      },
      {
        title: "Vous montre ce que les gens demandent sans cesse",
        body:
          "Les questions récurrentes signalent en général une information absente de votre fiche ou de votre site. Vous les voyez, au lieu que seule votre équipe les entende.",
      },
    ],
    faqs: [
      {
        q: "Quand sera-t-il disponible ?",
        a: "Nous ne donnons pas une date que nous ne pourrions pas tenir. Les partenaires pilotes sont informés en premier et participent à définir ce à quoi il doit savoir répondre.",
      },
      {
        q: "Est-ce séparé du reste de Vox ?",
        a: "Non — c'est le même hôte téléphonique face à un autre type d'appel. Il n'y a rien de plus à installer.",
      },
    ],
  },
  // DRAFT French (5 Sep 2026) — needs Ludovic's pass.
  voxstay: {
    ...featureFaqCtaFr,
    title: "VoxStay — réceptionniste téléphonique IA pour hôtels · BitePerk",
    description:
      "VoxStay répond à l'appel de réservation d'un hôtel en huit langues, annonce le vrai prix taxes comprises et envoie un lien de paiement sécurisé par SMS. En développement — pas encore disponible.",
    eyebrow: "Réception d'hôtel",
    h1: "Des chambres réservées, en huit langues.",
    lede:
      "Le téléphone d'un hôtel sonne en huit langues et la réception en parle deux. VoxStay, c'est Bella à l'accueil : elle comprend le séjour, propose des chambres, annonce le vrai prix taxes comprises et envoie un lien de paiement sécurisé par SMS — jamais de numéro de carte au téléphone.",
    statusLabel: "En développement",
    statusNote:
      "En cours de construction, pas encore disponible — y compris en Australie. Conçu d'abord pour l'Europe : les données des clients d'un hôtel européen sont prévues pour être hébergées dans l'UE (région parisienne). Présenté pour montrer où va Vox, pas pour être vendu aujourd'hui.",
    features: [
      {
        title: "Huit langues, une seule réceptionniste",
        body:
          "Français, anglais, flamand, italien, allemand, espagnol, mandarin et japonais. Bella répond dans la langue de l'appelant, sans jamais lui demander d'en changer.",
      },
      {
        title: "Un prix qu'elle ne peut pas inventer",
        body:
          "Chaque nombre que Bella prononce doit venir de vos tarifs en direct ; s'il n'y figure pas, elle ne peut pas le dire. Elle confirme la chambre, les dates et le prix taxes comprises avant toute réservation.",
      },
      {
        title: "La carte bancaire ne passe jamais par l'appel",
        body:
          "Bella note le nom et le mobile du client, puis envoie un lien de paiement sécurisé par SMS. Personne ne dicte un numéro de carte au téléphone, et votre équipe n'en entend jamais un.",
      },
    ],
    faqs: [
      {
        q: "Que se passe-t-il en cas de panne ?",
        a: "L'appel sonne à la réception, exactement comme avant. L'appelant n'entend jamais le vide : le mode dégradé, c'est l'ancien fonctionnement.",
      },
      {
        q: "Où sont traitées les données des clients ?",
        a: "VoxStay est conçu pour un hébergement dans l'UE, en région parisienne, afin que les données des clients d'un hôtel européen restent dans l'UE. C'est un engagement de conception que nous documenterons intégralement avec les partenaires pilotes, pas une promesse sur un système achetable aujourd'hui.",
      },
      {
        q: "Écrit-il dans notre logiciel hôtelier ?",
        a: "La première version capture la réservation — dates, chambre, prix, coordonnées — et remet au client un lien prérempli, ce qui fonctionne dans n'importe quel établissement, quel que soit l'outil derrière le comptoir. L'écriture directe dans le logiciel de l'hôtel viendra ensuite, construite avec les partenaires pilotes.",
      },
    ],
  },
  voxdrive: {
    ...featureFaqCtaFr,
    title: "VoxDrive — commande vocale au drive (concept) · BitePerk",
    description:
      "VoxDrive est un concept en amont pour la borne de commande au drive. Ni construit ni disponible — publié pour que la feuille de route reste honnête.",
    eyebrow: "Concept",
    h1: "Le drive, pensé sérieusement.",
    lede:
      "La borne de commande est le problème vocal le plus difficile de la restauration : le bruit du moteur, la file derrière, et un client qui ne se répétera pas deux fois.",
    statusLabel: "Concept",
    statusNote:
      "Ni construit ni disponible, nulle part. Cette page existe parce que nous préférons vous montrer la feuille de route plutôt que vous laisser découvrir plus tard que c'était du marketing.",
    features: [
      {
        title: "Le problème, c'est le bruit, pas la langue",
        body:
          "L'audio d'une borne, c'est un moteur, la météo et un haut-parleur conçu dans les années quatre-vingt-dix. Y répondre relève d'un problème d'ingénierie différent de celui du téléphone, et nous le traitons comme tel.",
      },
      {
        title: "La vitesse est tout le produit",
        body:
          "Un drive se juge en secondes par voiture. Un assistant agréable mais plus lent que la personne qu'il remplace ne mérite pas d'être déployé.",
      },
      {
        title: "Sa place dans l'ordre des choses",
        body:
          "Après les réservations, la commande, l'accueil et la réception d'hôtel, qui servent bien plus d'établissements. Nous préférons livrer le reste correctement que tout à moitié.",
      },
    ],
    faqs: [
      {
        q: "Peut-on le tester ?",
        a: "Pas encore — il n'y a rien à tester. Si vous exploitez des drives, nous aimerions sincèrement savoir ce que l'installation actuelle rate.",
      },
    ],
  },
};

export const intlProductsOverview: Record<Lang, IntlProductsOverviewCopy> = {
  en: overviewEn,
  fr: overviewFr,
};

export const intlProducts: Record<Lang, Record<string, IntlProductCopy>> = {
  en: productsEn,
  fr: productsFr,
};
