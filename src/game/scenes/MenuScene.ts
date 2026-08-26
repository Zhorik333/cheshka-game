import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0xf6d8a8);
    this.add.circle(width / 2, 275, 46, 0xfff6e5).setStrokeStyle(4, 0x4d2c1d);
    this.add.text(width / 2, 275, '🐾', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '38px',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, 'Чешка против объявлений', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '42px',
      color: '#4d2c1d',
      align: 'center',
    }).setOrigin(0.5);

    this.add.text(width / 2, 190, 'Будванский дворик ждёт маленькую беглянку 🐾', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#6b4f3b',
      align: 'center',
    }).setOrigin(0.5);

    this.createButton(width / 2, height / 2 + 85, 'Играть', () => this.scene.start('GameScene'), 0x79b66a);
    this.createButton(width / 2, height / 2 + 165, 'Как играть', () => this.scene.start('HowToScene'), 0x6db7c8);

    this.add.text(width / 2, height - 70, 'Днём срывай объявления, ночью избегай фонариков.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#4d2c1d',
      align: 'center',
    }).setOrigin(0.5);
  }

  private createButton(x: number, y: number, text: string, onClick: () => void, color: number): void {
    const button = this.add.rectangle(x, y, 260, 64, color)
      .setStrokeStyle(4, 0x315a2c)
      .setInteractive({ useHandCursor: true });
    const label = this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '28px',
      color: '#ffffff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerdown', onClick);
    label.on('pointerdown', onClick);
  }
}
