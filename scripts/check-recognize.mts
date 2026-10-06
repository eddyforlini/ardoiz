/**
 * Vérifie la reconnaissance par règles (src/content/recognize.ts) : une page
 * de prose ne doit pas devenir une poésie ni une leçon de la banque, une
 * poésie et une dictée restent reconnues, une feuille de devoirs ne se
 * rattache à rien, une page de cahier retrouve sa leçon, et chaque leçon de
 * la banque se retrouve à partir de son titre et de son résumé.
 * Lancer : node --experimental-strip-types --no-warnings --import ./scripts/node-ts-loader.mjs scripts/check-recognize.mts
 */
import { LESSONS } from '../src/content/bank.ts';
import { POEMS } from '../src/content/poems.ts';
import { analyseText } from '../src/content/recognize.ts';
import type { Level } from '../src/content/types.ts';

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

const devoirs = `Devoirs à faire pour lundi 8 septembre 2026    CP
Lecture : relire la fiche de sons n°2, le son [a], et les mots de la page 7.
Écriture : écrire une ligne de la lettre a et une ligne de la lettre i.
Lire les syllabes : la, li, lo, ma, mi, mo.
Entourer la lettre a dans les mots : papa, table, lavabo, chat, ami.
Maths : compter jusqu'à 10 avec les doigts, écrire les nombres de 1 à 5.
Poésie : apprendre les deux premiers vers de « L'école ».
Signer le cahier de liaison. Rapporter le livre de bibliothèque.`;

const cahierMuettes = `Les lettres muettes
À la fin de certains mots, il y a une lettre que l'on n'entend pas : c'est une lettre muette.
Pour la trouver, je cherche un mot de la même famille ou le féminin :
grand → grande, petit → petite, chat → chatte, toit → toiture.`;

const cahierPasseCompose = `Le passé composé
Le passé composé se forme avec l'auxiliaire avoir ou être au présent, suivi du participe passé du verbe.
j'ai mangé, tu as fini, il est parti, nous avons chanté.
Avec être, le participe passé s'accorde avec le sujet : elle est partie, ils sont partis.`;

// La vraie feuille de devoirs photographiée le 6 octobre 2026 (fiche graphème a, alphabet, gestes d'écriture)
const feuilleCp = `Cahier d'entraînement à la lecture (petit cahier violet)
Un adulte me lit la fiche graphème a.
Je doit connaître :
- les différentes graphies (les façons dont s'écrit le a),
- le son que fait le graphème
- le geste du son
- et je sais raconter l'histoire de l'alpha.
Porte vue noir de lecteur
1. Exercice 1 (lecture 1):
- Lire chaque lettre en la pointant du doigt et en faisant le geste à chaque lettre.
- Puis je repasse avec mon doigt plusieurs fois sur les lettres a
2. Connaître l'alphabet par cœur :
- Je récite l'alphabet sans me tromper (Prendre l'alphabet réalisé en GS dans les différentes graphies et montrer chaque lettre quand je la dis)
- Mes parents me montrent une lettre et je la nomme
- Mes parents nomment une lettre et c'est moi qui la montre.
Cahier fiche mémoire (cahier violet) « conseils pour les bons gestes d'écriture » + Lignage fourni dans un transparent
Pour m'entraîner à écrire le graphème a, je garde à la maison le lignage fournit ce jour. Je peux alors m'entraîner à refaire le graphème avec un feutre ardoise directement sur le plastique.
Je peux ensuite faire la ligne de a ci dessous
- Mes parents m'aident à vérifier ma trousse (voir mot cahier gris et récapitulatif couverture cahier de texte)
- Penser à laver la gourde.`;

const cases: { name: string; text: string; level: Level; expect: string; allowSimilar?: boolean }[] = [
  { name: 'vraie feuille de devoirs de CP, sans serveur', text: feuilleCp, level: 'CP', expect: 'unknown' },
  { name: 'vraie feuille de devoirs de CP, avec serveur', text: feuilleCp, level: 'CP', expect: 'unknown', allowSimilar: false },
  { name: 'cahier : les lettres muettes, avec serveur (pas de titre exact)', text: cahierMuettes, level: 'CE1', expect: 'unknown', allowSimilar: false },
  { name: 'cahier : le passé composé, avec serveur (titre exact)', text: cahierPasseCompose, level: 'CM1', expect: 'bank', allowSimilar: false },
  { name: 'leçon d\'histoire (prose)', text: histoire, level: 'CE2', expect: 'unknown' },
  { name: 'leçon de sciences (prose)', text: sciences, level: 'CE2', expect: 'unknown' },
  { name: 'feuille de devoirs de CP, profil CE2', text: devoirs, level: 'CE2', expect: 'unknown' },
  { name: 'feuille de devoirs de CP, profil CP', text: devoirs, level: 'CP', expect: 'unknown' },
  // Sans serveur, une page sans titre exact de la banque n'est plus rattachée : « lettres » est trop courant pour compter
  { name: 'cahier : les lettres muettes, sans serveur (limite connue)', text: cahierMuettes, level: 'CE1', expect: 'unknown' },
  { name: 'cahier : le passé composé', text: cahierPasseCompose, level: 'CM1', expect: 'bank' },
  { name: `poème (${known.title}, premier vers modifié)`, text: poeme, level: 'CE2', expect: 'generated' },
  { name: 'liste de dictée', text: dictee, level: 'CE2', expect: 'generated' },
];

let failures = 0;
for (const c of cases) {
  const r = analyseText(c.text, c.level, undefined, { allowSimilar: c.allowSimilar });
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
