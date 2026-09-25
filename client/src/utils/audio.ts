// Web Audio API Ambient Sound Synthesizer & Sound Effects
// Generates soothing mystical frequencies and ritual sounds with zero external files!

class MysticalAudioEngine {
  private ctx: AudioContext | null = null;
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  public isAmbientPlaying: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Toggle ambient meditation drone (C# minor sacred chord: 138Hz + 164Hz + 207Hz)
  public toggleAmbient(play?: boolean): boolean {
    this.initContext();
    if (!this.ctx) return false;

    const targetState = play !== undefined ? play : !this.isAmbientPlaying;

    if (targetState) {
      if (this.isAmbientPlaying) return true;

      try {
        const now = this.ctx.currentTime;
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.001, now);
        this.ambientGain.gain.exponentialRampToValueAtTime(0.07, now + 3);

        // Low warm drone (C#3)
        this.ambientOsc1 = this.ctx.createOscillator();
        this.ambientOsc1.type = 'sine';
        this.ambientOsc1.frequency.setValueAtTime(138.59, now);

        // Harmonic Fifth (G#3)
        this.ambientOsc2 = this.ctx.createOscillator();
        this.ambientOsc2.type = 'triangle';
        this.ambientOsc2.frequency.setValueAtTime(207.65, now);

        // Filter for ethereal warmth
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(380, now);

        this.ambientOsc1.connect(filter);
        this.ambientOsc2.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);

        this.ambientOsc1.start();
        this.ambientOsc2.start();

        this.isAmbientPlaying = true;
        return true;
      } catch (e) {
        console.error("Failed to start ambient audio:", e);
        return false;
      }
    } else {
      if (!this.isAmbientPlaying) return false;

      try {
        if (this.ambientGain && this.ctx) {
          const now = this.ctx.currentTime;
          this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
          setTimeout(() => {
            try {
              this.ambientOsc1?.stop();
              this.ambientOsc2?.stop();
              this.ambientOsc1?.disconnect();
              this.ambientOsc2?.disconnect();
              this.ambientGain?.disconnect();
            } catch {
              // ignore cleanup errors
            }
          }, 1600);
        }
      } catch (e) {
        console.error("Failed to stop ambient audio:", e);
      }
      this.isAmbientPlaying = false;
      return false;
    }
  }

  // Sacred Singing Bell / Chime sound (for card selection and reveal)
  public playChime(freq = 528) {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 2.6);
    } catch {
      // Audio playback allowed after user interaction
    }
  }

  // Card Shuffle Swoosh Effect
  public playShuffle() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      for (let i = 0; i < 7; i++) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const delay = i * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220 + (i * 45), now + delay);
        osc.frequency.exponentialRampToValueAtTime(110, now + delay + 0.12);

        gain.gain.setValueAtTime(0.1, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.13);
      }
    } catch {
      // Audio playback allowed after user interaction
    }
  }

  // Card Flip Sound Effect
  public playFlip() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio playback allowed after user interaction
    }
  }
}

export const audioEngine = new MysticalAudioEngine();
