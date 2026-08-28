export type CatVisualDesign = {
  bodyColor: number;
  outlineColor: number;
  scarfColor: number;
  hasEars: boolean;
  hasTail: boolean;
  faceFeatureCount: number;
};

export type HumanVisualDesign = {
  coatColor: number;
  headColor: number;
  flashlightDayColor: number;
  flashlightNightColor: number;
  readableSilhouetteParts: number;
};

export const CHESHKA_VISUAL_DESIGN: CatVisualDesign = {
  bodyColor: 0xfff6e5,
  outlineColor: 0x4d2c1d,
  scarfColor: 0xff8fab,
  hasEars: true,
  hasTail: true,
  faceFeatureCount: 7,
};

export const HUMAN_VISUAL_DESIGN: HumanVisualDesign = {
  coatColor: 0x2f62b3,
  headColor: 0xffd1a6,
  flashlightDayColor: 0xff5b4d,
  flashlightNightColor: 0xffd45c,
  readableSilhouetteParts: 5,
};

export function getCatReadableFeatureLabels(design = CHESHKA_VISUAL_DESIGN): string[] {
  const labels = ['body', 'head', 'eyes', 'nose', 'whiskers', 'name-label'];
  if (design.hasEars) {
    labels.push('ears');
  }
  if (design.hasTail) {
    labels.push('tail');
  }
  return labels;
}

export function getFlashlightAlpha(isNight: boolean): number {
  return isNight ? 0.38 : 0.26;
}
