import { describe, expect, it } from 'vitest';
import { getMenuLayout } from './menuLayout';

describe('menuLayout', () => {
  it('uses compact readable typography on portrait phones', () => {
    const layout = getMenuLayout({ width: 390, height: 844 });

    expect(layout.titleFontPx).toBeLessThanOrEqual(28);
    expect(layout.subtitleFontPx).toBeLessThanOrEqual(16);
    expect(layout.textWrapWidth).toBeLessThanOrEqual(350);
    expect(layout.buttonWidth).toBeLessThanOrEqual(280);
  });

  it('keeps larger desktop/tablet typography when there is enough width', () => {
    const layout = getMenuLayout({ width: 1024, height: 768 });

    expect(layout.titleFontPx).toBe(42);
    expect(layout.subtitleFontPx).toBe(20);
    expect(layout.buttonWidth).toBe(260);
  });
});
