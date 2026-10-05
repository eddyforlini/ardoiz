# Ardoiz

Réviser le programme de l'école en jouant, dans l'univers que l'enfant préfère, avec Gribouille. Le parent photographie la leçon, l'appli fabrique la mission du jour.

Lire d'abord `CLAUDE.md` (règles du projet) puis `docs/` (concept, idées retenues, feuille de route).

## Lancer l'appli sur son téléphone

1. Installer Node 22, puis `npm install` dans ce dossier.
2. Installer l'application **Expo Go** sur le téléphone (App Store ou Play Store).
3. `npx expo start`, puis scanner le QR code affiché avec l'appareil photo (iPhone) ou avec Expo Go (Android). Téléphone et ordinateur doivent être sur le même wifi.

## Vérifier avant de livrer

```bash
npx tsc --noEmit
npx expo lint
```

## Organisation

- `src/app/` écrans et navigation (Expo Router)
- `src/univers/` les huit univers et le contexte qui fournit l'univers courant
- `src/components/` Gribouille, cartes, boutons
- `docs/` concept, idées, feuille de route
