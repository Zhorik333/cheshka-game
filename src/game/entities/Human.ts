import Phaser from 'phaser';
import { advancePatrol, type PatrolState } from '../systems/patrol';
import type { DetectionHuman } from '../systems/detection';
import type { Point } from '../utils/movement';

const HUMAN_COLOR = 0x2f62b3;
const VIEW_COLOR = 0xff5b4d;

export class Human {
  private patrol: PatrolState;
  private readonly body: Phaser.GameObjects.Rectangle;
  private readonly view: Phaser.GameObjects.Triangle;
  private readonly label: Phaser.GameObjects.Text;
  private readonly speedPixelsPerSecond: number;
  private readonly viewDistance: number;
  private readonly viewAngleDegrees: number;

  constructor(
    scene: Phaser.Scene,
    path: Point[],
    speedPixelsPerSecond = 90,
    viewDistance = 105,
    viewAngleDegrees = 70,
  ) {
    this.speedPixelsPerSecond = speedPixelsPerSecond;
    this.viewDistance = viewDistance;
    this.viewAngleDegrees = viewAngleDegrees;
    const start = path[0] ?? { x: 0, y: 0 };
    this.patrol = {
      x: start.x,
      y: start.y,
      path,
      targetIndex: path.length > 1 ? 1 : 0,
      facing: { x: 1, y: 0 },
    };

    this.view = scene.add.triangle(start.x, start.y, 0, 0, 0, 0, 0, 0, VIEW_COLOR, 0.28).setOrigin(0, 0);
    this.body = scene.add.rectangle(start.x, start.y, 26, 34, HUMAN_COLOR).setStrokeStyle(2, 0x123768);
    this.label = scene.add.text(start.x, start.y - 30, 'человек', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#102a4a',
      backgroundColor: 'rgba(255,255,255,0.65)',
      padding: { x: 3, y: 2 },
    }).setOrigin(0.5);
    this.redrawViewCone();
  }

  update(deltaMs: number): void {
    this.patrol = advancePatrol(this.patrol, (this.speedPixelsPerSecond * deltaMs) / 1000);
    this.body.setPosition(this.patrol.x, this.patrol.y);
    this.label.setPosition(this.patrol.x, this.patrol.y - 30);
    this.redrawViewCone();
  }

  toDetectionHuman(): DetectionHuman {
    return {
      x: this.patrol.x,
      y: this.patrol.y,
      facing: this.patrol.facing ?? { x: 1, y: 0 },
      viewDistance: this.viewDistance,
      viewAngleDegrees: this.viewAngleDegrees,
    };
  }

  private redrawViewCone(): void {
    const facing = this.patrol.facing ?? { x: 1, y: 0 };
    const angle = Math.atan2(facing.y, facing.x);
    const halfAngle = Phaser.Math.DegToRad(this.viewAngleDegrees / 2);
    const left = {
      x: this.patrol.x + Math.cos(angle - halfAngle) * this.viewDistance,
      y: this.patrol.y + Math.sin(angle - halfAngle) * this.viewDistance,
    };
    const right = {
      x: this.patrol.x + Math.cos(angle + halfAngle) * this.viewDistance,
      y: this.patrol.y + Math.sin(angle + halfAngle) * this.viewDistance,
    };

    this.view.setTo(0, 0, left.x - this.patrol.x, left.y - this.patrol.y, right.x - this.patrol.x, right.y - this.patrol.y);
    this.view.setPosition(this.patrol.x, this.patrol.y);
  }
}
