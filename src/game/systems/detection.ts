import { distance, type Point } from '../utils/movement';
import { normalizeVector } from './patrol';

export type DetectionHuman = {
  x: number;
  y: number;
  facing: Point;
  viewDistance: number;
  viewAngleDegrees: number;
};

export function isCatDetected(human: DetectionHuman, catPosition: Point, catIsHidden: boolean): boolean {
  if (catIsHidden) {
    return false;
  }

  const humanPosition = { x: human.x, y: human.y };
  const catDistance = distance(humanPosition, catPosition);

  if (catDistance > human.viewDistance || catDistance === 0) {
    return false;
  }

  const facing = normalizeVector(human.facing);
  const toCat = normalizeVector({ x: catPosition.x - human.x, y: catPosition.y - human.y });
  const dot = facing.x * toCat.x + facing.y * toCat.y;
  const angleToCat = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);

  return angleToCat <= human.viewAngleDegrees / 2;
}
