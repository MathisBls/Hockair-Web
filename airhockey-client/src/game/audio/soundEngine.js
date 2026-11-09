import { GameEventType } from '../constants';

const MUTE_STORAGE_KEY = 'hockair.isMuted';
const MASTER_VOLUME = 0.55;
const MIN_SECONDS_BETWEEN_WALL_SOUNDS = 0.04;

const readStoredMute = () => {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

class SoundEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.noiseBuffer = null;
    this.isMuted = readStoredMute();
    this.lastWallSoundAt = 0;
  }

  ensureContext() {
    if (this.context) {
      if (this.context.state === 'suspended') {
        this.context.resume();
      }

      return this.context;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.master.gain.value = this.isMuted ? 0 : MASTER_VOLUME;
    this.master.connect(this.context.destination);
    const sampleCount = this.context.sampleRate;
    this.noiseBuffer = this.context.createBuffer(
      1,
      sampleCount,
      this.context.sampleRate
    );
    const channel = this.noiseBuffer.getChannelData(0);
    for (let index = 0; index < sampleCount; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }

    return this.context;
  }

  setMuted(isMuted) {
    this.isMuted = isMuted;
    try {
      localStorage.setItem(MUTE_STORAGE_KEY, String(isMuted));
    } catch {
      // Storage can be unavailable (private mode); muting still applies to this session.
    }
    if (this.master) {
      this.master.gain.value = isMuted ? 0 : MASTER_VOLUME;
    }
  }

  getMuted() {
    return this.isMuted;
  }

  playTone({
    frequency,
    endFrequency,
    duration,
    type = 'sine',
    volume = 0.3,
    delay = 0,
  }) {
    const context = this.ensureContext();
    if (!context) {
      return;
    }
    const startAt = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, startAt);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(
        endFrequency,
        startAt + duration
      );
    }
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(startAt);
    oscillator.stop(startAt + duration + 0.02);
  }

  playNoise({
    duration,
    frequency,
    q = 1,
    volume = 0.3,
    delay = 0,
    filterType = 'bandpass',
  }) {
    const context = this.ensureContext();
    if (!context) {
      return;
    }
    const startAt = context.currentTime + delay;
    const source = context.createBufferSource();
    source.buffer = this.noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume, startAt);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(startAt, Math.random() * 0.5);
    source.stop(startAt + duration + 0.02);
  }

  playMalletHit(strength) {
    const power = Math.min(strength / 6, 1);
    this.playTone({
      frequency: 180 + power * 160,
      endFrequency: 70,
      duration: 0.12,
      type: 'triangle',
      volume: 0.25 + power * 0.35,
    });
    this.playNoise({
      duration: 0.05,
      frequency: 2400,
      q: 0.8,
      volume: 0.2 + power * 0.3,
    });
  }

  playWallHit(strength) {
    const context = this.ensureContext();
    if (
      !context ||
      context.currentTime - this.lastWallSoundAt <
        MIN_SECONDS_BETWEEN_WALL_SOUNDS
    ) {
      return;
    }
    this.lastWallSoundAt = context.currentTime;
    const power = Math.min(strength / 6, 1);
    this.playNoise({
      duration: 0.04,
      frequency: 3800,
      q: 2,
      volume: 0.1 + power * 0.25,
    });
    this.playTone({
      frequency: 900,
      endFrequency: 500,
      duration: 0.05,
      volume: 0.05 + power * 0.1,
    });
  }

  playSave() {
    this.playTone({
      frequency: 660,
      endFrequency: 1320,
      duration: 0.18,
      type: 'square',
      volume: 0.08,
    });
  }

  playGoal(isPlayerGoal) {
    const chord = isPlayerGoal
      ? [261.6, 329.6, 392, 523.2]
      : [196, 233.1, 293.7];
    chord.forEach((frequency, index) => {
      this.playTone({
        frequency,
        duration: 1.1,
        type: 'sawtooth',
        volume: 0.07,
        delay: index * 0.03,
      });
    });
    this.playTone({
      frequency: 110,
      endFrequency: 55,
      duration: 0.6,
      type: 'sine',
      volume: 0.5,
    });
    this.playNoise({
      duration: 2.2,
      frequency: 900,
      q: 0.4,
      volume: isPlayerGoal ? 0.35 : 0.18,
      delay: 0.05,
    });
  }

  playCountdownTick(isGo) {
    this.playTone({
      frequency: isGo ? 1046 : 523,
      duration: isGo ? 0.35 : 0.14,
      type: 'square',
      volume: 0.08,
    });
  }

  playWhoosh() {
    this.playNoise({
      duration: 0.5,
      frequency: 600,
      q: 0.6,
      volume: 0.15,
      filterType: 'lowpass',
    });
  }

  playEvents(events, playerSide) {
    events.forEach((event) => {
      switch (event.type) {
        case GameEventType.MALLET_HIT:
          this.playMalletHit(event.strength);
          break;
        case GameEventType.WALL_HIT:
          this.playWallHit(event.strength);
          break;
        case GameEventType.SAVE:
          this.playSave();
          break;
        case GameEventType.GOAL:
          this.playGoal(event.side === playerSide);
          break;
        default:
          break;
      }
    });
  }
}

export const soundEngine = new SoundEngine();
