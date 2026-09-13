> **Sent for review, 13 September 2026 — NOT yet passed.** This batch collects every French string written after Ludovic's 7 Sep verbal pass (found with `extract-fr-review.mjs --since origin/main`, not from memory). Until it is passed, the source marks each string as unreviewed and the PRs carrying it (#69, fix/intl-structure, fix/fr-copy) must not deploy. When the pass lands, record it here and in `docs/accounts-and-ops-log.md` — do not edit the rows below; they are what was sent.

---

# French copy review — BitePerk international site

**Prepared for:** Ludovic · **Date:** 13 September 2026 · **Requested by:** Sam Kalaliya

## What this is

BitePerk's international site (biteperk.com) ships in five trees — `/en`, `/gb-en` (UK), `/fr` (France), `/be-en` and `/be-fr` (Belgium). The French you reviewed on **7 September 2026** is live and unchanged; this document collects **only the French written since then**, which is marked `DRAFT` in the source and has never had a native pass.

Everything below is already on the site or is one merge away from it, so a correction here changes what prospects read. One item is a hard blocker: the **city-page furniture** gates every future French city page (Paris, Brussels-FR) — nothing French can launch in a city until it is signed off.

## How to use it

Each table has an English reference column, the current French draft, and an empty **Your correction** column. You can:
- leave a cell empty if the draft is fine,
- rewrite the French in the cell, or
- write a short note ("too familiar", "wrong register") and we'll redraft.

Marking up this file directly, or replying with just the rows you'd change, both work.

## Register and constraints

- **Vouvoiement throughout**, professional but not stiff — the same voice as the July copy.
- The audience is **restaurant and hotel operators**, not developers. Plain words beat technical ones.
- We describe a **pilot programme**, never a shipped European product: there is no European office, no European phone number, and no local staff. If a draft implies otherwise, that is a bug worth flagging.
- Legal phrasing (GDPR/RGPD article references, the AI Act citation) is deliberate and checked by automated gates — please correct the *French*, but flag rather than remove a citation.

## The clusters

| # | Cluster | Where it appears | Blocking? |
|---|---|---|---|
| 1 | Chrome — accessible names, 404, organisation description | Every French page (screen-reader names + the one 404 page for all trees) | No |
| 2 | **Contact form runtime strings** | `/fr` and `/be-fr` contact pages, after submit | **Yes — gates deploying the French contact-form fix** |
| 3 | City pages — Service description (structured data) | Every French city page, in the JSON-LD search engines and answer engines read; {city} is replaced by the city name | No |
| 4 | Market lines (France / Belgium) | French city pages: the note under the district chips, and the 'other cities' eyebrow | No |

**On VoxStay (cluster 6):** this is the hotel receptionist product, in development. It's the one we'd most like your eye on as an operator as well as a native speaker — if a claim reads as overpromising in French, say so.


### Cluster 1 — chrome: accessible names, the 404 page, the organisation description (source: `copy.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `a11y.skipToContent` | Skip to content | Aller au contenu | |
| `a11y.brandHome` | BitePerk home | Accueil BitePerk | |
| `a11y.siteNav` | Site | Navigation principale | |
| `a11y.breadcrumb` | Breadcrumb | Fil d'Ariane | |
| `a11y.closeCities` | Close cities menu | Fermer le menu des villes | |
| `a11y.regionCurrent` | Region and language — currently {label} | Région et langue — actuellement {label} | |
| `a11y.closeRegion` | Close region picker | Fermer le sélecteur de région | |
| `a11y.themeToggle` | Switch theme | Changer de thème | |
| `a11y.themeToLight` | Switch to light theme | Passer au thème clair | |
| `a11y.themeToDark` | Switch to dark theme | Passer au thème sombre | |
| `orgDescription` | BitePerk builds Vox, the AI phone host for hospitality — it answers every call in a natural voice, takes bookings and orders, and hands over to the venue the moment a person is needed. Founded in Sydney; pilot partnerships with venues in the UK, France and Belgium. | BitePerk développe Vox, l'hôte téléphonique IA pour l'hôtellerie-restauration : il répond à chaque appel avec une voix naturelle, prend les réservations et les commandes, et passe la main à l'établissement dès qu'une personne est nécessaire. Fondée à Sydney ; partenariats pilotes avec des établissements au Royaume-Uni, en France et en Belgique. | |
| `notFound.eyebrow` | 404 · Page not found | 404 · Page introuvable | |
| `notFound.title` | This page is having a quiet night. | Cette page passe une soirée calme. | |
| `notFound.body` | We couldn't find what you were looking for. Try the home page, or write to us. | Nous n'avons pas trouvé la page demandée. Essayez la page d'accueil, ou écrivez-nous. | |
| `notFound.home` | Home | Accueil | |
| `notFound.contact` | Contact | Contact | |

### Cluster 2 — contact form — what the visitor reads after pressing the button ⚠️ BLOCKING (source: `copy.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `form.runtime.sending` | Sending… | Envoi… | |
| `form.runtime.successTitle` | Thanks — we'll be in touch. | Merci — nous revenons vers vous. | |
| `form.runtime.successBody` | Your request has reached the BitePerk team. We'll reply within a business day. | Votre demande est arrivée chez l'équipe BitePerk. Réponse sous un jour ouvré. | |
| `form.runtime.error` | Sorry — something went wrong. Please try again. | Désolé — quelque chose n'a pas fonctionné. Merci de réessayer. | |
| `form.runtime.networkError` | Network error — please try again or email {email}. | Erreur réseau — réessayez ou écrivez à {email}. | |

### Cluster 3 — city pages — the structured-data service description (source: `copy.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `serviceName` | AI phone answering for {city} restaurants | Hôte téléphonique IA pour les restaurants de {city} | |
| `serviceAltName` | AI receptionist for {city} restaurants | Réceptionniste IA pour les restaurants de {city} | |
| `serviceTypes[0]` | AI phone answering and reservation booking | Réponse téléphonique IA et prise de réservations | |
| `serviceTypes[1]` | AI receptionist for restaurants | Réceptionniste IA pour restaurants | |
| `audienceName` | Restaurants, cafés and venues | Restaurants, cafés et établissements | |

### Cluster 4 — market lines — France and Belgium city-page anchoring (source: `markets.ts`)

| Where | English (reference / gloss) | French (draft) | Your correction |
|---|---|---|---|
| `/fr` city pages — note under the district chips | Not on the list? The pilot programme isn't drawn by postcode — a venue anywhere in France works exactly the same way. | Votre quartier n'y figure pas ? Le programme pilote ne s'arrête pas à un code postal — un établissement situé n'importe où en France fonctionne exactement de la même manière. | |
| `/fr` city pages — 'other cities' eyebrow | Elsewhere in France | Ailleurs en France | |
| `/be-fr` city pages — note under the district chips | Not on the list? The pilot programme isn't drawn on a map — a venue anywhere in Belgium works exactly the same way. | Votre quartier n'y figure pas ? Le programme pilote ne se dessine pas sur une carte — un établissement situé n'importe où en Belgique fonctionne exactement de la même manière. | |
| `/be-fr` city pages — 'other cities' eyebrow | Elsewhere in Belgium | Ailleurs en Belgique | |

---

## What happens after you send this back

1. We apply your corrections and drop the `DRAFT` markers.
2. The French city-page furniture (cluster 2) unblocks Paris and Brussels-FR — those pages get written next.
3. VoxStay's French goes from draft to prospect-ready.

Thank you — this is the pass that lets the French side of the site grow.
<!-- 30 rows -->
