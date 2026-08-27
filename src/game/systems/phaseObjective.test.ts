import { describe, expect, it } from 'vitest';
import { getPhaseObjective } from './phaseObjective';

describe('getPhaseObjective', () => {
  it('tells the player to tear remaining posters during the day', () => {
    expect(getPhaseObjective({ phase: 'day', remainingMs: 42_000, collectedPosters: 2, totalPosters: 5 })).toBe(
      'Цель: сорви ещё 3 объявления',
    );
  });

  it('celebrates a cleared yard while waiting for night', () => {
    expect(getPhaseObjective({ phase: 'day', remainingMs: 1_000, collectedPosters: 5, totalPosters: 5 })).toBe(
      'Цель: двор чист — готовься к ночи',
    );
  });

  it('warns about sunset transition', () => {
    expect(getPhaseObjective({ phase: 'toNight', remainingMs: 2_200, collectedPosters: 5, totalPosters: 5 })).toBe(
      'Цель: спрячься, скоро фонарики',
    );
  });

  it('shows a survival countdown during night', () => {
    expect(getPhaseObjective({ phase: 'night', remainingMs: 14_200, collectedPosters: 5, totalPosters: 5 })).toBe(
      'Цель: продержись 15с до рассвета',
    );
  });

  it('uses a soft reset hint during dawn transition', () => {
    expect(getPhaseObjective({ phase: 'toDay', remainingMs: 1_200, collectedPosters: 5, totalPosters: 5 })).toBe(
      'Цель: дождись нового дня',
    );
  });
});
