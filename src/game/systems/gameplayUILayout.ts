import type { Size } from './viewport';

export type GameplayUILayout = {
  hudFontPx: number;
  objectiveFontPx: number;
  footerFontPx: number;
  footerHint: string;
  footerWrapWidth: number;
  devHint: string;
  soundButton: {
    width: number;
    height: number;
  };
};

export function getGameplayUILayout(size: Size, includeDevFooter: boolean): GameplayUILayout {
  const compact = size.width < 520;

  return {
    hudFontPx: compact ? 14 : 20,
    objectiveFontPx: compact ? 14 : 18,
    footerFontPx: compact ? 13 : 18,
    footerHint: compact ? 'Джойстик: веди пальцем ♪' : 'Веди пальцем по экрану: невидимый джойстик управляет Чешкой ♪',
    footerWrapWidth: compact ? (includeDevFooter ? 210 : 235) : 720,
    devHint: compact ? 'Dev: N = фаза' : 'Dev: N = следующая фаза',
    soundButton: {
      width: compact ? 112 : 132,
      height: compact ? 38 : 42,
    },
  };
}
