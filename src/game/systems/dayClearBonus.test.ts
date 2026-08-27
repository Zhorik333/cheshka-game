import { describe, expect, it } from 'vitest';
import { evaluateDayClearBonus } from './dayClearBonus';

describe('evaluateDayClearBonus', () => {
  it('awards a once-per-day bonus when every poster has been torn down during day', () => {
    expect(evaluateDayClearBonus({ phase: 'day', collectedCount: 5, totalCount: 5, alreadyAwarded: false })).toEqual({
      shouldAward: true,
      bonusScore: 40,
      label: 'Двор очищен! +40',
    });
  });

  it('does not award outside day, before all posters are collected, or after it was awarded', () => {
    expect(evaluateDayClearBonus({ phase: 'night', collectedCount: 5, totalCount: 5, alreadyAwarded: false }).shouldAward).toBe(false);
    expect(evaluateDayClearBonus({ phase: 'day', collectedCount: 4, totalCount: 5, alreadyAwarded: false }).shouldAward).toBe(false);
    expect(evaluateDayClearBonus({ phase: 'day', collectedCount: 5, totalCount: 5, alreadyAwarded: true }).shouldAward).toBe(false);
  });
});
