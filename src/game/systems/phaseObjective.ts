import type { DayNightPhase } from './dayNight';

export type PhaseObjectiveInput = {
  phase: DayNightPhase;
  remainingMs: number;
  collectedPosters: number;
  totalPosters: number;
};

export function getPhaseObjective(input: PhaseObjectiveInput): string {
  switch (input.phase) {
    case 'day': {
      const remainingPosters = Math.max(0, input.totalPosters - input.collectedPosters);
      if (remainingPosters === 0) {
        return 'Цель: двор чист — готовься к ночи';
      }
      return `Цель: сорви ещё ${remainingPosters} ${getPosterWord(remainingPosters)}`;
    }
    case 'toNight':
      return 'Цель: спрячься, скоро фонарики';
    case 'night':
      return `Цель: продержись ${Math.ceil(input.remainingMs / 1000)}с до рассвета`;
    case 'toDay':
      return 'Цель: дождись нового дня';
  }
}

function getPosterWord(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return 'объявление';
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'объявления';
  }
  return 'объявлений';
}
