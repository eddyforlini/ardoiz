# Serveur : Supabase et Claude

La photo d'une leçon est envoyée à une fonction serveur (Supabase Edge Function, dossier `supabase/functions/analyser-photo`) qui appelle Claude avec la clé API Anthropic. L'appli ne connaît que l'adresse du projet Supabase et la clé `anon`, publiques par construction. La clé Anthropic est un secret du serveur.

## Déployer la fonction (une fois, depuis le Mac)

Dans le Terminal, dans le dossier `ardoiz` :

```
npx supabase login
npx supabase link --project-ref <ref du projet>
npx supabase secrets set ANTHROPIC_API_KEY=<clé sk-ant-...>
npx supabase functions deploy analyser-photo
```

- `login` ouvre le navigateur pour autoriser le Terminal.
- La `ref` du projet est dans l'adresse du projet : `https://<ref>.supabase.co`. `link` demande le mot de passe de la base, enregistré à la création du projet.
- `secrets set` envoie la clé Anthropic au serveur sans l'écrire dans le projet.
- Après chaque changement de la fonction, relancer seulement `functions deploy`.

## Pendant les tests, sans clé API : le pont local

Un abonnement Claude (Pro ou Max) ne donne pas de clé API, mais il donne Claude Code. Le pont local est un petit serveur sur le Mac (`scripts/pont-claude.mts`) qui reçoit la photo de l'appli et la passe à Claude Code en mode headless (`claude -p`). L'analyse passe donc par l'abonnement de la personne connectée dans Claude Code, avec le même prompt, le même schéma et les mêmes vérifications que la fonction serveur (`contrat.ts`, partagé).

Ce que les conditions d'Anthropic permettent, et pas plus :

- **Oui** : toi, sur ton Mac, pour tes propres photos pendant le développement. C'est Claude Code utilisé en script, un usage prévu.
- **Non** : mettre un jeton d'abonnement sur un serveur (Supabase ou autre), ou faire passer les photos d'autres personnes par ton abonnement. Dès qu'un autre utilisateur est concerné, il faut la fonction serveur et une clé API.

Mise en route :

1. Claude Code connecté sur le Mac (`/login` dans Claude Code si besoin).
2. Dans le Terminal, dans le dossier du projet : `npm run pont`. Il affiche l'adresse à copier, par exemple `http://192.168.1.202:8787`.
3. Dans `.env`, remplir `EXPO_PUBLIC_ANALYSE_URL` avec cette adresse, puis relancer `npx expo start`. Le téléphone doit être sur le même Wi-Fi que le Mac.
4. Dans l'appli, une photo que les règles ne reconnaissent pas part vers le pont. Le Terminal affiche une ligne par photo : niveau, durée, exercices gardés et écartés.

La photo est écrite dans un dossier temporaire du Mac le temps de la lecture, puis supprimée. Une photo à la fois, 20 à 60 secondes chacune. `PONT_MODEL=sonnet npm run pont` consomme moins d'abonnement pour des essais rapides.

## Brancher l'appli

Copier `.env.example` en `.env` et remplir `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Project Settings > Data API). Relancer `npx expo start`. Le fichier `.env` n'est pas versionné.

## Ce que fait la fonction

1. Reçoit la photo en base64 (JPEG réduit à 1280 px par l'appli), le niveau choisi.
2. Demande à Claude (`claude-opus-5-5`, sortie structurée) une leçon du modèle neutre : titre, matière, type de page, notion, résumé, 5 à 8 exercices variés avec explication.
3. Vérifie chaque exercice (réponse dans les options, graduations cohérentes, trous présents...) et écarte ceux qui sont incomplets.
4. Renvoie la leçon, un avertissement pour le parent, et le nombre d'exercices écartés. La photo n'est pas conservée.

## Coût

Une photo analysée consomme environ 2 000 jetons d'entrée (image) et 2 000 à 4 000 de sortie : quelques centimes par leçon.
