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

export type LevelSignpost = Point & {
  id: string;
  role: 'tutorial-safe-pocket' | 'timing-crossing' | 'risk-reward-shortcut' | 'night-hideout';
  label: string;
  color: number;
};

export type LevelMischiefProp = Point & {
  id: string;
  kind: 'fish-cart' | 'poster-board' | 'laundry' | 'trash-bin' | 'cafe-menu' | 'paw-trail';
  label?: string;
  width?: number;
  height?: number;
  radius?: number;
  fill: number;
  stroke?: number;
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
  signposts: LevelSignpost[];
  mischiefProps: LevelMischiefProp[];
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
    { id: 'oleander-night-pocket', x: 815, y: 520, radius: 36 },
  ],
  signposts: [
    { id: 'start-pocket-sign', role: 'tutorial-safe-pocket', label: 'тихий старт', x: 398, y: 548, color: 0x2f7d3b },
    { id: 'wall-crossing-sign', role: 'timing-crossing', label: 'жди проход', x: 505, y: 222, color: 0xc77700 },
    { id: 'sea-shortcut-sign', role: 'risk-reward-shortcut', label: 'быстрый риск', x: 548, y: 636, color: 0x6d4c9f },
    { id: 'night-hideout-sign', role: 'night-hideout', label: 'нырнуть в куст', x: 760, y: 514, color: 0x2e7d32 },
  ],
  mischiefProps: [
    { id: 'start-paw-trail', kind: 'paw-trail', x: 292, y: 546, width: 128, height: 30, fill: 0x7c4d2b },
    { id: 'wall-poster-board-left', kind: 'poster-board', x: 238, y: 92, width: 76, height: 34, fill: 0xfff1a0, stroke: 0x7d6824, label: 'розыск' },
    { id: 'wall-poster-board-center', kind: 'poster-board', x: 505, y: 93, width: 82, height: 34, fill: 0xfff1a0, stroke: 0x7d6824, label: 'листовки' },
    { id: 'fish-cart-risk', kind: 'fish-cart', x: 690, y: 544, width: 92, height: 46, fill: 0x8ab9c8, stroke: 0x3d6f7d, label: 'рыба' },
    { id: 'cafe-menu-lure', kind: 'cafe-menu', x: 760, y: 345, width: 52, height: 64, fill: 0x3f2a1d, stroke: 0xfff3dc, label: 'меню' },
    { id: 'alley-trash-bin', kind: 'trash-bin', x: 184, y: 452, width: 42, height: 46, fill: 0x52735a, stroke: 0x25412d, label: 'бак' },
    { id: 'laundry-bait', kind: 'laundry', x: 340, y: 132, width: 138, height: 18, fill: 0xffffff, stroke: 0xb05c7a, label: 'бельё' },
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

export function getFirstLevelSignposts(): LevelSignpost[] {
  return FIRST_LEVEL_DESIGN.signposts.map((signpost) => ({ ...signpost }));
}

export function getFirstLevelMischiefProps(): LevelMischiefProp[] {
  return FIRST_LEVEL_DESIGN.mischiefProps.map((prop) => ({ ...prop }));
}
