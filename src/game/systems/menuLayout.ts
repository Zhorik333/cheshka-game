import type { Size } from './viewport';

export type MenuLayout = {
  titleFontPx: number;
  subtitleFontPx: number;
  footerFontPx: number;
  textWrapWidth: number;
  buttonWidth: number;
  buttonHeight: number;
};

export function getMenuLayout(size: Size): MenuLayout {
  const compact = size.width < 520;

  return {
    titleFontPx: compact ? 28 : 42,
    subtitleFontPx: compact ? 16 : 20,
    footerFontPx: compact ? 15 : 18,
    textWrapWidth: compact ? Math.max(280, size.width - 48) : 720,
    buttonWidth: compact ? Math.min(280, size.width - 64) : 260,
    buttonHeight: compact ? 58 : 64,
  };
}
