import Phaser from 'phaser';
import { Cat } from '../entities/Cat';

export class GameScene extends Phaser.Scene {
  private cat?: Cat;
  private score = 0;
  private scoreText?: Phaser.GameObjects.Text;

  constructor() {
    super('GameScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.drawBudvaYard(width, height);
    this.cat = new Cat(this, { x: width / 2, y: height / 2 });
    this.scoreText = this.add.text(24, 20, '☀ День: 60   Рейтинг: 0   Свобода: 🐾 🐾 🐾', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#2f241d',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 10, y: 7 },
    });

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.cat?.setTarget({ x: pointer.worldX, y: pointer.worldY });
    });

    this.add.text(width / 2, height - 28, 'Кликни/тапни по двору — Чешка побежит туда ♪', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#4d2c1d',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5);
  }

  update(_time: number, delta: number): void {
    this.cat?.update(delta);
    this.scoreText?.setText(`☀ День: 60   Рейтинг: ${this.score}   Свобода: 🐾 🐾 🐾`);
  }

  private drawBudvaYard(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0xd8c49a);

    this.add.rectangle(width / 2, 35, width, 70, 0x9c8f7b);
    this.add.text(width / 2, 35, 'каменная стена Будвы', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#f5ead4',
    }).setOrigin(0.5);

    this.add.rectangle(90, height / 2, 120, 420, 0xc97854);
    this.add.text(90, height / 2, 'дом', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#fff0df',
    }).setOrigin(0.5);

    this.add.rectangle(width - 145, height / 2 - 30, 190, 150, 0xe6b56f).setStrokeStyle(3, 0x7a5132);
    this.add.text(width - 145, height / 2 - 30, 'кафе', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#563a24',
    }).setOrigin(0.5);

    this.add.rectangle(width / 2, height - 55, width, 110, 0x6db7c8);
    this.add.text(width / 2, height - 73, 'море / набережная', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add.circle(330, 290, 42, 0x3f8f48);
    this.add.circle(515, 180, 36, 0x4fa35a);
    this.add.circle(620, 390, 48, 0x367d3e);

    this.add.rectangle(430, 340, 120, 52, 0x5d6f8f).setStrokeStyle(2, 0x28364e);
    this.add.text(430, 340, 'машина', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const posterPositions = [
      [240, 86],
      [505, 88],
      [140, 240],
      [770, 255],
      [720, 455],
    ];

    for (const [x, y] of posterPositions) {
      this.add.rectangle(x, y, 34, 44, 0xffee75).setStrokeStyle(2, 0x7d6824);
    }
  }
}
