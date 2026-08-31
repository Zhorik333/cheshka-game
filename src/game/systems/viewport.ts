import type { Point } from '../utils/movement';

export type Size = {
  width: number;
  height: number;
};

export type RectBounds = Size & Point;

export type MovementBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type CameraFollowConfig = {
  lerpX: number;
  lerpY: number;
  deadzone: Size;
};

export const GAME_VIEWPORT: Size = {
  width: 390,
  height: 844,
};

export const WORLD_BOUNDS: RectBounds = {
  x: 0,
  y: 0,
  width: 1000,
  height: 920,
};

export const CAMERA_DEADZONE: Size = {
  width: 150,
  height: 230,
};

export function getCatMovementBounds(edgeMargin: number): MovementBounds {
  return {
    minX: WORLD_BOUNDS.x + edgeMargin,
    maxX: WORLD_BOUNDS.x + WORLD_BOUNDS.width - edgeMargin,
    minY: WORLD_BOUNDS.y + edgeMargin,
    maxY: WORLD_BOUNDS.y + WORLD_BOUNDS.height - edgeMargin,
  };
}

export function getCameraFollowConfig(): CameraFollowConfig {
  return {
    lerpX: 0.14,
    lerpY: 0.14,
    deadzone: { ...CAMERA_DEADZONE },
  };
}
