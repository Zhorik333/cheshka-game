import Phaser from 'phaser';
import { HOW_TO_PLAY_STEPS } from '../content/howToPlay';
import { configureTelegramBackButton, getTelegramBackButton } from '../telegram/backButton';

export class HowToScene extends Phaser.Scene {
  constructor() {
    super('HowToScene');
  }

  create(): void {
    const cleanupBackButton = configureTelegramBackButton(
      getTelegramBackButton(window),
      () => this.scene.start('MenuScene'),
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanupBackButton);

    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0xf6d8a8);
    this.add.rectangle(width / 2, height / 2, 780, 560, 0xfff3dc).setStrokeStyle(5, 0x7c4d2b);

    this.add.text(width / 2, 115, 'Как играть', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '44px',
      color: '#4d2c1d',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 170, 'Чешка сбежала погулять по Будве. Помоги ей набрать рейтинг!', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#6b4f3b',
      align: 'center',
    }).setOrigin(0.5);

    HOW_TO_PLAY_STEPS.forEach((step, index) => {
      this.add.text(180, 230 + index * 58, `${index + 1}. ${step}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#4d2c1d',
        wordWrap: { width: 680 },
      });
    });

    this.createButton(width / 2 - 150, height - 115, 'Играть', () => this.scene.start('GameScene'), 0x79b66a);
    this.createButton(width / 2 + 150, height - 115, 'Назад', () => this.scene.start('MenuScene'), 0x6db7c8);
  }

  private createButton(x: number, y: number, text: string, onClick: () => void, color: number): void {
    const button = this.add.rectangle(x, y, 240, 58, color)
      .setStrokeStyle(3, 0x315a2c)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerdown', onClick);
    label.on('pointerdown', onClick);
  }
}
