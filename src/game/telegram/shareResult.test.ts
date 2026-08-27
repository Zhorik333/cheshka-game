import { describe, expect, it } from 'vitest';
import { buildTelegramShareUrl, shareGameResult, type ShareResultEnvironment } from './shareResult';

describe('share result', () => {
  it('builds a Telegram share URL with the game link and cozy result text', () => {
    const shareUrl = buildTelegramShareUrl({
      gameUrl: 'https://zhorik333.github.io/cheshka-game/',
      score: 145,
      postersTorn: 12,
      nightsSurvived: 2,
      rankTitle: 'Ночной разведчик',
    });

    const parsed = new URL(shareUrl);
    expect(parsed.origin + parsed.pathname).toBe('https://t.me/share/url');
    expect(parsed.searchParams.get('url')).toBe('https://zhorik333.github.io/cheshka-game/');
    expect(parsed.searchParams.get('text')).toBe(
      'Я помог Чешке сбежать в Будве! 🐾 Рейтинг: 145, объявления: 12, ночей: 2. Звание: Ночной разведчик. Попробуй побить мой результат!',
    );
  });

  it('opens the share URL through Telegram when available', () => {
    const openedLinks: string[] = [];
    const env: ShareResultEnvironment = {
      locationHref: 'https://zhorik333.github.io/cheshka-game/',
      telegramWebApp: {
        openTelegramLink: (url: string) => openedLinks.push(url),
      },
    };

    const result = shareGameResult(env, {
      score: 80,
      postersTorn: 7,
      nightsSurvived: 1,
      rankTitle: 'Дворовый искатель',
    });

    expect(result.sharedVia).toBe('telegram');
    expect(openedLinks).toHaveLength(1);
    expect(openedLinks[0]).toContain('https://t.me/share/url?');
  });

  it('falls back to assigning location when Telegram bridge is absent', () => {
    let assignedHref = '';
    const env: ShareResultEnvironment = {
      locationHref: 'https://zhorik333.github.io/cheshka-game/',
      assignLocation: (url: string) => {
        assignedHref = url;
      },
    };

    const result = shareGameResult(env, {
      score: 40,
      postersTorn: 3,
      nightsSurvived: 0,
      rankTitle: 'Домашний стратег',
    });

    expect(result.sharedVia).toBe('browser');
    expect(assignedHref).toContain('https://t.me/share/url?');
  });
});
