import { describe, expect, it } from 'vitest';
import { getSoundCue, isMobileSafeSoundCue, type SoundEventKind } from './soundDesign';

const events: SoundEventKind[] = ['posterCollect', 'dash', 'hide', 'caught', 'dayClear', 'phaseChange'];

describe('soundDesign', () => {
  it('defines a short mobile-safe cue for every gameplay sound', () => {
    for (const event of events) {
      const cue = getSoundCue(event);

      expect(cue.tones.length).toBeGreaterThan(0);
      expect(isMobileSafeSoundCue(cue)).toBe(true);
    }
  });

  it('keeps success sounds brighter than warning sounds', () => {
    const poster = getSoundCue('posterCollect');
    const caught = getSoundCue('caught');

    expect(poster.tones[0].frequencyHz).toBeGreaterThan(caught.tones[0].frequencyHz);
  });

  it('returns defensive copies so scenes cannot mutate the design table', () => {
    const cue = getSoundCue('dash');
    cue.tones[0].frequencyHz = 1;

    expect(getSoundCue('dash').tones[0].frequencyHz).toBe(320);
  });

  it('uses a tiny celebration arpeggio for clearing the day', () => {
    const cue = getSoundCue('dayClear');
    const frequencies = cue.tones.map((tone) => tone.frequencyHz);

    expect(frequencies).toEqual([660, 880, 1180]);
    expect(cue.maxDurationMs).toBeLessThanOrEqual(390);
  });
});
