# Ardoiz

Application mobile pour réviser le programme de l'école française en jouant. Le parent photographie la leçon, l'exercice ou les devoirs ; l'appli fabrique des missions de jeu à partir de la photo. Mascotte : Gribouille. Prototype sur le CE1, tous les niveaux à terme.

Ce fichier est lu par chaque session de Claude Code. Il fixe ce qui ne se discute pas. Les spécifications détaillées sont dans `docs/`.

## Langue

- Interface, contenu, commentaires de code destinés aux humains et messages de commit : **français**.
- Noms de variables, fichiers et fonctions : anglais court, comme d'habitude en TypeScript.

## Stack

- Expo SDK 57, React Native, TypeScript strict, Expo Router (routes dans `src/app/`).
- Données et comptes : Supabase (hébergé en Europe). Pas encore branché.
- Intelligence : API Claude, appelée **uniquement côté serveur** (Supabase Edge Functions). Jamais de clé API dans l'appli.
- Voix : synthèse et reconnaissance du téléphone (`expo-speech`, reconnaissance via module natif plus tard).
- Avant d'ajouter une dépendance, vérifier qu'Expo n'a pas déjà un module pour ça. Installer avec `npx expo install`. Si le réseau bloque `api.expo.dev`, prendre la version dans `node_modules/expo/bundledNativeModules.json` et installer avec npm.
- Lire `AGENTS.md` (généré par Expo) pour les commandes et les pièges de version.

## Règles produit, non négociables

1. **Le contenu scolaire est stocké une seule fois**, neutre (notion, énoncé, réponse, niveau, attendu du programme). L'univers n'est qu'un habillage posé par-dessus. Toute réécriture d'énoncé par Claude est suivie d'une vérification automatique que question et réponse n'ont pas changé.
2. **Huit univers** : Classique, Super-héros, Manga, Espace, Dinosaures (petits) ; Gaming, Street, Enquête (grands). Un univers change couleurs, police, décor, costume de Gribouille, nom de la monnaie, effet de fête et ton des textes. Voir `src/univers/`.
3. **Personnages maison uniquement.** Aucune licence, aucun personnage existant.
4. **Pas de pub, pas d'achat pour l'enfant, pas de mécanique de casino.** Les récompenses sont des costumes, autocollants, univers, bâtiments.
5. **L'erreur n'est pas grave** : pas de grosse croix rouge, une explication, une seconde chance, la notion revient plus tard.
6. **Jamais de classement public pour les petits.** Comparaison à soi-même. Ligues entre amis seulement pour les univers ados, avec accord parental.
7. **Vie privée** : compte créé par le parent, photos supprimées après analyse, voix analysée sur le téléphone quand c'est possible, rien revendu. RGPD et protection des mineurs.
8. **Chaque écran doit répondre à la question : est-ce que ça donne envie à l'enfant de continuer ?** Priorité de l'utilisateur : jeux variés, adaptés à la photo, complets, et une boucle de motivation forte.

## Pédagogie

- Difficulté réglée pour réussir environ 8 fois sur 10.
- Se tester plutôt que relire ; révision espacée (J+1, J+3, J+7) ; notions mélangées.
- Un nouveau jeu toutes les une à deux minutes, séances de 5 à 10 minutes.
- Tout ce qui est écrit à l'écran peut être lu à voix haute, pour ceux qui lisent peu.

## Organisation du code

- `src/app/` : écrans et navigation uniquement.
- `src/univers/` : définitions des univers et le contexte qui fournit l'univers courant.
- `src/components/` : composants réutilisables (Gribouille, cartes, boutons).
- `src/content/` (à venir) : modèle de contenu scolaire et banque d'exercices.
- `src/games/` (à venir) : un dossier par mécanique de jeu, chaque jeu reçoit un exercice neutre et l'univers courant.
- `docs/` : concept, idées retenues, feuille de route. Mettre à jour `docs/roadmap.md` quand une étape est livrée.

## Avant de livrer

- `npx tsc --noEmit` et `npx expo lint` passent.
- Une fonctionnalité par branche et par PR. Description de PR en français : « Avant », « Après », une phrase sur le pourquoi, un court « Comment ».
- Ne pas créer `ios/` ni `android/` à la main.
