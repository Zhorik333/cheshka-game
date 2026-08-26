export type Point = {
  x: number;
  y: number;
};

export function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export function moveTowards(current: Point, target: Point, maxDistance: number): Point {
  const remainingDistance = distance(current, target);

  if (remainingDistance === 0 || remainingDistance <= maxDistance) {
    return { ...target };
  }

  const ratio = maxDistance / remainingDistance;

  return {
    x: current.x + (target.x - current.x) * ratio,
    y: current.y + (target.y - current.y) * ratio,
  };
}
