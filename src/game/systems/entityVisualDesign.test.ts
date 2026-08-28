import { describe, expect, it } from 'vitest';
import { CHESHKA_VISUAL_DESIGN, HUMAN_VISUAL_DESIGN, getCatReadableFeatureLabels, getFlashlightAlpha } from './entityVisualDesign';

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
});
