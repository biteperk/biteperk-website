# French native review — /fr cities batch B (Bordeaux, Toulouse, Lille)

- **Status:** ✅ PASSED — Ludovic gave a verbal native pass on 7 Sep 2026 (relayed
  by Sam), happy with everything, green light to go ahead. The cities in this
  batch are flipped `published: true` and shipped.
- **Reviewer:** Ludovic (native French)
- **Pages:** /fr/bordeaux, /fr/toulouse, /fr/lille
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
| `/fr/bordeaux · seoTitle` | Répondeur téléphonique IA pour les restaurants bordelais — Vox par BitePerk |
| `/fr/bordeaux · seoDescription` | Vox répond au téléphone de votre restaurant à Bordeaux d'une voix naturelle, prend les grandes tablées et les menus accordés et vérifie le registre. Pilotes ouverts en France. |
| `/fr/bordeaux · heroHeadline` | Le week-end, les tablées de dégustation appellent. Vox répond à chacune. |
| `/fr/bordeaux · intro[0]` | Un samedi aux Chartrons : la salle affiche complet, une cave attend derrière, et le téléphone sonne pour une tablée de huit qui veut accorder les plats aux vins. Vox répond à leur place, vérifie ce que le registre garde et fixe la réservation avant que l'appelant ne raccroche. |
| `/fr/bordeaux · intro[1]` | Bordeaux vit au rythme du vin, et cela se lit sur le téléphone : les week-ends amènent des visiteurs venus pour les crus, des groupes qui réservent longtemps à l'avance, des demandes de menus accordés et de grandes tablées. Ce sont les appels les plus rémunérateurs de la semaine, et ce sont précisément ceux qui tombent quand la salle est pleine et que personne ne peut décrocher. Un groupe qui sonne dans le vide réserve ailleurs, souvent pour le double de couverts. |
| `/fr/bordeaux · intro[2]` | Vox est fait pour ces appels-là. Il répond dès la première sonnerie, à toute heure, consulte le registre avant de rien promettre et confirme — puis transmet une demande de groupe complète à votre équipe plutôt qu'un bip de messagerie. Il tourne en production en Australie ; la France est un programme pilote, et Bordeaux s'y ajoute après Paris. |
| `/fr/bordeaux · cityscapeImageAlt` | Cave à vins vitrée d'un restaurant bordelais, bouteilles françaises en présentation |
| `/fr/bordeaux · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/bordeaux · scenarios[0].title` | La grande tablée du samedi |
| `/fr/bordeaux · scenarios[0].body` | Un groupe de dix veut un menu accordé aux vins pour samedi soir. Vox recueille la date, le nombre, le budget et les régimes, et envoie une piste complète à votre équipe au lieu de la laisser sur un répondeur. |
| `/fr/bordeaux · scenarios[1].title` | Le week-end des primeurs |
| `/fr/bordeaux · scenarios[1].body` | Les fins de semaine amènent d'un coup les visiteurs venus pour le vin, et les appels avec. Chacun est pris au même moment plutôt que mis en attente — c'est la différence entre une salle pleine et des couverts partis chez le voisin. |
| `/fr/bordeaux · scenarios[2].title` | « On avait réservé la table près de la cave » |
| `/fr/bordeaux · scenarios[2].body` | Chaque appel garde son enregistrement et sa transcription. Une demande précise — une table, un accord, une allergie — se relit en quelques secondes plutôt que de se rejouer de mémoire. |
| `/fr/bordeaux · scenarios[3].title` | L'appel qui vient de loin |
| `/fr/bordeaux · scenarios[3].body` | Un visiteur prépare son passage à Bordeaux des semaines à l'avance, souvent en anglais. Vox prend la réservation quand elle arrive, à n'importe quelle heure, et la range au registre avec sa transcription. |
| `/fr/bordeaux · faqs[0].q` | Vox fonctionne-t-il déjà à Bordeaux ? |
| `/fr/bordeaux · faqs[0].a` | Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous ouvrons des pilotes en ce moment — dit simplement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions du pilote le reflètent. |
| `/fr/bordeaux · faqs[1].q` | Nous sommes une table de quartier, pas un grand nom. Est-ce pour nous ? |
| `/fr/bordeaux · faqs[1].a` | Oui — les pilotes se règlent maison par maison. Une petite table apprend davantage à la version française qu'une grande enseigne, et tout se convient au cas par cas, sans grille tarifaire. |
| `/fr/bordeaux · faqs[2].q` | Et quand plusieurs groupes appellent le même soir ? |
| `/fr/bordeaux · faqs[2].a` | Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, un samedi, c'est une grande tablée qui s'en va. |
| `/fr/bordeaux · faqs[3].q` | Faut-il un nouveau numéro ou du matériel ? |
| `/fr/bordeaux · faqs[3].a` | Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation. |
| `/fr/bordeaux · faqs[4].q` | Combien ça coûte ? |
| `/fr/bordeaux · faqs[4].a` | Les conditions se fixent avec chaque maison, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez. |
| `/fr/bordeaux · aiLocal.lead` | Trois choses tournent sous la voix : reconnaître les noms bordelais, lire le registre avant tout engagement, et passer la main à une personne pour tout ce qui dépasse la réservation simple. |
| `/fr/bordeaux · aiLocal.points[0].title` | Il connaît les noms |
| `/fr/bordeaux · aiLocal.points[0].body` | Les Chartrons, Nansouty, la Bastide — la transcription toute faite les malmène. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation. |
| `/fr/bordeaux · aiLocal.points[1].title` | Le registre avant la promesse |
| `/fr/bordeaux · aiLocal.points[1].body` | Une grande tablée du samedi ne s'improvise pas. Vox lit la disponibilité réelle avant de s'engager, pour qu'un service déjà plein ne soit pas vendu une fois de trop. |
| `/fr/bordeaux · aiLocal.points[2].title` | Des appels d'ailleurs |
| `/fr/bordeaux · aiLocal.points[2].body` | Une ville de vin reçoit des appels de toute l'Europe, souvent en anglais et des semaines à l'avance. Le système d'écoute est fait pour cet éventail, et chaque appel du pilote l'affine. |
| `/fr/bordeaux · aiLocal.points[3].title` | Gardé le temps qu'il faut |
| `/fr/bordeaux · aiLocal.points[3].body` | Les données d'un appel servent la réservation puis ne s'éternisent pas : conservées le temps utile, elles restent consultables par la maison et ne construisent aucun profil d'appelant. |
| `/fr/toulouse · seoTitle` | Répondeur téléphonique IA pour les restaurants toulousains — Vox par BitePerk |
| `/fr/toulouse · seoDescription` | Vox répond au téléphone de votre restaurant à Toulouse d'une voix naturelle, tient la ligne au coup de feu de midi et vérifie le registre réel. Pilotes ouverts en France. |
| `/fr/toulouse · heroHeadline` | Midi en semaine, la ville déjeune en une heure. Le téléphone n'attend pas. |
| `/fr/toulouse · intro[0]` | Un mardi midi près du Capitole : la salle se remplit d'un coup de tables de travail qui ont une heure, pas plus, et le téléphone sonne pour une réservation de groupe l'après-midi même. Vox répond quand la salle est débordée, vérifie ce qui reste et cale la table avant que l'appelant ne raccroche. |
| `/fr/toulouse · intro[1]` | Toulouse déjeune vite et en nombre. Les bureaux de l'aéronautique remplissent les salles à midi en semaine, la ville étudiante prend le relais le soir, et entre les deux la ligne ne cesse pas de sonner. La personne qui pourrait répondre porte des assiettes, et l'appel resté sans réponse à midi file à l'adresse d'à côté, sous les mêmes briques roses. Un déjeuner d'affaires manqué, c'est une table de six perdue en pleine semaine. |
| `/fr/toulouse · intro[2]` | Vox est fait pour ce midi serré. Il prend l'appel dès la première sonnerie, à toute heure, s'appuie sur le registre réel puis confirme — en laissant la main à une personne quand la demande le mérite. Il tourne en production en Australie ; la France est un programme pilote, et Toulouse s'y joint après Paris. |
| `/fr/toulouse · cityscapeImageAlt` | Salle de brasserie toulousaine, mur de brique et appliques, tables et banquette en bois |
| `/fr/toulouse · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/toulouse · scenarios[0].title` | Midi, une heure montre en main |
| `/fr/toulouse · scenarios[0].body` | Le déjeuner de semaine se joue en une heure et se remplit d'un coup. Vox prend la réservation de l'après-midi pendant que la salle envoie, et elle est au registre avant que l'appelant ait raccroché. |
| `/fr/toulouse · scenarios[1].title` | Le pot de fin de projet |
| `/fr/toulouse · scenarios[1].body` | Une équipe veut réserver pour vingt le soir même, à la dernière minute. Vox recueille le nombre, l'heure et le budget, et transmet une piste complète à votre équipe plutôt qu'un message qu'on lira trop tard. |
| `/fr/toulouse · scenarios[2].title` | « C'était pour douze, pas dix » |
| `/fr/toulouse · scenarios[2].body` | Chaque appel garde son enregistrement et sa transcription. Un nombre contesté cesse d'opposer deux souvenirs : il se relit en quelques secondes. |
| `/fr/toulouse · scenarios[3].title` | Le service du soir étudiant |
| `/fr/toulouse · scenarios[3].body` | Quand la ville étudiante sort, les appels changent de ton et d'heure. Vox les prend aussi tard qu'ils arrivent, sans standardiste de nuit, et range chaque réservation au registre. |
| `/fr/toulouse · faqs[0].q` | Vox fonctionne-t-il à Toulouse aujourd'hui ? |
| `/fr/toulouse · faqs[0].a` | Non. Il est en production en Australie, où il répond à de vrais appels pour des maisons qui le paient, et la France est un programme pilote que nous ouvrons. Version honnête : éprouvé ailleurs, en train d'arriver ici — les conditions du pilote sont écrites pour cela. |
| `/fr/toulouse · faqs[1].q` | Nous vivons surtout du midi en semaine. Est-ce pour nous ? |
| `/fr/toulouse · faqs[1].a` | Oui, et c'est même là que Vox se justifie le mieux : il tient la ligne quand la salle est pleine à midi, et les conditions du pilote se conviennent au cas par cas, sans grille. |
| `/fr/toulouse · faqs[2].q` | Et quand tout sonne pendant le coup de feu de midi ? |
| `/fr/toulouse · faqs[2].a` | Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée à midi, c'est une table de travail qui s'en va. |
| `/fr/toulouse · faqs[3].q` | Faut-il un nouveau numéro ou du matériel ? |
| `/fr/toulouse · faqs[3].a` | Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation. |
| `/fr/toulouse · faqs[4].q` | Combien ça coûte ? |
| `/fr/toulouse · faqs[4].a` | Les conditions se fixent avec chaque maison plutôt que sur une liste de prix, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne mérite pas sa place, vous arrêtez. |
| `/fr/toulouse · aiLocal.lead` | La machine sous la voix fait trois choses : comprendre les noms d'ici, ne promettre que ce que le registre confirme, et rendre la main à l'équipe dès qu'un appel se complique. |
| `/fr/toulouse · aiLocal.points[0].title` | Il écrit juste les noms |
| `/fr/toulouse · aiLocal.points[0].body` | Le Capitole, Saint-Cyprien, les Carmes — la transcription générique les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note. |
| `/fr/toulouse · aiLocal.points[1].title` | Une heure, pas de rab |
| `/fr/toulouse · aiLocal.points[1].body` | Un midi qui se remplit d'un coup ne pardonne pas un oui de trop. Vox ne s'engage qu'après avoir lu le registre, pour qu'une table promise existe vraiment. |
| `/fr/toulouse · aiLocal.points[2].title` | Le monde du travail au bout du fil |
| `/fr/toulouse · aiLocal.points[2].body` | Les bureaux appellent en rafale à midi, la ville étudiante le soir. Le système d'écoute encaisse ce va-et-vient d'accents et d'horaires, et le pilote l'entraîne à chaque appel. |
| `/fr/toulouse · aiLocal.points[3].title` | Réservé à la maison |
| `/fr/toulouse · aiLocal.points[3].body` | Les enregistrements et les notes restent accessibles à la maison seule, jamais à des tiers, et ne servent qu'à honorer la réservation. Aucun profil d'appelant n'est constitué. |
| `/fr/lille · seoTitle` | Répondeur téléphonique IA pour les restaurants lillois — Vox par BitePerk |
| `/fr/lille · seoDescription` | Vox répond au téléphone de votre estaminet ou restaurant à Lille d'une voix naturelle, tient la ligne les week-ends chargés et vérifie le registre. Pilotes ouverts en France. |
| `/fr/lille · heroHeadline` | Le week-end de la Braderie, la ligne explose. Vox décroche sans faiblir. |
| `/fr/lille · intro[0]` | Un soir dans un estaminet du Vieux-Lille : les tables sont pleines de moules et de bière du Nord, et le téléphone sonne pour une réservation de groupe le week-end suivant. Vox répond quand la salle ne peut pas, vérifie ce qui reste et note la table avant que l'appelant ne raccroche. |
| `/fr/lille · intro[1]` | Lille tient de la Flandre autant que de la France, et son calendrier a un sommet : la Braderie, un week-end où la ville double et où le téléphone n'arrête plus de sonner du vendredi au dimanche. Le reste de l'année, la clientèle passe la frontière belge dans les deux sens, et la ligne suit. La personne qui décrocherait est déjà débordée en salle, et l'appel manqué, un week-end pareil, c'est une grande tablée perdue d'un seul coup. |
| `/fr/lille · intro[2]` | Vox est fait pour ce pic. Il décroche dès la première sonnerie, à toute heure, lit ce que le registre a réellement de libre et confirme — en confiant à une personne ce qui sort de l'ordinaire. Il tourne en production en Australie ; la France est un programme pilote, et Lille referme la première série après Paris. |
| `/fr/lille · cityscapeImageAlt` | Salle lambrissée d'un estaminet du Nord, chaises en bois et tables dressées |
| `/fr/lille · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/lille · scenarios[0].title` | Le week-end de la Braderie |
| `/fr/lille · scenarios[0].body` | Trois jours où la ville double et où la ligne ne s'arrête jamais. Vox prend chaque appel à mesure qu'il arrive plutôt que de le laisser sonner, et range les réservations au registre pendant que la salle tourne. |
| `/fr/lille · scenarios[1].title` | La tablée qui vient de Belgique |
| `/fr/lille · scenarios[1].body` | Une partie des appels franchit la frontière belge. Le français et l'anglais sur une même ligne sont ce qu'un pilote sert d'abord à éprouver ; nous préférons vous le montrer sur vos appels que l'affirmer ici. |
| `/fr/lille · scenarios[2].title` | « J'avais réservé pour le samedi de la Braderie » |
| `/fr/lille · scenarios[2].body` | Chaque appel garde son enregistrement et sa transcription. Une réservation contestée, surtout un week-end chargé, se relit en quelques secondes plutôt que de se discuter. |
| `/fr/lille · scenarios[3].title` | Moules-frites pour vingt |
| `/fr/lille · scenarios[3].body` | Un groupe veut réserver pour vingt un soir de match ou de marché. Vox recueille le nombre, l'heure et les régimes et transmet une piste complète, au lieu d'un message découvert trop tard. |
| `/fr/lille · faqs[0].q` | Vox fonctionne-t-il déjà à Lille ? |
| `/fr/lille · faqs[0].a` | Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous signons des pilotes en ce moment — honnêtement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions le reflètent. |
| `/fr/lille · faqs[1].q` | Nous sommes un estaminet, pas une grande salle. Est-ce pour nous ? |
| `/fr/lille · faqs[1].a` | Oui — les pilotes se règlent maison par maison. Un petit estaminet apprend davantage à la version française qu'une grande salle, et tout se convient au cas par cas, sans grille. |
| `/fr/lille · faqs[2].q` | Et le week-end de la Braderie, quand tout sonne à la fois ? |
| `/fr/lille · faqs[2].a` | C'est exactement ce pour quoi Vox existe : tous les appels sont pris ensemble, dès la première sonnerie. Une tonalité occupée, ce week-end-là, c'est une grande tablée qui file ailleurs. |
| `/fr/lille · faqs[3].q` | Faut-il un nouveau numéro ou du matériel ? |
| `/fr/lille · faqs[3].a` | Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation. |
| `/fr/lille · faqs[4].q` | Combien ça coûte ? |
| `/fr/lille · faqs[4].a` | Les conditions se fixent avec chaque maison, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez. |
| `/fr/lille · aiLocal.lead` | Derrière la voix, trois réflexes : écrire juste les noms du Nord, vérifier le registre avant de dire oui, et confier à une personne tout ce qui n'est pas une réservation ordinaire. |
| `/fr/lille · aiLocal.points[0].title` | Il connaît le Nord |
| `/fr/lille · aiLocal.points[0].body` | Wazemmes, le Vieux-Lille, Esquermes — la transcription toute faite les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation. |
| `/fr/lille · aiLocal.points[1].title` | Un pic sans standardiste |
| `/fr/lille · aiLocal.points[1].body` | Un week-end de Braderie apporte en trois jours le volume d'appels d'un mois. Vox l'absorbe sans recruter un standard, et lit le registre avant chaque oui pour ne rien vendre deux fois. |
| `/fr/lille · aiLocal.points[2].title` | De part et d'autre de la frontière |
| `/fr/lille · aiLocal.points[2].body` | Les appels arrivent en français et en anglais, souvent d'au-delà de la frontière belge. Le système d'écoute est fait pour ce mélange, et chaque appel du pilote l'affine. |
| `/fr/lille · aiLocal.points[3].title` | À vous, et corrigeable |
| `/fr/lille · aiLocal.points[3].body` | Chaque appel est conservé avec sa transcription, que la maison peut relire et corriger, et n'est jamais utilisé pour ficher un client. Les données servent la réservation, rien d'autre. |
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
