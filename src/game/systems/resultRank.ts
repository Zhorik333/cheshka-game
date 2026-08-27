export type ResultRankInput = {
  score: number;
  postersTorn: number;
  nightsSurvived: number;
};

export type ResultRank = {
  title: string;
  description: string;
};

export function getResultRank(input: ResultRankInput): ResultRank {
  if (input.score >= 300 || input.nightsSurvived >= 3 || input.postersTorn >= 16) {
    return {
      title: 'Легенда ночного двора',
      description: 'Чешка почти стала городским мифом.',
    };
  }

  if (input.score >= 120 || input.nightsSurvived >= 1 || input.postersTorn >= 7) {
    return {
      title: 'Будванская хулиганка',
      description: 'Объявления дрожат, люди светят фонариками зря.',
    };
  }

  return {
    title: 'Домашняя разведчица',
    description: 'Чешка только присматривается к двору.',
  };
}
