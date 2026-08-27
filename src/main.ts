import './style.css';
import { startCheshkaGame } from './game/CheshkaGame';
import { initializeTelegramMiniAppFromWindow } from './game/telegram/telegramMiniApp';

initializeTelegramMiniAppFromWindow(window, document);

document.querySelector<HTMLDivElement>('#app')!.innerHTML = '<div id="game"></div>';

startCheshkaGame('game');
