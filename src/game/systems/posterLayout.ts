import { getFirstLevelPosterSpawnPoints } from './levelDesign';
import type { PosterState } from './posterCollection';

export const POSTER_SPAWN_POINTS = getFirstLevelPosterSpawnPoints();

export function createPosterStates(count: number): PosterState[] {
  return getFirstLevelPosterSpawnPoints().slice(0, Math.max(0, count)).map((point, index) => ({
    id: `poster-${index + 1}`,
    x: point.x,
    y: point.y,
    collected: false,
  }));
}
