import { describe, expect, it } from 'vitest';
import { getDetectionDangerLevel, isCatDetected, type DetectionHuman } from './detection';

const human: DetectionHuman = {
  x: 100,
  y: 100,
  facing: { x: 1, y: 0 },
  viewDistance: 80,
  viewAngleDegrees: 70,
};

describe('isCatDetected', () => {
  it('detects a cat inside the view cone', () => {
    expect(isCatDetected(human, { x: 150, y: 105 }, false)).toBe(true);
  });

  it('does not detect a cat behind the human', () => {
    expect(isCatDetected(human, { x: 70, y: 100 }, false)).toBe(false);
  });

  it('does not detect a cat outside view distance', () => {
    expect(isCatDetected(human, { x: 190, y: 100 }, false)).toBe(false);
  });

  it('does not detect a hidden cat', () => {
    expect(isCatDetected(human, { x: 150, y: 105 }, true)).toBe(false);
  });
});

describe('getDetectionDangerLevel', () => {
  it('reports detected, warning, and safe levels for HUD feedback', () => {
    expect(getDetectionDangerLevel(human, { x: 150, y: 105 }, false)).toBe('detected');
    expect(getDetectionDangerLevel(human, { x: 184, y: 105 }, false)).toBe('warning');
    expect(getDetectionDangerLevel(human, { x: 230, y: 105 }, false)).toBe('safe');
  });

  it('keeps a hidden cat safe even inside the warning area', () => {
    expect(getDetectionDangerLevel(human, { x: 184, y: 105 }, true)).toBe('safe');
  });
});
