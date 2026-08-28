import { describe, expect, it } from 'vitest';
import { CHESHKA_VISUAL_DESIGN, HUMAN_VISUAL_DESIGN, getCatReadableFeatureLabels, getFlashlightAlpha, getHumanMirrorScaleX } from './entityVisualDesign';

describe('entity visual design', () => {
  it('makes Cheshka read as a cat instead of a plain circle', () => {
    expect(CHESHKA_VISUAL_DESIGN.hasEars).toBe(true);
    expect(CHESHKA_VISUAL_DESIGN.hasTail).toBe(true);
    expect(getCatReadableFeatureLabels()).toEqual(expect.arrayContaining(['ears', 'tail', 'whiskers']));
  });

  it('keeps human silhouettes readable with a distinct flashlight state', () => {
    expect(HUMAN_VISUAL_DESIGN.readableSilhouetteParts).toBeGreaterThanOrEqual(5);
    expect(HUMAN_VISUAL_DESIGN.flashlightNightColor).not.toBe(HUMAN_VISUAL_DESIGN.flashlightDayColor);
    expect(getFlashlightAlpha(true)).toBeGreaterThan(getFlashlightAlpha(false));
  });

  it('mirrors humans left/right without ever requesting upside-down rotation', () => {
    expect(getHumanMirrorScaleX(1)).toBe(1);
    expect(getHumanMirrorScaleX(0)).toBe(1);
    expect(getHumanMirrorScaleX(-0.1)).toBe(-1);
  });
});
