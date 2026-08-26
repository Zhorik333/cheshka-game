import { describe, expect, it } from 'vitest';
import { recordCatch, type CatchState } from './catch';

const state: CatchState = {
  catches: 0,
  maxCatches: 3,
  invulnerableUntilMs: 0,
  ended: false,
};

describe('recordCatch', () => {
  it('adds one catch and starts invulnerability', () => {
    const result = recordCatch(state, 1000, 2000);

    expect(result).toEqual({
      catches: 1,
      maxCatches: 3,
      invulnerableUntilMs: 3000,
      ended: false,
    });
  });

  it('ends the session on the third catch', () => {
    const result = recordCatch({ ...state, catches: 2 }, 1000, 2000);

    expect(result.ended).toBe(true);
    expect(result.catches).toBe(3);
  });

  it('ignores catches while Cheshka is invulnerable', () => {
    const result = recordCatch({ ...state, invulnerableUntilMs: 3000 }, 1000, 2000);

    expect(result).toEqual({ ...state, invulnerableUntilMs: 3000 });
  });
});
