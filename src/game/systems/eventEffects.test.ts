import { describe, expect, it } from 'vitest';
import { EVENT_EFFECT_STYLES, getEventEffectStyle, getParticleAngles, isSubtleMobileEffect } from './eventEffects';

describe('event effects', () => {
  it('keeps every event effect subtle enough for a small mobile screen', () => {
    for (const style of Object.values(EVENT_EFFECT_STYLES)) {
      expect(isSubtleMobileEffect(style)).toBe(true);
      expect(style.endRadius).toBeGreaterThan(style.startRadius);
      expect(style.particles).toBeGreaterThanOrEqual(4);
    }
  });

  it('returns defensive copies of effect styles', () => {
    const style = getEventEffectStyle('dash');
    style.durationMs = 9999;

    expect(getEventEffectStyle('dash').durationMs).toBe(360);
  });

  it('spreads particles evenly around the effect center', () => {
    const angles = getParticleAngles(4);

    expect(angles).toHaveLength(4);
    expect(angles[0]).toBe(0);
    expect(angles[1]).toBeCloseTo(Math.PI / 2, 3);
    expect(getParticleAngles(0)).toEqual([]);
  });
});
