/**
 * Compliance registry — the per-market LEGAL FACTS every tree renders from.
 *
 * One typed entry per Market: who the visitor contracts with, which
 * supervisory authority they can complain to, which law governs, which
 * consent regime the cookie notice implements, which statutory website
 * disclosures apply, the contact mailbox, and the one honest sentence about
 * where the team is. Templates (TrustPanel, the contact page, the footer
 * disclosure, the privacy pages) read these; check-market-disclosure asserts
 * the built pages carry them.
 *
 * ── What this file is NOT ────────────────────────────────────────────────────
 * It names authorities and facts. It never claims compliance: "compliant
 * with", "certified", "conforme au RGPD" are banned on every non-legal page by
 * check-truthful, and nothing here is a legal opinion. Every string that is
 * legal in nature (the law names, the complaint sentences in markets.ts) needs
 * counsel's review before it changes — Natalia (Integrant) reviewed the
 * international privacy position in Sep 2026; record the next review under
 * docs/ops-records/.
 *
 * Adding a market (Canada, Wave 7) is a compile error until its entry exists:
 * the record is keyed by the Market union in locales.ts.
 */
import type { Lang, Market } from "../locales";
import { entities, site, ukEmail } from "../site";

export type ConsentRegime = "au-privacy-act" | "gdpr-eprivacy" | "uk-gdpr-pecr";

export type MarketCompliance = {
  /** Which legal entity the visitor contracts with (site.ts `entities`). */
  readonly controller: keyof typeof entities;
  /** Supervisory / privacy authority, or null for the geography-neutral tree. */
  readonly authority: { readonly name: Record<Lang, string>; readonly short: string; readonly url: string } | null;
  /** The data-protection law that governs, named plainly (not a claim). */
  readonly law: Record<Lang, string>;
  readonly consentRegime: ConsentRegime;
  /** Statutory website-disclosure duties the tree must satisfy on EVERY page. */
  readonly disclosures: readonly ("uk-companies-reg25" | "uk-ecommerce-reg6")[];
  /** Published contact mailbox for the audience (CLAUDE.md domain-by-audience rule). */
  readonly contactEmail: string;
  /** Where the team is, honestly — no premises, no phone line implied. */
  readonly timeZoneNote: Record<Lang, string>;
};

// Market-specific wording on purpose: the five homes are scored for mutual
// similarity (check-intl-similarity, 35% ceiling) and one identical sentence
// on all of them cost three points of headroom.
const note = (en: string, fr: string): Record<Lang, string> => ({ en, fr });
const INT_NOTE = note(
  "The team is in Sydney, Australia. Wherever you are writing from, a reply usually arrives within one business day — often overnight, your time.",
  "L'équipe est à Sydney, en Australie. D'où que vous écriviez, la réponse arrive généralement sous un jour ouvré — souvent pendant votre nuit.",
);
const UK_NOTE = note(
  "BitePerk's team works from Sydney. A UK enquiry sent in the afternoon is usually answered by the next morning, within one business day.",
  "L'équipe de BitePerk travaille depuis Sydney. Une demande envoyée l'après-midi depuis le Royaume-Uni reçoit généralement sa réponse le lendemain matin, sous un jour ouvré.",
);
const FR_NOTE = note(
  "Our team is based in Sydney, nine or ten hours ahead of France. Send an enquiry today and you will usually have an answer tomorrow morning.",
  "Notre équipe est basée à Sydney, avec neuf ou dix heures d'avance sur la France. Envoyez une demande aujourd'hui et vous aurez généralement une réponse demain matin.",
);
const BE_NOTE = note(
  "The people who answer are in Sydney, ahead of Belgium by most of a working day — enquiries sent in Belgian office hours are typically answered before the next one starts.",
  "Les personnes qui répondent sont à Sydney, avec presque une journée de travail d'avance sur la Belgique — une demande envoyée aux heures de bureau belges reçoit généralement sa réponse avant le début des suivantes.",
);

export const compliance: Readonly<Record<Market, MarketCompliance>> = {
  au: {
    controller: "au",
    authority: { name: { en: "Office of the Australian Information Commissioner", fr: "Office of the Australian Information Commissioner" }, short: "OAIC", url: "https://www.oaic.gov.au/" },
    law: { en: "the Privacy Act 1988 (Cth)", fr: "le Privacy Act 1988 (Cth)" },
    consentRegime: "au-privacy-act",
    disclosures: [],
    contactEmail: site.email.display,
    timeZoneNote: { en: "The team is in Sydney; we reply during Australian business hours.", fr: "L'équipe est à Sydney ; nous répondons pendant les heures ouvrées australiennes." },
  },
  int: {
    controller: "au",
    // The x-default serves the whole world outside the five markets: no single
    // authority is honest here. The privacy notice names the GDPR where it applies.
    authority: null,
    law: { en: "the GDPR where it applies, and the equivalent local rule elsewhere", fr: "le RGPD lorsqu'il s'applique, et la règle locale équivalente ailleurs" },
    consentRegime: "gdpr-eprivacy",
    disclosures: [],
    contactEmail: ukEmail.display,
    timeZoneNote: INT_NOTE,
  },
  gb: {
    controller: "uk",
    authority: { name: { en: "the Information Commissioner's Office", fr: "l'Information Commissioner's Office" }, short: "ICO", url: "https://ico.org.uk/" },
    law: { en: "the UK GDPR and the Data Protection Act 2018", fr: "le UK GDPR et le Data Protection Act 2018" },
    consentRegime: "uk-gdpr-pecr",
    disclosures: ["uk-companies-reg25", "uk-ecommerce-reg6"],
    contactEmail: ukEmail.display,
    timeZoneNote: UK_NOTE,
  },
  fr: {
    controller: "au",
    authority: { name: { en: "the CNIL (Commission nationale de l'informatique et des libertés)", fr: "la CNIL (Commission nationale de l'informatique et des libertés)" }, short: "CNIL", url: "https://www.cnil.fr/" },
    law: { en: "the GDPR and the French Data Protection Act (loi Informatique et Libertés)", fr: "le RGPD et la loi Informatique et Libertés" },
    consentRegime: "gdpr-eprivacy",
    disclosures: [],
    contactEmail: ukEmail.display,
    timeZoneNote: FR_NOTE,
  },
  be: {
    controller: "au",
    authority: { name: { en: "the Belgian Data Protection Authority (APD/GBA)", fr: "l'Autorité de protection des données (APD/GBA)" }, short: "APD/GBA", url: "https://www.dataprotectionauthority.be/" },
    law: { en: "the GDPR and the Belgian Data Protection Act of 30 July 2018", fr: "le RGPD et la loi belge du 30 juillet 2018" },
    consentRegime: "gdpr-eprivacy",
    disclosures: [],
    contactEmail: ukEmail.display,
    timeZoneNote: BE_NOTE,
  },
};

export const complianceFor = (market: Market): MarketCompliance => compliance[market];
