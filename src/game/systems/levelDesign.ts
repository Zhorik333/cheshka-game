import type { Point } from '../utils/movement';

export type LevelZone = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: number;
  stroke?: number;
  labelColor: string;
};

export type LevelPath = {
  id: string;
  points: Point[];
  width: number;
  fill: number;
  alpha: number;
};

export type LevelDecoration = {
  id: string;
  kind: 'circle' | 'rect';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  fill: number;
  stroke?: number;
  label?: string;
  labelColor?: string;
};

export type LevelBush = Point & {
  id: string;
  radius: number;
};

export type LevelHumanPatrol = {
  id: string;
  path: Point[];
  speed: number;
  dayView: number;
  nightView: number;
};

export type FirstLevelDesign = {
  name: string;
  playerSpawn: Point;
  zones: LevelZone[];
  paths: LevelPath[];
  bushes: LevelBush[];
  decorations: LevelDecoration[];
  humanPatrols: LevelHumanPatrol[];
  posterSpawnPoints: Point[];
};

export const FIRST_LEVEL_DESIGN: FirstLevelDesign = {
  name: 'Будванский дворик',
  playerSpawn: { x: 520, y: 585 },
  zones: [
    { id: 'old-wall', label: 'стена Старого города', x: 500, y: 35, width: 1000, height: 70, fill: 0x9c8f7b, labelColor: '#f5ead4' },
    { id: 'cheshka-home', label: 'дом Чешки', x: 94, y: 327, width: 132, height: 414, fill: 0xc97854, stroke: 0x8b4b38, labelColor: '#fff0df' },
    { id: 'cafe', label: 'кафе у дворика', x: 852, y: 330, width: 220, height: 160, fill: 0xe6b56f, stroke: 0x7a5132, labelColor: '#563a24' },
    { id: 'promenade', label: 'море / набережная', x: 500, y: 672, width: 1000, height: 96, fill: 0x6db7c8, labelColor: '#ffffff' },
    { id: 'plaza', label: 'солнечная площадь', x: 495, y: 332, width: 270, height: 150, fill: 0xe5d2a8, stroke: 0xb99a67, labelColor: '#6b4f3b' },
  ],
  paths: [
    { id: 'main-stone-lane', points: [{ x: 160, y: 200 }, { x: 822, y: 200 }, { x: 822, y: 565 }, { x: 210, y: 565 }], width: 52, fill: 0xb8aa91, alpha: 0.58 },
    { id: 'home-to-plaza', points: [{ x: 155, y: 345 }, { x: 500, y: 345 }, { x: 706, y: 438 }], width: 44, fill: 0xc9b99c, alpha: 0.54 },
    { id: 'sea-shortcut', points: [{ x: 410, y: 610 }, { x: 646, y: 610 }], width: 38, fill: 0xf1d59d, alpha: 0.64 },
  ],
  bushes: [
    { id: 'olive-bush-home', x: 312, y: 292, radius: 44 },
    { id: 'ivy-bush-wall', x: 525, y: 160, radius: 38 },
    { id: 'lavender-bush-cafe', x: 625, y: 405, radius: 48 },
    { id: 'palm-shadow', x: 245, y: 500, radius: 34 },
  ],
  decorations: [
    { id: 'fountain', kind: 'circle', x: 500, y: 333, radius: 34, fill: 0x93cddd, stroke: 0x4e8fa0, label: 'фонтан', labelColor: '#ffffff' },
    { id: 'blue-car', kind: 'rect', x: 430, y: 456, width: 122, height: 52, fill: 0x5d6f8f, stroke: 0x28364e, label: 'машина', labelColor: '#ffffff' },
    { id: 'fish-crates', kind: 'rect', x: 695, y: 592, width: 86, height: 42, fill: 0x9b6d42, stroke: 0x5f3f24, label: 'ящики', labelColor: '#fff2d8' },
    { id: 'cafe-table-1', kind: 'circle', x: 770, y: 277, radius: 18, fill: 0x7c4d2b, stroke: 0xfff3dc },
    { id: 'cafe-table-2', kind: 'circle', x: 904, y: 398, radius: 18, fill: 0x7c4d2b, stroke: 0xfff3dc },
    { id: 'laundry-line', kind: 'rect', x: 216, y: 134, width: 142, height: 10, fill: 0xffffff, stroke: 0x7c4d2b, label: 'бельё', labelColor: '#7c4d2b' },
    { id: 'cat-start-rug', kind: 'rect', x: 520, y: 585, width: 96, height: 44, fill: 0xffdca8, stroke: 0x9b5f3d, label: 'старт', labelColor: '#7c4d2b' },
  ],
  humanPatrols: [
    { id: 'wall-guard', path: [{ x: 250, y: 190 }, { x: 720, y: 190 }], speed: 80, dayView: 115, nightView: 190 },
    { id: 'cafe-waiter', path: [{ x: 770, y: 465 }, { x: 260, y: 465 }], speed: 70, dayView: 105, nightView: 175 },
    { id: 'promenade-runner', path: [{ x: 220, y: 585 }, { x: 790, y: 585 }], speed: 78, dayView: 110, nightView: 185 },
    { id: 'side-street-neighbor', path: [{ x: 880, y: 160 }, { x: 880, y: 520 }], speed: 72, dayView: 105, nightView: 180 },
  ],
  posterSpawnPoints: [
    { x: 238, y: 92 },
    { x: 505, y: 93 },
    { x: 142, y: 248 },
    { x: 760, y: 252 },
    { x: 710, y: 448 },
    { x: 340, y: 112 },
    { x: 892, y: 330 },
    { x: 190, y: 455 },
    { x: 585, y: 518 },
    { x: 675, y: 105 },
  ],
};

export function getFirstLevelPosterSpawnPoints(): Point[] {
  return FIRST_LEVEL_DESIGN.posterSpawnPoints.map((point) => ({ ...point }));
}

export function getFirstLevelHumanPatrols(count: number): LevelHumanPatrol[] {
  return FIRST_LEVEL_DESIGN.humanPatrols.slice(0, Math.max(0, count)).map((patrol) => ({
    ...patrol,
    path: patrol.path.map((point) => ({ ...point })),
  }));
}

export function getFirstLevelBushes(): LevelBush[] {
  return FIRST_LEVEL_DESIGN.bushes.map((bush) => ({ ...bush }));
}
