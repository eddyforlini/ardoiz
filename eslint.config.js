// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/*', '.expo/*', 'supabase/*'],
  },
  {
    rules: {
      // L'interface est en français : les apostrophes dans le JSX sont normales.
      'react/no-unescaped-entities': 'off',
    },
  },
]);
