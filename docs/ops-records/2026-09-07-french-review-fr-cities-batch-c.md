# French native review — /fr cities batch C (Nantes, Strasbourg, Montpellier)

- **Status:** ⏳ PENDING Ludovic's native pass — cities are staged `published: false`
  and must not flip live until this batch is signed off. When he passes it, change
  this line to the dated pass and note the medium (verbal/email), exactly as the
  other `docs/ops-records/…-french-review-*` sheets do.
- **Reviewer:** Ludovic (native French)
- **Pages:** /fr/nantes, /fr/strasbourg, /fr/montpellier
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
| `/fr/nantes · seoTitle` | Répondeur téléphonique IA pour les restaurants nantais — Vox par BitePerk |
| `/fr/nantes · seoDescription` | Vox répond au téléphone de votre restaurant à Nantes d'une voix naturelle, encaisse les week-ends en famille et vérifie le registre. Pilotes ouverts en France. |
| `/fr/nantes · heroHeadline` | Le dimanche, les familles appellent et le nombre change trois fois. Vox suit. |
| `/fr/nantes · intro[0]` | Un dimanche vers le Bouffay : la salle se remplit de tablées de famille, les poussettes s'alignent près de l'entrée, et le téléphone sonne pour une réservation qui passe de six à huit puis à sept. Vox répond quand la salle déborde, tient le compte à jour et confirme avant que l'appelant ne raccroche. |
| `/fr/nantes · intro[1]` | Nantes reçoit en famille, surtout le week-end : brunchs, anniversaires, grandes tablées dont le nombre bouge jusqu'au dernier moment. Ces réservations-là se règlent au téléphone, par petites retouches successives, et elles tombent quand la salle est pleine et que personne ne peut noter le changement. Un appel manqué le dimanche, ce n'est pas une table en moins, c'est une famille entière qui réserve ailleurs. |
| `/fr/nantes · intro[2]` | Vox est fait pour ces réservations qui bougent. Il décroche dès la première sonnerie, à toute heure, relit le registre à chaque changement et confirme le nouveau compte — en confiant à une personne ce qui sort de l'ordinaire. Il tourne en production en Australie ; la France est un programme pilote, et Nantes s'y ajoute. |
| `/fr/nantes · cityscapeImageAlt` | Salle lumineuse d'une brasserie nantaise, banquettes vertes, plantes et grandes fenêtres |
| `/fr/nantes · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/nantes · scenarios[0].title` | Le brunch du dimanche |
| `/fr/nantes · scenarios[0].body` | Les familles arrivent par vagues et le nombre change à chaque appel. Vox met la réservation à jour à mesure, relit le registre et confirme le nouveau compte sans faire attendre la salle. |
| `/fr/nantes · scenarios[1].title` | « Finalement, on sera neuf » |
| `/fr/nantes · scenarios[1].body` | Une tablée grossit la veille pour le lendemain. Vox reprend la réservation, vérifie que la place existe encore et confirme — ou propose un autre créneau plutôt que de promettre une table qui n'y est plus. |
| `/fr/nantes · scenarios[2].title` | L'anniversaire à caler |
| `/fr/nantes · scenarios[2].body` | Un parent veut réserver pour douze avec un gâteau et une chaise haute. Vox recueille le nombre, l'heure et les détails, et transmet une piste complète à votre équipe plutôt qu'un message sur le répondeur. |
| `/fr/nantes · scenarios[3].title` | « On avait dit sans les marches » |
| `/fr/nantes · scenarios[3].body` | Chaque appel garde son enregistrement et sa transcription. Une demande précise — une poussette, un accès, une allergie — se relit en quelques secondes plutôt que de se rejouer de mémoire. |
| `/fr/nantes · faqs[0].q` | Vox fonctionne-t-il déjà à Nantes ? |
| `/fr/nantes · faqs[0].a` | Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous ouvrons des pilotes en ce moment — dit simplement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions du pilote le reflètent. |
| `/fr/nantes · faqs[1].q` | Nous faisons surtout le week-end et la famille. Est-ce pour nous ? |
| `/fr/nantes · faqs[1].a` | Oui, et c'est là que Vox aide le plus : il tient les réservations qui changent quand la salle est pleine, et les conditions du pilote se conviennent au cas par cas, sans grille. |
| `/fr/nantes · faqs[2].q` | Et quand tout sonne pendant le service du dimanche ? |
| `/fr/nantes · faqs[2].a` | Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, un dimanche, c'est une tablée de famille qui s'en va. |
| `/fr/nantes · faqs[3].q` | Faut-il un nouveau numéro ou du matériel ? |
| `/fr/nantes · faqs[3].a` | Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation. |
| `/fr/nantes · faqs[4].q` | Combien ça coûte ? |
| `/fr/nantes · faqs[4].a` | Les conditions se fixent avec chaque maison, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez. |
| `/fr/nantes · aiLocal.lead` | Sous la voix, trois choses simples : reconnaître les noms nantais, tenir le registre à jour à chaque retouche, et passer la main à une personne dès qu'une demande sort du cadre. |
| `/fr/nantes · aiLocal.points[0].title` | Il connaît les noms |
| `/fr/nantes · aiLocal.points[0].body` | Le Bouffay, Talensac, les Hauts-Pavés — la transcription toute faite les abîme. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation. |
| `/fr/nantes · aiLocal.points[1].title` | Le compte reste juste |
| `/fr/nantes · aiLocal.points[1].body` | Une tablée qui passe de six à neuf n'existe que si le registre le dit. Vox relit la disponibilité à chaque changement, pour ne jamais confirmer une place qui n'est plus là. |
| `/fr/nantes · aiLocal.points[2].title` | Le brouhaha du dimanche |
| `/fr/nantes · aiLocal.points[2].body` | Un service de famille est bruyant, et les appels arrivent par-dessus. Le système d'écoute est fait pour ce fond sonore, et chaque appel du pilote l'affine. |
| `/fr/nantes · aiLocal.points[3].title` | Rien de plus que la réservation |
| `/fr/nantes · aiLocal.points[3].body` | Ce que Vox note d'un appel ne sert qu'à honorer la réservation — pas à démarcher, pas à profiler. Les données restent consultables par la maison et à personne d'autre. |
| `/fr/strasbourg · seoTitle` | Répondeur téléphonique IA pour les restaurants strasbourgeois — Vox par BitePerk |
| `/fr/strasbourg · seoDescription` | Vox répond au téléphone de votre winstub ou restaurant à Strasbourg d'une voix naturelle, encaisse les semaines de pointe et vérifie le registre. Pilotes ouverts en France. |
| `/fr/strasbourg · heroHeadline` | Semaine de session, marché de Noël : la ville double et le téléphone déborde. |
| `/fr/strasbourg · intro[0]` | Un soir de décembre près de la Petite France : la winstub est comble, les chalets du marché brillent dehors, et le téléphone n'arrête pas — une table pour ce soir, un groupe pour demain, une question en allemand sur les horaires. Vox répond à tout cela d'une voix calme pendant que la salle tient bon. |
| `/fr/strasbourg · intro[1]` | Strasbourg a un calendrier en dents de scie. Les semaines de session parlementaire et l'Avent font doubler la ville d'un coup, la clientèle passe la frontière allemande et appelle dans les deux langues, puis le calme revient. Embaucher un standard pour ces pointes n'a aucun sens, et pourtant c'est là que chaque appel manqué coûte le plus cher — une grande table perdue un soir où tout est plein. |
| `/fr/strasbourg · intro[2]` | Vox est fait pour ces pics. Il décroche dès la première sonnerie, à toute heure, lit ce que le registre a réellement de libre et confirme — en laissant la main à une personne quand la demande le mérite. Il tourne en production en Australie ; la France est un programme pilote, et Strasbourg entre dans la série. |
| `/fr/strasbourg · cityscapeImageAlt` | Coin d'une winstub alsacienne lambrissée de pin clair, table dressée et banquette |
| `/fr/strasbourg · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/strasbourg · scenarios[0].title` | La semaine de session |
| `/fr/strasbourg · scenarios[0].body` | Quand le Parlement siège, les tables de travail affluent et la ligne ne faiblit pas. Vox prend les réservations à mesure qu'elles arrivent, sans standard supplémentaire, et les range au registre pendant que la salle envoie. |
| `/fr/strasbourg · scenarios[1].title` | L'Avent et ses chalets |
| `/fr/strasbourg · scenarios[1].body` | Le marché de Noël amène en quelques semaines le volume d'appels d'un trimestre. Chacun est pris au même instant plutôt que mis en attente — c'est la différence entre une salle pleine et des couverts partis au chalet d'à côté. |
| `/fr/strasbourg · scenarios[2].title` | Un appel en allemand |
| `/fr/strasbourg · scenarios[2].body` | À un pas de la frontière, une partie des appels arrivent en allemand ou en anglais. C'est ce qu'un pilote sert d'abord à éprouver, et nous préférons vous le montrer sur vos appels plutôt que l'affirmer ici. |
| `/fr/strasbourg · scenarios[3].title` | « C'était pour la winstub du fond » |
| `/fr/strasbourg · scenarios[3].body` | Chaque appel garde son enregistrement et sa transcription. Une demande précise — une salle, un menu, une allergie — se relit en quelques secondes plutôt que de se rejouer de mémoire. |
| `/fr/strasbourg · faqs[0].q` | Vox fonctionne-t-il à Strasbourg aujourd'hui ? |
| `/fr/strasbourg · faqs[0].a` | Non. Il est en production en Australie, où il répond à de vrais appels pour des maisons qui le paient, et la France est un programme pilote que nous ouvrons. Version honnête : éprouvé ailleurs, en train d'arriver ici — les conditions du pilote sont écrites pour cela. |
| `/fr/strasbourg · faqs[1].q` | Nous ne saturons vraiment qu'à certaines périodes. Est-ce pour nous ? |
| `/fr/strasbourg · faqs[1].a` | Oui, et c'est justement là que Vox se justifie : il encaisse la pointe sans recrutement saisonnier, et les conditions du pilote se conviennent au cas par cas, sans grille. |
| `/fr/strasbourg · faqs[2].q` | Et quand tout sonne un soir d'Avent ? |
| `/fr/strasbourg · faqs[2].a` | Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, en décembre, c'est une grande table qui s'en va. |
| `/fr/strasbourg · faqs[3].q` | Faut-il un nouveau numéro ou du matériel ? |
| `/fr/strasbourg · faqs[3].a` | Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation. |
| `/fr/strasbourg · faqs[4].q` | Combien ça coûte ? |
| `/fr/strasbourg · faqs[4].a` | Les conditions se fixent avec chaque maison plutôt que sur une liste de prix, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne mérite pas sa place, vous arrêtez. |
| `/fr/strasbourg · aiLocal.lead` | Ce qui tourne sous la voix : une oreille faite pour les noms et les langues d'ici, une lecture du registre avant chaque promesse, et le réflexe de passer la main quand l'appel se complique. |
| `/fr/strasbourg · aiLocal.points[0].title` | Il écrit juste les noms |
| `/fr/strasbourg · aiLocal.points[0].body` | La Petite France, la Krutenau, la Neustadt — la transcription générique les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note. |
| `/fr/strasbourg · aiLocal.points[1].title` | Une pointe sans standard |
| `/fr/strasbourg · aiLocal.points[1].body` | Une semaine de session ou d'Avent apporte le volume d'appels d'un trimestre. Vox l'absorbe sans embaucher, et lit le registre avant chaque oui pour ne rien vendre deux fois. |
| `/fr/strasbourg · aiLocal.points[2].title` | Français, allemand, anglais |
| `/fr/strasbourg · aiLocal.points[2].body` | Au bord du Rhin, les langues se croisent sur la même ligne. Le système d'écoute est conçu pour ce mélange, et chaque conversation du pilote l'améliore. |
| `/fr/strasbourg · aiLocal.points[3].title` | Rien ne sort de la maison |
| `/fr/strasbourg · aiLocal.points[3].body` | Les enregistrements et les notes ne sont partagés avec aucun tiers et ne servent qu'à la réservation. Ils restent consultables par la maison et ne construisent aucun profil d'appelant. |
| `/fr/montpellier · seoTitle` | Répondeur téléphonique IA pour les restaurants montpelliérains — Vox par BitePerk |
| `/fr/montpellier · seoDescription` | Vox répond au téléphone de votre restaurant à Montpellier d'une voix naturelle, décroche tard quand la salle est pleine et vérifie le registre. Pilotes ouverts en France. |
| `/fr/montpellier · heroHeadline` | Tard le soir, la salle est pleine et le téléphone sonne encore. Vox décroche. |
| `/fr/montpellier · intro[0]` | Un vendredi soir près de la Comédie : la terrasse déborde, la porte ne désemplit pas, et le téléphone sonne pour une table à dix heures passées. Vox répond quand toute l'équipe est débordée par la salle, vérifie ce qui reste et cale la table avant que l'appelant ne raccroche. |
| `/fr/montpellier · intro[1]` | Montpellier sort tard et vit dehors. La ville est jeune, la clientèle se décide au dernier moment, et le soir la salle joue sur deux tableaux : la porte qui ne s'arrête pas et le téléphone que plus personne n'entend. C'est là que filent les réservations tardives — celles qui tentent leur chance quand le voisin affiche complet. Une table décrochée à dix heures, c'est un couvert rempli une seconde fois dans la soirée. |
| `/fr/montpellier · intro[2]` | Vox est fait pour ce moment-là. Il décroche dès la première sonnerie, aussi tard qu'il le faut, vérifie ce que le registre garde encore et confirme — puis passe la main à une personne si la demande sort de l'ordinaire. Il tourne en production en Australie ; la France est un programme pilote, et Montpellier complète la carte. |
| `/fr/montpellier · cityscapeImageAlt` | Terrasse d'un restaurant le soir dans le sud de la France, parasols et guirlandes lumineuses |
| `/fr/montpellier · storyImageAlt` | Banquette en velours bleu et tables en marbre dressées pour le service |
| `/fr/montpellier · scenarios[0].title` | Vingt-deux heures, salle pleine |
| `/fr/montpellier · scenarios[0].body` | La porte tourne encore et le téléphone sonne pour une table de dernière minute. Vox la prend pendant que l'équipe reste sur la salle, et la réservation est au registre avant que l'appelant ait raccroché. |
| `/fr/montpellier · scenarios[1].title` | L'appel de report |
| `/fr/montpellier · scenarios[1].body` | Un groupe repoussé par l'adresse voisine tente sa chance chez vous. Vox répond au moment où l'appel arrive plutôt que de le laisser sonner, vérifie la place et confirme — c'est une table gagnée sur le concurrent d'en face. |
| `/fr/montpellier · scenarios[2].title` | La terrasse un soir de match |
| `/fr/montpellier · scenarios[2].body` | Les soirs de sortie, les appels arrivent tard et en rafale. Vox les prend tous en même temps, sans standardiste de nuit, et range chaque réservation au registre avec sa transcription. |
| `/fr/montpellier · scenarios[3].title` | « J'avais réservé en terrasse » |
| `/fr/montpellier · scenarios[3].body` | Chaque appel garde son enregistrement et sa transcription. Une demande contestée — terrasse ou salle, heure ou nombre — se relit en quelques secondes plutôt que de se discuter. |
| `/fr/montpellier · faqs[0].q` | Vox fonctionne-t-il déjà à Montpellier ? |
| `/fr/montpellier · faqs[0].a` | Il est en production en Australie, où il répond à de vrais appels pour des établissements qui le paient. En France, nous signons des pilotes en ce moment — honnêtement : éprouvé ailleurs, en cours d'arrivée ici, et les conditions le reflètent. |
| `/fr/montpellier · faqs[1].q` | Nous marchons surtout le soir et à la dernière minute. Est-ce pour nous ? |
| `/fr/montpellier · faqs[1].a` | Oui, et c'est là que Vox aide le plus : il décroche tard, quand la salle est pleine et que le téléphone passe après la porte, et les conditions du pilote se conviennent au cas par cas. |
| `/fr/montpellier · faqs[2].q` | Et quand ça sonne en rafale un soir de sortie ? |
| `/fr/montpellier · faqs[2].a` | Tous les appels sont pris ensemble, dès la première sonnerie. La simultanéité est le cœur d'un hôte automatisé — une tonalité occupée, tard le soir, c'est une table qui part chez le voisin. |
| `/fr/montpellier · faqs[3].q` | Faut-il un nouveau numéro ou du matériel ? |
| `/fr/montpellier · faqs[3].a` | Non. Vous gardez votre numéro et transférez les appels vers Vox — tous, ou seulement les débordements. Ce transfert est toute l'installation. |
| `/fr/montpellier · faqs[4].q` | Combien ça coûte ? |
| `/fr/montpellier · faqs[4].a` | Les conditions se fixent avec chaque maison, pas sur une grille, et l'on convient d'un bon résultat avant le premier appel. Si Vox ne gagne pas sa place, vous arrêtez. |
| `/fr/montpellier · aiLocal.lead` | Derrière la voix, trois gestes : saisir les noms d'ici, ne s'engager qu'après avoir lu le registre, et rendre la main à l'équipe dès qu'un appel se complique. |
| `/fr/montpellier · aiLocal.points[0].title` | Il connaît la ville |
| `/fr/montpellier · aiLocal.points[0].body` | L'Écusson, Figuerolles, les Arceaux — la transcription toute faite les écorche. La version française est réglée dessus, pour qu'ils arrivent intacts dans la note de réservation. |
| `/fr/montpellier · aiLocal.points[1].title` | Tard, mais juste |
| `/fr/montpellier · aiLocal.points[1].body` | Une table de dernière minute n'a de valeur que si elle existe vraiment. Vox lit le registre avant de confirmer, même à dix heures passées, pour ne pas vendre une place déjà prise. |
| `/fr/montpellier · aiLocal.points[2].title` | Le bruit de la nuit |
| `/fr/montpellier · aiLocal.points[2].body` | Les appels tardifs arrivent d'une rue animée, souvent depuis une terrasse. Le système d'écoute est fait pour ce fond sonore, et chaque appel du pilote l'affine. |
| `/fr/montpellier · aiLocal.points[3].title` | Annoncé, puis effacé |
| `/fr/montpellier · aiLocal.points[3].body` | Vox se présente comme un assistant vocal, jamais comme un employé, et ce qu'il note ne sert qu'à la réservation, le temps utile. Les données restent consultables par la maison et ne profilent personne. |
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
