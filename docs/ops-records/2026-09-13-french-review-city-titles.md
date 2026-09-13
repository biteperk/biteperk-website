> **Sent for review, 13 September 2026 — NOT yet passed.** Only the fields below changed; every other line on these pages is the copy Ludovic passed on 7 Sep 2026 (batches A–C, Paris + Brussels-FR). Record the pass here and in `docs/accounts-and-ops-log.md`; do not edit the rows.

---

# French city pages — title rewrite, 13 September 2026

**Prepared for:** Ludovic · **Requested by:** Sam Kalaliya

## Why

All eleven French city `<title>`s used one template — *"Répondeur téléphonique IA pour les restaurants {gentilé} — Vox par BitePerk"*. Two problems: *un répondeur* is an answering machine, the thing Vox replaces; and eleven identical title shapes in one tree is the pattern a doorway-page classifier looks for (a gate, `check-title-templates`, now fails three or more). Each title below is written from the venue vocabulary already in that city's approved description (bouchon, estaminet, winstub…).

## Titles (`seoTitle` — the browser tab and the search result headline)

| Page | Was | Now | Correction |
|---|---|---|---|
| `/fr/paris/` | Répondeur téléphonique IA pour les restaurants parisiens — Vox par BitePerk | **Hôte téléphonique IA pour restaurants parisiens — BitePerk** | |
| `/fr/lyon/` | Répondeur téléphonique IA pour les restaurants lyonnais — Vox par BitePerk | **Vox, l'hôte téléphonique IA de votre bouchon à Lyon** | |
| `/fr/marseille/` | Répondeur téléphonique IA pour les restaurants marseillais — Vox par BitePerk | **Restaurants marseillais : Vox décroche et note la commande** | |
| `/fr/nice/` | Répondeur téléphonique IA pour les restaurants niçois — Vox par BitePerk | **Vox, l'hôte téléphonique IA des terrasses niçoises** | |
| `/fr/bordeaux/` | Répondeur téléphonique IA pour les restaurants bordelais — Vox par BitePerk | **Vox répond au téléphone de votre restaurant bordelais** | |
| `/fr/toulouse/` | Répondeur téléphonique IA pour les restaurants toulousains — Vox par BitePerk | **Le coup de feu de midi à Toulouse : Vox tient la ligne** | |
| `/fr/lille/` | Répondeur téléphonique IA pour les restaurants lillois — Vox par BitePerk | **Estaminets et restaurants lillois : Vox tient la ligne** | |
| `/fr/nantes/` | Répondeur téléphonique IA pour les restaurants nantais — Vox par BitePerk | **Vox, l'hôte téléphonique IA des restaurants nantais** | |
| `/fr/strasbourg/` | Répondeur téléphonique IA pour les restaurants strasbourgeois — Vox par BitePerk | **Winstubs et restaurants strasbourgeois : Vox répond** | |
| `/fr/montpellier/` | Répondeur téléphonique IA pour les restaurants montpelliérains — Vox par BitePerk | **Hôte téléphonique IA pour restaurants à Montpellier** | |
| `/be-fr/brussels/` | Répondeur téléphonique IA pour les restaurants bruxellois — Vox par BitePerk | **Vox, l'hôte téléphonique IA bilingue des restaurants bruxellois** | |

## Two Brussels lines (Belgian French: *déjeuner* is breakfast in Belgium; the midday meal is *le repas de midi / le service du midi*)

| Field | Was | Now | Correction |
|---|---|---|---|
| `heroHeadline` | Le déjeuner dure quatre-vingt-dix minutes. Le téléphone, lui, n'attend pas. | **Le service du midi dure quatre-vingt-dix minutes. Le téléphone, lui, n'attend pas.** | |
| `intro[1]` (opening words) | Bruxelles déjeune sur une montre qui ne laisse aucun jeu. Un service d… | **Bruxelles mange à midi sur une montre qui ne laisse aucun jeu. Un serv…** | |
