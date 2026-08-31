import { describe, expect, it } from 'vitest';
import { getVirtualJoystickFrame, getVirtualJoystickTarget } from './virtualJoystick';

const config = {
  maxRadius: 64,
  deadZoneRadius: 8,
};

describe('virtualJoystick', () => {
  it('returns no movement inside the dead zone', () => {
    const frame = getVirtualJoystickFrame({ x: 100, y: 100 }, { x: 104, y: 103 }, config);

    expect(frame.direction).toEqual({ x: 0, y: 0 });
    expect(frame.strength).toBe(0);
  });

  it('normalizes direction outside the dead zone', () => {
    const frame = getVirtualJoystickFrame({ x: 100, y: 100 }, { x: 130, y: 140 }, config);

    expect(frame.direction.x).toBeCloseTo(0.6);
    expect(frame.direction.y).toBeCloseTo(0.8);
    expect(frame.strength).toBeCloseTo(50 / 64);
  });

  it('clamps the invisible stick pointer to max radius', () => {
    const frame = getVirtualJoystickFrame({ x: 20, y: 20 }, { x: 220, y: 20 }, config);

    expect(frame.pointer).toEqual({ x: 84, y: 20 });
    expect(frame.direction).toEqual({ x: 1, y: 0 });
    expect(frame.strength).toBe(1);
  });

  it('builds a far target in the joystick direction for dash and facing', () => {
    expect(getVirtualJoystickTarget({ x: 50, y: 60 }, { x: 0, y: -1 }, 120)).toEqual({ x: 50, y: -60 });
  });
});
