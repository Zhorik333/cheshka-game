export type HidingStatus = {
  label: string;
  color: string;
};

export type HidingEvent = 'entered' | 'exited' | 'none';

export type HidingStatusUpdate = {
  isHidden: boolean;
  event: HidingEvent;
};

export function getHidingStatus(isHidden: boolean): HidingStatus {
  return isHidden
    ? { label: 'Укрытие: в кустах', color: '#2e7d32' }
    : { label: 'Укрытие: на виду', color: '#b3261e' };
}

export function updateHidingStatus(wasHidden: boolean, isHidden: boolean): HidingStatusUpdate {
  if (wasHidden === isHidden) {
    return { isHidden, event: 'none' };
  }

  return {
    isHidden,
    event: isHidden ? 'entered' : 'exited',
  };
}
