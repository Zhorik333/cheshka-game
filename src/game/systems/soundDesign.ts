export type SoundEventKind = 'posterCollect' | 'dash' | 'hide' | 'caught' | 'dayClear' | 'phaseChange';

export type SoundTone = {
  frequencyHz: number;
  startDelayMs: number;
  durationMs: number;
  volume: number;
  type: OscillatorType;
};

export type SoundCue = {
  tones: SoundTone[];
  maxDurationMs: number;
};

const SOUND_CUES: Record<SoundEventKind, SoundCue> = {
  posterCollect: {
    maxDurationMs: 150,
    tones: [
      { frequencyHz: 740, startDelayMs: 0, durationMs: 72, volume: 0.045, type: 'sine' },
      { frequencyHz: 1040, startDelayMs: 42, durationMs: 82, volume: 0.034, type: 'triangle' },
    ],
  },
  dash: {
    maxDurationMs: 180,
    tones: [
      { frequencyHz: 320, startDelayMs: 0, durationMs: 70, volume: 0.052, type: 'triangle' },
      { frequencyHz: 520, startDelayMs: 54, durationMs: 90, volume: 0.04, type: 'sine' },
    ],
  },
  hide: {
    maxDurationMs: 230,
    tones: [
      { frequencyHz: 420, startDelayMs: 0, durationMs: 110, volume: 0.032, type: 'sine' },
      { frequencyHz: 560, startDelayMs: 78, durationMs: 120, volume: 0.028, type: 'sine' },
    ],
  },
  caught: {
    maxDurationMs: 260,
    tones: [
      { frequencyHz: 180, startDelayMs: 0, durationMs: 130, volume: 0.055, type: 'sawtooth' },
      { frequencyHz: 130, startDelayMs: 96, durationMs: 120, volume: 0.044, type: 'triangle' },
    ],
  },
  dayClear: {
    maxDurationMs: 390,
    tones: [
      { frequencyHz: 660, startDelayMs: 0, durationMs: 90, volume: 0.038, type: 'sine' },
      { frequencyHz: 880, startDelayMs: 90, durationMs: 110, volume: 0.036, type: 'sine' },
      { frequencyHz: 1180, startDelayMs: 205, durationMs: 125, volume: 0.03, type: 'triangle' },
    ],
  },
  phaseChange: {
    maxDurationMs: 240,
    tones: [
      { frequencyHz: 500, startDelayMs: 0, durationMs: 95, volume: 0.03, type: 'triangle' },
      { frequencyHz: 350, startDelayMs: 95, durationMs: 105, volume: 0.026, type: 'sine' },
    ],
  },
};

export function getSoundCue(kind: SoundEventKind): SoundCue {
  return {
    maxDurationMs: SOUND_CUES[kind].maxDurationMs,
    tones: SOUND_CUES[kind].tones.map((tone) => ({ ...tone })),
  };
}

export function isMobileSafeSoundCue(cue: SoundCue): boolean {
  return cue.maxDurationMs <= 400
    && cue.tones.length <= 3
    && cue.tones.every((tone) => (
      tone.volume > 0
      && tone.volume <= 0.06
      && tone.durationMs > 0
      && tone.durationMs <= 150
      && tone.frequencyHz >= 100
      && tone.frequencyHz <= 1400
      && tone.startDelayMs >= 0
    ));
}
