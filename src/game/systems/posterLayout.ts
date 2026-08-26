import type { PosterState } from './posterCollection';

export const POSTER_SPAWN_POINTS = [
  { x: 240, y: 86 },
  { x: 505, y: 88 },
  { x: 140, y: 240 },
  { x: 770, y: 255 },
  { x: 720, y: 455 },
  { x: 330, y: 96 },
  { x: 885, y: 330 },
  { x: 190, y: 455 },
  { x: 585, y: 515 },
  { x: 675, y: 92 },
];

export function createPosterStates(count: number): PosterState[] {
  return POSTER_SPAWN_POINTS.slice(0, Math.max(0, count)).map((point, index) => ({
    id: `poster-${index + 1}`,
    x: point.x,
    y: point.y,
    collected: false,
  }));
}
