export type PosterComboState = {
  streak: number;
  lastCollectedAtMs: number | null;
  windowMs: number;
};

export type PosterComboResult = {
  state: PosterComboState;
  bonusScore: number;
  label: string;
};

const BONUS_PER_EXTRA_POSTER = 5;

export function createPosterComboState(windowMs: number): PosterComboState {
  return {
    streak: 0,
    lastCollectedAtMs: null,
    windowMs,
  };
}

export function recordPosterCombo(
  state: PosterComboState,
  timeMs: number,
  collectedCount: number,
): PosterComboResult {
  if (collectedCount <= 0) {
    return {
      state,
      bonusScore: 0,
      label: '',
    };
  }

  const continuesStreak = state.lastCollectedAtMs !== null && timeMs - state.lastCollectedAtMs <= state.windowMs;
  const streak = (continuesStreak ? state.streak : 0) + collectedCount;
  const bonusScore = Math.max(0, streak - 1) * BONUS_PER_EXTRA_POSTER;
  const label = bonusScore > 0 ? `цепочка x${streak} +${bonusScore}` : `цепочка x${streak}`;

  return {
    state: {
      ...state,
      streak,
      lastCollectedAtMs: timeMs,
    },
    bonusScore,
    label,
  };
}
