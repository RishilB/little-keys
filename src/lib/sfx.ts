/** Soft synthesized sound effects. No failure buzzers: every sound is friendly. */

interface NoteOptions {
  type?: OscillatorType;
  gain?: number;
  glideTo?: number;
}

class Sfx {
  enabled = true;
  private ctx: AudioContext | null = null;

  /** Must run inside a user gesture at least once so browsers allow audio. */
  unlock(): void {
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        this.ctx = new Ctor();
      }
      if (this.ctx.state === 'suspended') void this.ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  pop() {
    this.note(560, 0, 0.14, { glideTo: 820, gain: 0.07 });
  }

  success() {
    [523.25, 659.25, 783.99].forEach((f, i) => this.note(f, i * 0.1, 0.32, { gain: 0.07 }));
  }

  gentle() {
    this.note(440, 0, 0.18, { type: 'triangle', gain: 0.05 });
    this.note(494, 0.16, 0.24, { type: 'triangle', gain: 0.05 });
  }

  celebrate() {
    [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, i) => this.note(f, i * 0.12, 0.34, { gain: 0.06 }));
  }

  private note(freq: number, delay: number, duration: number, { type = 'sine', gain = 0.06, glideTo }: NoteOptions = {}) {
    if (!this.enabled) return;
    this.unlock();
    const ctx = this.ctx;
    if (!ctx || ctx.state !== 'running') return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration * 0.8);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  }
}

export const sfx = new Sfx();
