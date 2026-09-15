> **PASSED — Ludovic verbal pass, 15 September 2026, no corrections.** Batch B — the gap that batch A (`2026-09-15-french-review-ludovic.md`) surfaced: French flagged "next Ludovic batch" that never made it into a cluster of any earlier review document — the industry solution pages (`intl/solutions.ts`), the resources section furniture (`intl/resources.ts`), and the trust panel's supervisory-authority and "where the team is" lines (`copy.ts` `trustFacts`). Sam sent it; Ludovic reviewed and passed everything, no corrections. Recorded here and in `docs/accounts-and-ops-log.md`; the `DRAFT` / "not yet reviewed" markers on these strings are now dropped in the source. **Do not edit the rows below** — they are what was reviewed. As with the 7/13/15-Sep passes this was **verbal**, so no email backs it. Standing rule unchanged: French written after 15 Sep 2026 needs its own pass.

---

# French copy review — BitePerk international site

**Prepared for:** Ludovic · **Date:** 15 September 2026 · **Requested by:** Sam Kalaliya

## What this is

BitePerk's international site (biteperk.com) ships in five trees — `/en`, `/gb-en` (UK), `/fr` (France), `/be-en` and `/be-fr` (Belgium). This batch collects French that was written for the site earlier but never made it into a review document: the industry **solution** pages, the **resources** section furniture, and the trust panel's **supervisory-authority** and **team** lines. None of it has had a native pass.

Everything below already renders on the French trees, so a correction here changes what a French prospect reads. There is no hard deploy-blocker in this batch — but until it is signed off, these strings carry `DRAFT` / "not yet reviewed" markers in the source and should not be treated as prospect-ready.

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
| 1 | Trust panel — supervisory authority + team line | The trust strip (TrustPanel) on every French page | No |
| 2 | Solutions overview page | `/fr/solutions/` and `/be-fr/solutions/` — the industry index | No |
| 3 | Solution pages (8 industries) | Each French industry page: restaurants, hotels, cafés, takeaway, drive-thru, medical, professional services, groups | No |
| 4 | Resources furniture | `/fr/resources/` index, article furniture and the six resource-type labels | No |


### Cluster 1 — trust panel — supervisory-authority and "where the team is" lines (source: `copy.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `authorityLabel` | Supervisory authority | Autorité de contrôle | |
| `authorityBody` | You can complain to | Vous pouvez introduire une réclamation auprès de | |
| `teamLabel` | Where the team is | Où se trouve l'équipe | |

### Cluster 2 — solutions overview — the industry index page (source: `solutions.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `alsoBuiltFor` | Also built for | Également conçu pour | |
| `ctaLabel` | Book a pilot conversation | Réserver un échange pilote | |
| `description` | AI phone answering by industry — restaurants, hotels, cafés, takeaway, drive-thru, medical clinics, professional services and multi-site groups. Pilot partnerships in new markets. | La réponse téléphonique IA par secteur — restaurants, hôtels, cafés, vente à emporter, drive, cabinets médicaux, professions libérales et groupes multi-sites. Partenariats pilotes en Europe. | |
| `eyebrow` | Solutions by industry | Solutions par secteur | |
| `forProduct` | Solutions using {product} | Solutions avec {product} | |
| `h1` | The same phone host, tuned to how your business takes calls. | Le même hôte téléphonique, réglé sur la façon dont votre établissement prend ses appels. | |
| `lede` | People search for the job to be done — an AI receptionist for a restaurant, overflow cover for a clinic — not a product name. Start with your vertical; every page says plainly what ships today and what is still a pilot. | On cherche un métier à faire — une réceptionniste IA pour un restaurant, une couverture des appels débordants pour un cabinet — pas un nom de produit. Commencez par votre secteur ; chaque page dit clairement ce qui est en production et ce qui reste un pilote. | |
| `sectors.enterprise` | Groups | Groupes | |
| `sectors.hospitality` | Hospitality | Hôtellerie-restauration | |
| `sectors.services` | Services | Services | |
| `title` | Solutions by industry — Vox, the AI phone host | Solutions par secteur — Vox, l'hôte téléphonique IA | |

### Cluster 3 — solutions by industry — every industry solution page (source: `solutions.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `cafes.benefitsHeading` | What changes | Ce qui change | |
| `cafes.benefits[0]` | No more missed group bookings | Plus de réservations de groupe manquées | |
| `cafes.benefits[1]` | Staff stay on the machine and the floor | L'équipe reste à la machine et en salle | |
| `cafes.benefits[2]` | Regulars get through | Les habitués vous joignent | |
| `cafes.benefits[3]` | A live demonstration before any commitment | Une démonstration en direct avant tout engagement | |
| `cafes.ctaHeading` | Put Vox on your café line | Mettez Vox sur la ligne de votre café | |
| `cafes.ctaLabel` | Book a pilot conversation | Réserver un échange pilote | |
| `cafes.description` | Vox answers the café phone that is always an afterthought — bookings, opening hours, whether the terrace is open — in a natural voice, while the team stays at the machine. Pilots in new markets. | Vox répond au téléphone du café qui passe toujours après le reste — réservations, horaires, la terrasse — d'une voix naturelle, pendant que l'équipe reste à la machine. Pilotes en Europe. | |
| `cafes.eyebrow` | Cafés | Cafés | |
| `cafes.faqHeading` | Questions cafés ask | Les questions des cafés | |
| `cafes.faqs[0].a` | If the phone rings and nobody can answer it, yes. Vox handles the bookings and questions that do come by phone; walk-ins are unchanged. | Si le téléphone sonne et que personne ne peut répondre, oui. Vox gère les réservations et les questions qui passent par le téléphone ; les clients de passage ne changent pas. | |
| `cafes.faqs[0].q` | We take walk-ins mostly — is this for us? | Nous fonctionnons surtout sans réservation — est-ce pour nous ? | |
| `cafes.faqs[1].a` | It answers what you give it — hours, terrace, dietary basics — and passes anything else to a person rather than guess. | Il répond avec ce que vous lui donnez — horaires, terrasse, bases alimentaires — et transmet le reste à une personne plutôt que de deviner. | |
| `cafes.faqs[1].q` | Can it answer questions about the menu? | Peut-il répondre aux questions sur la carte ? | |
| `cafes.featuresHeading` | What you get | Ce que vous obtenez | |
| `cafes.features[0].body` | One account, one voice, when you grow into evening service. | Un compte, une voix, quand vous passez au service du soir. | |
| `cafes.features[0].title` | Same host as restaurants | Le même hôte que pour les restaurants | |
| `cafes.features[1].body` | Unhurried and honest that it is an AI. | Sans précipitation, et honnête sur le fait d'être une IA. | |
| `cafes.features[1].title` | A voice that fits | Une voix qui convient | |
| `cafes.features[2].body` | The outcome is a table in the diary. | Le résultat est une table au registre. | |
| `cafes.features[2].title` | Bookings, not messages | Des réservations, pas des messages | |
| `cafes.features[3].body` | Transcripts and outcomes so the phone is no longer a mystery. | Transcriptions et résultats : le téléphone n'est plus un mystère. | |
| `cafes.features[3].title` | Every call on record | Chaque appel enregistré | |
| `cafes.h1` | The café phone, answered while you are on the machine. | Le téléphone du café, décroché pendant que vous êtes à la machine. | |
| `cafes.how` | Vox answers, takes the booking against real availability, answers the hours-and-terrace questions, and hands anything else to your team. | Vox répond, prend la réservation sur les disponibilités réelles, répond aux questions d'horaires et de terrasse, et transmet le reste à votre équipe. | |
| `cafes.howHeading` | How Vox handles it | Comment Vox s'en charge | |
| `cafes.lede` | Cafés run on a small team and a phone nobody can reach at nine in the morning. Vox takes the booking, answers the ordinary question and passes on anything that needs a person. | Un café tourne avec une petite équipe et un téléphone que personne ne peut atteindre à neuf heures du matin. Vox prend la réservation, répond à la question ordinaire et transmet ce qui demande une personne. | |
| `cafes.lost` | Small rooms feel every lost table. A missed group booking on a Saturday is the difference the week is measured by. | Les petites salles ressentent chaque table perdue. Une réservation de groupe manquée un samedi, c'est l'écart sur lequel se mesure la semaine. | |
| `cafes.lostHeading` | What it costs | Ce que ça coûte | |
| `cafes.lostPoints[0]` | Morning-rush calls go to voicemail | Les appels du rush du matin partent sur le répondeur | |
| `cafes.lostPoints[1]` | Group bookings are the ones that get missed | Ce sont les réservations de groupe qui se perdent | |
| `cafes.lostPoints[2]` | Simple questions eat staff time | Les questions simples grignotent le temps de l'équipe | |
| `cafes.problem` | A café phone rings during the morning rush and again at the lunch turn — exactly when every pair of hands is busy. The regular who cannot get through stops calling. | Le téléphone d'un café sonne pendant le rush du matin puis au service de midi — exactement quand toutes les mains sont prises. L'habitué qui n'arrive pas à joindre arrête d'appeler. | |
| `cafes.problemHeading` | The problem | Le problème | |
| `cafes.statusLabel` | Live in Australia · pilots in new markets | En production en Australie · pilotes en Europe | |
| `cafes.statusNote` | Bookings ship today in Australia; elsewhere this is a pilot with a live demonstration on your own line. | Les réservations sont en production aujourd'hui en Australie ; en Europe, c'est un pilote avec une démonstration en direct sur votre propre ligne. | |
| `cafes.steps[0].body` | First ring, natural voice, no queue. | Première sonnerie, voix naturelle, pas de file d'attente. | |
| `cafes.steps[0].title` | Answers during the rush | Répond pendant le rush | |
| `cafes.steps[1].body` | Against what is actually free, with a read-back to the caller. | Sur ce qui est vraiment libre, avec relecture à l'appelant. | |
| `cafes.steps[1].title` | Books the table | Réserve la table | |
| `cafes.steps[2].body` | Hours, dogs, the terrace, the high chair. | Horaires, chiens, terrasse, chaise haute. | |
| `cafes.steps[2].title` | Answers the ordinary | Répond à l'ordinaire | |
| `cafes.steps[3].body` | Anything unusual reaches a person on your line. | Tout ce qui sort de l'ordinaire atteint une personne sur votre ligne. | |
| `cafes.steps[3].title` | Passes on the rest | Transmet le reste | |
| `cafes.title` | AI phone answering for cafés | Réponse téléphonique IA pour cafés | |
| `drive-thru.benefitsHeading` | What it is meant to change | Ce que cela doit changer | |
| `drive-thru.benefits[0]` | Shorter lanes | Des files plus courtes | |
| `drive-thru.benefits[1]` | Fewer remakes | Moins de plats refaits | |
| `drive-thru.benefits[2]` | Headset staff back in the kitchen | Le personnel au casque de retour en cuisine | |
| `drive-thru.benefits[3]` | One voice across phone and lane | Une seule voix, au téléphone et à la borne | |
| `drive-thru.ctaHeading` | Tell us about your lane | Parlez-nous de votre voie | |
| `drive-thru.ctaLabel` | Register interest | Manifester mon intérêt | |
| `drive-thru.description` | VoxDrive is a concept for the drive-through lane: a voice agent that takes the order, confirms it and keeps the lane moving. Not built yet — register interest. | VoxDrive est un concept pour la voie du drive : un agent vocal qui prend la commande, la confirme et fait avancer la file. Pas encore construit — manifestez votre intérêt. | |
| `drive-thru.eyebrow` | Drive-thru | Drive | |
| `drive-thru.faqHeading` | Questions about VoxDrive | Les questions sur VoxDrive | |
| `drive-thru.faqs[0].a` | No — it is a concept. Register interest and we will contact you when there is something real to demonstrate. | Non — c'est un concept. Manifestez votre intérêt et nous vous contacterons quand il y aura quelque chose de réel à démontrer. | |
| `drive-thru.faqs[0].q` | Can I pilot this now? | Puis-je le tester maintenant ? | |
| `drive-thru.faqs[1].a` | So that venues can tell us whether it is worth building, and so nobody mistakes it for a product that ships. | Pour que les établissements nous disent s'il vaut la peine d'être construit, et pour que personne ne le prenne pour un produit en production. | |
| `drive-thru.faqs[1].q` | Why publish a concept? | Pourquoi publier un concept ? | |
| `drive-thru.featuresHeading` | What it is designed for | Ce pour quoi il est conçu | |
| `drive-thru.features[0].body` | Vox family continuity if you already run it on the line. | Continuité de la famille Vox si vous l'utilisez déjà sur la ligne. | |
| `drive-thru.features[0].title` | Same voice as the phone | La même voix qu'au téléphone | |
| `drive-thru.features[1].body` | Built to understand how people order here, not a franchise script. | Conçu pour comprendre comment on commande ici, pas un script de franchise. | |
| `drive-thru.features[1].title` | Local accent | L'accent d'ici | |
| `drive-thru.features[2].body` | A concept, described as one. | Un concept, présenté comme tel. | |
| `drive-thru.features[2].title` | Honest scope | Un périmètre honnête | |
| `drive-thru.features[3].body` | Tell us about your lane and we will tell you when it is real. | Parlez-nous de votre voie et nous vous dirons quand ce sera réel. | |
| `drive-thru.features[3].title` | Register interest | Manifestez votre intérêt | |
| `drive-thru.h1` | A voice at the speaker box that keeps the lane moving. | Une voix à la borne qui fait avancer la file. | |
| `drive-thru.how` | Take the order at the box, confirm it back, send the ticket, and hand anything unusual to a person on the headset. | Prendre la commande à la borne, la confirmer, envoyer le ticket, et passer tout ce qui sort de l'ordinaire à une personne au casque. | |
| `drive-thru.howHeading` | How VoxDrive is meant to work | Comment VoxDrive est censé fonctionner | |
| `drive-thru.lede` | The drive-through order is the same job as the phone order, with a queue behind it. VoxDrive is the concept for taking it — accurately, quickly, in the local accent. | La commande au drive, c'est le même métier que la commande par téléphone, avec une file derrière. VoxDrive est le concept pour la prendre — avec précision, rapidement, avec l'accent d'ici. | |
| `drive-thru.lost` | Faster, more accurate order-taking at the box means shorter lanes and fewer remakes at the window. | Une prise de commande plus rapide et plus précise à la borne, ce sont des files plus courtes et moins de plats refaits à la fenêtre. | |
| `drive-thru.lostHeading` | What it would change | Ce que cela changerait | |
| `drive-thru.lostPoints[0]` | Dwell time set by the slowest exchange | Un temps de passage dicté par l'échange le plus lent | |
| `drive-thru.lostPoints[1]` | Misheard orders remade at the window | Des commandes mal entendues refaites à la fenêtre | |
| `drive-thru.lostPoints[2]` | Staff pulled from the kitchen to the headset | Du personnel tiré de la cuisine vers le casque | |
| `drive-thru.problem` | Lane dwell time is decided at the speaker box. A misheard order or a slow exchange backs up every car behind it. | Le temps passé dans la voie se décide à la borne. Une commande mal entendue ou un échange lent retarde chaque voiture derrière. | |
| `drive-thru.problemHeading` | The problem | Le problème | |
| `drive-thru.statusLabel` | Concept · register interest | Concept · manifestez votre intérêt | |
| `drive-thru.statusNote` | VoxDrive is a concept. Nothing on this page is live anywhere; it describes where the Vox family is going, so you can tell us whether it should. | VoxDrive est un concept. Rien sur cette page n'est en production nulle part ; elle décrit où va la famille Vox, pour que vous nous disiez si elle doit y aller. | |
| `drive-thru.steps[0].body` | Menu-aware, modifiers included. | En connaissant la carte, options comprises. | |
| `drive-thru.steps[0].title` | Takes the order | Prend la commande | |
| `drive-thru.steps[1].body` | Read back before the car moves. | Relue avant que la voiture n'avance. | |
| `drive-thru.steps[1].title` | Confirms it | La confirme | |
| `drive-thru.steps[2].body` | Ready to make by the time the car reaches the window. | Prêt à faire quand la voiture arrive à la fenêtre. | |
| `drive-thru.steps[2].title` | Sends the ticket | Envoie le ticket | |
| `drive-thru.steps[3].body` | A person on the headset for anything it cannot handle. | Une personne au casque pour tout ce qu'il ne peut pas gérer. | |
| `drive-thru.steps[3].title` | Hands over | Passe la main | |
| `drive-thru.title` | AI drive-thru voice ordering | Prise de commande vocale IA au drive | |
| `enterprise.benefitsHeading` | What changes | Ce qui change | |
| `enterprise.benefits[0]` | Consistent guest phone experience | Une expérience téléphonique cohérente pour les clients | |
| `enterprise.benefits[1]` | Portfolio-level outcomes | Des résultats au niveau du portefeuille | |
| `enterprise.benefits[2]` | Faster onboarding after the pilot | Un onboarding plus rapide après le pilote | |
| `enterprise.benefits[3]` | A path that respects procurement | Une démarche qui respecte les achats | |
| `enterprise.ctaHeading` | Start with one venue | Commencez par un établissement | |
| `enterprise.ctaLabel` | Book a pilot conversation | Réserver un échange pilote | |
| `enterprise.description` | Multi-site hospitality groups need one voice standard and central visibility. Talk to BitePerk about rolling Vox across venues, starting with one pilot site in your market. | Les groupes multi-sites ont besoin d'un standard de voix unique et d'une visibilité centrale. Parlez à BitePerk du déploiement de Vox sur vos établissements, en commençant par un site pilote en Europe. | |
| `enterprise.eyebrow` | Groups | Groupes | |
| `enterprise.faqHeading` | Questions groups ask | Les questions des groupes | |
| `enterprise.faqs[0].a` | Yes — brand voice, shared reporting and site exceptions are part of the pilot conversation. | Oui — voix de marque, reporting partagé et exceptions par site font partie de la discussion pilote. | |
| `enterprise.faqs[0].q` | Do you support multi-brand groups? | Prenez-vous en charge les groupes multi-marques ? | |
| `enterprise.faqs[1].a` | Commercial shape depends on venue count and capabilities, agreed per pilot. Start with one venue rather than a catalogue. | La forme commerciale dépend du nombre d'établissements et des capacités, convenue par pilote. Commencez par un établissement plutôt que par un catalogue. | |
| `enterprise.faqs[1].q` | Is there a separate enterprise offer? | Y a-t-il une offre entreprise distincte ? | |
| `enterprise.featuresHeading` | What you get | Ce que vous obtenez | |
| `enterprise.features[0].body` | Group conversations start from live capability, not a roadmap. | Les discussions de groupe partent de capacités en production, pas d'une feuille de route. | |
| `enterprise.features[0].title` | Product that ships | Un produit qui est livré | |
| `enterprise.features[1].body` | Local hours and rules without losing group standards. | Horaires et règles locales sans perdre les standards du groupe. | |
| `enterprise.features[1].title` | Site-level control | Un contrôle par site | |
| `enterprise.features[2].body` | Every venue's phone, one view. | Le téléphone de chaque établissement, une seule vue. | |
| `enterprise.features[2].title` | Central visibility | Une visibilité centrale | |
| `enterprise.features[3].body` | You are not left with a self-serve maze. | Vous n'êtes pas laissé seul face à un labyrinthe en libre-service. | |
| `enterprise.features[3].title` | A human partner | Un partenaire humain | |
| `enterprise.h1` | One voice standard across every venue phone. | Un seul standard de voix sur le téléphone de chaque établissement. | |
| `enterprise.how` | Pilot one venue, standardise the voice, expand with playbooks, and see the network in one place. | Piloter un établissement, standardiser la voix, étendre avec des méthodes éprouvées, et voir le réseau au même endroit. | |
| `enterprise.howHeading` | How a rollout works | Comment se déroule un déploiement | |
| `enterprise.lede` | Groups lose bookings the same way single venues do — site by site. Vox rolls out with shared configuration, central reporting and a pilot site first. | Les groupes perdent des réservations comme les établissements isolés — site par site. Vox se déploie avec une configuration partagée, un reporting central et un site pilote d'abord. | |
| `enterprise.lost` | Run the arithmetic: an ordinary miss rate across twenty venues is a budget line, not an anecdote. | Faites le calcul : un taux d'appels manqués ordinaire sur vingt établissements, c'est une ligne budgétaire, pas une anecdote. | |
| `enterprise.lostHeading` | What it costs | Ce que ça coûte | |
| `enterprise.lostPoints[0]` | Inconsistent guest experience by site | Une expérience client incohérente selon le site | |
| `enterprise.lostPoints[1]` | No single view of call outcomes | Aucune vue unique des résultats des appels | |
| `enterprise.lostPoints[2]` | Rollouts blocked by one-off telephony | Des déploiements bloqués par une téléphonie sur mesure | |
| `enterprise.problem` | Each venue invents its own overflow hack. Head office cannot see what the phones produced, and the guest experience drifts by site. | Chaque établissement invente sa propre parade aux débordements. Le siège ne voit pas ce que produisent les téléphones, et l'expérience client dérive d'un site à l'autre. | |
| `enterprise.problemHeading` | The problem | Le problème | |
| `enterprise.statusLabel` | Live in Australia · pilots in new markets | En production en Australie · pilotes en Europe | |
| `enterprise.statusNote` | The live capabilities (bookings, takeaway) ship today in Australia. A group engagement outside Australia starts with one pilot venue on a real line. | Les capacités en production (réservations, vente à emporter) sont livrées aujourd'hui en Australie. Un engagement de groupe en Europe commence par un établissement pilote sur une vraie ligne. | |
| `enterprise.steps[0].body` | Prove bookings taken on a real line before anything wider. | Prouver les réservations prises sur une vraie ligne avant d'aller plus loin. | |
| `enterprise.steps[0].title` | Pilot one venue | Piloter un établissement | |
| `enterprise.steps[1].body` | One craft, local details where they matter. | Un même savoir-faire, des détails locaux là où ils comptent. | |
| `enterprise.steps[1].title` | Standardise the voice | Standardiser la voix | |
| `enterprise.steps[2].body` | Site onboarding that does not reinvent telephony each time. | Un onboarding des sites qui ne réinvente pas la téléphonie à chaque fois. | |
| `enterprise.steps[2].title` | Expand with playbooks | Étendre avec des méthodes | |
| `enterprise.steps[3].body` | Outcomes visible beyond a single manager's notebook. | Des résultats visibles au-delà du carnet d'un seul directeur. | |
| `enterprise.steps[3].title` | See the network | Voir le réseau | |
| `enterprise.title` | Enterprise AI phone automation for groups | Automatisation téléphonique IA pour les groupes | |
| `hotels.benefitsHeading` | What it is meant to change | Ce que cela doit changer | |
| `hotels.benefits[0]` | Direct bookings taken while the desk is busy | Des réservations directes prises pendant que le comptoir est occupé | |
| `hotels.benefits[1]` | Fewer callers lost to language | Moins d'appelants perdus à cause de la langue | |
| `hotels.benefits[2]` | No commission on a call your own phone answered | Pas de commission sur un appel décroché par votre propre téléphone | |
| `hotels.benefits[3]` | Reception free for the guests in front of it | Une réception libre pour les clients qui sont devant elle | |
| `hotels.ctaHeading` | Talk about a hotel pilot | Parlons d'un pilote hôtelier | |
| `hotels.ctaLabel` | Book a pilot conversation | Réserver un échange pilote | |
| `hotels.description` | VoxStay is Bella as a hotel receptionist — answers the room-booking call in eight languages, quotes the real price with taxes, texts a secure payment link. In development; EU-first by design. | VoxStay, c'est Bella en réceptionniste d'hôtel — huit langues, le vrai prix taxes comprises, un lien de paiement sécurisé par SMS. En développement ; pilotes en Europe. | |
| `hotels.eyebrow` | Hotels | Hôtels | |
| `hotels.faqHeading` | Questions hotels ask | Les questions des hôteliers | |
| `hotels.faqs[0].a` | Not yet — it is in development, with a working demonstration. We are looking for pilot hotels in the EU; nothing here describes a live deployment. | Pas encore — il est en développement, avec une démonstration fonctionnelle. Nous cherchons des hôtels pilotes en Europe ; rien ici ne décrit un déploiement en production. | |
| `hotels.faqs[0].q` | Is VoxStay available now? | VoxStay est-il disponible maintenant ? | |
| `hotels.faqs[1].a` | The call rings the front desk as it does today. VoxStay is designed to take the ordinary booking, not to replace reception. | L'appel sonne à la réception comme aujourd'hui. VoxStay est conçu pour prendre la réservation ordinaire, pas pour remplacer la réception. | |
| `hotels.faqs[1].q` | What happens when the AI is unsure? | Que se passe-t-il quand l'IA n'est pas sûre ? | |
| `hotels.featuresHeading` | What it is built to do | Ce pour quoi il est conçu | |
| `hotels.features[0].body` | The guest's language, not a menu of options. | La langue du client, pas un menu d'options. | |
| `hotels.features[0].title` | Multilingual by design | Multilingue par conception | |
| `hotels.features[1].body` | Real rates with taxes; nothing quoted that is not in the hotel's system. | Les vrais tarifs taxes comprises ; rien qui ne soit pas dans le système de l'hôtel. | |
| `hotels.features[1].title` | Honest pricing | Un prix honnête | |
| `hotels.features[2].body` | Payment happens on a secure link, on the guest's own phone. | Le paiement se fait sur un lien sécurisé, sur le téléphone du client. | |
| `hotels.features[2].title` | No card numbers on the call | Aucun numéro de carte au téléphone | |
| `hotels.features[3].body` | Designed for EU hotels and EU data residency from the start — which is where the first pilot hotels are being sought. | Pensé dès le départ pour les hôtels européens — l'une des raisons pour lesquelles les premiers pilotes s'y déroulent. | |
| `hotels.features[3].title` | Built for the EU first | Conçu d'abord pour l'Europe | |
| `hotels.h1` | The room-booking call, answered in the guest's language. | L'appel de réservation, décroché dans la langue du client. | |
| `hotels.how` | Answer in the caller's language, offer rooms, quote the real price including taxes, take a name and mobile number, text a secure payment link — and never take a card number on the call. | Répondre dans la langue de l'appelant, proposer des chambres, annoncer le vrai prix taxes comprises, prendre un nom et un numéro de mobile, envoyer un lien de paiement sécurisé par SMS — et ne jamais prendre un numéro de carte au téléphone. | |
| `hotels.howHeading` | How VoxStay is designed to handle it | Comment VoxStay est conçu | |
| `hotels.lede` | Reception has a queue at the desk and a phone that will not stop. VoxStay is designed to take the booking call — eight languages, the real rate with taxes, a secure payment link by text — and to ring the front desk the moment anything falls outside that. | La réception a une file au comptoir et un téléphone qui ne s'arrête pas. VoxStay est conçu pour prendre l'appel de réservation — huit langues, le vrai tarif taxes comprises, un lien de paiement sécurisé par SMS — et pour faire sonner la réception dès que quelque chose sort de ce cadre. | |
| `hotels.lost` | A direct booking lost to a busy line is margin handed to a marketplace — or a room that stays empty. | Une réservation directe perdue sur une ligne occupée, c'est de la marge cédée à une plateforme — ou une chambre qui reste vide. | |
| `hotels.lostHeading` | What it costs | Ce que ça coûte | |
| `hotels.lostPoints[0]` | Calls arrive when the desk is busiest | Les appels arrivent quand le comptoir est le plus chargé | |
| `hotels.lostPoints[1]` | Callers switch to channels that take commission | Les appelants basculent vers des canaux à commission | |
| `hotels.lostPoints[2]` | Language mismatches end calls early | Une langue mal comprise met fin à l'appel | |
| `hotels.problem` | Independent hotels lose bookings at reception's busiest moments, and the caller who reaches voicemail books elsewhere or through a channel that takes a cut. | Les hôtels indépendants perdent des réservations aux moments où la réception est la plus occupée, et l'appelant qui tombe sur un répondeur réserve ailleurs, ou via un canal qui prend sa commission. | |
| `hotels.problemHeading` | The problem | Le problème | |
| `hotels.statusLabel` | In development · pilot partners wanted | En développement · partenaires pilotes recherchés | |
| `hotels.statusNote` | VoxStay is in development. There is no live hotel yet; every claim on this page is about how it is designed, and the first pilot hotels are being sought in the EU. | VoxStay est en développement. Aucun hôtel n'est encore en production ; chaque affirmation de cette page décrit la conception, et les premiers pilotes sont en Europe. | |
| `hotels.steps[0].body` | French, English, Flemish, Italian, German, Spanish, Mandarin and Japanese. | Français, anglais, néerlandais, italien, allemand, espagnol, mandarin et japonais. | |
| `hotels.steps[0].title` | Answers in eight languages | Répond en huit langues | |
| `hotels.steps[1].body` | Rooms and prices come from the hotel's live rates; it cannot invent a price. | Chambres et prix viennent des tarifs en direct de l'hôtel ; il ne peut pas inventer un prix. | |
| `hotels.steps[1].title` | Quotes what is really available | Propose ce qui est vraiment disponible | |
| `hotels.steps[2].body` | A payment link on the guest's phone — no card details spoken aloud. | Un lien de paiement sur le téléphone du client — aucun numéro de carte prononcé. | |
| `hotels.steps[2].title` | Secures the booking by text | Sécurise la réservation par SMS | |
| `hotels.steps[3].body` | If anything fails, the call rings the front desk exactly as it does today. | En cas de problème, l'appel sonne à la réception exactement comme aujourd'hui. | |
| `hotels.steps[3].title` | Falls back to the desk | Repasse la main à la réception | |
| `hotels.title` | AI phone receptionist for hotels | Réceptionniste téléphonique IA pour hôtels | |
| `medical.benefitsHeading` | What it is meant to change | Ce que cela doit changer | |
| `medical.benefits[0]` | Fewer missed calls at the desk | Moins d'appels manqués à l'accueil | |
| `medical.benefits[1]` | Receptionists uninterrupted with patients | Une secrétaire non interrompue avec les patients | |
| `medical.benefits[2]` | After-hours callers acknowledged | Les appelants hors horaires pris en compte | |
| `medical.benefits[3]` | A clear record of what the phone took | Une trace claire de ce que le téléphone a pris | |
| `medical.ctaHeading` | Talk about clinic coverage | Parlons de la couverture de votre cabinet | |
| `medical.ctaLabel` | Register interest | Manifester mon intérêt | |
| `medical.description` | Overflow and after-hours clinic calls deserve a competent answer. VoxConcierge is in development for front-desk coverage — register interest for medical use. | Les appels débordants et hors horaires d'un cabinet méritent une réponse compétente. VoxConcierge est en développement pour couvrir l'accueil — manifestez votre intérêt pour un usage médical. | |
| `medical.eyebrow` | Medical clinics | Cabinets médicaux | |
| `medical.faqHeading` | Questions clinics ask | Les questions des cabinets | |
| `medical.faqs[0].a` | No. It is designed for routine front-desk calls only; anything clinical or urgent goes to a person immediately. | Non. Il est conçu pour les appels de routine de l'accueil uniquement ; tout ce qui est clinique ou urgent va immédiatement à une personne. | |
| `medical.faqs[0].q` | Will it give medical advice? | Donnera-t-il des conseils médicaux ? | |
| `medical.faqs[1].a` | Not yet — it is in development. Register interest and we will talk about what a clinic pilot would need. | Pas encore — il est en développement. Manifestez votre intérêt et nous parlerons de ce qu'un pilote en cabinet exigerait. | |
| `medical.faqs[1].q` | Is it available now? | Est-il disponible maintenant ? | |
| `medical.featuresHeading` | What it is built to do | Ce pour quoi il est conçu | |
| `medical.features[0].body` | It does not give advice or triage. | Il ne donne ni conseil ni tri. | |
| `medical.features[0].title` | Routine only, by design | La routine seulement, par conception | |
| `medical.features[1].body` | Read back and recorded. | Relus et enregistrés. | |
| `medical.features[1].title` | Accurate messages | Des messages précis | |
| `medical.features[2].body` | A person for everything that matters. | Une personne pour tout ce qui compte. | |
| `medical.features[2].title` | Human routing | Un aiguillage humain | |
| `medical.features[3].body` | Clinics shape what this becomes. | Les cabinets façonnent ce que cela devient. | |
| `medical.features[3].title` | Register interest | Manifestez votre intérêt | |
| `medical.h1` | The clinic phone, covered when the desk is busy. | Le téléphone du cabinet, couvert quand l'accueil est occupé. | |
| `medical.how` | Answer the routine call, take an accurate message, and route anything clinical or urgent to a person immediately — never triage, never advice. | Répondre à l'appel de routine, prendre un message précis, et diriger tout ce qui est clinique ou urgent vers une personne immédiatement — jamais de tri, jamais de conseil. | |
| `medical.howHeading` | How it is designed to help | Comment il est conçu pour aider | |
| `medical.lede` | A clinic phone rings while the receptionist is with a patient. VoxConcierge is in development to take the ordinary call — hours, directions, a message that reaches the right person — and to pass everything else straight to a human. | Le téléphone d'un cabinet sonne pendant que la secrétaire est avec un patient. VoxConcierge est en développement pour prendre l'appel ordinaire — horaires, itinéraire, un message qui atteint la bonne personne — et transmettre tout le reste directement à un humain. | |
| `medical.lost` | Missed calls at a clinic are missed appointments and frustrated patients, on both sides of the desk. | Les appels manqués d'un cabinet, ce sont des rendez-vous manqués et des patients frustrés, des deux côtés du comptoir. | |
| `medical.lostHeading` | What it costs | Ce que ça coûte | |
| `medical.lostPoints[0]` | Overflow calls hit voicemail | Les appels débordants partent sur le répondeur | |
| `medical.lostPoints[1]` | After-hours callers get nothing | Les appelants hors horaires n'obtiennent rien | |
| `medical.lostPoints[2]` | Staff interrupted for routine questions | L'équipe interrompue pour des questions de routine | |
| `medical.problem` | Front desks are interrupted constantly, and callers who reach voicemail either call back later — or do not. | L'accueil est interrompu en permanence, et les appelants qui tombent sur un répondeur rappellent plus tard — ou pas. | |
| `medical.problemHeading` | The problem | Le problème | |
| `medical.statusLabel` | In development · pilot partners wanted | En développement · partenaires pilotes recherchés | |
| `medical.statusNote` | VoxConcierge is in development. Medical use is an area we are exploring with pilot partners; nothing here describes a live clinical deployment, and clinical questions always go to a person. | VoxConcierge est en développement. L'usage médical est un domaine que nous explorons avec des partenaires pilotes ; rien ici ne décrit un déploiement clinique en production, et toute question clinique va toujours à une personne. | |
| `medical.steps[0].body` | The call the desk could not reach. | L'appel que l'accueil n'a pas pu prendre. | |
| `medical.steps[0].title` | Answers overflow | Répond aux débordements | |
| `medical.steps[1].body` | Hours, location, what to bring. | Horaires, adresse, quoi apporter. | |
| `medical.steps[1].title` | Handles the routine | Gère la routine | |
| `medical.steps[2].body` | Name, number, reason — delivered to the right inbox. | Nom, numéro, motif — remis dans la bonne boîte. | |
| `medical.steps[2].title` | Takes a clean message | Prend un message propre | |
| `medical.steps[3].body` | Anything clinical goes to a person, immediately. | Tout ce qui est clinique va à une personne, immédiatement. | |
| `medical.steps[3].title` | Routes the rest | Dirige le reste | |
| `medical.title` | AI phone answering for medical clinics | Réponse téléphonique IA pour cabinets médicaux | |
| `professional-services.benefitsHeading` | What it is meant to change | Ce que cela doit changer | |
| `professional-services.benefits[0]` | No new enquiry lost to voicemail | Aucune nouvelle demande perdue sur un répondeur | |
| `professional-services.benefits[1]` | Billable hours uninterrupted | Des heures facturables sans interruption | |
| `professional-services.benefits[2]` | Messages that reach the right person | Des messages qui atteignent la bonne personne | |
| `professional-services.benefits[3]` | A record of every call | Une trace de chaque appel | |
| `professional-services.ctaHeading` | Talk about practice coverage | Parlons de la couverture de votre cabinet | |
| `professional-services.ctaLabel` | Register interest | Manifester mon intérêt | |
| `professional-services.description` | Law, accounting, consulting: every ring is a billable hour interrupted. VoxConcierge is in development for professional front-desk coverage — register interest. | Droit, expertise comptable, conseil : chaque sonnerie interrompt une heure facturable. VoxConcierge est en développement pour couvrir l'accueil des cabinets — manifestez votre intérêt. | |
| `professional-services.eyebrow` | Professional services | Professions libérales | |
| `professional-services.faqHeading` | Questions practices ask | Les questions des cabinets | |
| `professional-services.faqs[0].a` | It takes details and routes; it does not advise. Anything sensitive goes to a person on your line. | Il prend des coordonnées et dirige ; il ne conseille pas. Tout ce qui est sensible va à une personne sur votre ligne. | |
| `professional-services.faqs[0].q` | Can it handle confidential matters? | Peut-il traiter des dossiers confidentiels ? | |
| `professional-services.faqs[1].a` | Not yet — in development. Register interest and we will discuss a pilot. | Pas encore — en développement. Manifestez votre intérêt et nous discuterons d'un pilote. | |
| `professional-services.faqs[1].q` | Is it available now? | Est-il disponible maintenant ? | |
| `professional-services.featuresHeading` | What it is built to do | Ce pour quoi il est conçu | |
| `professional-services.features[0].body` | Calm, precise, honest that it is an AI. | Calme, précis, honnête sur le fait d'être une IA. | |
| `professional-services.features[0].title` | Professional tone | Un ton professionnel | |
| `professional-services.features[1].body` | Delivered where they belong. | Remis là où ils doivent aller. | |
| `professional-services.features[1].title` | Clean messages | Des messages propres | |
| `professional-services.features[2].body` | A person when it matters. | Une personne quand cela compte. | |
| `professional-services.features[2].title` | Live hand-off | Un passage de main en direct | |
| `professional-services.features[3].body` | Practices shape what ships. | Les cabinets façonnent ce qui sera livré. | |
| `professional-services.features[3].title` | Register interest | Manifestez votre intérêt | |
| `professional-services.h1` | Every call answered, without interrupting the people who bill. | Chaque appel décroché, sans interrompre ceux qui facturent. | |
| `professional-services.how` | Answer, take the caller's details and reason, route to the right person, and hand over live when the caller needs a human now. | Répondre, prendre les coordonnées et le motif de l'appelant, diriger vers la bonne personne, et passer la main en direct quand l'appelant a besoin d'un humain maintenant. | |
| `professional-services.howHeading` | How it is designed to help | Comment il est conçu pour aider | |
| `professional-services.lede` | In a small practice everyone is billable and nobody is the receptionist. VoxConcierge is in development to answer the phone, take an accurate message and route the call — so the work continues. | Dans un petit cabinet, tout le monde facture et personne n'est réceptionniste. VoxConcierge est en développement pour répondre au téléphone, prendre un message précis et diriger l'appel — pour que le travail continue. | |
| `professional-services.lost` | A new-client enquiry that reaches voicemail is often the last you hear of it. | Une demande de nouveau client qui tombe sur un répondeur, c'est souvent la dernière fois qu'on en entend parler. | |
| `professional-services.lostHeading` | What it costs | Ce que ça coûte | |
| `professional-services.lostPoints[0]` | New enquiries reach voicemail | Les nouvelles demandes tombent sur le répondeur | |
| `professional-services.lostPoints[1]` | Billable time spent on routine calls | Du temps facturable passé sur des appels de routine | |
| `professional-services.lostPoints[2]` | Messages lost between people | Des messages perdus entre les personnes | |
| `professional-services.problem` | The phone interrupts the work it is meant to bring in. Voicemail loses the new client; answering it costs the hour. | Le téléphone interrompt le travail qu'il est censé apporter. Le répondeur perd le nouveau client ; décrocher coûte l'heure. | |
| `professional-services.problemHeading` | The problem | Le problème | |
| `professional-services.statusLabel` | In development · pilot partners wanted | En développement · partenaires pilotes recherchés | |
| `professional-services.statusNote` | VoxConcierge is in development. Professional-services coverage is an area we are exploring with pilot partners; nothing here is live yet. | VoxConcierge est en développement. La couverture des professions libérales est un domaine que nous explorons avec des partenaires pilotes ; rien ici n'est encore en production. | |
| `professional-services.steps[0].body` | Professionally, in a natural voice. | Avec professionnalisme, d'une voix naturelle. | |
| `professional-services.steps[0].title` | Answers every call | Répond à chaque appel | |
| `professional-services.steps[1].body` | Name, number, matter — read back. | Nom, numéro, dossier — relus. | |
| `professional-services.steps[1].title` | Takes accurate details | Prend des coordonnées précises | |
| `professional-services.steps[2].body` | To the right inbox or person. | Vers la bonne boîte ou la bonne personne. | |
| `professional-services.steps[2].title` | Routes correctly | Dirige correctement | |
| `professional-services.steps[3].body` | When the caller needs a person now. | Quand l'appelant a besoin d'une personne maintenant. | |
| `professional-services.steps[3].title` | Hands over live | Passe la main en direct | |
| `professional-services.title` | AI receptionist for professional services | Réceptionniste IA pour les professions libérales | |
| `restaurants.benefitsHeading` | What changes | Ce qui change | |
| `restaurants.benefits[0]` | Fewer empty tables from unanswered calls | Moins de tables vides à cause d'appels sans réponse | |
| `restaurants.benefits[1]` | Hosts stay with diners instead of the handset | L'équipe reste avec les clients plutôt qu'au combiné | |
| `restaurants.benefits[2]` | A clear weekly picture of the phone | Une vision hebdomadaire claire du téléphone | |
| `restaurants.benefits[3]` | A demonstration on your own line before you decide | Une démonstration sur votre propre ligne avant de décider | |
| `restaurants.ctaHeading` | Put Vox on your line | Mettez Vox sur votre ligne | |
| `restaurants.ctaLabel` | Book a pilot conversation | Réserver un échange pilote | |
| `restaurants.description` | Vox answers your restaurant's phone in a natural voice, checks real availability and writes the booking to the diary — during service and after close. Pilots in new markets. | Vox répond au téléphone de votre restaurant d'une voix naturelle, vérifie les disponibilités réelles et inscrit la réservation au registre — en plein service comme après la fermeture. Pilotes en Europe. | |
| `restaurants.eyebrow` | Restaurants | Restaurants | |
| `restaurants.faqHeading` | Questions restaurants ask | Les questions des restaurateurs | |
| `restaurants.faqs[0].a` | Yes — Vox says so when it answers. Diners care more that someone competent picked up than that a human left them on hold. | Oui — Vox le dit en répondant. Les clients tiennent davantage à ce que quelqu'un de compétent décroche qu'à ce qu'un humain les laisse en attente. | |
| `restaurants.faqs[0].q` | Will guests know they are talking to an AI? | Les clients sauront-ils qu'ils parlent à une IA ? | |
| `restaurants.faqs[1].a` | No. Vox answers the phone and writes the booking into the flow you run. It is the receptionist you do not have, not a new system to learn. | Non. Vox répond au téléphone et inscrit la réservation dans le flux que vous utilisez déjà. C'est la réceptionniste que vous n'avez pas, pas un nouveau système à apprendre. | |
| `restaurants.faqs[1].q` | Does it replace our booking system? | Remplace-t-il notre système de réservation ? | |
| `restaurants.faqs[2].a` | A short conversation about your venue and call volume, then Vox on a test line so you hear it handle a call like yours. Commercial terms are agreed per pilot. | Un échange court sur votre établissement et votre volume d'appels, puis Vox sur une ligne de test pour l'entendre gérer un appel semblable aux vôtres. Les conditions commerciales sont convenues par pilote. | |
| `restaurants.faqs[2].q` | What does a pilot look like? | À quoi ressemble un pilote en Europe ? | |
| `restaurants.featuresHeading` | What you get | Ce que vous obtenez | |
| `restaurants.features[0].body` | Warm, unhurried, and honest that it is an AI when it answers. | Chaleureuse, sans précipitation, et qui dit honnêtement qu'elle est une IA. | |
| `restaurants.features[0].title` | A voice that fits the room | Une voix qui va avec la salle | |
| `restaurants.features[1].body` | The outcome is a reservation in the diary, not a voicemail to return. | Le résultat est une réservation au registre, pas un message à rappeler. | |
| `restaurants.features[1].title` | Booking, not a message | Une réservation, pas un message | |
| `restaurants.features[2].body` | Overflow, after-close and mid-service peaks are the point, not a nice-to-have. | Débordements, après la fermeture, coups de feu : c'est précisément l'objet. | |
| `restaurants.features[2].title` | Works with your hours | Adapté à vos horaires | |
| `restaurants.features[3].body` | Transcripts and outcomes in one place, so you know what the phone did. | Transcriptions et résultats au même endroit, pour savoir ce qu'a fait le téléphone. | |
| `restaurants.features[3].title` | Every call on record | Chaque appel enregistré | |
| `restaurants.h1` | Every booking call answered, even mid-service. | Chaque appel de réservation décroché, même en plein service. | |
| `restaurants.how` | Vox answers, understands what the caller wants, checks the diary and writes the booking — then confirms. Anything unusual is passed to your team on your own line. | Vox répond, comprend ce que veut l'appelant, vérifie le registre et inscrit la réservation — puis confirme. Tout ce qui sort de l'ordinaire est transmis à votre équipe, sur votre propre ligne. | |
| `restaurants.howHeading` | How Vox handles it | Comment Vox s'en charge | |
| `restaurants.lede` | A ringing phone at eight on a Friday is a table trying to give you money. Vox picks up on the first ring, books against what is actually free, and hands over to a person the moment a call stops being ordinary. | Un téléphone qui sonne à vingt heures un vendredi, c'est une table qui essaie de vous donner de l'argent. Vox décroche à la première sonnerie, réserve sur ce qui est réellement libre, et passe la main à une personne dès qu'un appel sort de l'ordinaire. | |
| `restaurants.lost` | Every missed call during service is a cover that walks. Multiply an ordinary miss rate by an ordinary week and it stops being an anecdote. | Chaque appel manqué pendant le service est un couvert qui s'en va. Multipliez un taux d'appels manqués ordinaire par une semaine ordinaire et ce n'est plus une anecdote. | |
| `restaurants.lostHeading` | What it costs | Ce que ça coûte | |
| `restaurants.lostPoints[0]` | Peak-hour calls go unanswered | Les appels de pointe restent sans réponse | |
| `restaurants.lostPoints[1]` | Voicemails become chases, not bookings | Les messages deviennent des relances, pas des réservations | |
| `restaurants.lostPoints[2]` | No picture of what the phone produced | Aucune vision de ce que produit le téléphone | |
| `restaurants.problem` | Restaurants lose bookings for one plain reason: the phone rings when the whole team is on the floor. Voicemail does not take a table; the caller simply tries the next place. | Les restaurants perdent des réservations pour une raison simple : le téléphone sonne quand toute l'équipe est en salle. Un répondeur ne prend pas de table ; l'appelant essaie simplement l'adresse suivante. | |
| `restaurants.problemHeading` | The problem | Le problème | |
| `restaurants.statusLabel` | Live in Australia · pilots in new markets | En production en Australie · pilotes en Europe | |
| `restaurants.statusNote` | Bookings ship today for Australian restaurants. Outside Australia this is a pilot: your venue, your line, a live demonstration before any commitment. | Les réservations sont en production aujourd'hui pour les restaurants australiens. En Europe, c'est un pilote : votre établissement, votre ligne, une démonstration en direct avant tout engagement. | |
| `restaurants.steps[0].body` | A natural voice, any hour, no hold music. | Une voix naturelle, à toute heure, sans musique d'attente. | |
| `restaurants.steps[0].title` | Answers on the first ring | Décroche à la première sonnerie | |
| `restaurants.steps[1].body` | Bookings are written against what is actually free — no double-bookings. | Les réservations sont inscrites sur ce qui est vraiment libre — pas de double réservation. | |
| `restaurants.steps[1].title` | Checks real availability | Vérifie les disponibilités réelles | |
| `restaurants.steps[2].body` | Name, party size, time, notes — read back before the call ends. | Nom, nombre de couverts, heure, remarques — relus avant la fin de l'appel. | |
| `restaurants.steps[2].title` | Confirms with the guest | Confirme avec le client | |
| `restaurants.steps[3].body` | Large groups, allergies, complaints: a person on your line, not a script. | Grands groupes, allergies, réclamations : une personne sur votre ligne, pas un script. | |
| `restaurants.steps[3].title` | Hands over when needed | Passe la main quand il le faut | |
| `restaurants.title` | AI receptionist for restaurants | Réceptionniste IA pour restaurants | |
| `takeaway.benefitsHeading` | What changes | Ce qui change | |
| `takeaway.benefits[0]` | Direct orders no longer lost to a busy line | Plus de commandes directes perdues sur une ligne occupée | |
| `takeaway.benefits[1]` | Fewer remakes from misheard orders | Moins de plats refaits | |
| `takeaway.benefits[2]` | Collection times that hold | Des heures de retrait qui tiennent | |
| `takeaway.benefits[3]` | Less commission on orders your own phone took | Moins de commission sur les commandes prises par votre propre téléphone | |
| `takeaway.ctaHeading` | Put VoxOrder on your takeaway line | Mettez VoxOrder sur votre ligne à emporter | |
| `takeaway.ctaLabel` | Book a pilot conversation | Réserver un échange pilote | |
| `takeaway.description` | VoxOrder takes the takeaway and collection order by phone — the menu, the substitutions, the collection time — and puts a clean ticket in front of the kitchen. Live in Australia; pilots in new markets. | VoxOrder prend la commande à emporter par téléphone — la carte, les modifications, l'heure de retrait — et place un ticket propre devant la cuisine. En production en Australie ; pilotes en Europe. | |
| `takeaway.eyebrow` | Takeaway & collection | Vente à emporter | |
| `takeaway.faqHeading` | Questions takeaway venues ask | Les questions des établissements à emporter | |
| `takeaway.faqs[0].a` | No. It answers your own phone line so a caller does not get a busy signal. Marketplace orders keep arriving as they do today. | Non. Il répond à votre propre ligne pour qu'un appelant ne tombe pas sur une ligne occupée. Les commandes des plateformes continuent d'arriver comme aujourd'hui. | |
| `takeaway.faqs[0].q` | Does it replace our marketplace listings? | Remplace-t-il nos présences sur les plateformes ? | |
| `takeaway.faqs[1].a` | You give us the menu once — items, sizes, substitutions — and VoxOrder reads it the way your staff would. | Vous nous donnez la carte une fois — articles, tailles, substitutions — et VoxOrder la lit comme le ferait votre équipe. | |
| `takeaway.faqs[1].q` | How does it learn the menu? | Comment apprend-il la carte ? | |
| `takeaway.featuresHeading` | What you get | Ce que vous obtenez | |
| `takeaway.features[0].body` | Change the menu and the phone changes with it. | Changez la carte et le téléphone change avec elle. | |
| `takeaway.features[0].title` | Menu-aware ordering | Commande guidée par la carte | |
| `takeaway.features[1].body` | Orders arrive structured, ready for the kitchen. | Les commandes arrivent structurées, prêtes pour la cuisine. | |
| `takeaway.features[1].title` | Clean tickets | Des tickets propres | |
| `takeaway.features[2].body` | 'Twenty minutes' means twenty minutes. | « Vingt minutes » veut dire vingt minutes. | |
| `takeaway.features[2].title` | Collection time you can keep | Une heure de retrait tenable | |
| `takeaway.features[3].body` | Allergies, big orders, complaints: a person on your line. | Allergies, grosses commandes, réclamations : une personne sur votre ligne. | |
| `takeaway.features[3].title` | Hand-off for the unusual | Passage de main pour l'inhabituel | |
| `takeaway.h1` | Every order picked up, even when the kitchen is on the floor. | Chaque commande prise, même quand la cuisine est en salle. | |
| `takeaway.how` | It reads your menu the way your staff would, takes the order with its modifiers, checks current kitchen load before quoting a collection time, and sends the ticket. | Il lit votre carte comme le ferait votre équipe, prend la commande avec ses options, vérifie la charge de la cuisine avant d'annoncer une heure de retrait, et envoie le ticket. | |
| `takeaway.howHeading` | How VoxOrder handles it | Comment VoxOrder s'en charge | |
| `takeaway.lede` | The takeaway line rings hardest exactly when nobody can hold it. VoxOrder takes the order — items, modifiers, a collection time you can keep — and sends a clean ticket to the kitchen. | La ligne à emporter sonne le plus fort exactement quand personne ne peut la tenir. VoxOrder prend la commande — articles, options, une heure de retrait que vous pouvez tenir — et envoie un ticket propre en cuisine. | |
| `takeaway.lost` | A direct order lost to an unanswered line is revenue handed to a competitor, or a commission you did not need to pay. | Une commande directe perdue sur une ligne sans réponse, c'est du chiffre cédé à un concurrent, ou une commission que vous n'aviez pas besoin de payer. | |
| `takeaway.lostHeading` | What it costs | Ce que ça coûte | |
| `takeaway.lostPoints[0]` | Peak orders hit a phone nobody can answer | Les commandes de pointe tombent sur un téléphone que personne ne peut décrocher | |
| `takeaway.lostPoints[1]` | Misheard modifiers become remakes | Les options mal entendues deviennent des plats refaits | |
| `takeaway.lostPoints[2]` | Collection times quoted blind | Des heures de retrait annoncées à l'aveugle | |
| `takeaway.problem` | Marketplaces are useful, but a guest who rings you directly and hits a busy signal orders from someone else — or through a platform that takes its share. | Les plateformes sont utiles, mais un client qui vous appelle directement et tombe sur une ligne occupée commande ailleurs — ou via une plateforme qui prend sa part. | |
| `takeaway.problemHeading` | The problem | Le problème | |
| `takeaway.statusLabel` | Live in Australia · pilots in new markets | En production en Australie · pilotes en Europe | |
| `takeaway.statusNote` | VoxOrder ships today for Australian venues. Outside Australia it is a pilot; your menu, your line, a live demonstration first. | VoxOrder est en production aujourd'hui pour les établissements australiens. En Europe, c'est un pilote ; votre carte, votre ligne, une démonstration en direct d'abord. | |
| `takeaway.steps[0].body` | Items, sizes, substitutions and the weekend small print. | Articles, tailles, substitutions et les petites lignes du week-end. | |
| `takeaway.steps[0].title` | Knows the menu | Connaît la carte | |
| `takeaway.steps[1].body` | Read back before the call ends, so 'no onions' means no onions. | Relues avant la fin de l'appel, pour que « sans oignons » veuille dire sans oignons. | |
| `takeaway.steps[1].title` | Takes the modifiers | Prend les options | |
| `takeaway.steps[2].body` | Collection windows come from kitchen load, not a guess. | Les créneaux de retrait viennent de la charge de la cuisine, pas d'une estimation. | |
| `takeaway.steps[2].title` | Quotes a real time | Annonce une heure réelle | |
| `takeaway.steps[3].body` | The order lands ready to make — no notepad, no copy-paste. | La commande arrive prête à faire — ni carnet, ni recopie. | |
| `takeaway.steps[3].title` | Sends a clean ticket | Envoie un ticket propre | |
| `takeaway.title` | AI phone ordering for takeaway | Prise de commande téléphonique IA pour la vente à emporter | |

### Cluster 4 — resources — index labels and type descriptions (source: `resources.ts`)

| Path | English (reference) | French (draft) | Your correction |
|---|---|---|---|
| `allLabel` | All resources | Toutes les ressources | |
| `backLabel` | All resources | Toutes les ressources | |
| `builtFor` | Built for | Conçu pour | |
| `ctaLabel` | Book a pilot conversation | Réserver un échange pilote | |
| `description` | Plain-English guides and comparisons on missed calls, AI phone answering and running a busy venue phone — written for operators, not for search engines. | Des guides et comparatifs en langage clair sur les appels manqués, la réponse téléphonique IA et la gestion d'un téléphone chargé — écrits pour les exploitants, pas pour les moteurs de recherche. | |
| `eyebrow` | Resources | Ressources | |
| `h1` | Plain-English help for a busy phone. | Une aide en langage clair pour un téléphone chargé. | |
| `lede` | Guides and comparisons written so operators can trust what we say about the phone. Every article says what ships today and what is still a pilot. | Des guides et des comparatifs écrits pour que les exploitants puissent se fier à ce que nous disons du téléphone. Chaque article précise ce qui est en production et ce qui reste un pilote. | |
| `publishedLabel` | Published | Publié le | |
| `readLabel` | Read | Lire | |
| `title` | Resources — guides and comparisons on AI phone answering | Ressources — guides et comparatifs sur la réponse téléphonique IA | |
| `types.case-study.description` | Proof from real venues — what changed on the phone and on the floor. | Des preuves venues d'établissements réels — ce qui a changé au téléphone et en salle. | |
| `types.case-study.label` | Case study | Étude de cas | |
| `types.case-study.plural` | Case studies | Études de cas | |
| `types.comparison.description` | Buyer-intent breakdowns — an AI host against voicemail, call centres and answering services. | Des analyses pour décider — un hôte IA face au répondeur, aux centres d'appels et aux services de permanence. | |
| `types.comparison.label` | Comparison | Comparatif | |
| `types.comparison.plural` | Comparisons | Comparatifs | |
| `types.faq.description` | Straight answers — short, citeable, no jargon. | Des réponses directes — courtes, citables, sans jargon. | |
| `types.faq.label` | FAQ | FAQ | |
| `types.faq.plural` | FAQs | FAQ | |
| `types.guide.description` | Field notes for operators — missed calls, bookings and running the phone. | Des notes de terrain pour les exploitants — appels manqués, réservations et gestion du téléphone. | |
| `types.guide.label` | Guide | Guide | |
| `types.guide.plural` | Guides | Guides | |
| `types.industry-report.description` | Longer pieces on phone automation in hospitality. | Des analyses plus longues sur l'automatisation du téléphone dans l'hôtellerie-restauration. | |
| `types.industry-report.label` | Industry report | Rapport sectoriel | |
| `types.industry-report.plural` | Industry reports | Rapports sectoriels | |
| `types.product-update.description` | What shipped and why. | Ce qui a été livré et pourquoi. | |
| `types.product-update.label` | Product update | Nouveauté produit | |
| `types.product-update.plural` | Product updates | Nouveautés produit | |

---

## What happens after you send this back

1. We drop the `DRAFT` / "not yet reviewed" markers on these strings in the source.
2. The industry solution pages and the resources section go from draft to prospect-ready across `/fr` and `/be-fr`.
3. The trust panel's supervisory-authority and team lines are cleared for every French page.

Thank you — this is the pass that lets the French side of the site grow.
<!-- 405 rows -->
