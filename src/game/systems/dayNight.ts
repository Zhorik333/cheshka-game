export type DayNightPhase = 'day' | 'toNight' | 'night' | 'toDay';

export type DayNightConfig = {
  dayMs: number;
  nightMs: number;
  transitionMs: number;
};

export type DayNightState = DayNightConfig & {
  phase: DayNightPhase;
  remainingMs: number;
  cycle: number;
};

export function createDayNightState(config: DayNightConfig): DayNightState {
  return {
    ...config,
    phase: 'day',
    remainingMs: config.dayMs,
    cycle: 1,
  };
}

export function advanceDayNight(state: DayNightState, deltaMs: number): DayNightState {
  let next = { ...state, remainingMs: state.remainingMs - deltaMs };

  while (next.remainingMs <= 0) {
    const overflowMs = Math.abs(next.remainingMs);
    next = switchPhase(next, overflowMs);
  }

  return next;
}

function switchPhase(state: DayNightState, overflowMs: number): DayNightState {
  switch (state.phase) {
    case 'day':
      return { ...state, phase: 'toNight', remainingMs: state.transitionMs - overflowMs };
    case 'toNight':
      return { ...state, phase: 'night', remainingMs: state.nightMs - overflowMs };
    case 'night':
      return { ...state, phase: 'toDay', remainingMs: state.transitionMs - overflowMs };
    case 'toDay':
      return { ...state, phase: 'day', remainingMs: state.dayMs - overflowMs, cycle: state.cycle + 1 };
  }
}

export function getPhaseLabel(phase: DayNightPhase): string {
  switch (phase) {
    case 'day':
      return '☀ День';
    case 'toNight':
      return '🌆 Смеркается';
    case 'night':
      return '🌙 Ночь';
    case 'toDay':
      return '🌅 Рассвет';
  }
}

export function isNightLikePhase(phase: DayNightPhase): boolean {
  return phase === 'night' || phase === 'toDay';
}

export function fastForwardToPhaseEnd(state: DayNightState): DayNightState {
  return { ...state, remainingMs: 1 };
}
