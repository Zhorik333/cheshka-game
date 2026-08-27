export type TelegramBackButtonBridge = {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
};

export type TelegramBackButtonWindow = {
  Telegram?: {
    WebApp?: {
      BackButton?: TelegramBackButtonBridge;
    };
  };
};

export function configureTelegramBackButton(
  backButton: TelegramBackButtonBridge | undefined,
  onBack: () => void,
): () => void {
  if (!backButton) {
    return () => undefined;
  }

  backButton.show();
  backButton.onClick(onBack);
  return () => backButton.offClick(onBack);
}

export function hideTelegramBackButton(backButton: TelegramBackButtonBridge | undefined): void {
  backButton?.hide();
}

export function getTelegramBackButton(launchWindow: unknown): TelegramBackButtonBridge | undefined {
  if (!launchWindow || typeof launchWindow !== 'object') {
    return undefined;
  }

  return (launchWindow as TelegramBackButtonWindow).Telegram?.WebApp?.BackButton;
}
