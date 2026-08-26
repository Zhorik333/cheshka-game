import Phaser from 'phaser';
import { moveTowards, type Point } from '../utils/movement';

const CAT_COLOR = 0xfff6e5;
const CAT_OUTLINE = 0x4d2c1d;

export class Cat {
  private target: Point;
  private readonly body: Phaser.GameObjects.Arc;
  private readonly label: Phaser.GameObjects.Text;

  private readonly speedPixelsPerSecond: number;

  constructor(scene: Phaser.Scene, start: Point, speedPixelsPerSecond = 220) {
    this.speedPixelsPerSecond = speedPixelsPerSecond;
    this.target = { ...start };
    this.body = scene.add.circle(start.x, start.y, 14, CAT_COLOR).setStrokeStyle(3, CAT_OUTLINE);
    this.label = scene.add.text(start.x, start.y - 31, 'Чешка', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#4d2c1d',
      backgroundColor: 'rgba(255, 246, 229, 0.7)',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);
  }

  setTarget(target: Point): void {
    this.target = { ...target };
  }

  update(deltaMs: number): void {
    const next = moveTowards(this.position, this.target, (this.speedPixelsPerSecond * deltaMs) / 1000);
    this.body.setPosition(next.x, next.y);
    this.label.setPosition(next.x, next.y - 31);
  }

  get position(): Point {
    return { x: this.body.x, y: this.body.y };
  }
}
