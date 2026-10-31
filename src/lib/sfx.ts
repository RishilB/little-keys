/** Synthesized sound effects: soft chimes, a crowd cheer and a silly raspberry. No audio files. */

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

  celebrate() {
    [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, i) => this.note(f, i * 0.12, 0.34, { gain: 0.06 }));
    this.cheer(1.4);
  }

  /**
   * A small crowd going "yaaay!": a few formant-filtered voices gliding up,
   * a swell of crowd noise and scattered claps. Synthesized, so every cheer
   * sounds a little different. Returns its length in seconds (0 when muted).
   */
  cheer(length = 1.1): number {
    const ctx = this.ready();
    if (!ctx) return 0;
    const t0 = ctx.currentTime + 0.02;
    const out = ctx.createGain();
    out.gain.value = 0.9;
    out.connect(ctx.destination);

    // Crowd bed: band-limited noise that swells and fades.
    const bed = this.noiseSource(ctx);
    const bedFilter = ctx.createBiquadFilter();
    bedFilter.type = 'bandpass';
    bedFilter.frequency.value = 1300;
    bedFilter.Q.value = 0.6;
    const bedGain = ctx.createGain();
    this.envelope(bedGain.gain, t0, [
      [0.25, 0.07],
      [length * 0.75, 0.035],
      [length + 0.4, 0.0001],
    ]);
    bed.connect(bedFilter).connect(bedGain).connect(out);
    bed.start(t0, Math.random());
    bed.stop(t0 + length + 0.5);

    // Claps: short bright noise bursts.
    for (let i = 0; i < Math.round(22 * length); i++) {
      const at = t0 + 0.08 + Math.random() * length;
      const clap = this.noiseSource(ctx);
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1100 + Math.random() * 800;
      const g = ctx.createGain();
      this.envelope(g.gain, at, [
        [0.004, 0.03 + Math.random() * 0.05],
        [0.06, 0.0001],
      ]);
      clap.connect(hp).connect(g).connect(out);
      clap.start(at, Math.random() * 1.5, 0.08);
    }

    // Voices: sawtooth "vocal cords" through two vowel formants gliding from "eh" to "ee".
    for (let v = 0; v < 6; v++) {
      const start = t0 + Math.random() * 0.12;
      const dur = length * (0.8 + Math.random() * 0.25);
      const f0 = 210 + Math.random() * 280;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f0, start);
      osc.frequency.linearRampToValueAtTime(f0 * 1.35, start + dur * 0.35);
      osc.frequency.linearRampToValueAtTime(f0 * 1.15, start + dur);
      const vibrato = ctx.createOscillator();
      vibrato.frequency.value = 5 + Math.random() * 1.5;
      const vibratoDepth = ctx.createGain();
      vibratoDepth.gain.value = f0 * 0.03;
      vibrato.connect(vibratoDepth).connect(osc.frequency);

      const voice = ctx.createGain();
      this.envelope(voice.gain, start, [
        [0.08, 0.045],
        [dur * 0.7, 0.035],
        [dur, 0.0001],
      ]);
      for (const [from, to] of [
        [600, 330],
        [1800, 2300],
      ]) {
        const formant = ctx.createBiquadFilter();
        formant.type = 'bandpass';
        formant.Q.value = 7;
        formant.frequency.setValueAtTime(from, start);
        formant.frequency.linearRampToValueAtTime(to, start + dur * 0.6);
        osc.connect(formant).connect(voice);
      }
      voice.connect(out);
      osc.start(start);
      vibrato.start(start);
      osc.stop(start + dur + 0.05);
      vibrato.stop(start + dur + 0.05);
    }
    return length;
  }

  private lastRaspberry = 0;

  /**
   * A silly raspberry ("pbbbt") for a wrong key: a low buzzy tone that
   * flutters and droops in pitch. Skipped if one played very recently, so
   * key-mashing stays funny instead of noisy. Returns its length in seconds.
   */
  raspberry(): number {
    const ctx = this.ready();
    if (!ctx) return 0;
    if (ctx.currentTime - this.lastRaspberry < 0.7) return 0;
    this.lastRaspberry = ctx.currentTime;

    const t0 = ctx.currentTime + 0.02;
    const dur = 0.5 + Math.random() * 0.3;
    const base = 70 + Math.random() * 40;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(base * 1.5, t0);
    osc.frequency.exponentialRampToValueAtTime(base * 0.75, t0 + dur);

    // Lip flutter: wobble the pitch and the loudness quickly.
    const flutter = ctx.createOscillator();
    flutter.frequency.value = 22 + Math.random() * 12;
    const flutterDepth = ctx.createGain();
    flutterDepth.gain.value = base * 0.35;
    flutter.connect(flutterDepth).connect(osc.frequency);

    const tremolo = ctx.createGain();
    tremolo.gain.value = 0.65;
    const tremoloLfo = ctx.createOscillator();
    tremoloLfo.type = 'square';
    tremoloLfo.frequency.value = 26 + Math.random() * 10;
    const tremoloDepth = ctx.createGain();
    tremoloDepth.gain.value = 0.35;
    tremoloLfo.connect(tremoloDepth).connect(tremolo.gain);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 520;
    lowpass.Q.value = 3;

    const env = ctx.createGain();
    this.envelope(env.gain, t0, [
      [0.03, 0.22],
      [dur * 0.75, 0.16],
      [dur, 0.0001],
    ]);
    osc.connect(tremolo).connect(lowpass).connect(env).connect(ctx.destination);

    // A breath of air through the lips.
    const air = this.noiseSource(ctx);
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = 'bandpass';
    airFilter.frequency.value = 350;
    const airGain = ctx.createGain();
    this.envelope(airGain.gain, t0, [
      [0.03, 0.05],
      [dur, 0.0001],
    ]);
    air.connect(airFilter).connect(airGain).connect(ctx.destination);

    for (const node of [osc, flutter, tremoloLfo]) {
      node.start(t0);
      node.stop(t0 + dur + 0.05);
    }
    air.start(t0, Math.random());
    air.stop(t0 + dur + 0.05);
    return dur;
  }

  private noise: AudioBuffer | null = null;

  private noiseSource(ctx: AudioContext): AudioBufferSourceNode {
    if (!this.noise) {
      this.noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    return src;
  }

  /** Starts silent at `start`, then ramps to each [offset, value] point. */
  private envelope(param: AudioParam, start: number, points: [number, number][]) {
    param.setValueAtTime(0.0001, start);
    for (const [offset, value] of points) param.exponentialRampToValueAtTime(Math.max(value, 0.0001), start + offset);
  }

  private ready(): AudioContext | null {
    if (!this.enabled) return null;
    this.unlock();
    return this.ctx && this.ctx.state === 'running' ? this.ctx : null;
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
