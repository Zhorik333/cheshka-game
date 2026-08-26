import { describe, expect, it } from 'vitest';
import { loadBestScore, saveBestScoreIfHigher, type ScoreStorage } from './bestScore';

function createStorage(initial: Record<string, string> = {}): ScoreStorage {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
  };
}

describe('best score storage', () => {
  it('loads zero when no best score exists', () => {
    expect(loadBestScore(createStorage())).toBe(0);
  });

  it('loads a saved best score', () => {
    expect(loadBestScore(createStorage({ cheshkaBestScore: '120' }))).toBe(120);
  });

  it('ignores invalid saved values', () => {
    expect(loadBestScore(createStorage({ cheshkaBestScore: 'not-a-number' }))).toBe(0);
  });

  it('saves and reports a new record when the current score is higher', () => {
    const storage = createStorage({ cheshkaBestScore: '90' });
    const result = saveBestScoreIfHigher(storage, 140);

    expect(result).toEqual({ bestScore: 140, isNewRecord: true });
    expect(loadBestScore(storage)).toBe(140);
  });

  it('keeps the old record when the current score is lower', () => {
    const storage = createStorage({ cheshkaBestScore: '200' });
    const result = saveBestScoreIfHigher(storage, 140);

    expect(result).toEqual({ bestScore: 200, isNewRecord: false });
    expect(loadBestScore(storage)).toBe(200);
  });
});
