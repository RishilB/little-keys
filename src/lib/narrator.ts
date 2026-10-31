/**
 * One voice at a time. Every call to `speak` cancels whatever is playing, so
 * narration can never overlap or build up into a queue; the latest request wins.
 * When narration is off (or unsupported) `onEnd` still fires after a short,
 * speech-like pause so activities keep the same pacing without sound.
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

class Narrator {
  rate = 0.85;
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

  speak(text: string, opts: SpeakOptions = {}): void {
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

  cancel(): void {
    this.token++;
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
