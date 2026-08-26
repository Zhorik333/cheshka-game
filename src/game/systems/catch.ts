export type CatchState = {
  catches: number;
  maxCatches: number;
  invulnerableUntilMs: number;
  ended: boolean;
};

export function recordCatch(state: CatchState, nowMs: number, invulnerabilityDurationMs: number): CatchState {
  if (state.ended || nowMs < state.invulnerableUntilMs) {
    return state;
  }

  const catches = Math.min(state.catches + 1, state.maxCatches);

  return {
    ...state,
    catches,
    invulnerableUntilMs: nowMs + invulnerabilityDurationMs,
    ended: catches >= state.maxCatches,
  };
}
