import type { Line } from '../data/phrases';

/**
 * One voice at a time. Every call to `speak` cancels whatever is playing, so
 * narration can never overlap or build up into a queue; the latest request wins.
 * When narration is off (or unsupported) `onEnd` still fires after a short,
 * speech-like pause so activities keep the same pacing without sound.
 *
 * Two voices are supported: pre-recorded clips (a natural voice, identical on
 * every device) and the browser's built-in speech as a fallback.
 */

export interface SpeakOptions {
  onEnd?: () => void;
  /** Lets callers ask "is a try-again message still playing?" */
  tag?: string;
}

const FEMALE_HINTS = [
  'female', 'woman', 'samantha', 'zira', 'aria', 'jenny', 'ava', 'emma', 'michelle', 'sonia', 'libby', 'hazel',
  'susan', 'karen', 'moira', 'tessa', 'victoria', 'fiona', 'serena', 'allison', 'joanna', 'salli', 'kendra',
  'kimberly', 'ivy', 'natasha', 'clara', 'catherine', 'nicky', 'heera', 'neerja', 'google us english',
  'google uk english female',
];
const MALE_HINTS = /\b(male|david|mark|george|guy|ryan|daniel|alex|fred|tom|christopher|eric|james|brian|aaron|arthur|oliver|thomas|ravi|prabhat)\b/i;

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  let score = 0;
  if (FEMALE_HINTS.some((h) => name.includes(h))) score += 10;
  if (MALE_HINTS.test(name)) score -= 10;
  if (/natural|neural|online|enhanced|premium/.test(name)) score += 3;
  if (/^en[-_](us|gb)/i.test(v.lang)) score += 2;
  return score;
}

export function rankEnglishVoices(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  return voices
    .filter((v) => v.lang.toLowerCase().startsWith('en'))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a) || a.name.localeCompare(b.name));
}

/** The recorded voice shipped in public/voice/<RECORDED_VOICE>/. */
export const RECORDED_VOICE = { id: 'neerja', label: 'Neerja (natural voice)' };
const RECORDED_BASE = `${import.meta.env.BASE_URL}voice/${RECORDED_VOICE.id}`;
/** Speech rate the recordings were made at; the speed setting is relative to it. */
const RECORDED_RATE = 0.85;

class Narrator {
  rate = 0.85;
  /** Prefer the recorded voice when its clips are available. */
  useRecorded = true;
  pitch = 1.1;
  voiceURI: string | null = null;

  private synth: SpeechSynthesis | null =
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  private voices: SpeechSynthesisVoice[] = [];
  private voiceListeners = new Set<() => void>();
  private token = 0;
  private timers: number[] = [];
  private currentTag: string | null = null;
  private active = false;
  // Keep a reference so the utterance isn't garbage-collected before `end` fires (Chrome bug).
  current: SpeechSynthesisUtterance | null = null;
  private pendingFinish: (() => void) | null = null;
  private _enabled = true;
  private clips: Set<string> | null = null;
  private audio: HTMLAudioElement | null = typeof Audio !== 'undefined' ? new Audio() : null;

  get enabled(): boolean {
    return this._enabled;
  }

  /**
   * Turning narration off mid-sentence stops the voice but still lets the
   * sentence "finish", so anything waiting on `onEnd` (like advancing to the
   * next target) carries on instead of getting stuck.
   */
  set enabled(value: boolean) {
    if (this._enabled === value) return;
    this._enabled = value;
    if (!value && this.active) {
      const finish = this.pendingFinish;
      this.stopAudio();
      this.synth?.cancel();
      this.clearTimers();
      if (finish) this.timers.push(window.setTimeout(finish, 300));
    }
  }

  constructor() {
    if (!this.synth) return;
    const load = () => {
      this.voices = this.synth?.getVoices() ?? [];
      this.voiceListeners.forEach((fn) => fn());
    };
    load();
    this.synth.onvoiceschanged = load;
  }

  get supported(): boolean {
    return this.synth !== null;
  }

  /** Loads the recorded voice's clip list; quietly stays on the device voice if it's missing. */
  async loadRecordedVoice(): Promise<void> {
    try {
      const res = await fetch(`${RECORDED_BASE}/manifest.json`, { cache: 'no-cache' });
      if (!res.ok) return;
      const manifest = (await res.json()) as { clips?: string[] };
      if (!Array.isArray(manifest.clips) || manifest.clips.length === 0) return;
      this.clips = new Set(manifest.clips);
      this.voiceListeners.forEach((fn) => fn());
    } catch {
      /* no recorded voice: device voice it is */
    }
  }

  get recordedAvailable(): boolean {
    return this.clips !== null;
  }

  /** Warms the cache for clips that are likely to play next, so they start instantly. */
  preload(lines: Line[]): void {
    if (!this.canPlayRecorded(lines)) return;
    for (const line of lines) {
      const a = new Audio();
      a.preload = 'auto';
      a.src = this.clipUrl(line.id);
    }
  }

  private canPlayRecorded(lines: Line[]): boolean {
    return this.useRecorded && !!this.audio && !!this.clips && lines.every((l) => this.clips!.has(l.id));
  }

  private clipUrl(id: string): string {
    return `${RECORDED_BASE}/${id}.mp3`;
  }

  private stopAudio() {
    if (!this.audio) return;
    this.audio.onended = null;
    this.audio.onerror = null;
    this.audio.pause();
  }

  englishVoices(): SpeechSynthesisVoice[] {
    return rankEnglishVoices(this.voices);
  }

  /** The voice that will actually be used: the parent's choice, else the best female English voice. */
  activeVoice(): SpeechSynthesisVoice | null {
    if (this.voiceURI) {
      const chosen = this.voices.find((v) => v.voiceURI === this.voiceURI);
      if (chosen) return chosen;
    }
    return this.englishVoices()[0] ?? this.voices[0] ?? null;
  }

  onVoicesChanged(fn: () => void): () => void {
    this.voiceListeners.add(fn);
    return () => {
      this.voiceListeners.delete(fn);
    };
  }

  isSpeaking(tag?: string): boolean {
    return this.active && (tag === undefined || this.currentTag === tag);
  }

  /** Says the lines (or plain text) in one go; anything already playing is stopped. */
  speak(input: string | Line[], opts: SpeakOptions = {}): void {
    const lines: Line[] = typeof input === 'string' ? [{ id: '', text: input }] : input;
    const text = lines.map((l) => l.text).join(' ');
    this.cancel();
    const token = this.token;
    this.active = true;
    this.currentTag = opts.tag ?? null;

    const finish = () => {
      if (token !== this.token || !this.active) return;
      this.active = false;
      this.currentTag = null;
      this.current = null;
      this.pendingFinish = null;
      this.clearTimers();
      opts.onEnd?.();
    };
    this.pendingFinish = finish;

    const estimate = 600 + (text.length * 70) / this.rate;
    if (!this.enabled || !this.synth) {
      this.timers.push(window.setTimeout(finish, Math.min(estimate, 1300)));
      return;
    }

    if (this.canPlayRecorded(lines)) {
      this.playClips(lines, finish, token);
      this.timers.push(window.setTimeout(finish, estimate * 2 + 4000));
      return;
    }

    const u = new SpeechSynthesisUtterance(text);
    const voice = this.activeVoice();
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? 'en-US';
    u.rate = this.rate;
    u.pitch = this.pitch;
    u.onend = finish;
    u.onerror = finish;
    this.current = u;
    // Safety net in case the engine never reports `end`.
    this.timers.push(window.setTimeout(finish, estimate * 2 + 2500));
    if (this.synth.paused) this.synth.resume();
    this.synth.speak(u);
  }

  private playClips(lines: Line[], finish: () => void, token: number) {
    const audio = this.audio!;
    let i = 0;
    const next = () => {
      if (token !== this.token) return;
      if (i >= lines.length) {
        finish();
        return;
      }
      audio.src = this.clipUrl(lines[i++].id);
      audio.playbackRate = this.rate / RECORDED_RATE;
      audio.onended = next;
      // A missing or blocked clip just moves on rather than stalling the game.
      audio.onerror = next;
      audio.play().catch(() => {
        if (token === this.token) next();
      });
    };
    next();
  }

  cancel(): void {
    this.token++;
    this.stopAudio();
    this.active = false;
    this.currentTag = null;
    this.current = null;
    this.pendingFinish = null;
    this.clearTimers();
    if (this.synth && (this.synth.speaking || this.synth.pending)) this.synth.cancel();
  }

  private clearTimers() {
    this.timers.forEach((t) => window.clearTimeout(t));
    this.timers = [];
  }
}

export const narrator = new Narrator();
