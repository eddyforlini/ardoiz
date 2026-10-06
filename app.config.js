// Complète app.json. Android refuse le HTTP en clair dans une appli
// installée (variante release) : le pont local (docs/serveur.md), joint en
// http:// sur le Wi-Fi de la maison, a besoin d'une exception. Elle n'est
// ajoutée que si le pont est configuré dans .env, jamais dans un build
// fait sans ce fichier.
module.exports = ({ config }) => {
  const bridge = process.env.EXPO_PUBLIC_ANALYSE_URL ?? '';
  if (!bridge.startsWith('http://')) return config;
  return {
    ...config,
    plugins: [...(config.plugins ?? []), ['expo-build-properties', { android: { usesCleartextTraffic: true } }]],
  };
};
