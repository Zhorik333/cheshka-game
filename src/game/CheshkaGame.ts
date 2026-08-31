import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { HowToScene } from './scenes/HowToScene';
import { MenuScene } from './scenes/MenuScene';
import { GAME_VIEWPORT } from './systems/viewport';

export function startCheshkaGame(parent: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_VIEWPORT.width,
    height: GAME_VIEWPORT.height,
    backgroundColor: '#d8c49a',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [MenuScene, HowToScene, GameScene],
  });
}
