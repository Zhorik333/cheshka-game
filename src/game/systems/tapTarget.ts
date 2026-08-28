import type { Point } from '../utils/movement';

export type CircleTapBlocker = {
  kind: 'circle';
  center: Point;
  radius: number;
};

export type RectTapBlocker = {
  kind: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TapBlocker = CircleTapBlocker | RectTapBlocker;

export function isPointInsideTapBlocker(point: Point, blocker: TapBlocker): boolean {
  if (blocker.kind === 'circle') {
    const dx = point.x - blocker.center.x;
    const dy = point.y - blocker.center.y;
    return Math.sqrt(dx * dx + dy * dy) <= blocker.radius;
  }

  return point.x >= blocker.x
    && point.x <= blocker.x + blocker.width
    && point.y >= blocker.y
    && point.y <= blocker.y + blocker.height;
}

export function isGameplayTap(point: Point, blockers: TapBlocker[]): boolean {
  return !blockers.some((blocker) => isPointInsideTapBlocker(point, blocker));
}

export function createGameplayTapBlockers(width: number, height: number, includeDevFooter = false): TapBlocker[] {
  const blockers: TapBlocker[] = [
    { kind: 'rect', x: 0, y: 0, width: 780, height: 178 },
    { kind: 'circle', center: { x: width - 78, y: height - 92 }, radius: 56 },
    { kind: 'rect', x: 0, y: height - 58, width, height: 58 },
  ];

  if (includeDevFooter) {
    blockers.push({ kind: 'rect', x: width - 270, y: height - 58, width: 270, height: 58 });
  }

  return blockers;
}
