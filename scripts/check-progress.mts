/**
 * Vérifie la révision espacée (src/profile/progress.ts) : boîtes de
 * Leitner, « acquis » après trois réussites à des jours différents, retour
 * en boîte 1 après un échec, même jour sans effet.
 * Lancer : node --experimental-strip-types --no-warnings --import ./scripts/node-ts-loader.mjs scripts/check-progress.mts
 */
import { EMPTY_PROGRESS, LEITNER_DAYS, applyMission, masteryState, type MissionResult, type Progress } from '../src/profile/progress.ts';

const failures: string[] = [];
function expect(name: string, got: unknown, want: unknown) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? 'ok ' : 'KO '} ${name} → ${JSON.stringify(got)}${ok ? '' : ` (attendu ${JSON.stringify(want)})`}`);
  if (!ok) failures.push(name);
}

function play(p: Progress, day: string, score: number): Progress {
  const total = 10;
  const errors = Math.round(((100 - score) / 100) * total);
  const r: MissionResult = { lessonId: 'L', good: total - errors, total, firstTryErrors: errors, kinds: ['choice'], wrongIds: [], rightIds: [] };
  return applyMission(p, r, day).progress;
}

let p: Progress = EMPTY_PROGRESS;
p = play(p, '2026-10-06', 100);
expect('première mission : boîte 1, retour J+1', [p.mastery.L.box, p.mastery.L.due], [1, '2026-10-07']);
expect('première mission parfaite : pas encore acquis', masteryState(p, 'L'), 'progress');
p = play(p, '2026-10-06', 100);
expect('rejouée le même jour : rien ne change', [p.mastery.L.box, p.mastery.L.due, p.mastery.L.plays], [1, '2026-10-07', 2]);
p = play(p, '2026-10-07', 90);
expect('réussite le lendemain : boîte 2, retour J+3', [p.mastery.L.box, p.mastery.L.due], [2, '2026-10-10']);
p = play(p, '2026-10-10', 80);
expect('réussite à 80 : boîte 3, retour J+7', [p.mastery.L.box, p.mastery.L.due], [3, '2026-10-17']);
expect('deux réussites espacées : encore en cours', masteryState(p, 'L'), 'progress');
p = play(p, '2026-10-17', 100);
expect('troisième réussite : boîte 4, retour J+14, acquis', [p.mastery.L.box, p.mastery.L.due, masteryState(p, 'L')], [4, '2026-10-31', 'done']);
p = play(p, '2026-10-31', 70);
expect('score moyen : même boîte, intervalle qui repart', [p.mastery.L.box, p.mastery.L.due], [4, '2026-11-14']);
p = play(p, '2026-11-14', 50);
expect('échec : retour en boîte 1 dès le lendemain, plus acquis', [p.mastery.L.box, p.mastery.L.due, masteryState(p, 'L')], [1, '2026-11-15', 'progress']);
for (const [day, score] of [['2026-11-15', 100], ['2026-11-18', 100], ['2026-11-25', 100], ['2026-12-09', 100]] as const) p = play(p, day, score);
expect('cinquième boîte plafonnée : retour J+30', [p.mastery.L.box, p.mastery.L.due], [5, '2027-01-08']);
expect('intervalles', LEITNER_DAYS, [1, 3, 7, 14, 30]);

// Anciens progrès sans boîte : déduite des parties jouées
const old: Progress = { ...EMPTY_PROGRESS, mastery: { L: { best: 90, plays: 2, lastDay: '2026-10-01', due: '2026-10-04' } } };
const migrated = play(old, '2026-10-04', 100);
expect('ancien progrès (2 parties) : boîte 2 déduite, réussite → boîte 3', migrated.mastery.L.box, 3);

console.log(failures.length ? `${failures.length} problème(s)` : 'Révision espacée valide');
process.exit(failures.length ? 1 : 0);
