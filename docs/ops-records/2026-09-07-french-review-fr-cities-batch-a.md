# French native review — /fr cities batch A (Lyon, Marseille, Nice)

- **Status:** ⏳ PENDING Ludovic's native pass — cities are staged `published: false`
  and must not flip live until this batch is signed off. When he passes it, change
  this line to the dated pass and note the medium (verbal/email), exactly as the
  other `docs/ops-records/…-french-review-*` sheets do.
- **Reviewer:** Ludovic (native French)
- **Pages:** /fr/lyon, /fr/marseille, /fr/nice
- **Scope:** hand-written per-city French in `src/data/intl/cities.ts` plus the
  French market home-strip / image-alt strings in `src/data/intl/markets.ts`.
  New French written after any earlier filed review — a separate batch; earlier
  filed sheets and their byte-exact test are untouched.
- **Machine checks (check-cities, run separately):** ≥600 unique words per city;
  Paris↔all-French intro & aiLocal ≤35%; no banned strings (`+33`, AU NAP/phone/
  price, "notre équipe à …"). This sheet is the human question only: **native,
  idiomatic, on-brand French?**

## Strings (115)

| Key | French |
|---|---|
| `/fr/lyon · seoTitle` | Répondeur téléphonique IA pour les restaurants lyonnais — Vox par BitePerk |
| `/fr/lyon · seoDescription` | Vox répond au téléphone de votre bouchon ou restaurant à Lyon d'une voix naturelle, vérifie le registre et prend la réservation pendant que la cuisine tourne. Pilotes ouverts en France. |
| `/fr/lyon · heroHeadline` | Au bouchon, le patron est au piano. Le téléphone sonne dans une salle vide. |
| `/fr/lyon · intro[0]` | Un jeudi midi à Lyon : douze couverts attendent leur tablier, le patron est au piano, et le téléphone sonne dans une salle où personne n'est libre pour décrocher. Vox répond à sa place, d'une voix posée, et note la réservation avant que l'appelant n'aille tenter l'adresse d'à côté. |
| `/fr/lyon · intro[1]` | Lyon se dit capitale de la gastronomie, et cela se paie en petites maisons : le bouchon familial où le chef-patron cuisine, sert et tient la caisse, sans personne près du téléphone au moment du coup de feu. C'est là que se perdent les appels qui comptent — la tablée du samedi, le groupe qui veut un menu, l'habitué qui déplace sa réservation. Un appel sans réponse à midi, c'est un couvert vendu chez le voisin, souvent celui-là même qui vous suit dans le guide. |
| `/fr/lyon · intro[2]` | Vox est fait pour cette salle sans standardiste. Il décroche à la première sonnerie, à toute heure, lit ce que le registre a réellement de libre et confirme la table avant de raccrocher — et confie l'appel à une personne dès qu'une demande sort de l'ordinaire. Il tourne en production en Australie ; la France est un programme pilote, et après Paris, Lyon en est l'étape. |
| `/fr/lyon · cityscapeImageAlt` | Salle d'un bistrot lyonnais, chaises en bois courbé et tables dressées près de la fenêtre |
| `/fr/lyon · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/lyon · scenarios[0].title` | Midi, deux services en un |
| `/fr/lyon · scenarios[0].body` | Le service du midi se joue en deux tournées serrées, sans creux. Vox prend la tablée de jeudi pendant que la cuisine envoie, et la réservation est au registre avant que l'appelant ait raccroché. |
| `/fr/lyon · scenarios[1].title` | L'appel qui vient du guide |
| `/fr/lyon · scenarios[1].body` | Une adresse citée dans un guide reçoit des appels de toute l'Europe, souvent en anglais. Vox les prend au moment où ils arrivent plutôt que de les laisser sonner, et transmet la demande de groupe complète à votre équipe. |
| `/fr/lyon · scenarios[2].title` | « C'était pourtant à mon nom » |
| `/fr/lyon · scenarios[2].body` | Chaque appel garde son enregistrement et sa transcription. Une réservation contestée cesse d'opposer deux mémoires : elle devient une ligne que l'on relit en quelques secondes. |
| `/fr/lyon · scenarios[3].title` | Le mâchon du samedi |
| `/fr/lyon · scenarios[3].body` | Un groupe veut un mâchon avec un menu et un budget à caler. Vox recueille la date, le nombre et les régimes, et envoie une piste complète à votre boîte plutôt qu'un message sur le répondeur. |
| `/fr/lyon · faqs[0].q` | Vox fonctionne-t-il déjà à Lyon ? |
| `/fr/lyon · faqs[0].a` | Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous ouvrons des pilotes en ce moment — dit honnêtement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions du pilote le reflètent. |
| `/fr/lyon · faqs[1].q` | Nous sommes un bouchon familial, pas une chaîne. Est-ce pour nous ? |
| `/fr/lyon · faqs[1].a` | Oui — les pilotes se règlent maison par maison. Un petit bouchon apprend davantage à la version française qu'un siège, et les conditions se conviennent au cas par cas, sans grille tarifaire. |
| `/fr/lyon · faqs[2].q` | Et si plusieurs personnes appellent pendant le coup de feu ? |
| `/fr/lyon · faqs[2].a` | Elles sont toutes prises en même temps, dès la première sonnerie. C'est tout l'intérêt d'un hôte automatisé — une tonalité occupée, c'est une réservation lyonnaise qui file ailleurs. |
| `/fr/lyon · faqs[3].q` | Faut-il changer de numéro ou de matériel ? |
| `/fr/lyon · faqs[3].a` | Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement ceux qui resteraient sans réponse. Ce transfert, c'est toute l'installation. |
| `/fr/lyon · faqs[4].q` | Quel est le prix ? |
| `/fr/lyon · faqs[4].a` | Les conditions se fixent avec chaque maison, pas sur une grille, et nous décidons ensemble de ce qu'est une réussite avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez. |
| `/fr/lyon · aiLocal.lead` | La mécanique tient en trois gestes : reconnaître les mots de Lyon, vérifier le registre avant d'ouvrir la bouche, et confier à une personne tout ce qui n'est pas une réservation ordinaire. |
| `/fr/lyon · aiLocal.points[0].title` | Il connaît les rues |
| `/fr/lyon · aiLocal.points[0].body` | Traboules, montées, quais de Saône — la transcription toute faite en fait de la bouillie. La version française est réglée dessus, si bien que la Croix-Rousse arrive dans la note écrite comme il faut. |
| `/fr/lyon · aiLocal.points[1].title` | Deux tournées, aucune marge |
| `/fr/lyon · aiLocal.points[1].body` | Un midi en deux services ne pardonne pas un oui de trop. Vox n'avance rien sans avoir lu le registre, pour qu'une table inventée ne fasse pas sauter la seconde tournée. |
| `/fr/lyon · aiLocal.points[2].title` | Des appels de partout |
| `/fr/lyon · aiLocal.points[2].body` | Une maison citée dans les guides est appelée en français comme en anglais. Le système d'écoute est bâti pour cet éventail, et chaque appel du pilote l'affine encore. |
| `/fr/lyon · aiLocal.points[3].title` | L'appel fait foi |
| `/fr/lyon · aiLocal.points[3].body` | Chaque appel est conservé avec sa transcription, consultable par la maison seule et par personne d'autre, jamais réutilisé pour ficher un client. Une contestation se relit au lieu de se discuter. |
| `/fr/marseille · seoTitle` | Répondeur téléphonique IA pour les restaurants marseillais — Vox par BitePerk |
| `/fr/marseille · seoDescription` | Vox répond au téléphone de votre restaurant à Marseille d'une voix naturelle, note les commandes passées à l'avance et vérifie le registre pendant que la salle tourne. Pilotes ouverts en France. |
| `/fr/marseille · heroHeadline` | La bouillabaisse se commande la veille. Encore faut-il que quelqu'un décroche. |
| `/fr/marseille · intro[0]` | Un vendredi sur le Vieux-Port : la salle se remplit face à l'eau, et le téléphone sonne pour la veille — une bouillabaisse pour six, un grand plateau à préparer, une table en terrasse dès qu'il fait beau. Vox répond quand la salle ne peut pas, vérifie ce qui reste et note la commande avant que l'appelant ne raccroche. |
| `/fr/marseille · intro[1]` | Marseille cuisine des plats qui se décident à l'avance : la bouillabaisse se commande un ou deux jours plus tôt, le temps d'acheter le poisson. L'appel qui prépare ce repas est le plus précieux de la semaine, et c'est souvent celui qui tombe en plein service, quand personne n'est libre. Ici la ligne parle aussi plusieurs langues, d'une rive à l'autre de la Méditerranée. Un appel manqué, ce n'est pas une table en moins — c'est une grande tablée partie ailleurs. |
| `/fr/marseille · intro[2]` | Vox existe pour cet appel-là. Il répond dès la première sonnerie, à toute heure, consulte le registre avant tout engagement et confirme — puis bascule vers une personne dès que la demande le mérite. Il tourne en production en Australie ; la France est un programme pilote, et Marseille rejoint la ligne après Paris. |
| `/fr/marseille · cityscapeImageAlt` | Terrasse d'un restaurant au bord d'un vieux port méditerranéen — barques et maisons colorées |
| `/fr/marseille · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/marseille · scenarios[0].title` | La commande de la veille |
| `/fr/marseille · scenarios[0].body` | Une bouillabaisse pour huit se décide avant que le poisson ne soit acheté. Vox prend la demande, la date et le nombre, et la transmet complète à la cuisine, au lieu de la laisser sur un répondeur que personne n'écoute avant le lendemain. |
| `/fr/marseille · scenarios[1].title` | Le premier vrai jour d'été |
| `/fr/marseille · scenarios[1].body` | La terrasse se remplit dès que le mistral tombe, et les appels avec. Chacun est pris au même moment plutôt que mis en attente derrière une sonnerie — c'est la différence entre une terrasse pleine et une terrasse à moitié. |
| `/fr/marseille · scenarios[2].title` | Un appelant qui passe d'une langue à l'autre |
| `/fr/marseille · scenarios[2].body` | Sur le port, la même ligne reçoit du français, de l'italien, de l'anglais. C'est exactement ce qu'un pilote sert à éprouver, et nous préférons vous le montrer sur vos appels plutôt que l'affirmer ici. |
| `/fr/marseille · scenarios[3].title` | « J'avais pourtant réservé » |
| `/fr/marseille · scenarios[3].body` | Chaque appel garde son enregistrement et sa transcription. Une réservation contestée devient une ligne à relire, pas une parole contre une autre. |
| `/fr/marseille · faqs[0].q` | Vox fonctionne-t-il à Marseille aujourd'hui ? |
| `/fr/marseille · faqs[0].a` | Non. Il est en production en Australie, où il répond à de vrais appels pour des maisons qui le paient, et la France est un programme pilote que nous ouvrons. Version honnête : éprouvé ailleurs, en train d'arriver ici — les conditions du pilote sont écrites pour cela. |
| `/fr/marseille · faqs[1].q` | Nous sommes une petite adresse de quartier. Est-ce pour nous ? |
| `/fr/marseille · faqs[1].a` | Oui — les pilotes se règlent adresse par adresse. Une petite maison apprend davantage à la version française qu'un siège, et tout se convient au cas par cas, sans grille tarifaire. |
| `/fr/marseille · faqs[2].q` | Que se passe-t-il quand ça sonne de partout en plein service ? |
| `/fr/marseille · faqs[2].a` | Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, c'est une grande table qui s'en va. |
| `/fr/marseille · faqs[3].q` | Faut-il un nouveau numéro ou du matériel ? |
| `/fr/marseille · faqs[3].a` | Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation. |
| `/fr/marseille · faqs[4].q` | Combien ça coûte ? |
| `/fr/marseille · faqs[4].a` | Les conditions se fixent avec chaque maison plutôt que sur une liste de prix, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne mérite pas sa place, vous arrêtez. |
| `/fr/marseille · aiLocal.lead` | Trois principes sous la voix : entendre juste les noms d'ici, ne rien avancer que le registre ne confirme, et laisser une personne reprendre dès qu'un appel sort du cadre. |
| `/fr/marseille · aiLocal.points[0].title` | Il note bien les noms |
| `/fr/marseille · aiLocal.points[0].body` | Endoume, le Vallon des Auffes, la Joliette — la transcription générique en fait n'importe quoi. Les reporter intacts dans une note de réservation est ingrat, et c'est ce qu'une maison remarque d'abord. |
| `/fr/marseille · aiLocal.points[1].title` | Le registre d'abord |
| `/fr/marseille · aiLocal.points[1].body` | Rien n'est promis avant lecture du registre. Une commande de la veille suppose de savoir ce que la cuisine peut tenir ; une table inventée coûte le service entier. |
| `/fr/marseille · aiLocal.points[2].title` | Plusieurs langues sur une ligne |
| `/fr/marseille · aiLocal.points[2].body` | Un port reçoit des appels d'un peu partout autour de la Méditerranée. Le système d'écoute est fait pour ce mélange d'accents, et le pilote l'entraîne un peu plus à chaque appel. |
| `/fr/marseille · aiLocal.points[3].title` | Le strict nécessaire |
| `/fr/marseille · aiLocal.points[3].body` | Vox ne retient d'un appel que ce qui sert à finaliser la réservation ; le reste n'est pas collecté. Les données restent consultables par la maison et ne construisent aucun profil d'appelant. |
| `/fr/nice · seoTitle` | Répondeur téléphonique IA pour les restaurants niçois — Vox par BitePerk |
| `/fr/nice · seoDescription` | Vox répond au téléphone de votre restaurant à Nice d'une voix naturelle, tient la ligne quand la saison déborde et vérifie le registre réel. Pilotes ouverts en France. |
| `/fr/nice · heroHeadline` | L'été, la terrasse déborde — et le téléphone avec. Vox tient la ligne. |
| `/fr/nice · intro[0]` | Un soir de juillet dans le Vieux-Nice : la terrasse est pleine, la file attend, et le téléphone n'arrête pas — une table pour ce soir, une réservation pour demain, une question en italien sur les horaires. Vox répond à tout cela d'une voix calme pendant que la salle avance. |
| `/fr/nice · intro[1]` | Nice vit à deux rythmes. Hors saison, le téléphone respire ; l'été venu, les couverts doublent et la ligne sature du matin au soir, portée par une clientèle qui appelle autant en italien et en anglais qu'en français. La personne qui pourrait décrocher est déjà en salle, et l'appel qui sonne dans le vide s'en va sur la Promenade, à l'adresse suivante. C'est en haute saison, quand chaque table compte double, que le téléphone coûte le plus cher. |
| `/fr/nice · intro[2]` | Vox est fait pour ce pic. Il prend l'appel dès la première sonnerie, quelle que soit l'heure, s'appuie sur le registre réel puis confirme — en laissant la main à une personne quand il le faut. Il tourne en production en Australie ; la France est un programme pilote, et Nice en fait partie depuis Paris. |
| `/fr/nice · cityscapeImageAlt` | Terrasse couverte d'un restaurant face à la mer turquoise sur la Riviera, chaises blanches |
| `/fr/nice · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/nice · scenarios[0].title` | Vingt et une heures, plein été |
| `/fr/nice · scenarios[0].body` | La salle et la terrasse tournent ensemble, et le téléphone ne faiblit pas. Vox prend la table de demain pendant que votre équipe reste au service, et la réservation est au registre avant que l'appelant ait raccroché. |
| `/fr/nice · scenarios[1].title` | Un appel en italien |
| `/fr/nice · scenarios[1].body` | À une heure de la frontière, une bonne part des appels arrivent en italien ou en anglais. C'est précisément ce qu'un pilote sert à éprouver ; nous préférons vous le montrer sur vos appels que l'écrire ici. |
| `/fr/nice · scenarios[2].title` | La bascule de saison |
| `/fr/nice · scenarios[2].body` | Le jour où la saison démarre, le volume d'appels change du tout au tout. Vox encaisse ce pic sans embaucher un standard pour trois mois, puis se fait oublier quand la ville se vide. |
| `/fr/nice · scenarios[3].title` | « On avait dit en terrasse » |
| `/fr/nice · scenarios[3].body` | Chaque appel garde son enregistrement et sa transcription. Une demande contestée — terrasse ou salle — se relit en quelques secondes plutôt que de se discuter. |
| `/fr/nice · faqs[0].q` | Vox fonctionne-t-il déjà à Nice ? |
| `/fr/nice · faqs[0].a` | Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous signons des pilotes en ce moment — honnêtement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions le reflètent. |
| `/fr/nice · faqs[1].q` | Nous n'ouvrons vraiment qu'en saison. Est-ce pour nous ? |
| `/fr/nice · faqs[1].a` | Oui, et c'est même là que Vox se justifie le mieux : il absorbe le pic sans standard saisonnier à recruter, et les conditions du pilote se conviennent au cas par cas. |
| `/fr/nice · faqs[2].q` | Et quand tout sonne en même temps un soir d'août ? |
| `/fr/nice · faqs[2].a` | Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, un soir d'été, c'est une table perdue sur la Promenade. |
| `/fr/nice · faqs[3].q` | Faut-il un nouveau numéro ou du matériel ? |
| `/fr/nice · faqs[3].a` | Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation. |
| `/fr/nice · faqs[4].q` | Combien ça coûte ? |
| `/fr/nice · faqs[4].a` | Les conditions se fixent avec chaque établissement, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez. |
| `/fr/nice · aiLocal.lead` | Ce qui travaille sous la voix : une oreille réglée sur Nice et ses langues, un registre consulté avant chaque oui, et le réflexe de passer la main quand l'appel n'a rien d'ordinaire. |
| `/fr/nice · aiLocal.points[0].title` | Il écrit juste les noms |
| `/fr/nice · aiLocal.points[0].body` | Cimiez, Riquier, le Carré d'Or — la transcription toute faite les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation. |
| `/fr/nice · aiLocal.points[1].title` | Le registre suit la saison |
| `/fr/nice · aiLocal.points[1].body` | Ce qui est libre en février ne l'est pas en août. Vox lit la disponibilité réelle avant de promettre, pour qu'un soir de pleine saison ne soit jamais vendu deux fois. |
| `/fr/nice · aiLocal.points[2].title` | Français, italien, anglais |
| `/fr/nice · aiLocal.points[2].body` | À la frontière italienne et en pleine saison, les langues se mêlent sur la même ligne. Le système d'écoute est conçu pour cela, et chaque conversation du pilote l'améliore. |
| `/fr/nice · aiLocal.points[3].title` | Il dit ce qu'il est |
| `/fr/nice · aiLocal.points[3].body` | Vox se présente comme un assistant vocal, jamais comme un employé — la transparence qu'impose l'AI Act (article 50, règlement (UE) 2024/1689). Les données d'appel servent la réservation, restent consultables et ne profilent personne. |
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
