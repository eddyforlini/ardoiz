/**
 * Vérifie la reconnaissance par règles (src/content/recognize.ts) : une page
 * de prose ne doit pas devenir une poésie ni une leçon de la banque, une
 * poésie et une dictée restent reconnues, et chaque leçon de la banque se
 * retrouve à partir de son titre et de son résumé.
 * Lancer : node --experimental-strip-types --no-warnings --import ./scripts/node-ts-loader.mjs scripts/check-recognize.mts
 */
import { LESSONS } from '../src/content/bank.ts';
import { POEMS } from '../src/content/poems.ts';
import { analyseText } from '../src/content/recognize.ts';

const histoire = `Histoire : les Gaulois
Il y a plus de 2 000 ans, la France s'appelait la Gaule.
Les Gaulois vivaient dans des villages de maisons en bois
et en terre, avec des toits de paille.
Ils étaient agriculteurs, éleveurs et artisans.
Les druides étaient les prêtres des Gaulois.
En 52 avant Jésus-Christ, le chef gaulois Vercingétorix
a été vaincu par le général romain Jules César
à la bataille d'Alésia.
La Gaule est alors devenue romaine : on parle
de la Gaule gallo-romaine.
Mots à retenir : Gaule, druide, Vercingétorix, Alésia.`;

const sciences = `Le cycle de l'eau
L'eau de la mer chauffée par le soleil s'évapore et monte
dans le ciel sous forme de vapeur. En montant, la vapeur
se refroidit et forme des nuages. Quand les gouttes
deviennent trop lourdes, il pleut ou il neige. L'eau
retourne alors dans les rivières, puis dans la mer.
C'est le cycle de l'eau : il recommence sans cesse.`;

const known = POEMS[3];
const poeme = ['Le temps a quitté son manteau', ...known.lines.slice(1)].join('\n');

const dictee = `Dictée de lundi
le chat, la maison, un jardin, la table
une fleur, le soleil, la lune, un bateau`;

const cases: { name: string; text: string; expect: string }[] = [
  { name: 'leçon d\'histoire (prose)', text: histoire, expect: 'unknown' },
  { name: 'leçon de sciences (prose)', text: sciences, expect: 'unknown' },
  { name: `poème (${known.title}, premier vers modifié)`, text: poeme, expect: 'generated' },
  { name: 'liste de dictée', text: dictee, expect: 'generated' },
];

let failures = 0;
for (const c of cases) {
  const r = analyseText(c.text, 'CE2');
  const ok = r.kind === c.expect;
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok ' : 'KO '} ${c.name} → ${r.kind} (${r.kind === 'unknown' ? r.why : r.lesson.title})`);
}

// Rappel : le titre et le résumé d'une leçon doivent la retrouver, sauf les poésies connues (reconnues par leur texte)
let found = 0;
const misses: string[] = [];
for (const l of LESSONS) {
  const r = analyseText(`${l.title}\n${l.summary}`, l.level);
  if (r.kind === 'bank' && r.lesson.id === l.id) found += 1;
  else if (r.kind !== 'generated') misses.push(`${l.level} ${l.title} → ${r.kind}`);
}
console.log(`Rappel banque : ${found}/${LESSONS.length} retrouvées, ${LESSONS.length - found - misses.length} fabriquées par règles (poésies, listes)`);
if (misses.length) {
  failures += misses.length;
  console.log(misses.join('\n'));
}
console.log(failures ? `${failures} problème(s)` : 'Reconnaissance valide');
process.exit(failures ? 1 : 0);
