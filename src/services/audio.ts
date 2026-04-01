/**
 * Sound effect service using Web Audio API
 * Synthesizes all sounds programmatically — no MP3 files needed!
 *
 * Each sound is a short synthesized tone designed for children's game feedback:
 * - click: soft tap
 * - correct: happy ascending chime
 * - wrong: gentle descending buzz
 * - star: sparkle arpeggio
 * - badge: triumphant fanfare
 * - flip: quick card flip
 * - match: satisfying pair-found chime
 * - complete: celebration melody
 */

type SoundName = 'click' | 'correct' | 'wrong' | 'star' | 'badge' | 'flip' | 'match' | 'complete';

class AudioService {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch {
        return null;
      }
    }
    // Resume if suspended (iOS requirement: must be triggered by user gesture)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  init(): void {
    // Lazy init — context created on first play() to comply with autoplay policy
  }

  play(name: SoundName): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const synth = this.sounds[name];
    if (synth) {
      synth(ctx);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // ── Sound Synthesizers ──────────────────────────────────────────

  private sounds: Record<SoundName, (ctx: AudioContext) => void> = {
    /** Soft click — short sine blip */
    click: (ctx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    },

    /** Happy ascending two-tone chime */
    correct: (ctx) => {
      const now = ctx.currentTime;
      // Tone 1: C5
      this.playTone(ctx, 523, now, 0.15, 0.3, 'sine');
      // Tone 2: E5
      this.playTone(ctx, 659, now + 0.1, 0.15, 0.3, 'sine');
      // Tone 3: G5 (high, bright)
      this.playTone(ctx, 784, now + 0.2, 0.12, 0.4, 'sine');
    },

    /** Gentle descending tone — not harsh, just informative */
    wrong: (ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    },

    /** Sparkle — quick ascending arpeggio */
    star: (ctx) => {
      const now = ctx.currentTime;
      const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
      notes.forEach((freq, i) => {
        this.playTone(ctx, freq, now + i * 0.07, 0.1, 0.25, 'sine');
      });
    },

    /** Badge unlock fanfare — triumphant ascending chord */
    badge: (ctx) => {
      const now = ctx.currentTime;
      // Fanfare: C4 → E4 → G4 → C5, with sustain
      const notes = [262, 330, 392, 523];
      notes.forEach((freq, i) => {
        this.playTone(ctx, freq, now + i * 0.12, 0.2, 0.5, 'sine');
      });
      // Add a shimmery high note
      this.playTone(ctx, 1047, now + 0.5, 0.08, 0.6, 'sine');
    },

    /** Card flip — short noise burst */
    flip: (ctx) => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    },

    /** Match found — satisfying two-tone with octave jump */
    match: (ctx) => {
      const now = ctx.currentTime;
      this.playTone(ctx, 440, now, 0.15, 0.2, 'sine');
      this.playTone(ctx, 880, now + 0.12, 0.15, 0.35, 'sine');
    },

    /** Level complete — cheerful ascending melody */
    complete: (ctx) => {
      const now = ctx.currentTime;
      // C5 → D5 → E5 → G5 → C6 ascending scale
      const melody = [523, 587, 659, 784, 1047];
      melody.forEach((freq, i) => {
        this.playTone(ctx, freq, now + i * 0.1, 0.15, 0.35, 'sine');
      });
      // Final sustain chord: C5 + E5 + G5
      [523, 659, 784].forEach((freq) => {
        this.playTone(ctx, freq, now + 0.55, 0.08, 0.7, 'sine');
      });
    },
  };

  /** Helper: play a single tone with attack/decay envelope */
  private playTone(
    ctx: AudioContext,
    freq: number,
    startTime: number,
    volume: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
}

export const audio = new AudioService();
