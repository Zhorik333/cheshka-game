import { distance, type Point } from '../utils/movement';

export type PosterState = {
  id: string;
  x: number;
  y: number;
  collected: boolean;
};

export type PosterCollectionResult = {
  posters: PosterState[];
  collectedIds: string[];
  scoreDelta: number;
};

const POSTER_SCORE = 10;

export function collectNearbyPosters(
  posters: PosterState[],
  catPosition: Point,
  collectionRadius: number,
): PosterCollectionResult {
  const collectedIds: string[] = [];

  const updatedPosters = posters.map((poster) => {
    if (poster.collected) {
      return poster;
    }

    const isNearCat = distance(poster, catPosition) <= collectionRadius;

    if (!isNearCat) {
      return poster;
    }

    collectedIds.push(poster.id);
    return { ...poster, collected: true };
  });

  return {
    posters: updatedPosters,
    collectedIds,
    scoreDelta: collectedIds.length * POSTER_SCORE,
  };
}
