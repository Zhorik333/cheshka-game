export type ShareResultStats = {
  score: number;
  postersTorn: number;
  nightsSurvived: number;
  rankTitle: string;
};

export type ShareResultEnvironment = {
  locationHref: string;
  telegramWebApp?: {
    openTelegramLink?: (url: string) => void;
  };
  assignLocation?: (url: string) => void;
};

export type ShareResultOutcome = {
  sharedVia: 'telegram' | 'browser';
  url: string;
};

type TelegramShareInput = ShareResultStats & {
  gameUrl: string;
};

export function buildTelegramShareUrl(input: TelegramShareInput): string {
  const shareUrl = new URL('https://t.me/share/url');
  shareUrl.searchParams.set('url', input.gameUrl);
  shareUrl.searchParams.set('text', buildShareText(input));
  return shareUrl.toString();
}

export function shareGameResult(env: ShareResultEnvironment, stats: ShareResultStats): ShareResultOutcome {
  const url = buildTelegramShareUrl({
    gameUrl: env.locationHref,
    ...stats,
  });

  if (env.telegramWebApp?.openTelegramLink) {
    env.telegramWebApp.openTelegramLink(url);
    return { sharedVia: 'telegram', url };
  }

  env.assignLocation?.(url);
  return { sharedVia: 'browser', url };
}

function buildShareText(input: ShareResultStats): string {
  return `Я помог Чешке сбежать в Будве! 🐾 Рейтинг: ${input.score}, объявления: ${input.postersTorn}, ночей: ${input.nightsSurvived}. Звание: ${input.rankTitle}. Попробуй побить мой результат!`;
}
