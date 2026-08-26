import Phaser from 'phaser';
import { Cat } from '../entities/Cat';
import { collectNearbyPosters, type PosterState } from '../systems/posterCollection';

const POSTER_COLLECTION_RADIUS = 34;

type PosterSprite = {
  paper: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Arc;
};

export class GameScene extends Phaser.Scene {
  private cat?: Cat;
  private score = 0;
  private collectedPosterCount = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private posters: PosterState[] = [];
  private posterSprites = new Map<string, PosterSprite>();

  constructor() {
    super('GameScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.score = 0;
    this.collectedPosterCount = 0;
    this.posters = [];
    this.posterSprites.clear();

    this.drawBudvaYard(width, height);
    this.createPosters();

    this.cat = new Cat(this, { x: width / 2, y: height / 2 });
    this.scoreText = this.add.text(24, 20, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#2f241d',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 10, y: 7 },
    });
    this.updateHud();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.cat?.setTarget({ x: pointer.worldX, y: pointer.worldY });
    });

    this.add.text(width / 2, height - 28, 'Срывай жёлтые объявления: каждое даёт +10 рейтинга ♪', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#4d2c1d',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5);
  }

  update(_time: number, delta: number): void {
    this.cat?.update(delta);
    this.collectPostersNearCat();
  }

  private collectPostersNearCat(): void {
    if (!this.cat) {
      return;
    }

    const result = collectNearbyPosters(this.posters, this.cat.position, POSTER_COLLECTION_RADIUS);

    if (result.collectedIds.length === 0) {
      return;
    }

    this.posters = result.posters;
    this.score += result.scoreDelta;
    this.collectedPosterCount += result.collectedIds.length;

    for (const posterId of result.collectedIds) {
      const sprite = this.posterSprites.get(posterId);
      sprite?.paper.destroy();
      sprite?.glow.destroy();
      this.posterSprites.delete(posterId);
    }

    this.showScorePopup(this.cat.position.x, this.cat.position.y - 34, `+${result.scoreDelta}`);
    this.updateHud();
  }

  private updateHud(): void {
    this.scoreText?.setText(
      `☀ День: 60   Рейтинг: ${this.score}   Объявления: ${this.collectedPosterCount}/${this.posters.length}   Свобода: 🐾 🐾 🐾`,
    );
  }

  private createPosters(): void {
    const posterPositions = [
      { id: 'poster-wall-left', x: 240, y: 86 },
      { id: 'poster-wall-center', x: 505, y: 88 },
      { id: 'poster-house', x: 140, y: 240 },
      { id: 'poster-cafe', x: 770, y: 255 },
      { id: 'poster-sea-street', x: 720, y: 455 },
    ];

    this.posters = posterPositions.map((poster) => ({ ...poster, collected: false }));

    for (const poster of this.posters) {
      const glow = this.add.circle(poster.x, poster.y, 28, 0xfff1a0, 0.32);
      const paper = this.add.rectangle(poster.x, poster.y, 34, 44, 0xffee75).setStrokeStyle(2, 0x7d6824);
      this.add.text(poster.x, poster.y, '!', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#7d6824',
      }).setOrigin(0.5);

      this.posterSprites.set(poster.id, { paper, glow });
    }
  }

  private showScorePopup(x: number, y: number, text: string): void {
    const popup = this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color: '#2e7d32',
      backgroundColor: 'rgba(255,255,255,0.8)',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 30,
      alpha: 0,
      duration: 650,
      onComplete: () => popup.destroy(),
    });
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
  }
}
