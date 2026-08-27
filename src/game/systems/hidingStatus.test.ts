import { describe, expect, it } from 'vitest';
import { getHidingStatus, updateHidingStatus } from './hidingStatus';

describe('hidingStatus', () => {
  it('describes whether Cheshka is visible or hidden for the HUD', () => {
    expect(getHidingStatus(true)).toEqual({ label: 'Укрытие: в кустах', color: '#2e7d32' });
    expect(getHidingStatus(false)).toEqual({ label: 'Укрытие: на виду', color: '#b3261e' });
  });

  it('reports enter and exit events only when the hidden state changes', () => {
    expect(updateHidingStatus(false, true)).toEqual({ isHidden: true, event: 'entered' });
    expect(updateHidingStatus(true, true)).toEqual({ isHidden: true, event: 'none' });
    expect(updateHidingStatus(true, false)).toEqual({ isHidden: false, event: 'exited' });
  });
});
