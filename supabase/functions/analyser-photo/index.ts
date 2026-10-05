// Fonction serveur (Supabase Edge Function, Deno) : reçoit la photo d'une
// leçon, demande à Claude d'en faire une leçon neutre du modèle Ardoiz,
// vérifie le résultat et le renvoie. La clé API Anthropic ne quitte jamais
// ce serveur (règle produit 7). La photo n'est pas enregistrée.

import Anthropic from 'npm:@anthropic-ai/sdk@^0.80';
import { zodOutputFormat } from 'npm:@anthropic-ai/sdk@^0.80/helpers/zod';
import { z } from 'npm:zod@^3.25';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MEDIA = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_BASE64 = 6_000_000; // ~4,5 Mo d'image

/**
 * Schéma plat : un exercice a un `kind` et seulement les champs utiles à ce
 * jeu, les autres restent null. Normalisé ensuite vers le modèle de l'appli.
 */
const ExerciseSchema = z.object({
  kind: z.enum(['choice', 'truefalse', 'numberline', 'scramble', 'flash', 'order', 'blanks', 'speed', 'sort', 'tapword', 'sentence', 'dictation', 'count', 'pairs', 'fix']),
  explain: z.string().describe('Explication courte et bienveillante montrée après une erreur'),
  prompt: z.string().nullable().describe('Consigne (choice, numberline, order, blanks, speed, sort, tapword, sentence, count, pairs, fix)'),
  options: z.array(z.string()).nullable().describe('choice : 2 à 4 propositions'),
  answerIndex: z.number().int().nullable().describe('choice : index de la bonne proposition'),
  statement: z.string().nullable().describe('truefalse : affirmation'),
  answerBool: z.boolean().nullable().describe('truefalse : vrai ou faux'),
  min: z.number().int().nullable(),
  max: z.number().int().nullable(),
  step: z.number().int().nullable(),
  answerNumber: z.number().int().nullable().describe('numberline ou count : réponse'),
  word: z.string().nullable().describe('scramble, flash, dictation : le mot'),
  distractors: z.array(z.string()).nullable().describe('flash, blanks, fix : mauvaises propositions'),
  lines: z.array(z.string()).nullable().describe('order : lignes dans le bon ordre'),
  text: z.string().nullable().describe('blanks : texte avec les trous notés {{mot}}, retours à la ligne autorisés'),
  items: z.array(z.object({ q: z.string(), a: z.number().int() })).nullable().describe('speed : calculs et résultats'),
  seconds: z.number().int().nullable(),
  target: z.number().int().nullable(),
  boxes: z.array(z.string()).nullable().describe('sort : noms des boîtes'),
  sortItems: z.array(z.object({ word: z.string(), box: z.number().int() })).nullable().describe('sort : mot et index de boîte'),
  words: z.array(z.string()).nullable().describe('tapword, sentence, fix : la phrase mot par mot'),
  answerIndexes: z.array(z.number().int()).nullable().describe('tapword : index des mots à toucher'),
  sentence: z.string().nullable().describe('dictation : phrase de contexte'),
  emoji: z.string().nullable().describe('count : objet à compter (un emoji)'),
  numberOptions: z.array(z.number().int()).nullable().describe('count : 3 nombres proposés dont la réponse'),
  pairs: z.array(z.object({ a: z.string(), b: z.string() })).nullable().describe('pairs : 4 à 6 paires'),
  wrongIndex: z.number().int().nullable().describe('fix : index du mot faux dans words'),
  correct: z.string().nullable().describe('fix : la correction'),
});

const LessonSchema = z.object({
  title: z.string().describe('Titre court, comme le parent nommerait la leçon'),
  subject: z.enum(['maths', 'francais']),
  source: z.enum(['poesie', 'mots', 'lecon', 'calcul', 'numeration', 'grammaire', 'lecture']).describe('Type de page photographiée'),
  level: z.enum(['CP', 'CE1', 'CE2', 'CM1', 'CM2', '6e', '5e', '4e', '3e']),
  notion: z.string().describe('La notion travaillée, en une ligne'),
  attendu: z.string().nullable().describe('Attendu du programme officiel si tu le connais, sinon null'),
  summary: z.string().describe('La leçon racontée à l\'enfant en deux ou trois phrases simples'),
  minutes: z.number().int(),
  exercises: z.array(ExerciseSchema).min(5).max(8),
  readable: z.boolean().describe('false si la photo est illisible ou n\'est pas une page d\'école'),
  warning: z.string().nullable().describe('Ce que le parent doit vérifier, ou pourquoi la photo ne convient pas'),
});

type Raw = z.infer<typeof LessonSchema>;
type RawExercise = z.infer<typeof ExerciseSchema>;

const SYSTEM = `Tu transformes la photo d'une page d'école française (leçon, liste de mots, poésie, exercice, cahier) en une leçon jouable pour l'application Ardoiz. Tout est en français.

Règles :
- Le contenu est neutre et fidèle à la page : mêmes mots, mêmes vers, mêmes notions, même niveau. N'invente pas de contenu absent de la page, sauf les mauvaises propositions (distracteurs) et les explications.
- Une erreur n'est jamais grave : chaque exercice a une explication courte, concrète et encourageante.
- Varie les jeux : 5 à 8 exercices, du plus facile au plus difficile, jamais deux fois le même jeu à la suite.
- Jeux selon la page : poésie → order (vers dans l'ordre), blanks, choice (rimes), fix. Mots de dictée → scramble, flash, dictation, choice (bonne écriture), fix. Grammaire ou conjugaison → tapword, sort, sentence, truefalse, fix. Calcul → speed (6 à 10 calculs, 45 secondes, target 6), pairs, truefalse, count, fix. Numération → numberline (min, max, step cohérents, answer sur une graduation), choice (comparer), count, truefalse. Leçon ou lecture → truefalse, choice, blanks, sort, sentence.
- Pour blanks, les trous sont écrits {{mot}} dans text, avec 2 à 4 trous et 2 distracteurs.
- Pour fix, words contient la phrase avec une faute plausible de l'enfant à l'index wrongIndex, correct est le bon mot, distractors deux autres mauvaises écritures.
- Pour count, answer entre 4 et 15, numberOptions contient la réponse et deux voisins.
- Niveau : adapte la difficulté au niveau indiqué par le parent, sauf si la page montre clairement un autre niveau.
- Si la photo est illisible, floue, ou n'est pas une page scolaire, mets readable à false et explique dans warning, avec exercises vide.`;

function clean(s: string | null | undefined): string {
  return (s ?? '').trim();
}

/** Passe du schéma plat au modèle de l'appli, en écartant les exercices incohérents */
function normalize(e: RawExercise, index: number, lessonId: string): Record<string, unknown> | null {
  const id = `${lessonId}-${index + 1}`;
  const base = { id, explain: clean(e.explain) || undefined };
  switch (e.kind) {
    case 'choice': {
      const options = (e.options ?? []).map(clean).filter(Boolean);
      if (options.length < 2 || e.answerIndex == null || e.answerIndex < 0 || e.answerIndex >= options.length) return null;
      return { ...base, kind: 'choice', prompt: clean(e.prompt), options, answer: e.answerIndex };
    }
    case 'truefalse':
      if (!clean(e.statement) || e.answerBool == null) return null;
      return { ...base, kind: 'truefalse', statement: clean(e.statement), answer: e.answerBool };
    case 'numberline': {
      const { min, max, step, answerNumber: answer } = e;
      if (min == null || max == null || step == null || answer == null || step <= 0 || max <= min) return null;
      if (answer < min || answer > max || (answer - min) % step !== 0 || (max - min) / step > 20) return null;
      return { ...base, kind: 'numberline', prompt: clean(e.prompt) || `Place le nombre ${answer}`, min, max, step, answer };
    }
    case 'scramble': {
      const word = clean(e.word).toLowerCase();
      if (word.length < 3 || word.length > 12 || /\s/.test(word)) return null;
      return { ...base, kind: 'scramble', word };
    }
    case 'flash': {
      const word = clean(e.word);
      const distractors = (e.distractors ?? []).map(clean).filter((d) => d && d !== word);
      if (!word || distractors.length < 1) return null;
      return { ...base, kind: 'flash', word, distractors: distractors.slice(0, 3) };
    }
    case 'order': {
      const lines = (e.lines ?? []).map(clean).filter(Boolean);
      if (lines.length < 3 || lines.length > 6) return null;
      return { ...base, kind: 'order', prompt: clean(e.prompt) || 'Remets les lignes dans l\'ordre', lines };
    }
    case 'blanks': {
      const text = clean(e.text);
      const holes = text.match(/\{\{(.+?)\}\}/g) ?? [];
      if (holes.length < 1 || holes.length > 5) return null;
      return { ...base, kind: 'blanks', prompt: clean(e.prompt) || 'Complète le texte', text, distractors: (e.distractors ?? []).map(clean).filter(Boolean).slice(0, 4) };
    }
    case 'speed': {
      const items = (e.items ?? []).filter((it) => clean(it.q) && Number.isFinite(it.a));
      if (items.length < 4) return null;
      const seconds = e.seconds && e.seconds >= 20 ? Math.min(e.seconds, 90) : 45;
      const target = e.target && e.target > 0 ? Math.min(e.target, items.length) : Math.max(3, Math.floor(items.length * 0.6));
      return { ...base, kind: 'speed', prompt: clean(e.prompt) || 'Calcul éclair', items, seconds, target };
    }
    case 'sort': {
      const boxes = (e.boxes ?? []).map(clean).filter(Boolean);
      const items = (e.sortItems ?? []).filter((it) => clean(it.word) && it.box >= 0 && it.box < boxes.length);
      if (boxes.length < 2 || boxes.length > 3 || items.length < 4) return null;
      return { ...base, kind: 'sort', prompt: clean(e.prompt) || 'Range chaque mot dans la bonne boîte', boxes, items: items.slice(0, 8) };
    }
    case 'tapword': {
      const words = (e.words ?? []).map(clean).filter(Boolean);
      const answer = (e.answerIndexes ?? []).filter((i) => i >= 0 && i < words.length);
      if (words.length < 3 || answer.length < 1) return null;
      return { ...base, kind: 'tapword', prompt: clean(e.prompt) || 'Touche le bon mot', words, answer };
    }
    case 'sentence': {
      const words = (e.words ?? []).map(clean).filter(Boolean);
      if (words.length < 3 || words.length > 9) return null;
      return { ...base, kind: 'sentence', prompt: clean(e.prompt) || 'Remets la phrase dans l\'ordre', words };
    }
    case 'dictation': {
      const word = clean(e.word);
      if (!word) return null;
      return { ...base, kind: 'dictation', word, sentence: clean(e.sentence) || undefined };
    }
    case 'count': {
      const answer = e.answerNumber;
      if (answer == null || answer < 2 || answer > 20) return null;
      const options = [...new Set([...(e.numberOptions ?? []), answer])].filter((n) => n > 0).slice(0, 3);
      if (options.length < 2) return null;
      return { ...base, kind: 'count', prompt: clean(e.prompt) || 'Combien y a-t-il d\'objets ?', emoji: clean(e.emoji) || '🍎', answer, options: options.sort((a, b) => a - b) };
    }
    case 'pairs': {
      const pairs = (e.pairs ?? []).filter((p) => clean(p.a) && clean(p.b));
      if (pairs.length < 3) return null;
      return { ...base, kind: 'pairs', prompt: clean(e.prompt) || 'Retrouve les paires', pairs: pairs.slice(0, 6) };
    }
    case 'fix': {
      const words = (e.words ?? []).map(clean).filter(Boolean);
      const correct = clean(e.correct);
      if (words.length < 2 || e.wrongIndex == null || e.wrongIndex < 0 || e.wrongIndex >= words.length || !correct) return null;
      const distractors = (e.distractors ?? []).map(clean).filter((d) => d && d !== correct).slice(0, 2);
      return { ...base, kind: 'fix', prompt: clean(e.prompt) || 'Gribouille a fait une faute, corrige-le', words, wrongIndex: e.wrongIndex, correct, distractors };
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY manquante côté serveur' }, 500);

  let body: { image?: string; mediaType?: string; level?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Corps de requête illisible' }, 400);
  }
  const image = body.image ?? '';
  const mediaType = MEDIA.find((m) => m === body.mediaType) ?? 'image/jpeg';
  const level = body.level ?? 'CE1';
  if (!image || image.length > MAX_BASE64) return json({ error: 'Photo manquante ou trop lourde' }, 400);

  const client = new Anthropic({ apiKey });
  let raw: Raw;
  try {
    const response = await client.messages.parse({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      output_config: { effort: 'high', format: zodOutputFormat(LessonSchema) },
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: image } },
            { type: 'text', text: `Niveau indiqué par le parent : ${level}. Fabrique la leçon à partir de cette page.` },
          ],
        },
      ],
    });
    if (response.stop_reason === 'refusal') return json({ error: 'Cette photo ne peut pas être analysée.' }, 422);
    if (!response.parsed_output) return json({ error: 'Réponse inattendue du modèle' }, 502);
    raw = response.parsed_output;
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? `Erreur Claude ${err.status}` : 'Erreur serveur';
    return json({ error: message }, 502);
  }

  if (!raw.readable) return json({ error: raw.warning ?? 'La photo est illisible ou n\'est pas une page d\'école.' }, 422);

  const id = `photo-${Date.now().toString(36)}`;
  const exercises = raw.exercises.map((e, i) => normalize(e, i, id)).filter((e) => e !== null);
  if (exercises.length < 3) return json({ error: 'Pas assez d\'exercices utilisables, réessaie avec une photo plus nette.' }, 422);

  return json({
    lesson: {
      id,
      title: clean(raw.title) || 'Leçon photographiée',
      subject: raw.subject,
      source: raw.source,
      level: raw.level,
      notion: clean(raw.notion),
      attendu: clean(raw.attendu) || undefined,
      summary: clean(raw.summary),
      minutes: Math.max(3, Math.min(12, raw.minutes || exercises.length)),
      exercises,
    },
    warning: clean(raw.warning) || null,
    dropped: raw.exercises.length - exercises.length,
  });
});
