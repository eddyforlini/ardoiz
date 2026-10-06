// Fonction serveur (Supabase Edge Function, Deno) : reçoit la photo d'une
// leçon, demande à Claude d'en faire une leçon neutre du modèle Ardoiz,
// vérifie le résultat et le renvoie. La clé API Anthropic ne quitte jamais
// ce serveur (règle produit 7). La photo n'est pas enregistrée.

import Anthropic from 'npm:@anthropic-ai/sdk@^0.80';
import { zodOutputFormat } from 'npm:@anthropic-ai/sdk@^0.80/helpers/zod';
import { z } from 'npm:zod@^3.25';

import { SYSTEM, buildResponse } from './contrat.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MEDIA = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_BASE64 = 6_000_000; // ~4,5 Mo d'image

/**
 * Schéma plat : un exercice a un `kind` et seulement les champs utiles à ce
 * jeu, les autres restent null. Normalisé ensuite vers le modèle de l'appli.
 * Le même schéma existe en JSON Schema dans contrat.ts (pont local) : garder les deux alignés.
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

  const built = buildResponse(raw);
  return json(built.body, built.status);
});
