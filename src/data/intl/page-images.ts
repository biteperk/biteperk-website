/**
 * One supporting photograph per international SUB-page.
 *
 * Why this exists: the market homes carry a hero and (except /en) a two-up
 * imagery band, but every sub-page shipped text-only across all five trees
 * while the equivalent AU pages all carry photography. That is the gap that
 * made the rest of each tree read as a wall of prose.
 *
 * Kept OUT of the copy bundle deliberately. Alt text is language-scoped, not
 * market-scoped — the picture on /gb-en/about and /be-en/about is the same
 * picture, so putting it in CopyBundle would force every market to restate an
 * identical value (merge() replaces arrays and objects wholesale) for no gain.
 * Keyed by page path, then by copyLang.
 *
 * Slug rules: reuse slugs already graded into public/images — no new
 * photography, so no repo-size or Lighthouse cost beyond the render. Every one
 * chosen here is geography-neutral, because these pages are shared across all
 * five trees: a London or Paris landmark on a page that also serves Belgium
 * would be worse than no picture at all.
 *
 * NOT `priority` and NOT preloaded, anywhere. Measured on the homes: the LCP
 * element on these trees is TEXT, so prioritising an image steals throttled
 * bandwidth from the thing actually being measured (see [...intl].astro).
 */
import type { Lang } from "@/data/locales";

export type PageImage = {
  slug: string;
  alt: Record<Lang, string>;
  /** Rendered aspect. Prose pages take a wide crop; it sits under the intro. */
  aspect: string;
};

export const intlPageImages: Readonly<Record<string, PageImage>> = {
  solutions: {
    slug: "restaurant-host",
    alt: {
      en: "A host taking a call at the front of a restaurant during service",
      fr: "Un hôte prenant un appel à l'entrée d'un restaurant pendant le service",
    },
    aspect: "16 / 9",
  },
  "how-it-works": {
    // The product story in one frame: a phone, on a bar, during service.
    slug: "phone-on-bar",
    alt: {
      en: "A phone resting on a bar counter during service",
      fr: "Un téléphone posé sur le comptoir d'un bar pendant le service",
    },
    aspect: "16 / 9",
  },
  about: {
    slug: "restaurant-evening",
    alt: {
      en: "A dining room lit for evening service",
      fr: "Une salle de restaurant éclairée pour le service du soir",
    },
    aspect: "16 / 9",
  },
  contact: {
    slug: "coffee-window",
    alt: {
      en: "A quiet café table by a window",
      fr: "Une table de café tranquille près d'une fenêtre",
    },
    aspect: "16 / 9",
  },
  products: {
    slug: "restaurant-pass",
    alt: {
      en: "The pass in a working kitchen, plates waiting to go out",
      fr: "Le passe d'une cuisine en service, des assiettes prêtes à partir",
    },
    aspect: "16 / 9",
  },
  // Legal pages stay text-only on purpose: a decorative photograph above a
  // privacy notice reads as marketing dressing on a document people go to for
  // plain answers.
};

export const pageImageFor = (page: string, base: string): PageImage | undefined =>
  intlPageImageOverrides[base]?.[page] ?? intlPageImages[page];

/**
 * One photo per product detail page, keyed by product slug. Same rules as
 * above — existing slugs, geography-neutral, per-language alt, never priority.
 * Each picture shows the moment the product is about, not the product: there
 * is no European deployment to photograph, and a mocked-up screen would be the
 * "no fake presence" rule broken with pixels instead of words.
 */
export const intlProductImages: Readonly<Record<string, PageImage>> = {
  voxtable: {
    slug: "reservation-book",
    alt: {
      en: "A reservation book open on the host stand",
      fr: "Un livre de réservations ouvert sur le pupitre d'accueil",
    },
    aspect: "16 / 9",
  },
  voxorder: {
    slug: "pizza-pass",
    alt: {
      en: "Takeaway orders waiting on the pass",
      fr: "Des commandes à emporter en attente sur le passe",
    },
    aspect: "16 / 9",
  },
  voxconcierge: {
    slug: "restaurant-host",
    alt: {
      en: "A host greeting guests at the front of house",
      fr: "Un hôte accueillant des clients à l'entrée de la salle",
    },
    aspect: "16 / 9",
  },
  voxstay: {
    slug: "hotel-reception",
    alt: {
      en: "A brass reception bell on a hotel front desk",
      fr: "Une sonnette en laiton sur le comptoir d'une réception d'hôtel",
    },
    aspect: "16 / 9",
  },
  voxdrive: {
    slug: "staff-hands-tray",
    alt: {
      en: "An order being handed over at the counter",
      fr: "Une commande remise au comptoir",
    },
    aspect: "16 / 9",
  },
};

export const productImageFor = (slug: string, base: string): PageImage | undefined =>
  intlProductImageOverrides[base]?.[slug] ?? intlProductImages[slug];

/**
 * One photo per solution vertical — the same geography-neutral rules as the
 * page and product maps above (graded slugs only, never priority/preloaded).
 */
export const intlSolutionImages: Readonly<Record<string, PageImage>> = {
  restaurants: { slug: "busy-service-night", alt: { en: "A dining room mid-service at night", fr: "Une salle de restaurant en plein service, le soir" }, aspect: "16 / 9" },
  hotels: { slug: "hotel-reception", alt: { en: "A hotel reception desk", fr: "Un comptoir de réception d'hôtel" }, aspect: "16 / 9" },
  cafes: { slug: "coffee-window", alt: { en: "A café table by a window", fr: "Une table de café près d'une fenêtre" }, aspect: "16 / 9" },
  takeaway: { slug: "kitchen-rush", alt: { en: "A kitchen during the rush", fr: "Une cuisine pendant le coup de feu" }, aspect: "16 / 9" },
  "drive-thru": { slug: "pizza-pass", alt: { en: "A pizza on the pass, ready to go", fr: "Une pizza au passe, prête à partir" }, aspect: "16 / 9" },
  medical: { slug: "reservation-book", alt: { en: "An appointment book open on a desk", fr: "Un carnet de rendez-vous ouvert sur un bureau" }, aspect: "16 / 9" },
  "professional-services": { slug: "phone-on-bar", alt: { en: "A phone resting on a counter", fr: "Un téléphone posé sur un comptoir" }, aspect: "16 / 9" },
  enterprise: { slug: "empty-tables-evening", alt: { en: "Tables set and waiting for evening service", fr: "Des tables dressées, en attente du service du soir" }, aspect: "16 / 9" },
};
export const solutionImageFor = (slug: string, base: string): PageImage | undefined =>
  intlSolutionImageOverrides[base]?.[slug] ?? intlSolutionImages[slug];

/**
 * Per-market OVERRIDES (rev. PR 2). The maps above are geography-neutral and
 * shared by all five trees; these replace a chosen slug on ONE tree where a
 * market-specific photo earns its place. Only /gb-en is populated: the UK photo
 * upgrade added British food and service frames, and a market page localises
 * the imagery the same way it localises the copy. Keyed base → page/slug →
 * PageImage; `*For(key, base)` consults the override first, else the shared map,
 * so a base with no entry (every tree but gb-en) is byte-unchanged. The `fr`
 * alt is filled for type-completeness only — gb-en is English and never serves
 * it, and no French tree is keyed here, so these British photos never reach
 * /fr or /be-fr.
 *
 * British food doubles onto the product/solution pages it fits (fish & chips →
 * takeaway, brunch → cafés), so the six gallery photos and these overrides draw
 * from one small graded set rather than adding more.
 */
const GB = "/gb-en";
export const intlPageImageOverrides: Readonly<Record<string, Record<string, PageImage>>> = {
  [GB]: {
    about: { slug: "uk-table-window", alt: { en: "A warm dining room, tables set before service", fr: "Une salle chaleureuse, tables dressées avant le service" }, aspect: "16 / 9" },
    "how-it-works": { slug: "uk-chef-pass", alt: { en: "Hands finishing a dish at the pass during service", fr: "Des mains dressant une assiette au passe pendant le service" }, aspect: "16 / 9" },
    solutions: { slug: "uk-sharing-plates", alt: { en: "Sharing plates and wine on a restaurant table", fr: "Des plats à partager et du vin sur une table de restaurant" }, aspect: "16 / 9" },
    products: { slug: "uk-chef-pass", alt: { en: "Hands plating at the pass in a working kitchen", fr: "Des mains au passe dans une cuisine en service" }, aspect: "16 / 9" },
    contact: { slug: "uk-wine-pour", alt: { en: "Red wine being poured into a glass", fr: "Du vin rouge versé dans un verre" }, aspect: "16 / 9" },
  },
};
export const intlProductImageOverrides: Readonly<Record<string, Record<string, PageImage>>> = {
  [GB]: {
    voxtable: { slug: "uk-table-window", alt: { en: "A restaurant dining room set for service", fr: "Une salle de restaurant dressée pour le service" }, aspect: "16 / 9" },
    voxorder: { slug: "uk-fish-and-chips", alt: { en: "Fish and chips, a takeaway classic", fr: "Fish and chips, un classique à emporter" }, aspect: "16 / 9" },
    voxconcierge: { slug: "uk-sharing-plates", alt: { en: "Sharing plates and wine on a table", fr: "Des plats à partager et du vin sur une table" }, aspect: "16 / 9" },
  },
};
export const intlSolutionImageOverrides: Readonly<Record<string, Record<string, PageImage>>> = {
  [GB]: {
    restaurants: { slug: "uk-sunday-roast", alt: { en: "A Sunday roast plated with gravy", fr: "Un rôti du dimanche nappé de sauce" }, aspect: "16 / 9" },
    cafes: { slug: "uk-brunch-plate", alt: { en: "A cooked brunch plate with coffee", fr: "Une assiette de brunch avec un café" }, aspect: "16 / 9" },
    takeaway: { slug: "uk-fish-and-chips", alt: { en: "Fish and chips ready to take away", fr: "Fish and chips prêts à emporter" }, aspect: "16 / 9" },
  },
};
