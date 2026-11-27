import { GameSettings, WeatherKind } from './types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private suspenseGain: GainNode | null = null;
  private ambientStarted = false;
  private settings: GameSettings = {
    musicVolume: 0.45,
    sfxVolume: 0.7,
    muted: false,
    graphicsQuality: 'high',
    controlSensitivity: 1,
    touchControls: 'auto',
  };

  public updateSettings(next: GameSettings): void {
    this.settings = next;
    if (this.ambientGain && this.ctx) {
      const target = next.muted ? 0 : next.musicVolume * 0.14;
      this.ambientGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
    }
  }

  public updateAtmosphere(
    weather: WeatherKind,
    inInterior: boolean,
    dangerLevel: number
  ): void {
    if (!this.ctx || !this.ambientStarted) return;
    const now = this.ctx.currentTime;
    const mutedMult = this.settings.muted ? 0 : this.settings.musicVolume;

    if (this.rainGain) {
      const rainTarget =
        weather === 'rain' ? (inInterior ? 0.025 : 0.075) * mutedMult : 0;
      this.rainGain.gain.setTargetAtTime(rainTarget, now, 0.4);
    }
    if (this.suspenseGain) {
      const suspTarget = (0.015 + Math.min(1, dangerLevel) * 0.08) * mutedMult;
      this.suspenseGain.gain.setTargetAtTime(suspTarget, now, 0.25);
    }
  }

  public unlockAndStartAmbient(): void {
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      if (!this.ambientStarted) {
        this.startAmbientDrone();
        this.ambientStarted = true;
      }
    } catch {
      // Ignore if browser blocks audio
    }
  }

  private startAmbientDrone(): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const master = this.ctx.createGain();
    master.gain.setValueAtTime(
      this.settings.muted ? 0 : this.settings.musicVolume * 0.14,
      now
    );
    master.connect(this.ctx.destination);
    this.ambientGain = master;

    // 1. Hollow Creek eerie wind drone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(210, now);
    filter.connect(master);

    const oscA = this.ctx.createOscillator();
    oscA.type = 'triangle';
    oscA.frequency.setValueAtTime(55, now);

    const oscB = this.ctx.createOscillator();
    oscB.type = 'sine';
    oscB.frequency.setValueAtTime(55.4, now);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.14, now);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(65, now);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    oscA.connect(filter);
    oscB.connect(filter);
    oscA.start(now);
    oscB.start(now);
    lfo.start(now);

    // 2. Suspenseful minor pulse oscillator (scales up when enemies stalk)
    const suspGain = this.ctx.createGain();
    suspGain.gain.setValueAtTime(0, now);
    suspGain.connect(this.ctx.destination);
    this.suspenseGain = suspGain;

    const pulseFilter = this.ctx.createBiquadFilter();
    pulseFilter.type = 'lowpass';
    pulseFilter.frequency.setValueAtTime(160, now);
    pulseFilter.connect(suspGain);

    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(41.2, now); // E1 dark drone
    const subMod = this.ctx.createOscillator();
    subMod.type = 'sine';
    subMod.frequency.setValueAtTime(1.1, now);
    const subModGain = this.ctx.createGain();
    subModGain.gain.setValueAtTime(60, now);
    subMod.connect(subModGain);
    subModGain.connect(pulseFilter.frequency);
    subOsc.connect(pulseFilter);
    subOsc.start(now);
    subMod.start(now);

    // 3. Filtered noise loop for rain ambience
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'bandpass';
    rainFilter.frequency.setValueAtTime(1100, now);
    rainFilter.Q.setValueAtTime(0.7, now);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0, now);
    this.rainGain = rainGain;

    whiteNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.ctx.destination);
    whiteNoise.start(now);
  }

  public pauseAmbient(): void {
    if (!this.ctx) return;
    if (this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.06);
    }
    if (this.rainGain) {
      this.rainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.06);
    }
    if (this.suspenseGain) {
      this.suspenseGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.06);
    }
  }

  public resumeAmbient(): void {
    if (this.ambientGain && this.ctx) {
      const target = this.settings.muted ? 0 : this.settings.musicVolume * 0.14;
      this.ambientGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.12);
    }
  }

  public playFootstep(stance: 'walk' | 'run' | 'sneak'): void {
    if (!this.ctx || this.settings.muted || this.settings.sfxVolume <= 0.01) {
      return;
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const pitchJitter = 0.92 + Math.random() * 0.16;
    const baseFreq = stance === 'run' ? 125 : stance === 'sneak' ? 75 : 98;
    const volScale = stance === 'run' ? 0.13 : stance === 'sneak' ? 0.04 : 0.08;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq * pitchJitter, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.065);

    gain.gain.setValueAtTime(volScale * this.settings.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.075);
  }

  public playUiClick(): void {
    if (!this.ctx) this.unlockAndStartAmbient();
    if (!this.ctx || this.settings.muted || this.settings.sfxVolume <= 0.01) {
      return;
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.05);
    gain.gain.setValueAtTime(0.09 * this.settings.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playFlashlightClick(): void {
    if (!this.ctx) this.unlockAndStartAmbient();
    if (!this.ctx || this.settings.muted || this.settings.sfxVolume <= 0.01) {
      return;
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(920, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.03);
    gain.gain.setValueAtTime(0.08 * this.settings.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playMissionChime(): void {
    if (!this.ctx) this.unlockAndStartAmbient();
    if (!this.ctx || this.settings.muted || this.settings.sfxVolume <= 0.01) {
      return;
    }
    const now = this.ctx.currentTime;
    const notes = [392, 493.88, 587.33];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);
      gain.gain.setValueAtTime(0.11 * this.settings.sfxVolume, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.38);
    });
  }

  public playCombatHit(isPlayerHurt: boolean): void {
    if (!this.ctx) this.unlockAndStartAmbient();
    if (!this.ctx || this.settings.muted || this.settings.sfxVolume <= 0.01) {
      return;
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isPlayerHurt ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isPlayerHurt ? 140 : 210, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.14);
    gain.gain.setValueAtTime(0.18 * this.settings.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playInteractCue(
    cue: 'paper' | 'phone' | 'metal' | 'wood' | 'whisper'
  ): void {
    if (!this.ctx) this.unlockAndStartAmbient();
    if (!this.ctx || this.settings.muted || this.settings.sfxVolume <= 0.01) {
      return;
    }
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const vol = 0.14 * this.settings.sfxVolume;

    if (cue === 'paper') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);
      gain.gain.setValueAtTime(vol * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    } else if (cue === 'phone') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.setValueAtTime(440, now + 0.09);
      gain.gain.setValueAtTime(vol * 0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    } else if (cue === 'metal') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.11);
      gain.gain.setValueAtTime(vol * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    } else if (cue === 'whisper') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(135, now + 0.28);
      gain.gain.setValueAtTime(vol * 0.75, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);
      gain.gain.setValueAtTime(vol * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }
}

export const soundEngine = new SoundEngine();
