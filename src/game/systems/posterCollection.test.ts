import { describe, expect, it } from 'vitest';
import { collectNearbyPosters, type PosterState } from './posterCollection';

const posters: PosterState[] = [
  { id: 'p1', x: 100, y: 100, collected: false },
  { id: 'p2', x: 180, y: 100, collected: false },
  { id: 'p3', x: 100, y: 150, collected: true },
];

describe('collectNearbyPosters', () => {
  it('collects only uncollected posters within the radius and awards 10 points each', () => {
    const result = collectNearbyPosters(posters, { x: 110, y: 105 }, 24);

    expect(result.collectedIds).toEqual(['p1']);
    expect(result.scoreDelta).toBe(10);
    expect(result.posters).toEqual([
      { id: 'p1', x: 100, y: 100, collected: true },
      { id: 'p2', x: 180, y: 100, collected: false },
      { id: 'p3', x: 100, y: 150, collected: true },
    ]);
  });

  it('does not award points for posters that were already collected', () => {
    const result = collectNearbyPosters(posters, { x: 100, y: 150 }, 24);

    expect(result.collectedIds).toEqual([]);
    expect(result.scoreDelta).toBe(0);
  });
});
