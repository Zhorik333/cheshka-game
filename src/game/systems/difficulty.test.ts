import { describe, expect, it } from 'vitest';
import { getCycleDifficulty } from './difficulty';

describe('getCycleDifficulty', () => {
  it('starts the first cycle with five posters and two humans', () => {
    expect(getCycleDifficulty(1)).toEqual({
      posterCount: 5,
      humanCount: 2,
      humanSpeedMultiplier: 1,
      nightViewMultiplier: 1,
    });
  });

  it('adds posters and humans over the first three cycles', () => {
    expect(getCycleDifficulty(2).posterCount).toBe(7);
    expect(getCycleDifficulty(2).humanCount).toBe(3);
    expect(getCycleDifficulty(3).posterCount).toBe(9);
    expect(getCycleDifficulty(3).humanCount).toBe(4);
  });

  it('caps poster and human count so the map stays playable', () => {
    expect(getCycleDifficulty(10).posterCount).toBe(10);
    expect(getCycleDifficulty(10).humanCount).toBe(4);
  });

  it('increases speed and night view gradually', () => {
    expect(getCycleDifficulty(3).humanSpeedMultiplier).toBeCloseTo(1.16);
    expect(getCycleDifficulty(3).nightViewMultiplier).toBeCloseTo(1.12);
  });
});
