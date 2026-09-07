# French native review — Paris (/fr) & Brussels-FR (/be-fr) city pages

- **Status:** ✅ PASSED — Ludovic gave a **verbal** native pass on **7 Sep 2026**
  (relayed by Sam), happy with everything, no corrections. Verbal, matching the
  7 Sep furniture batch. The two city pages are cleared and flipped
  `published: true`. In the same pass Ludovic asked to drop the Eiffel-Tower
  imagery on the French tree for restaurant/gastronomy photography — done in this
  batch (see the `media` / `cityscapeImageAlt` rows below); the swap is imagery,
  not prose, and rides this sign-off.
- **Reviewer:** Ludovic (native French)
- **Prepared:** 7 Sep 2026
- **Scope:** the per-city French body copy in `src/data/intl/cities.ts` (Paris +
  Bruxelles) and the two home city-strip blocks in `src/data/intl/markets.ts`
  (`/fr`, `/be-fr`). This is **new** French written after the 7 Sep batch filed at
  `2026-09-07-french-review-ludovic.md` — that document and its byte-exact test are
  untouched; this is a separate, later batch.
- **Not in scope (already signed off 7 Sep):** the shared `cityPage.fr` section
  furniture in `copy.ts` (eyebrows/headings with the `{city}` placeholder).
- **Gate context already cleared (machine checks):** ≥600 words each (Paris 852,
  Bruxelles 882); anti-doorway similarity Paris↔Bruxelles-FR intro 9%, aiLocal 14%
  (max 35%); no banned strings (no `+33`/`+32`, no AU NAP/phone, no "notre équipe").
  What remains is the human question this sheet asks: **does it read as native,
  idiomatic, on-brand French?**

## How to record the outcome
When Ludovic passes it (verbally or in writing), change **Status** above to the
dated pass and note the medium, exactly as `2026-09-07-french-review-ludovic.md`
records its own. Corrections, if any, are applied to the source modules first,
then this sheet is regenerated.

## Strings (80)

| Key | French |
|---|---|
| `/fr/paris · seoTitle` | Répondeur téléphonique IA pour les restaurants parisiens — Vox par BitePerk |
| `/fr/paris · seoDescription` | Vox répond au téléphone de votre restaurant parisien d'une voix naturelle, vérifie le registre réel et enregistre la réservation — pendant que votre équipe reste en salle. Pilotes ouverts en France. |
| `/fr/paris · heroHeadline` | Vingt heures trente, la salle est pleine, trois lignes sonnent. Vox les prend toutes. |
| `/fr/paris · intro[0]` | Un vendredi soir dans le Marais : la salle est complète depuis vingt heures et le téléphone continue de sonner — un quatre-couverts pour samedi, un habitué qui aura vingt minutes de retard, une tablée qui demande si la cuisine tient jusqu'à minuit. Vox répond à tout cela d'une voix posée et naturelle pendant que votre équipe reste au service. |
| `/fr/paris · intro[1]` | Paris dîne tard et se réserve à l'avance. Les loyers comptent parmi les plus lourds du pays, les équipes sont comptées du Marais à Montmartre, et la personne qu'on peut le moins se permettre d'arracher à la salle en plein coup de feu, c'est celle qui se tient près du téléphone. Les appels qui restent sans réponse sont les plus chers : les anniversaires, les tablées d'affaires, les couverts du soir qui filent chez le voisin dès que personne ne décroche. Et le no-show, la plaie du dîner parisien, commence toujours par une réservation que personne n'a pu confirmer. |
| `/fr/paris · intro[2]` | Vox existe pour cet écart précis. Il décroche sur-le-champ, à n'importe quelle heure, vérifie ce que le registre a réellement à offrir et confirme la table avant que l'appelant ne raccroche — en passant la main à une personne dès qu'une conversation cesse d'être ordinaire. Il tourne en production en Australie aujourd'hui ; la France est un programme pilote, et Paris en est le point de départ. |
| `/fr/paris · cityscapeImageAlt` | Terrasse de café parisien — store rayé et chaises de bistrot en rotin vert |
| `/fr/paris · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/paris · scenarios[0].title` | 20 h 30, le coup de feu du soir |
| `/fr/paris · scenarios[0].body` | La salle tourne à plein et le téléphone sonne au passe. Vox prend la demande pour samedi, confirme le quatre-couverts de vingt heures, et votre personnel de salle ne quitte pas son rang. |
| `/fr/paris · scenarios[1].title` | L'appel de 23 heures |
| `/fr/paris · scenarios[1].body` | Une tablée sort d'un spectacle et cherche une table pour le week-end suivant. Personne de sensé ne tient un téléphone à onze heures du soir ; Vox le fait, et lundi matin la réservation est déjà au registre, sa transcription attachée. |
| `/fr/paris · scenarios[2].title` | « Nous avions pourtant réservé pour huit » |
| `/fr/paris · scenarios[2].body` | Un appelant affirme que la réservation était pour huit, pas six. Chaque appel Vox conserve son enregistrement et sa transcription : une réservation contestée devient un fait que l'on consulte plutôt qu'une discussion que l'on perd. |
| `/fr/paris · scenarios[3].title` | La demande de privatisation |
| `/fr/paris · scenarios[3].body` | Un assistant veut la salle du haut pour dix-huit couverts, un menu unique et un budget à discuter. Vox recueille tout le brief — date, nombre, allergies — et le transmet à votre boîte événements sous forme de piste complète et chaleureuse, pas d'un bip de messagerie. |
| `/fr/paris · faqs[0].q` | Vox fonctionne-t-il réellement à Paris aujourd'hui ? |
| `/fr/paris · faqs[0].a` | Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous signons des partenaires pilotes en ce moment — la description honnête, c'est : éprouvé ailleurs, en train d'arriver ici, et les conditions du pilote le reflètent. |
| `/fr/paris · faqs[1].q` | Nous sommes un bistrot indépendant, pas un groupe. Est-ce pour nous ? |
| `/fr/paris · faqs[1].a` | Oui — les pilotes se font établissement par établissement, par construction. Un petit indépendant du Marais apprend davantage à la version française qu'un siège ne le ferait jamais, et les conditions se conviennent par établissement, sans grille tarifaire. |
| `/fr/paris · faqs[2].q` | Que se passe-t-il quand trois personnes appellent en plein service ? |
| `/fr/paris · faqs[2].a` | Les trois sont prises en même temps, dès la première sonnerie. La simultanéité est tout l'intérêt d'un hôte automatisé — la tonalité « occupé » est le bruit d'une réservation parisienne qui part ailleurs. |
| `/fr/paris · faqs[3].q` | Faut-il un nouveau numéro ou du nouveau matériel ? |
| `/fr/paris · faqs[3].a` | Non. Vous gardez votre numéro et vous transférez les appels vers Vox — tous, ou seulement ceux qui resteraient autrement sans réponse. Ce transfert d'appel, c'est toute l'installation. |
| `/fr/paris · faqs[4].q` | Combien ça coûte ? |
| `/fr/paris · faqs[4].a` | Les conditions du pilote se fixent avec chaque établissement plutôt qu'à partir d'une grille, et nous convenons de ce qu'est une réussite avant le premier appel décroché. Si Vox ne justifie pas sa place, vous arrêtez. |
| `/fr/paris · aiLocal.lead` | Des modèles de voix réglés marché par marché, une vérification du registre en direct à chaque appel, et une règle ferme — tout ce qui sort de l'ordinaire passe directement à votre équipe. Voilà la mécanique dessous, arrangée pour la façon dont Paris dîne vraiment. |
| `/fr/paris · aiLocal.points[0].title` | Il connaît le quartier |
| `/fr/paris · aiLocal.points[0].body` | La transcription générique écorche les noms parisiens. La version française est réglée dessus, si bien que Ménilmontant arrive dans la note de réservation écrit Ménilmontant. |
| `/fr/paris · aiLocal.points[1].title` | Le registre fait foi |
| `/fr/paris · aiLocal.points[1].body` | Vox lit la disponibilité réelle avant de rien promettre, de sorte qu'un samedi soir complet ne peut jamais être vendu deux fois par une réponse trop empressée. |
| `/fr/paris · aiLocal.points[2].title` | Tous les accents dînent ici |
| `/fr/paris · aiLocal.points[2].body` | Paris appelle avec tous les accents de la francophonie, plus ceux des visiteurs. Le modèle d'écoute est bâti pour cet éventail, et chaque appel du pilote l'affine encore. |
| `/fr/paris · aiLocal.points[3].title` | Le RGPD comme principe |
| `/fr/paris · aiLocal.points[3].body` | Les données d'appel servent à finaliser une réservation, restent consultables par l'établissement et ne servent jamais à profiler un appelant. Les obligations de transparence de l'AI Act (article 50, règlement (UE) 2024/1689) valent pour un agent vocal, et la CNIL est l'autorité qui compte ici. |
| `/be-fr/brussels · seoTitle` | Répondeur téléphonique IA pour les restaurants bruxellois — Vox par BitePerk |
| `/be-fr/brussels · seoDescription` | Vox répond au téléphone de votre restaurant bruxellois d'une voix naturelle, vérifie le registre réel et prend la réservation — pendant que votre équipe reste avec la salle. Pilotes belges en ouverture. |
| `/be-fr/brussels · heroHeadline` | Le déjeuner dure quatre-vingt-dix minutes. Le téléphone, lui, n'attend pas. |
| `/be-fr/brussels · intro[0]` | Midi et demi dans le quartier européen : la salle se remplit d'un seul mouvement. Tous ceux qui déjeuneront aujourd'hui arrivent en vingt minutes, veulent avoir réglé pour deux heures, et le téléphone se met à sonner sous tout cela — une table de six pour jeudi, une annulation, quelqu'un qui demande si la terrasse est ouverte. |
| `/be-fr/brussels · intro[1]` | Bruxelles déjeune sur une montre qui ne laisse aucun jeu. Un service du midi ici n'est pas une longue soirée que l'on organise à l'avance ; c'est une fenêtre étroite où la personne qui pourrait décrocher porte trois assiettes, et l'appelant qui tombe sur une sonnerie essaie simplement l'adresse suivante. Les langues qui arrivent sur cette ligne posent leur propre question — c'est une ville où le même numéro prend le français et l'anglais à une minute d'intervalle. |
| `/be-fr/brussels · intro[2]` | Vox est notre réponse à cette fenêtre étroite. Il décroche dès la première sonnerie quelle que soit l'heure, lit ce que le registre a vraiment de libre, et confie l'appel à votre équipe dès qu'il cesse d'être ordinaire. Il tourne en production en Australie aujourd'hui ; la Belgique est un programme pilote, et Bruxelles en est le point de départ. |
| `/be-fr/brussels · cityscapeImageAlt` | Les maisons des corporations de la Grand-Place à Bruxelles |
| `/be-fr/brussels · storyImageAlt` | A relaxed continental café interior between services |
| `/be-fr/brussels · scenarios[0].title` | 12 h 40, la salle tourne une fois |
| `/be-fr/brussels · scenarios[0].body` | Le rush du midi a une seule forme, sans aucun creux. Vox prend le six-couverts de jeudi pendant que votre équipe reste sur les assiettes, et la réservation est au registre avant même que l'appelant ait raccroché. |
| `/be-fr/brussels · scenarios[1].title` | Le premier vendredi de beau temps |
| `/be-fr/brussels · scenarios[1].body` | La météo de terrasse arrive du jour au lendemain, et les appels avec elle. Chacun est pris au même instant plutôt que mis en file derrière une sonnerie — c'est la différence entre une terrasse pleine et une à moitié vide. |
| `/be-fr/brussels · scenarios[2].title` | Un appelant qui change de langue en pleine phrase |
| `/be-fr/brussels · scenarios[2].body` | Cela arrive sans cesse ici, et c'est exactement ce qu'un pilote belge existe pour éprouver. Nous préférons vous montrer Vox sur l'un de vos propres enregistrements plutôt que d'annoncer un résultat sur une page web. |
| `/be-fr/brussels · scenarios[3].title` | « J'avais annulé cette table lundi » |
| `/be-fr/brussels · scenarios[3].body` | Chaque appel conserve son enregistrement et sa transcription. Une annulation contestée cesse d'être la mémoire de l'un contre celle de l'autre : elle devient quelque chose que l'on retrouve en quelques secondes. |
| `/be-fr/brussels · faqs[0].q` | Vox fonctionne-t-il à Bruxelles aujourd'hui ? |
| `/be-fr/brussels · faqs[0].a` | Non. Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient, et la Belgique est un programme pilote que nous ouvrons maintenant. La version honnête : éprouvé ailleurs, en train d'arriver ici — et les conditions du pilote sont écrites pour refléter exactement cela. |
| `/be-fr/brussels · faqs[1].q` | Nos appelants passent du français à l'anglais sur la même ligne. Vox suit-il ? |
| `/be-fr/brussels · faqs[1].a` | Gérer les deux sur un seul numéro est précisément ce qu'un pilote belge est bâti pour prouver ; nous préférons donc le démontrer sur vos appels plutôt que de l'affirmer ici. Les langues dont votre établissement a réellement besoin sont l'une des premières choses que nous établissons ensemble. |
| `/be-fr/brussels · faqs[2].q` | Et le néerlandais ? |
| `/be-fr/brussels · faqs[2].a` | Pas encore développé. Servir la Flandre correctement veut dire le néerlandais, et c'est un véritable engagement plutôt qu'un réglage que l'on active — il suit la demande des établissements, et non l'inverse. |
| `/be-fr/brussels · faqs[3].q` | Faut-il un numéro belge, ou du nouveau matériel ? |
| `/be-fr/brussels · faqs[3].a` | Ni l'un ni l'autre. Vous gardez le numéro que vos clients composent déjà et vous transférez les appels vers Vox — tous, ou seulement ceux qui resteraient sans réponse. Ce transfert est toute l'installation. La numérotation belge exige un dossier réglementaire approuvé, fourni dans le cadre du pilote. |
| `/be-fr/brussels · faqs[4].q` | Combien coûte un pilote ? |
| `/be-fr/brussels · faqs[4].a` | Les conditions se conviennent établissement par établissement plutôt qu'à partir d'une liste de prix, et nous fixons ce qu'est un bon résultat avant le premier appel décroché. Si Vox ne mérite pas sa place, vous arrêtez. |
| `/be-fr/brussels · aiLocal.lead` | En dessous : un modèle qui écoute la façon dont cette ville parle vraiment, une vérification du registre avant toute promesse, et une règle ferme — tout ce qui sort de l'ordinaire va à votre équipe plutôt que d'être deviné. |
| `/be-fr/brussels · aiLocal.points[0].title` | Il écrit bien les noms |
| `/be-fr/brussels · aiLocal.points[0].body` | Châtelain, Sainte-Catherine, Flagey — la transcription toute faite transforme les noms de rue bruxellois en devinettes. Les reporter intacts dans une note de réservation est ingrat, et c'est ce qu'un établissement remarque en premier. |
| `/be-fr/brussels · aiLocal.points[1].title` | Une promesse qu'il peut tenir |
| `/be-fr/brussels · aiLocal.points[1].body` | Rien n'est proposé avant que le registre ait été lu. Un service à une seule tournée ne peut absorber un oui trop empressé, et une table inventée à 13 h 15 vous coûte toute la fenêtre. |
| `/be-fr/brussels · aiLocal.points[2].title` | Fait pour écouter dans une salle bruyante |
| `/be-fr/brussels · aiLocal.points[2].body` | Les appels bruxellois viennent de toute l'Europe, par-dessus une terrasse à plein volume. Le modèle d'écoute est conçu pour cet éventail d'accents et ce fond sonore, et chaque appel du pilote l'affine. |
| `/be-fr/brussels · aiLocal.points[3].title` | Les règles européennes, dès la conception |
| `/be-fr/brussels · aiLocal.points[3].body` | Le RGPD et les obligations de transparence de l'AI Act (article 50, règlement (UE) 2024/1689) s'appliquent à un agent vocal qui parle à des clients, et l'APD/GBA est l'autorité de référence ici. Les données d'appel finalisent une réservation, vous restent consultables et ne construisent aucun profil. |
| `/fr · home cities.eyebrow` | Là où tout commence |
| `/fr · home cities.heading` | Une ville après l'autre, sur de vraies lignes. |
| `/fr · home cities.body` | Un pilote, c'est une conversation avec une salle précise dans une rue précise, pas un lancement. Voici les villes où ces conversations sont ouvertes. |
| `/fr · media cityscape alt` | Terrasse de café parisien — store rayé et chaises de bistrot en rotin vert |
| `/fr · media hospitality alt` | Assiette gastronomique dressée dans une lumière contrastée |
| `/be-fr · home cities.eyebrow` | Nos premières adresses |
| `/be-fr · home cities.heading` | Un établissement à la fois, sur la ligne bien réelle. |
| `/be-fr · home cities.body` | Le pilote se joue au téléphone d'une adresse précise, jamais dans une annonce. Ces pages parlent de la vôtre en particulier. |
| `/be-fr · media cityscape alt` | Les maisons de guilde de la Grand-Place de Bruxelles |
| `/be-fr · media hospitality alt` | L'intérieur d'un café continental entre deux services |
