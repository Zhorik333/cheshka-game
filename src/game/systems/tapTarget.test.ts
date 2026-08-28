import { describe, expect, it } from 'vitest';
import { createGameplayTapBlockers, isGameplayTap, isPointInsideTapBlocker } from './tapTarget';

describe('tapTarget', () => {
  it('blocks taps inside rectangular HUD zones', () => {
    expect(isPointInsideTapBlocker({ x: 24, y: 24 }, { kind: 'rect', x: 0, y: 0, width: 200, height: 80 })).toBe(true);
    expect(isPointInsideTapBlocker({ x: 210, y: 24 }, { kind: 'rect', x: 0, y: 0, width: 200, height: 80 })).toBe(false);
  });

  it('blocks taps inside circular action buttons', () => {
    const blocker = { kind: 'circle' as const, center: { x: 922, y: 628 }, radius: 56 };

    expect(isPointInsideTapBlocker({ x: 922, y: 628 }, blocker)).toBe(true);
    expect(isPointInsideTapBlocker({ x: 978, y: 628 }, blocker)).toBe(true);
    expect(isPointInsideTapBlocker({ x: 979, y: 628 }, blocker)).toBe(false);
  });

  it('keeps normal playfield taps available', () => {
    const blockers = createGameplayTapBlockers(1000, 720);

    expect(isGameplayTap({ x: 520, y: 360 }, blockers)).toBe(true);
    expect(isGameplayTap({ x: 120, y: 104 }, blockers)).toBe(false);
    expect(isGameplayTap({ x: 922, y: 628 }, blockers)).toBe(false);
    expect(isGameplayTap({ x: 520, y: 700 }, blockers)).toBe(false);
  });

  it('can add an explicit dev footer blocker without changing the playfield', () => {
    const blockers = createGameplayTapBlockers(1000, 720, true);

    expect(isGameplayTap({ x: 880, y: 700 }, blockers)).toBe(false);
    expect(isGameplayTap({ x: 750, y: 620 }, blockers)).toBe(true);
  });
});
