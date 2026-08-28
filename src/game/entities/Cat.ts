import Phaser from 'phaser';
import { CHESHKA_VISUAL_DESIGN } from '../systems/entityVisualDesign';
import { moveTowards, type Point } from '../utils/movement';

const CAT_COLOR = CHESHKA_VISUAL_DESIGN.bodyColor;
const CAT_OUTLINE = CHESHKA_VISUAL_DESIGN.outlineColor;

export class Cat {
  private target: Point;
  private readonly avatar: Phaser.GameObjects.Container;
  private readonly label: Phaser.GameObjects.Text;

  private readonly speedPixelsPerSecond: number;

  constructor(scene: Phaser.Scene, start: Point, speedPixelsPerSecond = 220) {
    this.speedPixelsPerSecond = speedPixelsPerSecond;
    this.target = { ...start };

    const shadow = scene.add.ellipse(0, 16, 38, 16, 0x3b2a20, 0.18);
    const tail = scene.add.ellipse(-19, 8, 11, 30, CAT_COLOR).setStrokeStyle(3, CAT_OUTLINE);
    tail.setRotation(Phaser.Math.DegToRad(-32));
    const body = scene.add.ellipse(0, 7, 30, 25, CAT_COLOR).setStrokeStyle(3, CAT_OUTLINE);
    const head = scene.add.circle(7, -9, 15, CAT_COLOR).setStrokeStyle(3, CAT_OUTLINE);
    const leftEar = scene.add.triangle(-5, -21, 0, 16, 9, 0, 18, 16, CAT_COLOR).setStrokeStyle(2, CAT_OUTLINE);
    const rightEar = scene.add.triangle(15, -22, 0, 16, 9, 0, 18, 16, CAT_COLOR).setStrokeStyle(2, CAT_OUTLINE);
    const scarf = scene.add.ellipse(-2, 1, 27, 8, CHESHKA_VISUAL_DESIGN.scarfColor, 0.9).setStrokeStyle(1, 0x9b3d58);
    const leftEye = scene.add.circle(2, -12, 2, 0x2b1b14);
    const rightEye = scene.add.circle(12, -12, 2, 0x2b1b14);
    const nose = scene.add.triangle(7, -7, 0, 0, 5, 0, 2.5, 4, 0xff8fab);
    const whiskers = scene.add.graphics();
    whiskers.lineStyle(1.4, CAT_OUTLINE, 0.82);
    whiskers.lineBetween(-7, -7, 1, -8);
    whiskers.lineBetween(-7, -3, 1, -5);
    whiskers.lineBetween(13, -8, 22, -10);
    whiskers.lineBetween(13, -5, 22, -3);

    this.avatar = scene.add.container(start.x, start.y, [
      shadow,
      tail,
      body,
      scarf,
      leftEar,
      rightEar,
      head,
      leftEye,
      rightEye,
      nose,
      whiskers,
    ]);

    this.label = scene.add.text(start.x, start.y - 39, 'Чешка', {
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

  setPosition(position: Point): void {
    this.target = { ...position };
    this.avatar.setPosition(position.x, position.y);
    this.label.setPosition(position.x, position.y - 39);
  }

  snapTo(position: Point): void {
    this.avatar.setPosition(position.x, position.y);
    this.label.setPosition(position.x, position.y - 39);
  }

  update(deltaMs: number): void {
    const current = this.position;
    const next = moveTowards(current, this.target, (this.speedPixelsPerSecond * deltaMs) / 1000);
    this.avatar.setPosition(next.x, next.y);
    this.avatar.setScale(this.target.x < next.x ? -1 : 1, 1);
    this.label.setPosition(next.x, next.y - 39);
  }

  get position(): Point {
    return { x: this.avatar.x, y: this.avatar.y };
  }

  get targetPosition(): Point {
    return { ...this.target };
  }
}
