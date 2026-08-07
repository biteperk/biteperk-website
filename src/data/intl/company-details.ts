/**
 * `/gb-en/legal/company-details/` — the UK statutory disclosure page.
 *
 * WHY THIS PAGE EXISTS. Two separate instruments impose website-disclosure
 * duties on a UK company, and the second is the one that is usually missed:
 *
 *   1. SI 2015/17 reg 24-25 (Companies Act 2006 s.82) — a company must disclose
 *      its registered name, the part of the UK in which it is registered, its
 *      registered number and its registered office address ON ITS WEBSITES.
 *   2. The Electronic Commerce (EC Directive) Regulations 2002 reg 6 — a
 *      service provider must make available, "easily, directly and
 *      permanently accessible": its name, the geographic address at which it is
 *      established, contact details INCLUDING AN ELECTRONIC MAIL ADDRESS that
 *      allow rapid and direct communication, and its trade-register details.
 *      Reg 6(1)(f) adds the VAT number where the activity is VAT-liable, and
 *      reg 6(2) requires prices to state whether they include tax.
 *
 * "Permanently accessible" is why this is a page rather than a paragraph buried
 * in the terms, and reg 6(1)(c) is why a contact form alone is not enough — the
 * email address is a legal requirement, not a convenience.
 *
 * WHY IT IS ENGLISH-ONLY AND UK-ONLY. Biteperk Ltd is registered in England and
 * Wales; the duties above attach to that company's own site. There is no French
 * or Belgian entity, so the same page on /fr or /be-* would disclose nothing and
 * imply a presence that does not exist. It is therefore NOT a CopyBundle key —
 * making it one would force both language cores to carry a bundle that only one
 * tree can ever render, and would put unused French in front of Ludovic.
 *
 * WHY THERE ARE NO FACTS IN THIS FILE. Every name, number and address is read
 * from `entities.uk` in site.ts. A registered office that drifts between the
 * footer and this page is a disclosure failure, not a typo, so there is exactly
 * one place to change it — and check-schema byte-checks it against the built
 * output the same way it does the AU NAP.
 *
 * Source of record is Companies House. Third-party aggregators publish INFERRED
 * size and turnover bands for companies that have filed no accounts (Biteperk
 * Ltd's first are not due until 4 May 2028); none of that belongs on this page.
 */
import type { SimplePageCopy } from "./copy";
import { entities, ukEmail } from "@/data/site";

const uk = entities.uk;
const office = `${uk.office.street}, ${uk.office.locality}, ${uk.office.region}, ${uk.office.postalCode}`;

export const companyDetails: SimplePageCopy = {
  title: "Company details — BitePerk",
  description:
    "Registered company information for Biteperk Ltd: registered name, company number, registered office and contact details.",
  eyebrow: "Legal",
  h1: "Company details",
  intro:
    "The information on this page is published to meet the disclosure requirements that apply to a company registered in the United Kingdom and to a provider of an online service.",
  sections: [
    {
      heading: "Registered company information",
      body: [
        `${uk.legalName} is a private limited company registered in ${uk.placeOfRegistration}. ${uk.registerLabel}: ${uk.registerNumber}.`,
        `Registered office: ${office}. This is a registered office address for the service of documents. It is not a trading premises, and BitePerk has no staff based there.`,
        `The company's public record can be checked at Companies House: ${uk.registerUrl}`,
      ],
    },
    {
      heading: "How to contact us",
      body: [
        `Email: ${ukEmail.display}. This is the fastest way to reach us and we read it every working day.`,
        "You can also use the contact form on this site. We do not publish a UK telephone number, because we do not operate one — the team answering your enquiry is in Sydney, Australia.",
      ],
    },
    {
      heading: "Group structure",
      body: [
        `${uk.legalName} is a subsidiary of ${entities.au.legalName}, an Australian company (${entities.au.registerLabel} ${entities.au.registerNumber}) based in Sydney, which operates this website and builds the Vox product.`,
      ],
    },
    {
      heading: "VAT",
      body: [
        "Biteperk Ltd is not currently registered for UK VAT, so no VAT registration number is published and no VAT is charged. Any prices quoted for UK pilots state whether tax is included.",
      ],
    },
    {
      heading: "What we do",
      body: [
        "Business and domestic software development; information technology consultancy; data processing, hosting and related activities. BitePerk builds Vox, an AI phone host for restaurants.",
      ],
    },
  ],
};
