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

## Brancher l'appli

Copier `.env.example` en `.env` et remplir `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` (Project Settings > Data API). Relancer `npx expo start`. Le fichier `.env` n'est pas versionné.

## Ce que fait la fonction

1. Reçoit la photo en base64 (JPEG réduit à 1280 px par l'appli), le niveau choisi.
2. Demande à Claude (`claude-opus-5-5`, sortie structurée) une leçon du modèle neutre : titre, matière, type de page, notion, résumé, 5 à 8 exercices variés avec explication.
3. Vérifie chaque exercice (réponse dans les options, graduations cohérentes, trous présents...) et écarte ceux qui sont incomplets.
4. Renvoie la leçon, un avertissement pour le parent, et le nombre d'exercices écartés. La photo n'est pas conservée.

## Coût

Une photo analysée consomme environ 2 000 jetons d'entrée (image) et 2 000 à 4 000 de sortie : quelques centimes par leçon.
