> **Filed as evidence, 7 September 2026.** Ludovic Roux read this batch and passed it
> **with no corrections**. The pass was **verbal, on a call** — there is no email or
> written sign-off behind it, which is why this document is filed: it is the only
> record of which lines the pass covered. Recorded in `docs/accounts-and-ops-log.md`.
>
> The document below is reproduced **as it was sent to him**, correction columns empty.
> Do not edit it — later French batches get their own dated file.

---

# French copy review — BitePerk international site

**Prepared for:** Ludovic · **Date:** 7 September 2026 · **Requested by:** Sam Kalaliya

## What this is

BitePerk's international site (biteperk.com) ships in five trees — `/en`, `/gb-en` (UK), `/fr` (France), `/be-en` and `/be-fr` (Belgium). The French you reviewed on **26 and 27 July 2026** is live and unchanged; this document collects **only the French written since then**, which is marked `DRAFT` in the source and has never had a native pass.

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
| 1 | Chrome — nav, footer, menu labels | Every French page | No |
| 2 | Cookie banner + settings modal | Every French page (consent must be *understood* to be valid) | No |
| 3 | Call transcript | `/fr` and `/be-fr` home pages | No |
| 4 | Trust strip | French home + contact pages | No |
| 5 | **City-page furniture** | Every future French city page | **Yes — gates Paris and Brussels-FR** |
| 6 | VoxStay (hotels) | `/fr` and `/be-fr` product pages | No, but see the note below |
| 7 | Two market lines | `/fr` about page; FR/BE trust cards | No |

**On VoxStay (cluster 6):** this is the hotel receptionist product, in development. It's the one we'd most like your eye on as an operator as well as a native speaker — if a claim reads as overpromising in French, say so.


### Cluster 1 — chrome: nav, footer and menu labels (source: `copy.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `nav.home` | Home | Accueil | |
| `nav.products` | Product | Le produit | |
| `nav.howItWorks` | How it works | Comment ça marche | |
| `nav.about` | About | À propos | |
| `nav.contact` | Contact | Contact | |
| `auSite` | Australia site | Site Australie | |
| `regionTitle` | Choose your region | Choisissez votre région | |
| `cities` | Cities | Villes | |
| `citiesTitle` | Choose a city | Choisissez une ville | |
| `footerExplore` | Explore | Explorer | |
| `footerRegions` | Regions & languages | Régions et langues | |
| `footerProducts` | Products | Produits | |
| `footerLegal` | Legal | Mentions légales | |
| `footerFollow` | Follow us | Suivez-nous | |
| `menu` | Menu | Menu | |
| `menuClose` | Close menu | Fermer le menu | |
| `suggest` | There's a BitePerk site for your region. | Un site BitePerk existe pour votre région. | |
| `suggestDismiss` | Dismiss | Fermer | |

### Cluster 2 — cookie banner and settings modal (source: `copy.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `consent.region` | Cookie consent | Consentement aux cookies | |
| `consent.body` | We use privacy-first analytics and Google consent mode for ad measurement. Google may receive limited cookieless signals while consent is denied; ad storage and personalisation stay off unless you allow Marketing. | Nous utilisons des statistiques respectueuses de la vie privée et le mode consentement de Google pour la mesure publicitaire. Google peut recevoir des signaux limités, sans cookies, tant que le consentement est refusé ; le stockage publicitaire et la personnalisation restent désactivés sauf si vous autorisez le marketing. | |
| `consent.policy` | Cookie Policy | Politique relative aux cookies | |
| `consent.settings` | Cookie settings | Paramètres des cookies | |
| `consent.reject` | Reject all | Tout refuser | |
| `consent.accept` | Accept all | Tout accepter | |
| `consent.modalTitle` | Cookie settings | Paramètres des cookies | |
| `consent.modalLede` | Choose what you're comfortable with. You can change this any time from Cookie settings in the footer. | Choisissez ce qui vous convient. Vous pouvez modifier ce choix à tout moment via Paramètres des cookies, dans le pied de page. | |
| `consent.alwaysOn` | Always on | Toujours actif | |
| `consent.saved` | Preferences saved ✓ | Préférences enregistrées ✓ | |
| `consent.cancel` | Cancel | Annuler | |
| `consent.save` | Save choices | Enregistrer mes choix | |
| `consent.categories.necessary.title` | Strictly necessary | Strictement nécessaires | |
| `consent.categories.necessary.body` | Remembers your theme and cookie choice in your browser. Nothing else: the contact form uses no CAPTCHA and sets nothing on your device. | Mémorise votre thème et votre choix de cookies dans votre navigateur. Rien d'autre : le formulaire de contact n'utilise aucun CAPTCHA et ne dépose rien sur votre appareil. | |
| `consent.categories.analytics.title` | Analytics | Statistiques | |
| `consent.categories.analytics.body` | Privacy-first, cookieless analytics (Plausible) that counts page visits and which links help visitors — aggregated, no cookies, no cross-site tracking, no personal profiles. | Statistiques sans cookies et respectueuses de la vie privée (Plausible), qui comptent les visites et les liens utiles aux visiteurs — agrégées, sans cookies, sans suivi entre sites, sans profil personnel. | |
| `consent.categories.marketing.title` | Marketing | Marketing | |
| `consent.categories.marketing.body` | Google Ads uses consent mode to send limited cookieless measurement signals while consent is denied. Ad storage, advertising user-data use, personalisation and the LinkedIn Insight Tag stay off unless you switch Marketing on. | Google Ads utilise le mode consentement pour envoyer des signaux de mesure limités, sans cookies, tant que le consentement est refusé. Le stockage publicitaire, l'utilisation des données utilisateur à des fins publicitaires, la personnalisation et le LinkedIn Insight Tag restent désactivés sauf si vous activez le marketing. | |

### Cluster 3 — the call transcript (source: `copy.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `eyebrow` | The 8pm test | Le test de 20 h | |
| `headingLead` | This is what a missed call | Voici ce qu'un appel manqué | |
| `headingAccent` | sounds like instead. | donne à la place. | |
| `lede` | Mid-service, every table is seated and the phone is still ringing. Bella answers in under a second, checks what is genuinely free, and writes the booking down. | En plein service, toutes les tables sont occupées et le téléphone sonne encore. Bella répond en moins d'une seconde, vérifie ce qui est réellement libre et inscrit la réservation. | |
| `note` | And when she is unsure, she does not guess — she offers to put the caller through to your own team. That is by design. | Et quand elle a un doute, elle ne devine pas : elle propose de passer l'appel à votre propre équipe. C'est voulu. | |
| `ctaLabel` | See how VoxTable works | Voir comment fonctionne VoxTable | |
| `status` | Incoming call · 8:04pm | Appel entrant · 20 h 04 | |
| `badge` | Answered <1s | Décroché en <1 s | |
| `whoBella` | Bella | Bella | |
| `whoCaller` | Caller | Appelant | |
| `written` | Booking written to the venue dashboard | Réservation inscrite au tableau de bord de l'établissement | |
| `replay` | Replay | Rejouer | |
| `disclaimer` | Illustrative — a fictional venue, but exactly the way Bella handles a call. | À titre d'illustration — un établissement fictif, mais exactement la façon dont Bella gère un appel. | |
| `lines[0].role` | bella | bella | |
| `lines[0].text` | Good evening — you've reached The Lantern Room. This is Bella, the AI assistant. How can I help? | Bonsoir, vous êtes bien à La Table d'Élise. Je suis Bella, l'assistante IA. Que puis-je pour vous ? | |
| `lines[1].role` | caller | caller | |
| `lines[1].text` | Hi — any chance of a table for four tonight, around eight? | Bonsoir — auriez-vous une table pour quatre ce soir, vers 20 h ? | |
| `lines[2].role` | bella | bella | |
| `lines[2].text` | Let me check the book… eight is full, but I can do 7:15, or 8:30 on the terrace. | Je regarde le registre… 20 h est complet, mais je peux vous proposer 19 h 15, ou 20 h 30 en terrasse. | |
| `lines[3].role` | caller | caller | |
| `lines[3].text` | 8:30 works. | 20 h 30, très bien. | |
| `lines[4].role` | bella | bella | |
| `lines[4].text` | Lovely. Four at 8:30 tonight — what name should I put it under? | Parfait. Quatre personnes à 20 h 30 ce soir — à quel nom ? | |
| `lines[5].role` | caller | caller | |
| `lines[5].text` | Ellis. | Ellis. | |
| `lines[6].role` | bella | bella | |
| `lines[6].text` | Booked, Ellis. If you would rather speak to someone, I can pass you to the team at any point. A confirmation is on its way. | C'est noté, Ellis. Si vous préférez parler à quelqu'un, je peux vous passer l'équipe à tout moment. Vous recevez une confirmation. | |

### Cluster 4 — the trust strip (source: `copy.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `heading` | Where you stand with us | Où vous en êtes avec nous | |
| `entityLabel` | Who you contract with | Votre cocontractant | |
| `registerUk` | Company number | Numéro de société | |
| `registerAu` | ABN | ABN | |
| `transparencyLabel` | Bella says she is an AI | Bella annonce qu'elle est une IA | |
| `transparency` | At the start of every call. Ask for a person and the call is handed to your own team, and every conversation stays reviewable afterwards. | Dès le début de chaque appel. Demandez une personne et l'appel est transmis à votre propre équipe ; chaque conversation reste consultable ensuite. | |
| `recordsLabel` | Where your data goes | Où vont vos informations | |
| `records` | Enquiry and booking records are stored on Google Cloud in Australia. Live calls are processed by our voice platform in the United States. Both are transfers out of Europe, and the safeguards are set out plainly in our privacy notice. | Les enregistrements des demandes et des réservations sont conservés sur Google Cloud, en Australie. Les appels en direct sont traités par notre plateforme vocale aux États-Unis. Il s'agit dans les deux cas de transferts hors d'Europe, et les garanties sont exposées clairement dans notre politique de confidentialité. | |
| `basisLabel` | Lawful basis | Base juridique | |
| `basis` | Legitimate interests (Article 6(1)(f) GDPR) for answering the enquiry you send us; consent for optional cookies, withdrawable at any time. Your rights are listed in the privacy notice. | L'intérêt légitime (article 6(1)(f) du RGPD) pour répondre à la demande que vous nous adressez ; le consentement pour les cookies facultatifs, retirable à tout moment. Vos droits sont détaillés dans la politique de confidentialité. | |
| `privacyLink` | Read the privacy notice | Lire la politique de confidentialité | |

### Cluster 5 — city-page furniture ⚠️ BLOCKING (source: `copy.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `storyEyebrow` | The missed-call problem, {city}-style | Les appels manqués, version {city} | |
| `storyHeading` | A ringing phone during service is a booking walking out. | Un téléphone qui sonne en plein service, c'est une réservation qui s'en va. | |
| `scenariosEyebrow` | During a {city} service | En plein service à {city} | |
| `scenariosHeading` | Where the phone loses you money — and what answering it changes. | Là où le téléphone vous coûte — et ce que change une ligne décrochée. | |
| `aiEyebrow` | The AI under the hood | L'IA sous le capot | |
| `aiHeading` | Tuned for {city}. A person the moment it matters. | Réglée pour {city}. Une personne dès que c'est nécessaire. | |
| `districtsEyebrow` | Across {city} | Dans tout {city} | |
| `districtsHeading` | The neighbourhoods venues call from. | Les quartiers d'où appellent les établissements. | |
| `districtsNote` | Not on the list? The pilot programme isn't drawn by postcode — a venue anywhere in the UK works exactly the same way. | Votre quartier n'y figure pas ? Le programme pilote ne s'arrête pas à un code postal — un établissement situé ailleurs fonctionne exactement de la même manière. | |
| `faqEyebrow` | {city} questions | Questions à {city} | |
| `faqHeading` | Answered plainly. | Des réponses claires. | |
| `othersEyebrow` | Elsewhere in the UK | Ailleurs | |
| `othersHeading` | Also in pilot conversations with venues in | Également en discussions pilotes avec des établissements à | |
| `closingHeading` | Put Vox on a {city} line | Mettez Vox sur une ligne à {city} | |
| `closingBody` | Tell us how a busy service sounds at your venue and we'll show you Vox handling a call like it — live, before you commit to anything. | Décrivez-nous un service chargé dans votre établissement et nous vous montrerons Vox au téléphone sur un appel semblable — en direct, avant tout engagement. | |

### Cluster 6a — VoxStay, product page (source: `products.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `voxstay.featuresHeading` | What it actually does | Ce qu'il fait concrètement | |
| `voxstay.faqHeading` | Questions we get asked | Les questions qu'on nous pose | |
| `voxstay.ctaHeading` | Interested in a pilot? | Intéressé par un pilote ? | |
| `voxstay.ctaLabel` | Book a pilot conversation | Demander un entretien pilote | |
| `voxstay.title` | VoxStay — AI phone receptionist for hotels · BitePerk | VoxStay — réceptionniste téléphonique IA pour hôtels · BitePerk | |
| `voxstay.description` | VoxStay answers a hotel's booking call in eight languages, quotes the real price with taxes and texts a secure payment link. In development — not yet available to book. | VoxStay répond à l'appel de réservation d'un hôtel en huit langues, annonce le vrai prix taxes comprises et envoie un lien de paiement sécurisé par SMS. En développement — pas encore disponible. | |
| `voxstay.eyebrow` | Hotel reception | Réception d'hôtel | |
| `voxstay.h1` | Room bookings, answered in eight languages. | Des chambres réservées, en huit langues. | |
| `voxstay.lede` | A hotel's phone rings in eight languages and the front desk speaks two. VoxStay is Bella at reception: she understands the stay, offers rooms, quotes the real price including taxes and texts a secure payment link — never a card number on the call. | Le téléphone d'un hôtel sonne en huit langues et la réception en parle deux. VoxStay, c'est Bella à l'accueil : elle comprend le séjour, propose des chambres, annonce le vrai prix taxes comprises et envoie un lien de paiement sécurisé par SMS — jamais de numéro de carte au téléphone. | |
| `voxstay.statusLabel` | In development | En développement | |
| `voxstay.statusNote` | Being built now, not yet available — including in Australia. Built EU-first: it is designed so a European hotel's guest data is hosted in the EU (Paris region). Listed so you can see where Vox is going, not so you can buy it today. | En cours de construction, pas encore disponible — y compris en Australie. Conçu d'abord pour l'Europe : les données des clients d'un hôtel européen sont prévues pour être hébergées dans l'UE (région parisienne). Présenté pour montrer où va Vox, pas pour être vendu aujourd'hui. | |
| `voxstay.features[0].title` | Eight languages, one receptionist | Huit langues, une seule réceptionniste | |
| `voxstay.features[0].body` | French, English, Flemish, Italian, German, Spanish, Mandarin and Japanese. Bella answers in the language the caller opens with, so a guest is never asked to switch. | Français, anglais, flamand, italien, allemand, espagnol, mandarin et japonais. Bella répond dans la langue de l'appelant, sans jamais lui demander d'en changer. | |
| `voxstay.features[1].title` | A price it cannot invent | Un prix qu'elle ne peut pas inventer | |
| `voxstay.features[1].body` | Every number Bella says out loud has to come from your live rates; if it is not there, she cannot say it. She confirms the room, the dates and the price with taxes before anything is booked. | Chaque nombre que Bella prononce doit venir de vos tarifs en direct ; s'il n'y figure pas, elle ne peut pas le dire. Elle confirme la chambre, les dates et le prix taxes comprises avant toute réservation. | |
| `voxstay.features[2].title` | Card details never touch the call | La carte bancaire ne passe jamais par l'appel | |
| `voxstay.features[2].body` | Bella takes the guest's name and mobile and texts a secure payment link. Nobody reads a card number down the phone, and your team never hears one. | Bella note le nom et le mobile du client, puis envoie un lien de paiement sécurisé par SMS. Personne ne dicte un numéro de carte au téléphone, et votre équipe n'en entend jamais un. | |
| `voxstay.faqs[0].q` | What happens if it breaks? | Que se passe-t-il en cas de panne ? | |
| `voxstay.faqs[0].a` | The call rings the front desk, exactly as it did before. A caller never hears dead air — the failure mode is the old behaviour. | L'appel sonne à la réception, exactement comme avant. L'appelant n'entend jamais le vide : le mode dégradé, c'est l'ancien fonctionnement. | |
| `voxstay.faqs[1].q` | Where is guest data processed? | Où sont traitées les données des clients ? | |
| `voxstay.faqs[1].a` | VoxStay is designed for EU hosting, in the Paris region, so a European hotel's guest data is meant to stay in the EU. That is a design commitment we will document in full with pilot partners, not a claim about a system you can buy today. | VoxStay est conçu pour un hébergement dans l'UE, en région parisienne, afin que les données des clients d'un hôtel européen restent dans l'UE. C'est un engagement de conception que nous documenterons intégralement avec les partenaires pilotes, pas une promesse sur un système achetable aujourd'hui. | |
| `voxstay.faqs[2].q` | Does it write into our hotel system? | Écrit-il dans notre logiciel hôtelier ? | |
| `voxstay.faqs[2].a` | The first version captures the booking — dates, room, price, guest details — and hands the guest a pre-filled link, which works at any property regardless of what runs behind the desk. Writing directly into a hotel system is a later step, built with pilot partners. | La première version capture la réservation — dates, chambre, prix, coordonnées — et remet au client un lien prérempli, ce qui fonctionne dans n'importe quel établissement, quel que soit l'outil derrière le comptoir. L'écriture directe dans le logiciel de l'hôtel viendra ensuite, construite avec les partenaires pilotes. | |

### Cluster 6b — VoxStay, products overview (source: `products.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `capabilities.voxstay.outcome` | A room booked in the caller's own language. | Une chambre réservée dans la langue de l'appelant. | |
| `capabilities.voxstay.body` | Understands the stay, offers rooms, quotes the real price with taxes and texts a secure payment link. Built for hotels; in development, with the first pilots in Europe. | Comprend le séjour, propose des chambres, annonce le vrai prix taxes comprises et envoie un lien de paiement sécurisé par SMS. Conçu pour les hôtels ; en développement, premiers pilotes en Europe. | |

### Cluster 7 — two market lines (source: `markets.ts`)

| Where | English (reference / gloss) | French (draft) | Your correction |
|---|---|---|---|
| `/fr` about page, intro | We're a small Sydney shop with one product and no wish to turn it into a suite. Vox came from an unglamorous observation: the missed call is what costs a dining room most, and nobody had built the tool that simply picks up. | Nous sommes une petite maison sydneysienne avec un seul produit et aucune envie d'en faire une suite. Vox est né d'un constat sans gloire : l'appel manqué est ce qui coûte le plus cher en salle, et personne n'avait fait l'outil qui se contente de décrocher. | |
| `/fr` trust card — AI Act citation clause (new, 7 Sep) | …falls under the transparency duties of the EU AI Act (Article 50, Regulation (EU) 2024/1689). | Un agent vocal qui parle à des clients relève des obligations de transparence du règlement européen sur l'IA (article 50 du règlement (UE) 2024/1689). Nous le traitons comme une contrainte de conception, pas comme une mention en bas de page. | |
| `/be-fr` trust card — same clause, deliberately worded differently | (Same meaning; the wording differs from `/fr` on purpose — an automated gate measures how similar the two French pages are, so they must not converge.) | Un agent vocal qui s'adresse à des consommateurs relève pleinement des obligations de transparence du règlement sur l'IA — son article 50, dans le règlement (UE) 2024/1689. Nous en faisons une contrainte de conception, et les données d'appel servent la réservation, pas un profil. | |

---

## What happens after you send this back

1. We apply your corrections and drop the `DRAFT` markers.
2. The French city-page furniture (cluster 5) unblocks Paris and Brussels-FR — those pages get written next.
3. VoxStay's French goes from draft to prospect-ready.

Thank you — this is the pass that lets the French side of the site grow.
