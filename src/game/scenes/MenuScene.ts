import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0xf6d8a8);
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

    const button = this.add.rectangle(width / 2, height / 2 + 90, 260, 70, 0x79b66a)
      .setStrokeStyle(4, 0x315a2c)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(width / 2, height / 2 + 90, 'Играть', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      color: '#ffffff',
    }).setOrigin(0.5);

    button.on('pointerdown', () => this.scene.start('GameScene'));
    label.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.scene.start('GameScene'));

    this.add.text(width / 2, height - 80, 'Днём срывай объявления, ночью избегай фонариков.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#4d2c1d',
      align: 'center',
    }).setOrigin(0.5);
  }
}
