import type { DayNightPhase } from './dayNight';

export type DayClearBonusInput = {
  phase: DayNightPhase;
  collectedCount: number;
  totalCount: number;
  alreadyAwarded: boolean;
};

export type DayClearBonusResult = {
  shouldAward: boolean;
  bonusScore: number;
  label: string;
};

const DAY_CLEAR_BONUS_SCORE = 40;

export function evaluateDayClearBonus(input: DayClearBonusInput): DayClearBonusResult {
  const shouldAward = input.phase === 'day'
    && !input.alreadyAwarded
    && input.totalCount > 0
    && input.collectedCount >= input.totalCount;

  if (!shouldAward) {
    return {
      shouldAward: false,
      bonusScore: 0,
      label: '',
    };
  }

  return {
    shouldAward: true,
    bonusScore: DAY_CLEAR_BONUS_SCORE,
    label: `Двор очищен! +${DAY_CLEAR_BONUS_SCORE}`,
  };
}
