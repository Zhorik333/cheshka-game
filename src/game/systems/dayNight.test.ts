import { describe, expect, it } from 'vitest';
import { advanceDayNight, createDayNightState } from './dayNight';

describe('advanceDayNight', () => {
  it('starts on day one with the configured day duration', () => {
    const state = createDayNightState({ dayMs: 60_000, nightMs: 45_000, transitionMs: 3_000 });

    expect(state.phase).toBe('day');
    expect(state.cycle).toBe(1);
    expect(state.remainingMs).toBe(60_000);
  });

  it('moves from day into the night transition when day time expires', () => {
    const state = createDayNightState({ dayMs: 60_000, nightMs: 45_000, transitionMs: 3_000 });
    const next = advanceDayNight(state, 60_000);

    expect(next.phase).toBe('toNight');
    expect(next.remainingMs).toBe(3_000);
    expect(next.cycle).toBe(1);
  });

  it('moves from night into the day transition when night time expires', () => {
    const state = {
      ...createDayNightState({ dayMs: 60_000, nightMs: 45_000, transitionMs: 3_000 }),
      phase: 'night' as const,
      remainingMs: 45_000,
    };
    const next = advanceDayNight(state, 45_000);

    expect(next.phase).toBe('toDay');
    expect(next.remainingMs).toBe(3_000);
  });

  it('starts the next cycle after the transition back to day', () => {
    const state = {
      ...createDayNightState({ dayMs: 60_000, nightMs: 45_000, transitionMs: 3_000 }),
      phase: 'toDay' as const,
      remainingMs: 3_000,
    };
    const next = advanceDayNight(state, 3_000);

    expect(next.phase).toBe('day');
    expect(next.remainingMs).toBe(60_000);
    expect(next.cycle).toBe(2);
  });

  it('carries overflow time into the next phase', () => {
    const state = createDayNightState({ dayMs: 60_000, nightMs: 45_000, transitionMs: 3_000 });
    const next = advanceDayNight(state, 61_000);

    expect(next.phase).toBe('toNight');
    expect(next.remainingMs).toBe(2_000);
  });
});
