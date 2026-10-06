# Lire les photos sur le téléphone : la « dev build »

Expo Go est l'appli de test rapide : elle ne contient que les modules
d'Expo. La lecture du texte sur une photo utilise ML Kit (`@react-native-ml-kit/text-recognition`),
un module natif gratuit et hors ligne qui n'est pas dans Expo Go. Pour
l'avoir, on installe sur le téléphone une version d'Ardoiz construite pour
lui : la « dev build ». Tout le reste de l'appli marche déjà dans Expo Go.

## Ce que ça change

- Dans Expo Go : le bouton photo reste grisé, le parent tape ou colle le
  texte (onglet « Texte de la leçon »), les jeux se fabriquent pareil.
- Dans la dev build : la photo est lue sur place, rien n'est envoyé, et
  les mêmes règles fabriquent les jeux (`src/content/recognize.ts`).

## Étapes, une seule fois

Téléphone Android, avec Android Studio déjà installé sur le Mac (c'est le
cas si un APK a déjà été construit dessus) :

1. Dire au Terminal où est le SDK Android, une fois pour toutes : dans le
   fichier `~/.zshrc` (le créer s'il n'existe pas), ajouter
   ```
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$PATH"
   ```
   puis ouvrir un nouveau Terminal. Sans ça, Gradle s'arrête sur
   « SDK location not found ».
2. Brancher le téléphone en USB, débogage USB activé. Un émulateur lancé
   depuis Android Studio (Device Manager) fait aussi l'affaire.
3. Dans le Terminal, dans le dossier du projet :
   ```
   npm install
   npx expo run:android
   ```
   La première fois, 5 à 10 minutes : l'appli est construite, installée et
   lancée. Le dossier `android/` est généré par cette commande, il ne se
   modifie pas à la main. Cette étape fixe aussi l'identifiant Android de
   l'appli (`android.package` dans `app.json`) et les scripts `android` et
   `ios` de `package.json`.
4. Ensuite, `npx expo start` suffit : l'appli installée se recharge.

iPhone : `npx expo run:ios --device` avec Xcode installé et un compte Apple
(gratuit pour son propre téléphone). Sans Mac configuré, EAS Build
(`npx eas-cli build --profile development`) construit dans le nuage.

À refaire seulement quand un module natif est ajouté. Les changements de
code habituels se rechargent sans rebuild.
