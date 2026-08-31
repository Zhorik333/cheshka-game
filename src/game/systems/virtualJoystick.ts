import type { Point } from '../utils/movement';

export type VirtualJoystickConfig = {
  maxRadius: number;
  deadZoneRadius: number;
};

export type VirtualJoystickFrame = {
  origin: Point;
  pointer: Point;
  direction: Point;
  strength: number;
};

export function getVirtualJoystickFrame(
  origin: Point,
  pointer: Point,
  config: VirtualJoystickConfig,
): VirtualJoystickFrame {
  const dx = pointer.x - origin.x;
  const dy = pointer.y - origin.y;
  const distance = Math.hypot(dx, dy);

  if (distance <= config.deadZoneRadius || distance === 0) {
    return {
      origin: { ...origin },
      pointer: { ...pointer },
      direction: { x: 0, y: 0 },
      strength: 0,
    };
  }

  const normalized = {
    x: dx / distance,
    y: dy / distance,
  };

  return {
    origin: { ...origin },
    pointer: {
      x: origin.x + normalized.x * Math.min(distance, config.maxRadius),
      y: origin.y + normalized.y * Math.min(distance, config.maxRadius),
    },
    direction: normalized,
    strength: Math.min(1, distance / config.maxRadius),
  };
}

export function getVirtualJoystickTarget(
  current: Point,
  direction: Point,
  lookAheadDistance: number,
): Point {
  return {
    x: current.x + direction.x * lookAheadDistance,
    y: current.y + direction.y * lookAheadDistance,
  };
}
