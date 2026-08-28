import Phaser from 'phaser';
import { getFlashlightPulseFrame } from '../systems/ambientAnimation';
import { getFlashlightAlpha, HUMAN_VISUAL_DESIGN } from '../systems/entityVisualDesign';
import { advancePatrol, type PatrolState } from '../systems/patrol';
import type { DetectionHuman } from '../systems/detection';
import type { Point } from '../utils/movement';

const HUMAN_COLOR = HUMAN_VISUAL_DESIGN.coatColor;
const VIEW_COLOR = HUMAN_VISUAL_DESIGN.flashlightDayColor;

export class Human {
  private patrol: PatrolState;
  private readonly avatar: Phaser.GameObjects.Container;
  private readonly view: Phaser.GameObjects.Triangle;
  private readonly flashlight: Phaser.GameObjects.Ellipse;
  private readonly label: Phaser.GameObjects.Text;
  private readonly speedPixelsPerSecond: number;
  private readonly dayViewDistance: number;
  private readonly nightViewDistance: number;
  private readonly viewAngleDegrees: number;
  private currentViewDistance: number;
  private isNightMode = false;
  private elapsedMs = 0;

  constructor(
    scene: Phaser.Scene,
    path: Point[],
    speedPixelsPerSecond = 90,
    dayViewDistance = 105,
    viewAngleDegrees = 70,
    nightViewDistance = dayViewDistance * 1.65,
  ) {
    this.speedPixelsPerSecond = speedPixelsPerSecond;
    this.dayViewDistance = dayViewDistance;
    this.nightViewDistance = nightViewDistance;
    this.viewAngleDegrees = viewAngleDegrees;
    this.currentViewDistance = dayViewDistance;
    const start = path[0] ?? { x: 0, y: 0 };
    this.patrol = {
      x: start.x,
      y: start.y,
      path,
      targetIndex: path.length > 1 ? 1 : 0,
      facing: { x: 1, y: 0 },
    };

    this.view = scene.add.triangle(start.x, start.y, 0, 0, 0, 0, 0, 0, VIEW_COLOR, getFlashlightAlpha(false)).setOrigin(0, 0);

    const shadow = scene.add.ellipse(0, 17, 34, 12, 0x16223b, 0.18);
    const legs = scene.add.rectangle(-3, 16, 18, 15, 0x1b315e).setStrokeStyle(1, 0x102444);
    const body = scene.add.ellipse(0, 1, 28, 38, HUMAN_COLOR).setStrokeStyle(2, 0x123768);
    const head = scene.add.circle(0, -23, 11, HUMAN_VISUAL_DESIGN.headColor).setStrokeStyle(2, 0x8d5d43);
    const hat = scene.add.rectangle(0, -35, 25, 7, 0x123768).setStrokeStyle(1, 0x0b203d);
    const arm = scene.add.rectangle(17, 0, 19, 6, 0x244d91).setStrokeStyle(1, 0x123768);
    this.flashlight = scene.add.ellipse(29, 0, 16, 8, 0xfff0a8).setStrokeStyle(2, 0x7c4d2b);

    this.avatar = scene.add.container(start.x, start.y, [
      shadow,
      legs,
      body,
      head,
      hat,
      arm,
      this.flashlight,
    ]);

    this.label = scene.add.text(start.x, start.y - 45, 'прохожий', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#102a4a',
      backgroundColor: 'rgba(255,255,255,0.65)',
      padding: { x: 3, y: 2 },
    }).setOrigin(0.5);
    this.redrawViewCone();
  }

  update(deltaMs: number): void {
    this.elapsedMs += deltaMs;
    this.patrol = advancePatrol(this.patrol, (this.speedPixelsPerSecond * deltaMs) / 1000);
    this.avatar.setPosition(this.patrol.x, this.patrol.y);
    this.label.setPosition(this.patrol.x, this.patrol.y - 45);
    const facing = this.patrol.facing ?? { x: 1, y: 0 };
    this.avatar.setRotation(Math.atan2(facing.y, facing.x));
    this.redrawViewCone();
  }

  setNightMode(enabled: boolean): void {
    this.isNightMode = enabled;
    this.currentViewDistance = enabled ? this.nightViewDistance : this.dayViewDistance;
    this.view.setFillStyle(
      enabled ? HUMAN_VISUAL_DESIGN.flashlightNightColor : HUMAN_VISUAL_DESIGN.flashlightDayColor,
      getFlashlightAlpha(enabled),
    );
    this.flashlight.setFillStyle(enabled ? 0xfff0a8 : 0xffd1a6, enabled ? 1 : 0.86);
    this.redrawViewCone();
  }

  destroy(): void {
    this.view.destroy();
    this.avatar.destroy(true);
    this.label.destroy();
  }

  toDetectionHuman(): DetectionHuman {
    return {
      x: this.patrol.x,
      y: this.patrol.y,
      facing: this.patrol.facing ?? { x: 1, y: 0 },
      viewDistance: this.currentViewDistance,
      viewAngleDegrees: this.viewAngleDegrees,
    };
  }

  private redrawViewCone(): void {
    const facing = this.patrol.facing ?? { x: 1, y: 0 };
    const angle = Math.atan2(facing.y, facing.x);
    const halfAngle = Phaser.Math.DegToRad(this.viewAngleDegrees / 2);
    const left = {
      x: this.patrol.x + Math.cos(angle - halfAngle) * this.currentViewDistance,
      y: this.patrol.y + Math.sin(angle - halfAngle) * this.currentViewDistance,
    };
    const right = {
      x: this.patrol.x + Math.cos(angle + halfAngle) * this.currentViewDistance,
      y: this.patrol.y + Math.sin(angle + halfAngle) * this.currentViewDistance,
    };

    this.view.setTo(0, 0, left.x - this.patrol.x, left.y - this.patrol.y, right.x - this.patrol.x, right.y - this.patrol.y);
    this.view.setPosition(this.patrol.x, this.patrol.y);
    const pulse = getFlashlightPulseFrame(this.isNightMode, this.elapsedMs);
    this.view.setScale(pulse.scale);
    this.view.setFillStyle(
      this.isNightMode ? HUMAN_VISUAL_DESIGN.flashlightNightColor : HUMAN_VISUAL_DESIGN.flashlightDayColor,
      pulse.alpha,
    );
  }
}
