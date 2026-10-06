# Feuille de route

Une étape = une branche et une PR, essayée sur téléphone avec Expo Go avant validation.

| Étape | Contenu | État |
|---|---|---|
| 1. Squelette | Navigation, 8 univers, Gribouille, accueil, écrans vides | Livré (PR 1) |
| 2. Moteur d'exercices | Modèle de contenu neutre, banque CE1 de départ, déroulé de mission, 7 premiers jeux (bonne réponse, droite graduée, lettres en vrac, mémo-flash, vers dans l'ordre, mots manquants, calcul éclair) | En cours (PR 2) |
| 2b. Autres jeux | Écran de découverte de la leçon, 7 jeux de plus (vrai ou faux, tri, touche le mot, phrase en vrac, dictée, dénombrer, memory), leçons grammaire et tables | En cours (PR 3) |
| 3. Photo vers mission | Edge Function Supabase qui appelle Claude, onglet Photo, validation parent, leçons enregistrées sur le téléphone | En cours (PR 6), voir `docs/serveur.md` |
| 3a. Dictée et poésie sans IA | Mots tapés par le parent (voix enregistrée mot par mot), poésie retrouvée par titre ou auteur dans une banque libre de droits, jeux fabriqués par règles sur le téléphone | En cours (PR 7) |
| 3c. Bibliothèque | Onglet Leçons rangé par niveau, matière et thème, recherche, accueil allégé, choix du niveau à l'ajout | En cours (PR 8) |
| 3d. Accueil enfant | Un seul bouton Jouer, trois onglets enfant, photo et espace parent derrière un petit calcul, mission qui dit pourquoi elle revient | En cours (PR 9) |
| 3e. Trois jeux de plus | Carte mémoire auto-évaluée (récitation, tables), paires chrono avec record personnel, dizaines et unités à manipuler : 18 jeux | En cours (PR 10) |
| 3f. Programme et trois états | Attendus officiels de fin de CE1 (27) dans `src/content/programme.ts`, écran Programme avec l'état de chaque attendu, états ○ ◐ ● partout à la place des pourcentages | En cours (PR 11) |
| 3g. Banque CE1 | 34 leçons, 323 exercices, un fichier par matière (`bank-ce1-maths.ts`, `bank-ce1-francais.ts`), les 27 attendus couverts, script `scripts/check-bank.mts` | En cours (PR 12) |
| 3h. Photo et texte sans IA | Lecture du texte sur le téléphone (ML Kit, dev build), reconnaissance par règles (calculs, poésie, mots, leçon de la banque), onglet « Texte de la leçon » dans l'ajout, Claude en dernier recours | En cours (PR 13) |
| 3i. Banque CP | 28 leçons, 254 exercices, 22 attendus de fin de CP couverts (`bank-cp-maths.ts`, `bank-cp-francais.ts`) | En cours (PR 14) |
| 3j. Banque CE2 | 33 leçons, 320 exercices, 27 attendus de fin de CE2 couverts (`bank-ce2-maths.ts`, `bank-ce2-francais.ts`) | En cours (PR 15) |
| 3k. Banque CM1 | 37 leçons, 370 exercices, 33 attendus de fin de CM1 couverts (`bank-cm1-maths.ts`, `bank-cm1-francais.ts`) ; droite graduée compatible avec les décimaux | En cours (PR 16) |
| 3l. Banque CM2 | 38 leçons, 380 exercices, 32 attendus de fin de CM2 couverts (`bank-cm2-maths.ts`, `bank-cm2-francais.ts`). L'école élémentaire est complète : 170 leçons, 1 647 exercices | En cours (PR 17) |
| 3m. Pédagogie fondée | Rapport `docs/recherche-apprendre-en-jouant.md` (programmes 2024-2025, sciences de l'apprentissage 6-11 ans, formats par compétence, motivation, génération d'exercices). Prompt et validateurs de `contrat.ts` réécrits dessus ; révision espacée en cinq boîtes (J+1, 3, 7, 14, 30), « acquis » après trois réussites à des jours différents | En cours (PR 20) |
| 3b. Comptes | Compte parent Supabase, plusieurs enfants, progrès synchronisés | À faire |
| 4. Voix | Réciter, épeler, lire à voix haute, Ardoiz qui parle | À faire |
| 5. Motivation | Progrès enregistrés, révision espacée, série, quêtes du jour, coffres et autocollants, monde à construire, Gribouille qui évolue | En cours (PR 4) |
| 5b. Apprendre de ses erreurs | Jeu « Corrige Gribouille », journal « Mes pièges » avec mission dédiée, espace parent (suivi par leçon) | En cours (PR 5) |
| 5c. Motivation, suite | Codex des notions, mode dys, animations de fête, classe partagée | À faire |
| 6. Parent et bêta | Espace parent, rapport hebdo, TestFlight et Play interne | À faire |

## Architecture du contenu, décidée le 5 octobre 2026

Pour que l'appli ne coûte presque rien à faire tourner, l'intelligence artificielle est le dernier recours, pas le cœur :

1. **Banque d'exercices par notion du programme**, écrite une fois (avec Claude pendant le développement, relue à la main). Gratuit à l'usage.
2. **Lecture du texte sur le téléphone** (reconnaissance intégrée à iOS et Android), puis reconnaissance de la notion et jeux fabriqués par règles : mots de dictée, poésie, tables, listes. Gratuit. Voir `src/content/generate.ts`.
3. **IA du téléphone** (Apple Intelligence, Gemini Nano) quand elle existe, pour reconnaître une notion ou reformuler une consigne. Gratuit.
4. **Claude côté serveur** seulement pour ce que les trois premiers ne savent pas faire, avec un quota par famille et une mémoire des pages déjà lues. Quelques centimes par photo (`docs/serveur.md`). Pendant le développement, le pont local (`scripts/pont-claude.mts`) remplace le serveur et passe par l'abonnement Claude du développeur, pour ses propres photos seulement.

## Ce que la recherche demande encore (voir les 28 décisions du rapport)

Fait dans la PR 20 : décisions 3, 5, 6 (collection non annoncée, déjà le cas), 7, 9, 11, 13, 18, 20, 21 côté fabrication des jeux par Claude ; 4 et 22 côté révision espacée ; 2 et 8 côté séance (`src/content/session.ts` : échauffement, escalier, allègement après deux erreurs, sortie de la production après trois, clôture sur une réussite) ; 16 (rythme de la semaine à la place de la série), 17 (chronomètre sans alarme) et 23 (espace parent sans pourcentage, un piège, une action).

À faire, par ordre d'effet :

1. **Retours échus dans la séance** (décision 8, suite) : un tiers de la séance pris dans les leçons arrivées à échéance, en plus de l'échauffement et de la clôture déjà en place ; arrêt à 10 minutes.
2. **Monter d'un palier après trois réussites** (décision 2, suite) : la descente existe, la montée demande des exercices de plusieurs paliers pour une même notion dans la banque.
3. **Lire à voix haute** (décision 10) : fiche de son, fluence d'une minute sur un texte connu, poésie, avec reconnaissance vocale et feedback neutre en cas de doute. C'est l'étape 4 de la feuille de route.
4. **Fiche de son au CP** (décision 18) : jeux par règles sur le son (entendre, repérer, assembler des syllabes, dicter), déchiffrable à 100 %, sans Claude.
5. **Pièges par type d'erreur** (décision 9) : chaque distracteur porte son erreur type, le journal « Mes pièges » compte par type (son, lettre muette, accord, retenue).
6. **Série douce** (décision 16) : hebdomadaire ou « 3 jours sur 7 », réparable, jamais reprochée à l'enfant.
7. **Rapport parent** (décision 23) : notions et états, une ou deux erreurs types, prochain retour, une seule action ; jamais de score global.
8. **Univers des grands réglés autrement** (conclusion du rapport) : moins d'indices, plus d'entrelacement, chronomètre visible possible, là où les petits restent sur la récupération guidée.

Ensuite : autres niveaux, autres matières, classe partagée, mode sans écran, histoire du soir, appel de Gribouille, ardoise réelle.
