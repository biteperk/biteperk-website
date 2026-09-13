/**
 * Resources furniture for the international trees — the language-scoped
 * strings around the articles in src/content/intl-resources/. Kept out of
 * CopyBundle (like intl/solutions.ts) so a market cannot fork it.
 *
 * Type ids/segments come from src/data/resources.ts; only the LABELS are here.
 * French written 13 Sep 2026 — NOT yet reviewed (next Ludovic batch).
 */
import type { Lang } from "../locales";
import type { ResourceType } from "../resources";

export type IntlResourcesCopy = {
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly h1: string;
  readonly lede: string;
  readonly types: Readonly<Record<ResourceType, { readonly label: string; readonly plural: string; readonly description: string }>>;
  readonly builtFor: string;
  readonly allLabel: string;
  readonly readLabel: string;
  readonly backLabel: string;
  readonly publishedLabel: string;
  readonly ctaLabel: string;
};

export const intlResources: Record<Lang, IntlResourcesCopy> = {
  en: {
    title: "Resources — guides and comparisons on AI phone answering",
    description: "Plain-English guides and comparisons on missed calls, AI phone answering and running a busy venue phone — written for operators, not for search engines.",
    eyebrow: "Resources",
    h1: "Plain-English help for a busy phone.",
    lede: "Guides and comparisons written so operators can trust what we say about the phone. Every article says what ships today and what is still a pilot.",
    types: {
      guide: { label: "Guide", plural: "Guides", description: "Field notes for operators — missed calls, bookings and running the phone." },
      comparison: { label: "Comparison", plural: "Comparisons", description: "Buyer-intent breakdowns — an AI host against voicemail, call centres and answering services." },
      "case-study": { label: "Case study", plural: "Case studies", description: "Proof from real venues — what changed on the phone and on the floor." },
      faq: { label: "FAQ", plural: "FAQs", description: "Straight answers — short, citeable, no jargon." },
      "product-update": { label: "Product update", plural: "Product updates", description: "What shipped and why." },
      "industry-report": { label: "Industry report", plural: "Industry reports", description: "Longer pieces on phone automation in hospitality." },
    },
    builtFor: "Built for",
    allLabel: "All resources",
    readLabel: "Read",
    backLabel: "All resources",
    publishedLabel: "Published",
    ctaLabel: "Book a pilot conversation",
  },
  fr: {
    title: "Ressources — guides et comparatifs sur la réponse téléphonique IA",
    description: "Des guides et comparatifs en langage clair sur les appels manqués, la réponse téléphonique IA et la gestion d'un téléphone chargé — écrits pour les exploitants, pas pour les moteurs de recherche.",
    eyebrow: "Ressources",
    h1: "Une aide en langage clair pour un téléphone chargé.",
    lede: "Des guides et des comparatifs écrits pour que les exploitants puissent se fier à ce que nous disons du téléphone. Chaque article précise ce qui est en production et ce qui reste un pilote.",
    types: {
      guide: { label: "Guide", plural: "Guides", description: "Des notes de terrain pour les exploitants — appels manqués, réservations et gestion du téléphone." },
      comparison: { label: "Comparatif", plural: "Comparatifs", description: "Des analyses pour décider — un hôte IA face au répondeur, aux centres d'appels et aux services de permanence." },
      "case-study": { label: "Étude de cas", plural: "Études de cas", description: "Des preuves venues d'établissements réels — ce qui a changé au téléphone et en salle." },
      faq: { label: "FAQ", plural: "FAQ", description: "Des réponses directes — courtes, citables, sans jargon." },
      "product-update": { label: "Nouveauté produit", plural: "Nouveautés produit", description: "Ce qui a été livré et pourquoi." },
      "industry-report": { label: "Rapport sectoriel", plural: "Rapports sectoriels", description: "Des analyses plus longues sur l'automatisation du téléphone dans l'hôtellerie-restauration." },
    },
    builtFor: "Conçu pour",
    allLabel: "Toutes les ressources",
    readLabel: "Lire",
    backLabel: "Toutes les ressources",
    publishedLabel: "Publié le",
    ctaLabel: "Réserver un échange pilote",
  },
};
