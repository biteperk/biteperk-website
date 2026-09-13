/**
 * Solution (industry vertical) copy for the international locale trees.
 *
 * STRUCTURE comes from src/data/solutions.ts (the SSOT: slugs, order, sector,
 * primaryProduct, status); only the PROSE lives here, keyed by LANGUAGE — the
 * same contract as intl/products.ts, for the same reason: an "AI receptionist
 * for restaurants" page says the same thing in Manchester and Antwerp, the
 * market colour comes from the chrome and the city pages, and the English
 * trees declare each other as hreflang alternates. Do NOT fork per market.
 *
 * ── Europe-truthful (PLAN.md §8), enforced by check-truthful ─────────────────
 * No price, no AU phone or address, no proof quotes (the AU registry's `proof`
 * block is Australian venues on the Australian tree), no metrics, no named
 * booking/POS/PMS integrations, no "certified", no EU-hosting claim, no
 * "human oversight" — the hand-off is to the VENUE's phone. "Live" always
 * means live in Australia; Europe is the pilot programme. Statuses mirror
 * products.ts: bookings and takeaway ship, concierge and hotel reception are
 * in development, drive-thru is a concept — and the copy says so.
 *
 * French written 13 Sep 2026 — NOT yet reviewed. It goes in the next Ludovic
 * batch (extract-fr-review.mjs --since lists it); nothing French here ships to
 * prospects before that pass is filed under docs/ops-records/.
 */
import type { Lang } from "../locales";
import type { SolutionSector, SolutionSlug } from "../solutions";

export type IntlSolutionCopy = {
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly h1: string;
  readonly lede: string;
  /** Short status pill, e.g. "Live in Australia · pilots in Europe". */
  readonly statusLabel: string;
  readonly statusNote: string;
  readonly problemHeading: string;
  readonly problem: string;
  readonly lostHeading: string;
  readonly lost: string;
  readonly lostPoints: readonly [string, string, string];
  readonly howHeading: string;
  readonly how: string;
  readonly steps: readonly { readonly title: string; readonly body: string }[];
  readonly featuresHeading: string;
  readonly features: readonly { readonly title: string; readonly body: string }[];
  readonly benefitsHeading: string;
  readonly benefits: readonly string[];
  readonly faqHeading: string;
  readonly faqs: readonly { readonly q: string; readonly a: string }[];
  readonly ctaHeading: string;
  readonly ctaLabel: string;
};

export type IntlSolutionsOverviewCopy = {
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly h1: string;
  readonly lede: string;
  readonly sectors: Readonly<Record<SolutionSector, string>>;
  readonly ctaLabel: string;
};

const STATUS_EN = {
  live: "Live in Australia · pilots in Europe",
  dev: "In development · pilot partners wanted",
  concept: "Concept · register interest",
} as const;
const STATUS_FR = {
  live: "En production en Australie · pilotes en Europe",
  dev: "En développement · partenaires pilotes recherchés",
  concept: "Concept · manifestez votre intérêt",
} as const;

export const intlSolutionsOverview: Record<Lang, IntlSolutionsOverviewCopy> = {
  en: {
    title: "Solutions by industry — Vox, the AI phone host",
    description:
      "AI phone answering by industry — restaurants, hotels, cafés, takeaway, drive-thru, medical clinics, professional services and multi-site groups. Pilot partnerships in Europe.",
    eyebrow: "Solutions by industry",
    h1: "The same phone host, tuned to how your business takes calls.",
    lede: "People search for the job to be done — an AI receptionist for a restaurant, overflow cover for a clinic — not a product name. Start with your vertical; every page says plainly what ships today and what is still a pilot.",
    sectors: { hospitality: "Hospitality", services: "Services", enterprise: "Groups" },
    ctaLabel: "Book a pilot conversation",
  },
  fr: {
    title: "Solutions par secteur — Vox, l'hôte téléphonique IA",
    description:
      "La réponse téléphonique IA par secteur — restaurants, hôtels, cafés, vente à emporter, drive, cabinets médicaux, professions libérales et groupes multi-sites. Partenariats pilotes en Europe.",
    eyebrow: "Solutions par secteur",
    h1: "Le même hôte téléphonique, réglé sur la façon dont votre établissement prend ses appels.",
    lede: "On cherche un métier à faire — une réceptionniste IA pour un restaurant, une couverture des appels débordants pour un cabinet — pas un nom de produit. Commencez par votre secteur ; chaque page dit clairement ce qui est en production et ce qui reste un pilote.",
    sectors: { hospitality: "Hôtellerie-restauration", services: "Services", enterprise: "Groupes" },
    ctaLabel: "Réserver un échange pilote",
  },
};

export const intlSolutions: Record<Lang, Record<SolutionSlug, IntlSolutionCopy>> = {
  en: {
    restaurants: {
      title: "AI receptionist for restaurants",
      description:
        "Vox answers your restaurant's phone in a natural voice, checks real availability and writes the booking to the diary — during service and after close. Pilots in Europe.",
      eyebrow: "Restaurants",
      h1: "Every booking call answered, even mid-service.",
      lede: "A ringing phone at eight on a Friday is a table trying to give you money. Vox picks up on the first ring, books against what is actually free, and hands over to a person the moment a call stops being ordinary.",
      statusLabel: STATUS_EN.live,
      statusNote: "Bookings ship today for Australian restaurants. In Europe this is a pilot: your venue, your line, a live demonstration before any commitment.",
      problemHeading: "The problem",
      problem: "Restaurants lose bookings for one plain reason: the phone rings when the whole team is on the floor. Voicemail does not take a table; the caller simply tries the next place.",
      lostHeading: "What it costs",
      lost: "Every missed call during service is a cover that walks. Multiply an ordinary miss rate by an ordinary week and it stops being an anecdote.",
      lostPoints: ["Peak-hour calls go unanswered", "Voicemails become chases, not bookings", "No picture of what the phone produced"],
      howHeading: "How Vox handles it",
      how: "Vox answers, understands what the caller wants, checks the diary and writes the booking — then confirms. Anything unusual is passed to your team on your own line.",
      steps: [
        { title: "Answers on the first ring", body: "A natural voice, any hour, no hold music." },
        { title: "Checks real availability", body: "Bookings are written against what is actually free — no double-bookings." },
        { title: "Confirms with the guest", body: "Name, party size, time, notes — read back before the call ends." },
        { title: "Hands over when needed", body: "Large groups, allergies, complaints: a person on your line, not a script." },
      ],
      featuresHeading: "What you get",
      features: [
        { title: "A voice that fits the room", body: "Warm, unhurried, and honest that it is an AI when it answers." },
        { title: "Booking, not a message", body: "The outcome is a reservation in the diary, not a voicemail to return." },
        { title: "Works with your hours", body: "Overflow, after-close and mid-service peaks are the point, not a nice-to-have." },
        { title: "Every call on record", body: "Transcripts and outcomes in one place, so you know what the phone did." },
      ],
      benefitsHeading: "What changes",
      benefits: ["Fewer empty tables from unanswered calls", "Hosts stay with diners instead of the handset", "A clear weekly picture of the phone", "A demonstration on your own line before you decide"],
      faqHeading: "Questions restaurants ask",
      faqs: [
        { q: "Will guests know they are talking to an AI?", a: "Yes — Vox says so when it answers. Diners care more that someone competent picked up than that a human left them on hold." },
        { q: "Does it replace our booking system?", a: "No. Vox answers the phone and writes the booking into the flow you run. It is the receptionist you do not have, not a new system to learn." },
        { q: "What does a European pilot look like?", a: "A short conversation about your venue and call volume, then Vox on a test line so you hear it handle a call like yours. Commercial terms are agreed per pilot." },
      ],
      ctaHeading: "Put Vox on your line",
      ctaLabel: "Book a pilot conversation",
    },
    hotels: {
      title: "AI phone receptionist for hotels",
      description:
        "VoxStay is Bella as a hotel receptionist — answers the room-booking call in eight languages, quotes the real price with taxes, texts a secure payment link. In development; pilots in Europe.",
      eyebrow: "Hotels",
      h1: "The room-booking call, answered in the guest's language.",
      lede: "Reception has a queue at the desk and a phone that will not stop. VoxStay is designed to take the booking call — eight languages, the real rate with taxes, a secure payment link by text — and to ring the front desk the moment anything falls outside that.",
      statusLabel: STATUS_EN.dev,
      statusNote: "VoxStay is in development. There is no live hotel yet; every claim on this page is about how it is designed, and the first pilots are in Europe.",
      problemHeading: "The problem",
      problem: "Independent hotels lose bookings at reception's busiest moments, and the caller who reaches voicemail books elsewhere or through a channel that takes a cut.",
      lostHeading: "What it costs",
      lost: "A direct booking lost to a busy line is margin handed to a marketplace — or a room that stays empty.",
      lostPoints: ["Calls arrive when the desk is busiest", "Callers switch to channels that take commission", "Language mismatches end calls early"],
      howHeading: "How VoxStay is designed to handle it",
      how: "Answer in the caller's language, offer rooms, quote the real price including taxes, take a name and mobile number, text a secure payment link — and never take a card number on the call.",
      steps: [
        { title: "Answers in eight languages", body: "French, English, Flemish, Italian, German, Spanish, Mandarin and Japanese." },
        { title: "Quotes what is really available", body: "Rooms and prices come from the hotel's live rates; it cannot invent a price." },
        { title: "Secures the booking by text", body: "A payment link on the guest's phone — no card details spoken aloud." },
        { title: "Falls back to the desk", body: "If anything fails, the call rings the front desk exactly as it does today." },
      ],
      featuresHeading: "What it is built to do",
      features: [
        { title: "Multilingual by design", body: "The guest's language, not a menu of options." },
        { title: "Honest pricing", body: "Real rates with taxes; nothing quoted that is not in the hotel's system." },
        { title: "No card numbers on the call", body: "Payment happens on a secure link, on the guest's own phone." },
        { title: "Built for Europe first", body: "Designed for European hotels from the start — one of the reasons the first pilots are here." },
      ],
      benefitsHeading: "What it is meant to change",
      benefits: ["Direct bookings taken while the desk is busy", "Fewer callers lost to language", "No commission on a call your own phone answered", "Reception free for the guests in front of it"],
      faqHeading: "Questions hotels ask",
      faqs: [
        { q: "Is VoxStay available now?", a: "Not yet — it is in development, with a working demonstration. We are looking for pilot hotels in Europe; nothing here describes a live deployment." },
        { q: "What happens when the AI is unsure?", a: "The call rings the front desk as it does today. VoxStay is designed to take the ordinary booking, not to replace reception." },
      ],
      ctaHeading: "Talk about a hotel pilot",
      ctaLabel: "Book a pilot conversation",
    },
    cafes: {
      title: "AI phone answering for cafés",
      description:
        "Vox answers the café phone that is always an afterthought — bookings, opening hours, the regular asking if the terrace is open — in a natural voice, while the team stays at the machine. Pilots in Europe.",
      eyebrow: "Cafés",
      h1: "The café phone, answered while you are on the machine.",
      lede: "Cafés run on a small team and a phone nobody can reach at nine in the morning. Vox takes the booking, answers the ordinary question and passes on anything that needs a person.",
      statusLabel: STATUS_EN.live,
      statusNote: "Bookings ship today in Australia; in Europe this is a pilot with a live demonstration on your own line.",
      problemHeading: "The problem",
      problem: "A café phone rings during the morning rush and again at the lunch turn — exactly when every pair of hands is busy. The regular who cannot get through stops calling.",
      lostHeading: "What it costs",
      lost: "Small rooms feel every lost table. A missed group booking on a Saturday is the difference the week is measured by.",
      lostPoints: ["Morning-rush calls go to voicemail", "Group bookings are the ones that get missed", "Simple questions eat staff time"],
      howHeading: "How Vox handles it",
      how: "Vox answers, takes the booking against real availability, answers the hours-and-terrace questions, and hands anything else to your team.",
      steps: [
        { title: "Answers during the rush", body: "First ring, natural voice, no queue." },
        { title: "Books the table", body: "Against what is actually free, with a read-back to the caller." },
        { title: "Answers the ordinary", body: "Hours, dogs, the terrace, the high chair." },
        { title: "Passes on the rest", body: "Anything unusual reaches a person on your line." },
      ],
      featuresHeading: "What you get",
      features: [
        { title: "Same host as restaurants", body: "One account, one voice, when you grow into evening service." },
        { title: "A voice that fits", body: "Unhurried and honest that it is an AI." },
        { title: "Bookings, not messages", body: "The outcome is a table in the diary." },
        { title: "Every call on record", body: "Transcripts and outcomes so the phone is no longer a mystery." },
      ],
      benefitsHeading: "What changes",
      benefits: ["No more missed group bookings", "Staff stay on the machine and the floor", "Regulars get through", "A live demonstration before any commitment"],
      faqHeading: "Questions cafés ask",
      faqs: [
        { q: "We take walk-ins mostly — is this for us?", a: "If the phone rings and nobody can answer it, yes. Vox handles the bookings and questions that do come by phone; walk-ins are unchanged." },
        { q: "Can it answer questions about the menu?", a: "It answers what you give it — hours, terrace, dietary basics — and passes anything else to a person rather than guess." },
      ],
      ctaHeading: "Put Vox on your café line",
      ctaLabel: "Book a pilot conversation",
    },
    takeaway: {
      title: "AI phone ordering for takeaway",
      description:
        "VoxOrder takes the takeaway and collection order by phone — the menu, the substitutions, the collection time — and puts a clean ticket in front of the kitchen. Live in Australia; pilots in Europe.",
      eyebrow: "Takeaway & collection",
      h1: "Every order picked up, even when the kitchen is on the floor.",
      lede: "The takeaway line rings hardest exactly when nobody can hold it. VoxOrder takes the order — items, modifiers, a collection time you can keep — and sends a clean ticket to the kitchen.",
      statusLabel: STATUS_EN.live,
      statusNote: "VoxOrder ships today for Australian venues. In Europe it is a pilot; your menu, your line, a live demonstration first.",
      problemHeading: "The problem",
      problem: "Marketplaces are useful, but a guest who rings you directly and hits a busy signal orders from someone else — or through a platform that takes its share.",
      lostHeading: "What it costs",
      lost: "A direct order lost to an unanswered line is revenue handed to a competitor, or a commission you did not need to pay.",
      lostPoints: ["Peak orders hit a phone nobody can answer", "Misheard modifiers become remakes", "Collection times quoted blind"],
      howHeading: "How VoxOrder handles it",
      how: "It reads your menu the way your staff would, takes the order with its modifiers, checks current kitchen load before quoting a collection time, and sends the ticket.",
      steps: [
        { title: "Knows the menu", body: "Items, sizes, substitutions and the weekend small print." },
        { title: "Takes the modifiers", body: "Read back before the call ends, so 'no onions' means no onions." },
        { title: "Quotes a real time", body: "Collection windows come from kitchen load, not a guess." },
        { title: "Sends a clean ticket", body: "The order lands ready to make — no notepad, no copy-paste." },
      ],
      featuresHeading: "What you get",
      features: [
        { title: "Menu-aware ordering", body: "Change the menu and the phone changes with it." },
        { title: "Clean tickets", body: "Orders arrive structured, ready for the kitchen." },
        { title: "Collection time you can keep", body: "'Twenty minutes' means twenty minutes." },
        { title: "Hand-off for the unusual", body: "Allergies, big orders, complaints: a person on your line." },
      ],
      benefitsHeading: "What changes",
      benefits: ["Direct orders no longer lost to a busy line", "Fewer remakes from misheard orders", "Collection times that hold", "Less commission on orders your own phone took"],
      faqHeading: "Questions takeaway venues ask",
      faqs: [
        { q: "Does it replace our marketplace listings?", a: "No. It answers your own phone line so a caller does not get a busy signal. Marketplace orders keep arriving as they do today." },
        { q: "How does it learn the menu?", a: "You give us the menu once — items, sizes, substitutions — and VoxOrder reads it the way your staff would." },
      ],
      ctaHeading: "Put VoxOrder on your takeaway line",
      ctaLabel: "Book a pilot conversation",
    },
    "drive-thru": {
      title: "AI drive-thru voice ordering",
      description:
        "VoxDrive is a concept for the drive-through lane: a voice agent that takes the order, confirms it and keeps the lane moving. Not built yet — register interest.",
      eyebrow: "Drive-thru",
      h1: "A voice at the speaker box that keeps the lane moving.",
      lede: "The drive-through order is the same job as the phone order, with a queue behind it. VoxDrive is the concept for taking it — accurately, quickly, in the local accent.",
      statusLabel: STATUS_EN.concept,
      statusNote: "VoxDrive is a concept. Nothing on this page is live anywhere; it describes where the Vox family is going, so you can tell us whether it should.",
      problemHeading: "The problem",
      problem: "Lane dwell time is decided at the speaker box. A misheard order or a slow exchange backs up every car behind it.",
      lostHeading: "What it would change",
      lost: "Faster, more accurate order-taking at the box means shorter lanes and fewer remakes at the window.",
      lostPoints: ["Dwell time set by the slowest exchange", "Misheard orders remade at the window", "Staff pulled from the kitchen to the headset"],
      howHeading: "How VoxDrive is meant to work",
      how: "Take the order at the box, confirm it back, send the ticket, and hand anything unusual to a person on the headset.",
      steps: [
        { title: "Takes the order", body: "Menu-aware, modifiers included." },
        { title: "Confirms it", body: "Read back before the car moves." },
        { title: "Sends the ticket", body: "Ready to make by the time the car reaches the window." },
        { title: "Hands over", body: "A person on the headset for anything it cannot handle." },
      ],
      featuresHeading: "What it is designed for",
      features: [
        { title: "Same voice as the phone", body: "Vox family continuity if you already run it on the line." },
        { title: "Local accent", body: "Built to understand how people order here, not a franchise script." },
        { title: "Honest scope", body: "A concept, described as one." },
        { title: "Register interest", body: "Tell us about your lane and we will tell you when it is real." },
      ],
      benefitsHeading: "What it is meant to change",
      benefits: ["Shorter lanes", "Fewer remakes", "Headset staff back in the kitchen", "One voice across phone and lane"],
      faqHeading: "Questions about VoxDrive",
      faqs: [
        { q: "Can I pilot this now?", a: "No — it is a concept. Register interest and we will contact you when there is something real to demonstrate." },
        { q: "Why publish a concept?", a: "So that venues can tell us whether it is worth building, and so nobody mistakes it for a product that ships." },
      ],
      ctaHeading: "Tell us about your lane",
      ctaLabel: "Register interest",
    },
    medical: {
      title: "AI phone answering for medical clinics",
      description:
        "Overflow and after-hours clinic calls deserve a competent answer. VoxConcierge is in development for front-desk coverage — register interest for medical use.",
      eyebrow: "Medical clinics",
      h1: "The clinic phone, covered when the desk is busy.",
      lede: "A clinic phone rings while the receptionist is with a patient. VoxConcierge is in development to take the ordinary call — hours, directions, a message that reaches the right person — and to pass everything else straight to a human.",
      statusLabel: STATUS_EN.dev,
      statusNote: "VoxConcierge is in development. Medical use is an area we are exploring with pilot partners; nothing here describes a live clinical deployment, and clinical questions always go to a person.",
      problemHeading: "The problem",
      problem: "Front desks are interrupted constantly, and callers who reach voicemail either call back later — or do not.",
      lostHeading: "What it costs",
      lost: "Missed calls at a clinic are missed appointments and frustrated patients, on both sides of the desk.",
      lostPoints: ["Overflow calls hit voicemail", "After-hours callers get nothing", "Staff interrupted for routine questions"],
      howHeading: "How it is designed to help",
      how: "Answer the routine call, take an accurate message, and route anything clinical or urgent to a person immediately — never triage, never advice.",
      steps: [
        { title: "Answers overflow", body: "The call the desk could not reach." },
        { title: "Handles the routine", body: "Hours, location, what to bring." },
        { title: "Takes a clean message", body: "Name, number, reason — delivered to the right inbox." },
        { title: "Routes the rest", body: "Anything clinical goes to a person, immediately." },
      ],
      featuresHeading: "What it is built to do",
      features: [
        { title: "Routine only, by design", body: "It does not give advice or triage." },
        { title: "Accurate messages", body: "Read back and recorded." },
        { title: "Human routing", body: "A person for everything that matters." },
        { title: "Register interest", body: "Clinics shape what this becomes." },
      ],
      benefitsHeading: "What it is meant to change",
      benefits: ["Fewer missed calls at the desk", "Receptionists uninterrupted with patients", "After-hours callers acknowledged", "A clear record of what the phone took"],
      faqHeading: "Questions clinics ask",
      faqs: [
        { q: "Will it give medical advice?", a: "No. It is designed for routine front-desk calls only; anything clinical or urgent goes to a person immediately." },
        { q: "Is it available now?", a: "Not yet — it is in development. Register interest and we will talk about what a clinic pilot would need." },
      ],
      ctaHeading: "Talk about clinic coverage",
      ctaLabel: "Register interest",
    },
    "professional-services": {
      title: "AI receptionist for professional services",
      description:
        "Law, accounting, consulting: every ring is a billable hour interrupted. VoxConcierge is in development for professional front-desk coverage — register interest.",
      eyebrow: "Professional services",
      h1: "Every call answered, without interrupting the people who bill.",
      lede: "In a small practice everyone is billable and nobody is the receptionist. VoxConcierge is in development to answer the phone, take an accurate message and route the call — so the work continues.",
      statusLabel: STATUS_EN.dev,
      statusNote: "VoxConcierge is in development. Professional-services coverage is an area we are exploring with pilot partners; nothing here is live yet.",
      problemHeading: "The problem",
      problem: "The phone interrupts the work it is meant to bring in. Voicemail loses the new client; answering it costs the hour.",
      lostHeading: "What it costs",
      lost: "A new-client enquiry that reaches voicemail is often the last you hear of it.",
      lostPoints: ["New enquiries reach voicemail", "Billable time spent on routine calls", "Messages lost between people"],
      howHeading: "How it is designed to help",
      how: "Answer, take the caller's details and reason, route to the right person, and hand over live when the caller needs a human now.",
      steps: [
        { title: "Answers every call", body: "Professionally, in a natural voice." },
        { title: "Takes accurate details", body: "Name, number, matter — read back." },
        { title: "Routes correctly", body: "To the right inbox or person." },
        { title: "Hands over live", body: "When the caller needs a person now." },
      ],
      featuresHeading: "What it is built to do",
      features: [
        { title: "Professional tone", body: "Calm, precise, honest that it is an AI." },
        { title: "Clean messages", body: "Delivered where they belong." },
        { title: "Live hand-off", body: "A person when it matters." },
        { title: "Register interest", body: "Practices shape what ships." },
      ],
      benefitsHeading: "What it is meant to change",
      benefits: ["No new enquiry lost to voicemail", "Billable hours uninterrupted", "Messages that reach the right person", "A record of every call"],
      faqHeading: "Questions practices ask",
      faqs: [
        { q: "Can it handle confidential matters?", a: "It takes details and routes; it does not advise. Anything sensitive goes to a person on your line." },
        { q: "Is it available now?", a: "Not yet — in development. Register interest and we will discuss a pilot." },
      ],
      ctaHeading: "Talk about practice coverage",
      ctaLabel: "Register interest",
    },
    enterprise: {
      title: "Enterprise AI phone automation for groups",
      description:
        "Multi-site hospitality groups need one voice standard and central visibility. Talk to BitePerk about rolling Vox across venues, starting with one pilot site in Europe.",
      eyebrow: "Groups",
      h1: "One voice standard across every venue phone.",
      lede: "Groups lose bookings the same way single venues do — site by site. Vox rolls out with shared configuration, central reporting and a pilot site first.",
      statusLabel: STATUS_EN.live,
      statusNote: "The live capabilities (bookings, takeaway) ship today in Australia. A European group engagement starts with one pilot venue on a real line.",
      problemHeading: "The problem",
      problem: "Each venue invents its own overflow hack. Head office cannot see what the phones produced, and the guest experience drifts by site.",
      lostHeading: "What it costs",
      lost: "Run the arithmetic: an ordinary miss rate across twenty venues is a budget line, not an anecdote.",
      lostPoints: ["Inconsistent guest experience by site", "No single view of call outcomes", "Rollouts blocked by one-off telephony"],
      howHeading: "How a rollout works",
      how: "Pilot one venue, standardise the voice, expand with playbooks, and see the network in one place.",
      steps: [
        { title: "Pilot one venue", body: "Prove bookings taken on a real line before anything wider." },
        { title: "Standardise the voice", body: "One craft, local details where they matter." },
        { title: "Expand with playbooks", body: "Site onboarding that does not reinvent telephony each time." },
        { title: "See the network", body: "Outcomes visible beyond a single manager's notebook." },
      ],
      featuresHeading: "What you get",
      features: [
        { title: "Product that ships", body: "Group conversations start from live capability, not a roadmap." },
        { title: "Site-level control", body: "Local hours and rules without losing group standards." },
        { title: "Central visibility", body: "Every venue's phone, one view." },
        { title: "A human partner", body: "You are not left with a self-serve maze." },
      ],
      benefitsHeading: "What changes",
      benefits: ["Consistent guest phone experience", "Portfolio-level outcomes", "Faster onboarding after the pilot", "A path that respects procurement"],
      faqHeading: "Questions groups ask",
      faqs: [
        { q: "Do you support multi-brand groups?", a: "Yes — brand voice, shared reporting and site exceptions are part of the pilot conversation." },
        { q: "Is there a separate enterprise offer?", a: "Commercial shape depends on venue count and capabilities, agreed per pilot. Start with one venue rather than a catalogue." },
      ],
      ctaHeading: "Start with one venue",
      ctaLabel: "Book a pilot conversation",
    },
  },
  fr: {
    restaurants: {
      title: "Réceptionniste IA pour restaurants",
      description:
        "Vox répond au téléphone de votre restaurant d'une voix naturelle, vérifie les disponibilités réelles et inscrit la réservation au registre — en plein service comme après la fermeture. Pilotes en Europe.",
      eyebrow: "Restaurants",
      h1: "Chaque appel de réservation décroché, même en plein service.",
      lede: "Un téléphone qui sonne à vingt heures un vendredi, c'est une table qui essaie de vous donner de l'argent. Vox décroche à la première sonnerie, réserve sur ce qui est réellement libre, et passe la main à une personne dès qu'un appel sort de l'ordinaire.",
      statusLabel: STATUS_FR.live,
      statusNote: "Les réservations sont en production aujourd'hui pour les restaurants australiens. En Europe, c'est un pilote : votre établissement, votre ligne, une démonstration en direct avant tout engagement.",
      problemHeading: "Le problème",
      problem: "Les restaurants perdent des réservations pour une raison simple : le téléphone sonne quand toute l'équipe est en salle. Un répondeur ne prend pas de table ; l'appelant essaie simplement l'adresse suivante.",
      lostHeading: "Ce que ça coûte",
      lost: "Chaque appel manqué pendant le service est un couvert qui s'en va. Multipliez un taux d'appels manqués ordinaire par une semaine ordinaire et ce n'est plus une anecdote.",
      lostPoints: ["Les appels de pointe restent sans réponse", "Les messages deviennent des relances, pas des réservations", "Aucune vision de ce que produit le téléphone"],
      howHeading: "Comment Vox s'en charge",
      how: "Vox répond, comprend ce que veut l'appelant, vérifie le registre et inscrit la réservation — puis confirme. Tout ce qui sort de l'ordinaire est transmis à votre équipe, sur votre propre ligne.",
      steps: [
        { title: "Décroche à la première sonnerie", body: "Une voix naturelle, à toute heure, sans musique d'attente." },
        { title: "Vérifie les disponibilités réelles", body: "Les réservations sont inscrites sur ce qui est vraiment libre — pas de double réservation." },
        { title: "Confirme avec le client", body: "Nom, nombre de couverts, heure, remarques — relus avant la fin de l'appel." },
        { title: "Passe la main quand il le faut", body: "Grands groupes, allergies, réclamations : une personne sur votre ligne, pas un script." },
      ],
      featuresHeading: "Ce que vous obtenez",
      features: [
        { title: "Une voix qui va avec la salle", body: "Chaleureuse, sans précipitation, et qui dit honnêtement qu'elle est une IA." },
        { title: "Une réservation, pas un message", body: "Le résultat est une réservation au registre, pas un message à rappeler." },
        { title: "Adapté à vos horaires", body: "Débordements, après la fermeture, coups de feu : c'est précisément l'objet." },
        { title: "Chaque appel enregistré", body: "Transcriptions et résultats au même endroit, pour savoir ce qu'a fait le téléphone." },
      ],
      benefitsHeading: "Ce qui change",
      benefits: ["Moins de tables vides à cause d'appels sans réponse", "L'équipe reste avec les clients plutôt qu'au combiné", "Une vision hebdomadaire claire du téléphone", "Une démonstration sur votre propre ligne avant de décider"],
      faqHeading: "Les questions des restaurateurs",
      faqs: [
        { q: "Les clients sauront-ils qu'ils parlent à une IA ?", a: "Oui — Vox le dit en répondant. Les clients tiennent davantage à ce que quelqu'un de compétent décroche qu'à ce qu'un humain les laisse en attente." },
        { q: "Remplace-t-il notre système de réservation ?", a: "Non. Vox répond au téléphone et inscrit la réservation dans le flux que vous utilisez déjà. C'est la réceptionniste que vous n'avez pas, pas un nouveau système à apprendre." },
        { q: "À quoi ressemble un pilote en Europe ?", a: "Un échange court sur votre établissement et votre volume d'appels, puis Vox sur une ligne de test pour l'entendre gérer un appel semblable aux vôtres. Les conditions commerciales sont convenues par pilote." },
      ],
      ctaHeading: "Mettez Vox sur votre ligne",
      ctaLabel: "Réserver un échange pilote",
    },
    hotels: {
      title: "Réceptionniste téléphonique IA pour hôtels",
      description:
        "VoxStay, c'est Bella en réceptionniste d'hôtel — huit langues, le vrai prix taxes comprises, un lien de paiement sécurisé par SMS. En développement ; pilotes en Europe.",
      eyebrow: "Hôtels",
      h1: "L'appel de réservation, décroché dans la langue du client.",
      lede: "La réception a une file au comptoir et un téléphone qui ne s'arrête pas. VoxStay est conçu pour prendre l'appel de réservation — huit langues, le vrai tarif taxes comprises, un lien de paiement sécurisé par SMS — et pour faire sonner la réception dès que quelque chose sort de ce cadre.",
      statusLabel: STATUS_FR.dev,
      statusNote: "VoxStay est en développement. Aucun hôtel n'est encore en production ; chaque affirmation de cette page décrit la conception, et les premiers pilotes sont en Europe.",
      problemHeading: "Le problème",
      problem: "Les hôtels indépendants perdent des réservations aux moments où la réception est la plus occupée, et l'appelant qui tombe sur un répondeur réserve ailleurs, ou via un canal qui prend sa commission.",
      lostHeading: "Ce que ça coûte",
      lost: "Une réservation directe perdue sur une ligne occupée, c'est de la marge cédée à une plateforme — ou une chambre qui reste vide.",
      lostPoints: ["Les appels arrivent quand le comptoir est le plus chargé", "Les appelants basculent vers des canaux à commission", "Une langue mal comprise met fin à l'appel"],
      howHeading: "Comment VoxStay est conçu",
      how: "Répondre dans la langue de l'appelant, proposer des chambres, annoncer le vrai prix taxes comprises, prendre un nom et un numéro de mobile, envoyer un lien de paiement sécurisé par SMS — et ne jamais prendre un numéro de carte au téléphone.",
      steps: [
        { title: "Répond en huit langues", body: "Français, anglais, néerlandais, italien, allemand, espagnol, mandarin et japonais." },
        { title: "Propose ce qui est vraiment disponible", body: "Chambres et prix viennent des tarifs en direct de l'hôtel ; il ne peut pas inventer un prix." },
        { title: "Sécurise la réservation par SMS", body: "Un lien de paiement sur le téléphone du client — aucun numéro de carte prononcé." },
        { title: "Repasse la main à la réception", body: "En cas de problème, l'appel sonne à la réception exactement comme aujourd'hui." },
      ],
      featuresHeading: "Ce pour quoi il est conçu",
      features: [
        { title: "Multilingue par conception", body: "La langue du client, pas un menu d'options." },
        { title: "Un prix honnête", body: "Les vrais tarifs taxes comprises ; rien qui ne soit pas dans le système de l'hôtel." },
        { title: "Aucun numéro de carte au téléphone", body: "Le paiement se fait sur un lien sécurisé, sur le téléphone du client." },
        { title: "Conçu d'abord pour l'Europe", body: "Pensé dès le départ pour les hôtels européens — l'une des raisons pour lesquelles les premiers pilotes s'y déroulent." },
      ],
      benefitsHeading: "Ce que cela doit changer",
      benefits: ["Des réservations directes prises pendant que le comptoir est occupé", "Moins d'appelants perdus à cause de la langue", "Pas de commission sur un appel décroché par votre propre téléphone", "Une réception libre pour les clients qui sont devant elle"],
      faqHeading: "Les questions des hôteliers",
      faqs: [
        { q: "VoxStay est-il disponible maintenant ?", a: "Pas encore — il est en développement, avec une démonstration fonctionnelle. Nous cherchons des hôtels pilotes en Europe ; rien ici ne décrit un déploiement en production." },
        { q: "Que se passe-t-il quand l'IA n'est pas sûre ?", a: "L'appel sonne à la réception comme aujourd'hui. VoxStay est conçu pour prendre la réservation ordinaire, pas pour remplacer la réception." },
      ],
      ctaHeading: "Parlons d'un pilote hôtelier",
      ctaLabel: "Réserver un échange pilote",
    },
    cafes: {
      title: "Réponse téléphonique IA pour cafés",
      description:
        "Vox répond au téléphone du café qui passe toujours après le reste — réservations, horaires, la terrasse — d'une voix naturelle, pendant que l'équipe reste à la machine. Pilotes en Europe.",
      eyebrow: "Cafés",
      h1: "Le téléphone du café, décroché pendant que vous êtes à la machine.",
      lede: "Un café tourne avec une petite équipe et un téléphone que personne ne peut atteindre à neuf heures du matin. Vox prend la réservation, répond à la question ordinaire et transmet ce qui demande une personne.",
      statusLabel: STATUS_FR.live,
      statusNote: "Les réservations sont en production aujourd'hui en Australie ; en Europe, c'est un pilote avec une démonstration en direct sur votre propre ligne.",
      problemHeading: "Le problème",
      problem: "Le téléphone d'un café sonne pendant le rush du matin puis au service de midi — exactement quand toutes les mains sont prises. L'habitué qui n'arrive pas à joindre arrête d'appeler.",
      lostHeading: "Ce que ça coûte",
      lost: "Les petites salles ressentent chaque table perdue. Une réservation de groupe manquée un samedi, c'est l'écart sur lequel se mesure la semaine.",
      lostPoints: ["Les appels du rush du matin partent sur le répondeur", "Ce sont les réservations de groupe qui se perdent", "Les questions simples grignotent le temps de l'équipe"],
      howHeading: "Comment Vox s'en charge",
      how: "Vox répond, prend la réservation sur les disponibilités réelles, répond aux questions d'horaires et de terrasse, et transmet le reste à votre équipe.",
      steps: [
        { title: "Répond pendant le rush", body: "Première sonnerie, voix naturelle, pas de file d'attente." },
        { title: "Réserve la table", body: "Sur ce qui est vraiment libre, avec relecture à l'appelant." },
        { title: "Répond à l'ordinaire", body: "Horaires, chiens, terrasse, chaise haute." },
        { title: "Transmet le reste", body: "Tout ce qui sort de l'ordinaire atteint une personne sur votre ligne." },
      ],
      featuresHeading: "Ce que vous obtenez",
      features: [
        { title: "Le même hôte que pour les restaurants", body: "Un compte, une voix, quand vous passez au service du soir." },
        { title: "Une voix qui convient", body: "Sans précipitation, et honnête sur le fait d'être une IA." },
        { title: "Des réservations, pas des messages", body: "Le résultat est une table au registre." },
        { title: "Chaque appel enregistré", body: "Transcriptions et résultats : le téléphone n'est plus un mystère." },
      ],
      benefitsHeading: "Ce qui change",
      benefits: ["Plus de réservations de groupe manquées", "L'équipe reste à la machine et en salle", "Les habitués vous joignent", "Une démonstration en direct avant tout engagement"],
      faqHeading: "Les questions des cafés",
      faqs: [
        { q: "Nous fonctionnons surtout sans réservation — est-ce pour nous ?", a: "Si le téléphone sonne et que personne ne peut répondre, oui. Vox gère les réservations et les questions qui passent par le téléphone ; les clients de passage ne changent pas." },
        { q: "Peut-il répondre aux questions sur la carte ?", a: "Il répond avec ce que vous lui donnez — horaires, terrasse, bases alimentaires — et transmet le reste à une personne plutôt que de deviner." },
      ],
      ctaHeading: "Mettez Vox sur la ligne de votre café",
      ctaLabel: "Réserver un échange pilote",
    },
    takeaway: {
      title: "Prise de commande téléphonique IA pour la vente à emporter",
      description:
        "VoxOrder prend la commande à emporter par téléphone — la carte, les modifications, l'heure de retrait — et place un ticket propre devant la cuisine. En production en Australie ; pilotes en Europe.",
      eyebrow: "Vente à emporter",
      h1: "Chaque commande prise, même quand la cuisine est en salle.",
      lede: "La ligne à emporter sonne le plus fort exactement quand personne ne peut la tenir. VoxOrder prend la commande — articles, options, une heure de retrait que vous pouvez tenir — et envoie un ticket propre en cuisine.",
      statusLabel: STATUS_FR.live,
      statusNote: "VoxOrder est en production aujourd'hui pour les établissements australiens. En Europe, c'est un pilote ; votre carte, votre ligne, une démonstration en direct d'abord.",
      problemHeading: "Le problème",
      problem: "Les plateformes sont utiles, mais un client qui vous appelle directement et tombe sur une ligne occupée commande ailleurs — ou via une plateforme qui prend sa part.",
      lostHeading: "Ce que ça coûte",
      lost: "Une commande directe perdue sur une ligne sans réponse, c'est du chiffre cédé à un concurrent, ou une commission que vous n'aviez pas besoin de payer.",
      lostPoints: ["Les commandes de pointe tombent sur un téléphone que personne ne peut décrocher", "Les options mal entendues deviennent des plats refaits", "Des heures de retrait annoncées à l'aveugle"],
      howHeading: "Comment VoxOrder s'en charge",
      how: "Il lit votre carte comme le ferait votre équipe, prend la commande avec ses options, vérifie la charge de la cuisine avant d'annoncer une heure de retrait, et envoie le ticket.",
      steps: [
        { title: "Connaît la carte", body: "Articles, tailles, substitutions et les petites lignes du week-end." },
        { title: "Prend les options", body: "Relues avant la fin de l'appel, pour que « sans oignons » veuille dire sans oignons." },
        { title: "Annonce une heure réelle", body: "Les créneaux de retrait viennent de la charge de la cuisine, pas d'une estimation." },
        { title: "Envoie un ticket propre", body: "La commande arrive prête à faire — ni carnet, ni recopie." },
      ],
      featuresHeading: "Ce que vous obtenez",
      features: [
        { title: "Commande guidée par la carte", body: "Changez la carte et le téléphone change avec elle." },
        { title: "Des tickets propres", body: "Les commandes arrivent structurées, prêtes pour la cuisine." },
        { title: "Une heure de retrait tenable", body: "« Vingt minutes » veut dire vingt minutes." },
        { title: "Passage de main pour l'inhabituel", body: "Allergies, grosses commandes, réclamations : une personne sur votre ligne." },
      ],
      benefitsHeading: "Ce qui change",
      benefits: ["Plus de commandes directes perdues sur une ligne occupée", "Moins de plats refaits", "Des heures de retrait qui tiennent", "Moins de commission sur les commandes prises par votre propre téléphone"],
      faqHeading: "Les questions des établissements à emporter",
      faqs: [
        { q: "Remplace-t-il nos présences sur les plateformes ?", a: "Non. Il répond à votre propre ligne pour qu'un appelant ne tombe pas sur une ligne occupée. Les commandes des plateformes continuent d'arriver comme aujourd'hui." },
        { q: "Comment apprend-il la carte ?", a: "Vous nous donnez la carte une fois — articles, tailles, substitutions — et VoxOrder la lit comme le ferait votre équipe." },
      ],
      ctaHeading: "Mettez VoxOrder sur votre ligne à emporter",
      ctaLabel: "Réserver un échange pilote",
    },
    "drive-thru": {
      title: "Prise de commande vocale IA au drive",
      description:
        "VoxDrive est un concept pour la voie du drive : un agent vocal qui prend la commande, la confirme et fait avancer la file. Pas encore construit — manifestez votre intérêt.",
      eyebrow: "Drive",
      h1: "Une voix à la borne qui fait avancer la file.",
      lede: "La commande au drive, c'est le même métier que la commande par téléphone, avec une file derrière. VoxDrive est le concept pour la prendre — avec précision, rapidement, avec l'accent d'ici.",
      statusLabel: STATUS_FR.concept,
      statusNote: "VoxDrive est un concept. Rien sur cette page n'est en production nulle part ; elle décrit où va la famille Vox, pour que vous nous disiez si elle doit y aller.",
      problemHeading: "Le problème",
      problem: "Le temps passé dans la voie se décide à la borne. Une commande mal entendue ou un échange lent retarde chaque voiture derrière.",
      lostHeading: "Ce que cela changerait",
      lost: "Une prise de commande plus rapide et plus précise à la borne, ce sont des files plus courtes et moins de plats refaits à la fenêtre.",
      lostPoints: ["Un temps de passage dicté par l'échange le plus lent", "Des commandes mal entendues refaites à la fenêtre", "Du personnel tiré de la cuisine vers le casque"],
      howHeading: "Comment VoxDrive est censé fonctionner",
      how: "Prendre la commande à la borne, la confirmer, envoyer le ticket, et passer tout ce qui sort de l'ordinaire à une personne au casque.",
      steps: [
        { title: "Prend la commande", body: "En connaissant la carte, options comprises." },
        { title: "La confirme", body: "Relue avant que la voiture n'avance." },
        { title: "Envoie le ticket", body: "Prêt à faire quand la voiture arrive à la fenêtre." },
        { title: "Passe la main", body: "Une personne au casque pour tout ce qu'il ne peut pas gérer." },
      ],
      featuresHeading: "Ce pour quoi il est conçu",
      features: [
        { title: "La même voix qu'au téléphone", body: "Continuité de la famille Vox si vous l'utilisez déjà sur la ligne." },
        { title: "L'accent d'ici", body: "Conçu pour comprendre comment on commande ici, pas un script de franchise." },
        { title: "Un périmètre honnête", body: "Un concept, présenté comme tel." },
        { title: "Manifestez votre intérêt", body: "Parlez-nous de votre voie et nous vous dirons quand ce sera réel." },
      ],
      benefitsHeading: "Ce que cela doit changer",
      benefits: ["Des files plus courtes", "Moins de plats refaits", "Le personnel au casque de retour en cuisine", "Une seule voix, au téléphone et à la borne"],
      faqHeading: "Les questions sur VoxDrive",
      faqs: [
        { q: "Puis-je le tester maintenant ?", a: "Non — c'est un concept. Manifestez votre intérêt et nous vous contacterons quand il y aura quelque chose de réel à démontrer." },
        { q: "Pourquoi publier un concept ?", a: "Pour que les établissements nous disent s'il vaut la peine d'être construit, et pour que personne ne le prenne pour un produit en production." },
      ],
      ctaHeading: "Parlez-nous de votre voie",
      ctaLabel: "Manifester mon intérêt",
    },
    medical: {
      title: "Réponse téléphonique IA pour cabinets médicaux",
      description:
        "Les appels débordants et hors horaires d'un cabinet méritent une réponse compétente. VoxConcierge est en développement pour couvrir l'accueil — manifestez votre intérêt pour un usage médical.",
      eyebrow: "Cabinets médicaux",
      h1: "Le téléphone du cabinet, couvert quand l'accueil est occupé.",
      lede: "Le téléphone d'un cabinet sonne pendant que la secrétaire est avec un patient. VoxConcierge est en développement pour prendre l'appel ordinaire — horaires, itinéraire, un message qui atteint la bonne personne — et transmettre tout le reste directement à un humain.",
      statusLabel: STATUS_FR.dev,
      statusNote: "VoxConcierge est en développement. L'usage médical est un domaine que nous explorons avec des partenaires pilotes ; rien ici ne décrit un déploiement clinique en production, et toute question clinique va toujours à une personne.",
      problemHeading: "Le problème",
      problem: "L'accueil est interrompu en permanence, et les appelants qui tombent sur un répondeur rappellent plus tard — ou pas.",
      lostHeading: "Ce que ça coûte",
      lost: "Les appels manqués d'un cabinet, ce sont des rendez-vous manqués et des patients frustrés, des deux côtés du comptoir.",
      lostPoints: ["Les appels débordants partent sur le répondeur", "Les appelants hors horaires n'obtiennent rien", "L'équipe interrompue pour des questions de routine"],
      howHeading: "Comment il est conçu pour aider",
      how: "Répondre à l'appel de routine, prendre un message précis, et diriger tout ce qui est clinique ou urgent vers une personne immédiatement — jamais de tri, jamais de conseil.",
      steps: [
        { title: "Répond aux débordements", body: "L'appel que l'accueil n'a pas pu prendre." },
        { title: "Gère la routine", body: "Horaires, adresse, quoi apporter." },
        { title: "Prend un message propre", body: "Nom, numéro, motif — remis dans la bonne boîte." },
        { title: "Dirige le reste", body: "Tout ce qui est clinique va à une personne, immédiatement." },
      ],
      featuresHeading: "Ce pour quoi il est conçu",
      features: [
        { title: "La routine seulement, par conception", body: "Il ne donne ni conseil ni tri." },
        { title: "Des messages précis", body: "Relus et enregistrés." },
        { title: "Un aiguillage humain", body: "Une personne pour tout ce qui compte." },
        { title: "Manifestez votre intérêt", body: "Les cabinets façonnent ce que cela devient." },
      ],
      benefitsHeading: "Ce que cela doit changer",
      benefits: ["Moins d'appels manqués à l'accueil", "Une secrétaire non interrompue avec les patients", "Les appelants hors horaires pris en compte", "Une trace claire de ce que le téléphone a pris"],
      faqHeading: "Les questions des cabinets",
      faqs: [
        { q: "Donnera-t-il des conseils médicaux ?", a: "Non. Il est conçu pour les appels de routine de l'accueil uniquement ; tout ce qui est clinique ou urgent va immédiatement à une personne." },
        { q: "Est-il disponible maintenant ?", a: "Pas encore — il est en développement. Manifestez votre intérêt et nous parlerons de ce qu'un pilote en cabinet exigerait." },
      ],
      ctaHeading: "Parlons de la couverture de votre cabinet",
      ctaLabel: "Manifester mon intérêt",
    },
    "professional-services": {
      title: "Réceptionniste IA pour les professions libérales",
      description:
        "Droit, expertise comptable, conseil : chaque sonnerie interrompt une heure facturable. VoxConcierge est en développement pour couvrir l'accueil des cabinets — manifestez votre intérêt.",
      eyebrow: "Professions libérales",
      h1: "Chaque appel décroché, sans interrompre ceux qui facturent.",
      lede: "Dans un petit cabinet, tout le monde facture et personne n'est réceptionniste. VoxConcierge est en développement pour répondre au téléphone, prendre un message précis et diriger l'appel — pour que le travail continue.",
      statusLabel: STATUS_FR.dev,
      statusNote: "VoxConcierge est en développement. La couverture des professions libérales est un domaine que nous explorons avec des partenaires pilotes ; rien ici n'est encore en production.",
      problemHeading: "Le problème",
      problem: "Le téléphone interrompt le travail qu'il est censé apporter. Le répondeur perd le nouveau client ; décrocher coûte l'heure.",
      lostHeading: "Ce que ça coûte",
      lost: "Une demande de nouveau client qui tombe sur un répondeur, c'est souvent la dernière fois qu'on en entend parler.",
      lostPoints: ["Les nouvelles demandes tombent sur le répondeur", "Du temps facturable passé sur des appels de routine", "Des messages perdus entre les personnes"],
      howHeading: "Comment il est conçu pour aider",
      how: "Répondre, prendre les coordonnées et le motif de l'appelant, diriger vers la bonne personne, et passer la main en direct quand l'appelant a besoin d'un humain maintenant.",
      steps: [
        { title: "Répond à chaque appel", body: "Avec professionnalisme, d'une voix naturelle." },
        { title: "Prend des coordonnées précises", body: "Nom, numéro, dossier — relus." },
        { title: "Dirige correctement", body: "Vers la bonne boîte ou la bonne personne." },
        { title: "Passe la main en direct", body: "Quand l'appelant a besoin d'une personne maintenant." },
      ],
      featuresHeading: "Ce pour quoi il est conçu",
      features: [
        { title: "Un ton professionnel", body: "Calme, précis, honnête sur le fait d'être une IA." },
        { title: "Des messages propres", body: "Remis là où ils doivent aller." },
        { title: "Un passage de main en direct", body: "Une personne quand cela compte." },
        { title: "Manifestez votre intérêt", body: "Les cabinets façonnent ce qui sera livré." },
      ],
      benefitsHeading: "Ce que cela doit changer",
      benefits: ["Aucune nouvelle demande perdue sur un répondeur", "Des heures facturables sans interruption", "Des messages qui atteignent la bonne personne", "Une trace de chaque appel"],
      faqHeading: "Les questions des cabinets",
      faqs: [
        { q: "Peut-il traiter des dossiers confidentiels ?", a: "Il prend des coordonnées et dirige ; il ne conseille pas. Tout ce qui est sensible va à une personne sur votre ligne." },
        { q: "Est-il disponible maintenant ?", a: "Pas encore — en développement. Manifestez votre intérêt et nous discuterons d'un pilote." },
      ],
      ctaHeading: "Parlons de la couverture de votre cabinet",
      ctaLabel: "Manifester mon intérêt",
    },
    enterprise: {
      title: "Automatisation téléphonique IA pour les groupes",
      description:
        "Les groupes multi-sites ont besoin d'un standard de voix unique et d'une visibilité centrale. Parlez à BitePerk du déploiement de Vox sur vos établissements, en commençant par un site pilote en Europe.",
      eyebrow: "Groupes",
      h1: "Un seul standard de voix sur le téléphone de chaque établissement.",
      lede: "Les groupes perdent des réservations comme les établissements isolés — site par site. Vox se déploie avec une configuration partagée, un reporting central et un site pilote d'abord.",
      statusLabel: STATUS_FR.live,
      statusNote: "Les capacités en production (réservations, vente à emporter) sont livrées aujourd'hui en Australie. Un engagement de groupe en Europe commence par un établissement pilote sur une vraie ligne.",
      problemHeading: "Le problème",
      problem: "Chaque établissement invente sa propre parade aux débordements. Le siège ne voit pas ce que produisent les téléphones, et l'expérience client dérive d'un site à l'autre.",
      lostHeading: "Ce que ça coûte",
      lost: "Faites le calcul : un taux d'appels manqués ordinaire sur vingt établissements, c'est une ligne budgétaire, pas une anecdote.",
      lostPoints: ["Une expérience client incohérente selon le site", "Aucune vue unique des résultats des appels", "Des déploiements bloqués par une téléphonie sur mesure"],
      howHeading: "Comment se déroule un déploiement",
      how: "Piloter un établissement, standardiser la voix, étendre avec des méthodes éprouvées, et voir le réseau au même endroit.",
      steps: [
        { title: "Piloter un établissement", body: "Prouver les réservations prises sur une vraie ligne avant d'aller plus loin." },
        { title: "Standardiser la voix", body: "Un même savoir-faire, des détails locaux là où ils comptent." },
        { title: "Étendre avec des méthodes", body: "Un onboarding des sites qui ne réinvente pas la téléphonie à chaque fois." },
        { title: "Voir le réseau", body: "Des résultats visibles au-delà du carnet d'un seul directeur." },
      ],
      featuresHeading: "Ce que vous obtenez",
      features: [
        { title: "Un produit qui est livré", body: "Les discussions de groupe partent de capacités en production, pas d'une feuille de route." },
        { title: "Un contrôle par site", body: "Horaires et règles locales sans perdre les standards du groupe." },
        { title: "Une visibilité centrale", body: "Le téléphone de chaque établissement, une seule vue." },
        { title: "Un partenaire humain", body: "Vous n'êtes pas laissé seul face à un labyrinthe en libre-service." },
      ],
      benefitsHeading: "Ce qui change",
      benefits: ["Une expérience téléphonique cohérente pour les clients", "Des résultats au niveau du portefeuille", "Un onboarding plus rapide après le pilote", "Une démarche qui respecte les achats"],
      faqHeading: "Les questions des groupes",
      faqs: [
        { q: "Prenez-vous en charge les groupes multi-marques ?", a: "Oui — voix de marque, reporting partagé et exceptions par site font partie de la discussion pilote." },
        { q: "Y a-t-il une offre entreprise distincte ?", a: "La forme commerciale dépend du nombre d'établissements et des capacités, convenue par pilote. Commencez par un établissement plutôt que par un catalogue." },
      ],
      ctaHeading: "Commencez par un établissement",
      ctaLabel: "Réserver un échange pilote",
    },
  },
};
