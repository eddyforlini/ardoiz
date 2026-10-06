/**
 * Pont local : pendant les tests, l'appli envoie la photo à ce petit serveur
 * sur le Mac au lieu de la fonction Supabase. Le serveur passe la photo à
 * Claude Code en mode headless (`claude -p`), donc par l'abonnement Claude
 * de la personne connectée sur ce Mac, sans clé API.
 *
 * Réservé à l'usage personnel sur sa propre machine : jamais sur un serveur,
 * jamais pour d'autres utilisateurs (conditions d'utilisation d'Anthropic).
 * Voir docs/serveur.md.
 *
 * Lancer : npm run pont   (ou node --experimental-strip-types --no-warnings scripts/pont-claude.mts)
 * Variables : PORT (8787), PONT_MODEL (opus), CLAUDE_BIN (chemin du binaire).
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { homedir, networkInterfaces, tmpdir } from 'node:os';
import { join } from 'node:path';

import { LESSON_JSON_SCHEMA, SYSTEM, buildResponse, type RawLesson } from '../supabase/functions/analyser-photo/contrat.ts';

const PORT = Number(process.env.PORT ?? 8787);
const MODEL = process.env.PONT_MODEL ?? 'opus';
const TIMEOUT_MS = 240_000;
const MAX_BODY = 9_000_000; // ~6 Mo de base64, comme la fonction serveur
const MAX_BASE64 = 6_000_000;
const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** Le binaire Claude Code : variable d'environnement, PATH, installation locale, ou extension VS Code */
function findClaude(): string {
  if (process.env.CLAUDE_BIN) return process.env.CLAUDE_BIN;
  if (spawnSync('claude', ['--version'], { stdio: 'ignore' }).status === 0) return 'claude';
  const home = homedir();
  const fixed = [join(home, '.claude/local/claude'), '/opt/homebrew/bin/claude', '/usr/local/bin/claude'];
  const found = fixed.find((p) => existsSync(p));
  if (found) return found;
  const ext = join(home, '.vscode/extensions');
  if (existsSync(ext)) {
    const versions = readdirSync(ext).filter((d) => d.startsWith('anthropic.claude-code-')).sort().reverse();
    for (const v of versions) {
      const bin = join(ext, v, 'resources/native-binary/claude');
      if (existsSync(bin)) return bin;
    }
  }
  throw new Error('Claude Code introuvable. Installe-le ou indique CLAUDE_BIN=/chemin/vers/claude.');
}

const CLAUDE = findClaude();

/** Claude Code refuse de tourner « dans » Claude Code : on retire ses marqueurs de l'environnement */
function cleanEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k === 'CLAUDECODE' || k.startsWith('CLAUDE_CODE_')) delete env[k];
  return env;
}

type ClaudeResult = { is_error?: boolean; result?: string; structured_output?: unknown; num_turns?: number };

function runClaude(args: string[], cwd: string): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(CLAUDE, args, { cwd, env: cleanEnv(), stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill('SIGKILL'), TIMEOUT_MS);
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (err) => { clearTimeout(timer); reject(err); });
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, stdout, stderr }); });
  });
}

/** Vérifie une fois au démarrage que Claude Code est connecté (abonnement ou clé) */
async function checkLogin(): Promise<string> {
  const { stdout } = await runClaude(['auth', 'status'], tmpdir());
  try {
    const status = JSON.parse(stdout) as { loggedIn?: boolean; authMethod?: string; email?: string };
    if (!status.loggedIn) throw new Error('non connecté');
    return `${status.authMethod ?? '?'} (${status.email ?? '?'})`;
  } catch {
    throw new Error('Claude Code n\'est pas connecté : ouvre Claude Code, tape /login, puis relance le pont.');
  }
}

/** La photo est écrite dans un dossier temporaire, lue par Claude, puis le dossier est supprimé */
async function analyse(image: string, mediaType: string, level: string): Promise<RawLesson> {
  const dir = await mkdtemp(join(tmpdir(), 'ardoiz-pont-'));
  try {
    const file = `page.${EXTENSIONS[mediaType]}`;
    await writeFile(join(dir, file), Buffer.from(image, 'base64'));
    const prompt = `Lis la photo ./${file} avec l'outil Read. Niveau indiqué par le parent : ${level}. Fabrique la leçon à partir de cette page.`;
    const args = [
      '-p', prompt,
      '--system-prompt', SYSTEM,
      '--output-format', 'json',
      '--json-schema', JSON.stringify(LESSON_JSON_SCHEMA),
      '--restricted', '--tools', 'Read', '--allowedTools', 'Read',
      '--no-session-persistence', '--max-turns', '6',
      '--model', MODEL,
    ];
    const { code, stdout, stderr } = await runClaude(args, dir);
    let parsed: ClaudeResult;
    try {
      parsed = JSON.parse(stdout) as ClaudeResult;
    } catch {
      throw new Error(`Claude Code n'a pas répondu en JSON (code ${code}). ${stderr.trim().slice(0, 200)}`);
    }
    if (parsed.is_error) {
      const text = parsed.result ?? '';
      if (/not logged in/i.test(text)) throw new Error('Claude Code n\'est plus connecté : ouvre Claude Code et tape /login.');
      throw new Error(`Claude Code a renvoyé une erreur : ${text.slice(0, 200)}`);
    }
    if (!parsed.structured_output || typeof parsed.structured_output !== 'object') throw new Error('Réponse de Claude sans leçon structurée.');
    return parsed.structured_output as RawLesson;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// Une photo à la fois : l'abonnement n'est pas fait pour des rafales
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(job: () => Promise<T>): Promise<T> {
  const next = queue.then(job, job);
  queue = next.catch(() => undefined);
  return next;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BODY) { reject(new Error('Photo trop lourde')); req.destroy(); return; }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type' });
  res.end(JSON.stringify(body));
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  if (req.method === 'OPTIONS') return send(res, 200, { ok: true });
  if (req.method === 'GET' && req.url === '/sante') return send(res, 200, { ok: true, model: MODEL, claude: CLAUDE });
  if (req.method !== 'POST' || req.url !== '/analyser-photo') return send(res, 404, { error: 'Route inconnue' });

  let body: { image?: string; mediaType?: string; level?: string };
  try {
    body = JSON.parse(await readBody(req));
  } catch (err) {
    return send(res, 400, { error: err instanceof Error && err.message === 'Photo trop lourde' ? 'Photo manquante ou trop lourde' : 'Corps de requête illisible' });
  }
  const image = body.image ?? '';
  const mediaType = body.mediaType && EXTENSIONS[body.mediaType] ? body.mediaType : 'image/jpeg';
  const level = body.level ?? 'CE1';
  if (!image || image.length > MAX_BASE64) return send(res, 400, { error: 'Photo manquante ou trop lourde' });

  const started = Date.now();
  const kb = Math.round((image.length * 3) / 4 / 1024);
  try {
    const raw = await enqueue(() => analyse(image, mediaType, level));
    const built = buildResponse(raw);
    const seconds = Math.round((Date.now() - started) / 1000);
    const count = Array.isArray((built.body.lesson as { exercises?: unknown[] } | undefined)?.exercises) ? (built.body.lesson as { exercises: unknown[] }).exercises.length : 0;
    console.log(`[pont] ${level} ${mediaType} ${kb} Ko → ${built.status} en ${seconds} s${built.status === 200 ? `, ${count} exercices, ${built.body.dropped} écarté(s)` : ` : ${built.body.error}`}`);
    return send(res, built.status, built.body);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur du pont local';
    console.log(`[pont] ${level} ${mediaType} ${kb} Ko → 502 : ${message}`);
    return send(res, 502, { error: message });
  }
}

const login = await checkLogin();
const server = createServer((req, res) => { handle(req, res).catch((err) => send(res, 500, { error: String(err) })); });
server.listen(PORT, '0.0.0.0', () => {
  const addresses = Object.values(networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i!.address);
  console.log(`Pont local Ardoiz : Claude Code ${login}, modèle ${MODEL}`);
  console.log(`Binaire : ${CLAUDE}`);
  console.log('À mettre dans .env (puis relancer npx expo start) :');
  for (const a of addresses) console.log(`  EXPO_PUBLIC_ANALYSE_URL=http://${a}:${PORT}`);
  console.log('Une photo à la fois, dossier temporaire supprimé après lecture. Ctrl+C pour arrêter.');
});
