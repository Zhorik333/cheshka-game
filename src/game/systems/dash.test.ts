import { describe, expect, it } from 'vitest';
import { createDashState, performDash } from './dash';

describe('performDash', () => {
  it('moves the cat toward the target by the dash distance', () => {
    const state = createDashState({ distance: 90, cooldownMs: 2_500 });
    const result = performDash(state, { x: 0, y: 0 }, { x: 200, y: 0 }, 1_000);

    expect(result.dashed).toBe(true);
    expect(result.position).toEqual({ x: 90, y: 0 });
    expect(result.state.availableAtMs).toBe(3_500);
  });

  it('does not overshoot a nearby target', () => {
    const state = createDashState({ distance: 90, cooldownMs: 2_500 });
    const result = performDash(state, { x: 0, y: 0 }, { x: 35, y: 0 }, 1_000);

    expect(result.dashed).toBe(true);
    expect(result.position).toEqual({ x: 35, y: 0 });
  });

  it('does not move while the dash is cooling down', () => {
    const coolingDown = {
      ...createDashState({ distance: 90, cooldownMs: 2_500 }),
      availableAtMs: 3_500,
    };
    const result = performDash(coolingDown, { x: 0, y: 0 }, { x: 200, y: 0 }, 2_000);

    expect(result.dashed).toBe(false);
    expect(result.position).toEqual({ x: 0, y: 0 });
    expect(result.state).toEqual(coolingDown);
  });
});
