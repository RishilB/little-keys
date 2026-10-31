/**
 * Records every narration line with an Azure neural voice and saves the clips
 * to public/voice/neerja/, plus a manifest the app reads at startup.
 *
 *   npm run voice -- --list      show what would be recorded (no key needed)
 *   npm run voice -- --sample    record a handful of clips to listen to first
 *   npm run voice                record everything that's missing
 *   npm run voice -- --force     re-record everything
 *
 * Needs AZURE_SPEECH_KEY and AZURE_SPEECH_REGION, from the environment or from
 * a .env.local file (git-ignored). Optional: AZURE_VOICE (default en-IN-NeerjaNeural).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { allLines, type Line } from '../src/data/phrases';

const OUT_DIR = resolve('public/voice/neerja');
const SAMPLE_IDS = ['greeting', 'prompt-A-1', 'praise-1', 'thats-A', 'tryagain-1', 'find-B', 'prompt-5-1', 'key-Z', 'finished'];
const CONCURRENCY = 4;

/** Warm, unhurried delivery: friendly lines are cheerful, try-again lines are gentle. */
function styleFor(id: string): string | null {
  if (/^(greeting|praise|thats|finished|find-intro|playground-intro|voice-test)/.test(id)) return 'cheerful';
  if (id.startsWith('tryagain')) return 'empathetic';
  return null;
}

function loadEnvFile() {
  for (const name of ['.env.local', '.env']) {
    if (!existsSync(name)) continue;
    for (const raw of readFileSync(name, 'utf8').split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(raw);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function toSsml(line: Line, voice: string): string {
  const body = escapeXml(line.clip ?? line.text).replace(
    /\[\[([A-Z0-9])\]\]/g,
    '<say-as interpret-as="characters">$1</say-as>',
  );
  const prosody = `<prosody rate="-8%" pitch="+3%">${body}</prosody>`;
  const style = styleFor(line.id);
  const inner = style ? `<mstts:express-as style="${style}">${prosody}</mstts:express-as>` : prosody;
  const lang = voice.slice(0, 5);
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" ` +
    `xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${lang}">` +
    `<voice name="${voice}">${inner}</voice></speak>`
  );
}

async function synthesize(line: Line, key: string, region: string, voice: string): Promise<Buffer> {
  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
        'User-Agent': 'little-keys-voice-generator',
      },
      body: toSsml(line, voice),
    });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if ((res.status === 429 || res.status >= 500) && attempt < 5) {
      await new Promise((r) => setTimeout(r, attempt * 1500));
      continue;
    }
    throw new Error(`${line.id}: Azure returned ${res.status} ${res.statusText} ${await res.text()}`);
  }
}

function writeManifest(voice: string) {
  const clips = readdirSync(OUT_DIR)
    .filter((f) => f.endsWith('.mp3'))
    .map((f) => f.slice(0, -4))
    .sort();
  writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify({ voice, clips }, null, 2) + '\n');
  return clips.length;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const lines = allLines();

  if (args.has('--list')) {
    for (const l of lines) console.log(`${l.id.padEnd(20)} ${l.clip ?? l.text}`);
    console.log(`\n${lines.length} lines`);
    return;
  }

  loadEnvFile();
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;
  const voice = process.env.AZURE_VOICE ?? 'en-IN-NeerjaNeural';
  if (!key || !region) {
    console.error('Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION (see .env.example).');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const wanted = args.has('--sample') ? lines.filter((l) => SAMPLE_IDS.includes(l.id)) : lines;
  const todo = wanted.filter((l) => args.has('--force') || args.has('--sample') || !existsSync(join(OUT_DIR, `${l.id}.mp3`)));
  console.log(`Recording ${todo.length} of ${wanted.length} clips with ${voice}…`);

  let done = 0;
  const queue = [...todo];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let line = queue.shift(); line; line = queue.shift()) {
        const audio = await synthesize(line, key, region, voice);
        writeFileSync(join(OUT_DIR, `${line.id}.mp3`), audio);
        done++;
        if (done % 20 === 0 || done === todo.length) console.log(`  ${done}/${todo.length}`);
      }
    }),
  );

  const count = writeManifest(voice);
  console.log(`Done. ${count} clips in public/voice/neerja.`);
  if (args.has('--sample')) {
    console.log('Sample only: the app uses these clips and the device voice for the rest. Run without --sample for all.');
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
