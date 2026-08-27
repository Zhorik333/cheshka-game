import { describe, expect, it } from 'vitest';
import { getResultRank } from './resultRank';

describe('getResultRank', () => {
  it('gives cozy titles based on score, posters, and survived nights', () => {
    expect(getResultRank({ score: 30, postersTorn: 2, nightsSurvived: 0 })).toEqual({
      title: 'Домашняя разведчица',
      description: 'Чешка только присматривается к двору.',
    });

    expect(getResultRank({ score: 150, postersTorn: 8, nightsSurvived: 1 })).toEqual({
      title: 'Будванская хулиганка',
      description: 'Объявления дрожат, люди светят фонариками зря.',
    });

    expect(getResultRank({ score: 320, postersTorn: 18, nightsSurvived: 3 })).toEqual({
      title: 'Легенда ночного двора',
      description: 'Чешка почти стала городским мифом.',
    });
  });
});
