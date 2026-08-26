import { describe, expect, it } from 'vitest';
import { advancePatrol, type PatrolState } from './patrol';

const patrol: PatrolState = {
  x: 0,
  y: 0,
  targetIndex: 1,
  path: [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
  ],
};

describe('advancePatrol', () => {
  it('moves a patrol toward its current target', () => {
    const next = advancePatrol(patrol, 4);

    expect(next).toEqual({
      x: 4,
      y: 0,
      targetIndex: 1,
      path: patrol.path,
      facing: { x: 1, y: 0 },
    });
  });

  it('switches to the next path point after reaching the target', () => {
    const next = advancePatrol({ ...patrol, x: 8 }, 4);

    expect(next.x).toBe(10);
    expect(next.y).toBe(0);
    expect(next.targetIndex).toBe(0);
    expect(next.facing).toEqual({ x: 1, y: 0 });
  });
});
