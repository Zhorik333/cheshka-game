import { describe, expect, it } from 'vitest';
import { getFlashlightPulseFrame, getMovementBobFrame, getPosterPulseFrame } from './ambientAnimation';

describe('ambient animation helpers', () => {
  it('keeps an idle cat stable and bobs only while moving', () => {
    expect(getMovementBobFrame(false, 500)).toEqual({ yOffset: 0, scaleY: 1 });

    const moving = getMovementBobFrame(true, 150);
    expect(Math.abs(moving.yOffset)).toBeGreaterThan(0);
    expect(moving.scaleY).toBeGreaterThanOrEqual(1);
    expect(moving.scaleY).toBeLessThanOrEqual(1.05);
  });

  it('keeps poster glow pulse inside a subtle mobile-readable range', () => {
    const frames = [0, 250, 500, 750, 1000].map((time) => getPosterPulseFrame(time, 120));

    for (const frame of frames) {
      expect(frame.alpha).toBeGreaterThanOrEqual(0.24);
      expect(frame.alpha).toBeLessThanOrEqual(0.44);
      expect(frame.scale).toBeGreaterThanOrEqual(0.94);
      expect(frame.scale).toBeLessThanOrEqual(1.06);
    }
  });

  it('pulses flashlight cones at night but keeps day cones calm', () => {
    expect(getFlashlightPulseFrame(false, 999)).toEqual({ alpha: 0.26, scale: 1 });

    const night = getFlashlightPulseFrame(true, 360);
    expect(night.alpha).toBeGreaterThanOrEqual(0.32);
    expect(night.alpha).toBeLessThanOrEqual(0.46);
    expect(night.scale).toBeGreaterThanOrEqual(0.98);
    expect(night.scale).toBeLessThanOrEqual(1.06);
  });
});
