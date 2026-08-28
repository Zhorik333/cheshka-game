import { describe, expect, it } from 'vitest';
import { distance } from '../utils/movement';
import { FIRST_LEVEL_DESIGN, getFirstLevelBushes, getFirstLevelHumanPatrols, getFirstLevelPosterSpawnPoints } from './levelDesign';

describe('first level design', () => {
  it('has a readable first-cycle route: start, five posters, two patrols and hiding spots', () => {
    expect(FIRST_LEVEL_DESIGN.name).toBe('Будванский дворик');
    expect(FIRST_LEVEL_DESIGN.playerSpawn).toEqual({ x: 520, y: 585 });
    expect(getFirstLevelPosterSpawnPoints().length).toBeGreaterThanOrEqual(10);
    expect(getFirstLevelPosterSpawnPoints().slice(0, 5)).toHaveLength(5);
    expect(getFirstLevelHumanPatrols(2)).toHaveLength(2);
    expect(getFirstLevelBushes().length).toBeGreaterThanOrEqual(3);
  });

  it('keeps the first posters away from the exact spawn so the player must move', () => {
    const firstCyclePosters = getFirstLevelPosterSpawnPoints().slice(0, 5);

    for (const poster of firstCyclePosters) {
      expect(distance(FIRST_LEVEL_DESIGN.playerSpawn, poster)).toBeGreaterThan(120);
    }
  });

  it('orders patrol unlocks from simple horizontal routes to harder extra routes', () => {
    const patrols = getFirstLevelHumanPatrols(4);

    expect(patrols[0].id).toBe('wall-guard');
    expect(patrols[1].id).toBe('cafe-waiter');
    expect(patrols[2].id).toBe('promenade-runner');
    expect(patrols[3].id).toBe('side-street-neighbor');
  });

  it('returns defensive copies of mutable level points', () => {
    const posters = getFirstLevelPosterSpawnPoints();
    posters[0].x = -999;

    expect(getFirstLevelPosterSpawnPoints()[0].x).toBe(238);
  });
});
