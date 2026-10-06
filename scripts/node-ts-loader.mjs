/**
 * Chargeur Node pour les scripts qui importent `src/` : le code de l'appli
 * écrit ses imports sans extension (`./bank`), que Node seul ne résout pas.
 * Lancer : node --experimental-strip-types --no-warnings --import ./scripts/node-ts-loader.mjs <script>
 */
import { existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier) && context.parentURL) {
      const base = fileURLToPath(new URL(specifier, context.parentURL));
      for (const ext of ['.ts', '.tsx', '.mts']) {
        if (existsSync(base + ext)) return next(pathToFileURL(base + ext).href, context);
      }
    }
    return next(specifier, context);
  },
});
