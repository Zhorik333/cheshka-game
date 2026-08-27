export type TelegramThemeParams = {
  bg_color?: string;
  text_color?: string;
  button_color?: string;
  button_text_color?: string;
};

export type TelegramWebAppBridge = {
  themeParams?: TelegramThemeParams;
  ready: () => void;
  expand: () => void;
  disableVerticalSwipes?: () => void;
};

export type TelegramMiniAppEnvironment = {
  document: Document;
  telegramWebApp?: TelegramWebAppBridge;
};

export type TelegramLaunchWindow = {
  Telegram?: {
    WebApp?: TelegramWebAppBridge;
  };
};

export type TelegramMiniAppInitResult = {
  isTelegram: boolean;
};

const THEME_VARIABLES: Array<[keyof TelegramThemeParams, string]> = [
  ['bg_color', '--tg-bg-color'],
  ['text_color', '--tg-text-color'],
  ['button_color', '--tg-button-color'],
  ['button_text_color', '--tg-button-text-color'],
];

export function initializeTelegramMiniApp(env: TelegramMiniAppEnvironment): TelegramMiniAppInitResult {
  const webApp = env.telegramWebApp;
  if (!webApp) {
    return { isTelegram: false };
  }

  applyTelegramTheme(env.document, webApp.themeParams ?? {});
  webApp.ready();
  webApp.expand();
  webApp.disableVerticalSwipes?.();

  return { isTelegram: true };
}

export function initializeTelegramMiniAppFromWindow(
  launchWindow: unknown,
  document: Document,
): TelegramMiniAppInitResult {
  return initializeTelegramMiniApp({
    document,
    telegramWebApp: getTelegramWebApp(launchWindow),
  });
}

function getTelegramWebApp(launchWindow: unknown): TelegramWebAppBridge | undefined {
  if (!launchWindow || typeof launchWindow !== 'object') {
    return undefined;
  }

  const maybeTelegram = (launchWindow as TelegramLaunchWindow).Telegram;
  return maybeTelegram?.WebApp;
}

function applyTelegramTheme(document: Document, theme: TelegramThemeParams): void {
  for (const [themeKey, cssVariable] of THEME_VARIABLES) {
    const color = theme[themeKey];
    if (color) {
      document.documentElement.style.setProperty(cssVariable, color);
    }
  }
}
