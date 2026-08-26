import { distance, moveTowards, type Point } from '../utils/movement';

export type PatrolState = {
  x: number;
  y: number;
  path: Point[];
  targetIndex: number;
  facing?: Point;
};

export function normalizeVector(vector: Point): Point {
  const length = Math.hypot(vector.x, vector.y);

  if (length === 0) {
    return { x: 1, y: 0 };
  }

  return { x: vector.x / length, y: vector.y / length };
}

export function advancePatrol(patrol: PatrolState, maxDistance: number): PatrolState {
  const target = patrol.path[patrol.targetIndex];

  if (!target) {
    return { ...patrol, facing: patrol.facing ?? { x: 1, y: 0 } };
  }

  const current = { x: patrol.x, y: patrol.y };
  const facing = normalizeVector({ x: target.x - patrol.x, y: target.y - patrol.y });
  const next = moveTowards(current, target, maxDistance);
  const reachedTarget = distance(next, target) === 0;

  return {
    ...patrol,
    x: next.x,
    y: next.y,
    targetIndex: reachedTarget ? (patrol.targetIndex + 1) % patrol.path.length : patrol.targetIndex,
    facing,
  };
}
