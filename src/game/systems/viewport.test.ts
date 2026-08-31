import { describe, expect, it } from 'vitest';
import {
  CAMERA_DEADZONE,
  GAME_VIEWPORT,
  WORLD_BOUNDS,
  getCameraFollowConfig,
  getCatMovementBounds,
} from './viewport';

describe('viewport', () => {
  it('uses a portrait mobile viewport by default', () => {
    expect(GAME_VIEWPORT.width).toBeLessThan(GAME_VIEWPORT.height);
    expect(GAME_VIEWPORT.width).toBe(390);
    expect(GAME_VIEWPORT.height).toBe(844);
  });

  it('keeps a larger scrollable world around the mobile viewport', () => {
    expect(WORLD_BOUNDS.width).toBeGreaterThan(GAME_VIEWPORT.width * 2);
    expect(WORLD_BOUNDS.height).toBeGreaterThan(GAME_VIEWPORT.height);
  });

  it('keeps cat movement inside world bounds with a cozy edge margin', () => {
    expect(getCatMovementBounds(22)).toEqual({
      minX: 22,
      maxX: WORLD_BOUNDS.width - 22,
      minY: 22,
      maxY: WORLD_BOUNDS.height - 22,
    });
  });

  it('uses a gentle 90s-style follow camera deadzone', () => {
    expect(CAMERA_DEADZONE.width).toBeLessThan(GAME_VIEWPORT.width);
    expect(CAMERA_DEADZONE.height).toBeLessThan(GAME_VIEWPORT.height);
    expect(getCameraFollowConfig()).toEqual({
      lerpX: 0.14,
      lerpY: 0.14,
      deadzone: CAMERA_DEADZONE,
    });
  });
});
