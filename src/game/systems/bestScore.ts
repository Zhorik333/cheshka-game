const BEST_SCORE_KEY = 'cheshkaBestScore';

export type ScoreStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export type BestScoreResult = {
  bestScore: number;
  isNewRecord: boolean;
};

export function loadBestScore(storage: ScoreStorage): number {
  const rawValue = storage.getItem(BEST_SCORE_KEY);
  const parsedValue = rawValue === null ? 0 : Number.parseInt(rawValue, 10);

  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : 0;
}

export function saveBestScoreIfHigher(storage: ScoreStorage, score: number): BestScoreResult {
  const currentBest = loadBestScore(storage);

  if (score <= currentBest) {
    return { bestScore: currentBest, isNewRecord: false };
  }

  storage.setItem(BEST_SCORE_KEY, String(score));
  return { bestScore: score, isNewRecord: true };
}
