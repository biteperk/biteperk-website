> **Filed as evidence, 14 September 2026.** Ludovic Roux read this batch and passed it
> **with no corrections**. The pass was **verbal, on a call** — there is no email or
> written sign-off behind it, which is why this document is filed: it is the only record
> of which lines the pass covered. Recorded in `docs/accounts-and-ops-log.md`.
>
> Do not edit it — later French batches get their own dated file. This batch is **not**
> pinned by `tests/unit/fr-review.test.mjs` (that test pins the 13 Sep city-title batch,
> whose strings are unchanged). These strings live in the consent/cookie/privacy copy,
> which was last reviewed in the 7 Sep batch; this file records the changes made since.

---

# French copy review — Umami analytics migration

**Prepared for:** Ludovic · **Date:** 14 September 2026 · **Requested by:** Sam Kalaliya

## What this is

We replaced the analytics tool (Plausible → self-hosted **Umami**) and changed the
privacy posture: analytics is now **cookieless, holds no personal data (IP hashed, never
stored), needs no consent and loads by default**, with a one-click opt-out in the cookie
banner. That makes several French sentences in the consent modal, the cookie policy and
the privacy notice out of date. This batch is **only** those sentences.

Where these appear: the cookie-settings modal and `/fr` + `/be-fr` cookie and privacy
pages. `Umami` is a product name and stays in English; `« Paramètres des cookies »` is the
existing label for the banner's settings link.

## The changes

| Where | English (reference) | French (new) |
|---|---|---|
| Consent modal — Analytics category (`copy.ts` consent) | Privacy-first, cookieless analytics (self-hosted Umami) … on by default; switch it off here and it stops immediately. | Statistiques sans cookies et respectueuses de la vie privée (Umami, que nous hébergeons nous-mêmes), qui comptent les visites et les liens utiles aux visiteurs — agrégées, sans cookies, sans suivi entre sites, sans profil personnel, l'adresse IP étant hachée et jamais conservée. Sans données personnelles, elles ne nécessitent pas de consentement et sont activées par défaut ; désactivez-les ici et elles s'arrêtent aussitôt. |
| Cookie policy — Analytics section (`/fr`, `/be-fr`) | We use Umami, a privacy-friendly analytics tool that we host ourselves … runs by default; switch it off from Cookie settings. | Nous utilisons Umami, un outil de mesure d'audience que nous hébergeons nous-mêmes. Sans cookie, il comptabilise les pages vues sans suivi inter-sites et sans constituer de profil, et les adresses IP sont hachées pour compter les visiteurs uniques, jamais conservées. Comme il ne traite aucune donnée personnelle, il ne nécessite pas de consentement et fonctionne par défaut ; vous pouvez le désactiver à tout moment depuis « Paramètres des cookies ». |
| Privacy notice — final sentence of "what we collect" (`/fr`, `/be-fr`) | Our analytics (self-hosted Umami) are cookieless, set nothing on your device and keep no personal data; they run by default and you can switch them off from Cookie settings. | Notre mesure d'audience (Umami, que nous hébergeons nous-mêmes) est sans cookie, ne dépose rien sur votre appareil et ne conserve aucune donnée personnelle ; elle fonctionne par défaut et vous pouvez la désactiver depuis « Paramètres des cookies ». |
| Privacy summary line (`/fr`, `/be-fr`) | We use privacy-first, self-hosted, cookieless analytics (Umami) and Google consent mode for ad measurement … | Nous utilisons des statistiques respectueuses de la vie privée, sans cookie et que nous hébergeons nous-mêmes (Umami), ainsi que le mode consentement de Google pour la mesure publicitaire … |

## Note on residency

The French deliberately says "que nous hébergeons nous-mêmes" (self-hosted) and makes **no
claim about where** Umami runs. The instance is on Railway (US); no French/EU hosting is
claimed anywhere, consistent with the site's Europe-truthful rules.
