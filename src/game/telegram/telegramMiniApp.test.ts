import { describe, expect, it } from 'vitest';
import { initializeTelegramMiniApp, initializeTelegramMiniAppFromWindow, type TelegramMiniAppEnvironment } from './telegramMiniApp';

function createDocument(): Document {
  const styles = new Map<string, string>();
  return {
    documentElement: {
      style: {
        setProperty: (name: string, value: string) => styles.set(name, value),
        getPropertyValue: (name: string) => styles.get(name) ?? '',
      },
    },
  } as unknown as Document;
}

describe('Telegram Mini App launch integration', () => {
  it('does nothing when opened as a normal browser page', () => {
    const doc = createDocument();
    const env: TelegramMiniAppEnvironment = {
      document: doc,
      telegramWebApp: undefined,
    };

    const result = initializeTelegramMiniApp(env);

    expect(result).toEqual({ isTelegram: false });
    expect(doc.documentElement.style.getPropertyValue('--tg-bg-color')).toBe('');
  });

  it('notifies Telegram that the game is ready and expands the viewport', () => {
    const calls: string[] = [];
    const env: TelegramMiniAppEnvironment = {
      document: createDocument(),
      telegramWebApp: {
        themeParams: {},
        ready: () => calls.push('ready'),
        expand: () => calls.push('expand'),
        disableVerticalSwipes: () => calls.push('disableVerticalSwipes'),
      },
    };

    const result = initializeTelegramMiniApp(env);

    expect(result).toEqual({ isTelegram: true });
    expect(calls).toEqual(['ready', 'expand', 'disableVerticalSwipes']);
  });

  it('applies Telegram theme colors as CSS variables for cozy embedding', () => {
    const doc = createDocument();
    const env: TelegramMiniAppEnvironment = {
      document: doc,
      telegramWebApp: {
        themeParams: {
          bg_color: '#20172b',
          text_color: '#fff3dc',
          button_color: '#6d4c9f',
          button_text_color: '#ffffff',
        },
        ready: () => undefined,
        expand: () => undefined,
      },
    };

    initializeTelegramMiniApp(env);

    expect(doc.documentElement.style.getPropertyValue('--tg-bg-color')).toBe('#20172b');
    expect(doc.documentElement.style.getPropertyValue('--tg-text-color')).toBe('#fff3dc');
    expect(doc.documentElement.style.getPropertyValue('--tg-button-color')).toBe('#6d4c9f');
    expect(doc.documentElement.style.getPropertyValue('--tg-button-text-color')).toBe('#ffffff');
  });

  it('reads Telegram WebApp from the launch window', () => {
    const calls: string[] = [];
    const doc = createDocument();
    const launchWindow = {
      Telegram: {
        WebApp: {
          themeParams: { bg_color: '#101010' },
          ready: () => calls.push('ready'),
          expand: () => calls.push('expand'),
        },
      },
    };

    const result = initializeTelegramMiniAppFromWindow(launchWindow, doc);

    expect(result).toEqual({ isTelegram: true });
    expect(calls).toEqual(['ready', 'expand']);
    expect(doc.documentElement.style.getPropertyValue('--tg-bg-color')).toBe('#101010');
  });
});
