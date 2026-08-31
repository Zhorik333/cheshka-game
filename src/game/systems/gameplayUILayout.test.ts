import { describe, expect, it } from 'vitest';
import { getGameplayUILayout } from './gameplayUILayout';

describe('gameplayUILayout', () => {
  it('uses compact HUD and short hint text on portrait phones', () => {
    const layout = getGameplayUILayout({ width: 390, height: 844 }, false);

    expect(layout.hudFontPx).toBeLessThanOrEqual(14);
    expect(layout.footerHint).toBe('Джойстик: веди пальцем ♪');
    expect(layout.footerWrapWidth).toBeLessThanOrEqual(240);
    expect(layout.soundButton.width).toBeLessThanOrEqual(112);
  });

  it('keeps room for dev footer controls in development layout', () => {
    const layout = getGameplayUILayout({ width: 390, height: 844 }, true);

    expect(layout.devHint).toBe('Dev: N = фаза');
    expect(layout.footerWrapWidth).toBeLessThanOrEqual(220);
  });
});
