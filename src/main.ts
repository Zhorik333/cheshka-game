import './style.css';
import { startCheshkaGame } from './game/CheshkaGame';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = '<div id="game"></div>';

startCheshkaGame('game');
