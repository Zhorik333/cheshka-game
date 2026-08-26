import { describe, expect, it } from 'vitest';
import { HOW_TO_PLAY_STEPS, getHowToPlayText } from './howToPlay';

describe('how to play content', () => {
  it('explains every core MVP mechanic', () => {
    const text = getHowToPlayText();

    expect(text).toContain('Днём срывай объявления');
    expect(text).toContain('Не попадай в зоны видимости людей');
    expect(text).toContain('Прячься в кустах');
    expect(text).toContain('Ночью избегай фонариков');
    expect(text).toContain('После 3 поимок Чешку вернут домой');
  });

  it('keeps the instruction short enough for a Telegram phone screen', () => {
    expect(HOW_TO_PLAY_STEPS).toHaveLength(5);
    expect(getHowToPlayText().length).toBeLessThan(360);
  });
});
