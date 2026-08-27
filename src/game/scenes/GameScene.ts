import Phaser from 'phaser';
import { Cat } from '../entities/Cat';
import { Human } from '../entities/Human';
import { loadBestScore, saveBestScoreIfHigher } from '../systems/bestScore';
import { recordCatch, type CatchState } from '../systems/catch';
import { advanceDayNight, createDayNightState, fastForwardToPhaseEnd, getPhaseLabel, isNightLikePhase, type DayNightState } from '../systems/dayNight';
import { evaluateDayClearBonus } from '../systems/dayClearBonus';
import { createDashState, getDashCooldownRatio, getDashCooldownSeconds, isDashReady, performDash, type DashState } from '../systems/dash';
import { isCatDetected } from '../systems/detection';
import { getCycleDifficulty } from '../systems/difficulty';
import { getHidingStatus, updateHidingStatus } from '../systems/hidingStatus';
import { createPosterComboState, recordPosterCombo, type PosterComboState } from '../systems/posterCombo';
import { collectNearbyPosters, type PosterState } from '../systems/posterCollection';
import { createPosterStates } from '../systems/posterLayout';
import { distance, type Point } from '../utils/movement';

const POSTER_COLLECTION_RADIUS = 34;
const CAT_RESPAWN: Point = { x: 520, y: 585 };
const DAY_NIGHT_CONFIG = {
  dayMs: 60_000,
  nightMs: 45_000,
  transitionMs: 3_000,
};
const NIGHT_SURVIVAL_SCORE_INTERVAL_MS = 1000;
const DASH_CONFIG = {
  distance: 90,
  cooldownMs: 2_500,
};
const POSTER_COMBO_WINDOW_MS = 4_000;

type PosterSprite = {
  paper: Phaser.GameObjects.Rectangle;
  glow: Phaser.GameObjects.Arc;
  mark: Phaser.GameObjects.Text;
};

type BushZone = Point & {
  radius: number;
};

export class GameScene extends Phaser.Scene {
  private cat?: Cat;
  private score = 0;
  private collectedPosterCount = 0;
  private totalCollectedPosterCount = 0;
  private survivedNightCount = 0;
  private dayClearAwarded = false;
  private bestScore = 0;
  private scoreText?: Phaser.GameObjects.Text;
  private hidingText?: Phaser.GameObjects.Text;
  private posters: PosterState[] = [];
  private readonly posterSprites = new Map<string, PosterSprite>();
  private humans: Human[] = [];
  private bushes: BushZone[] = [];
  private dayNight: DayNightState = createDayNightState(DAY_NIGHT_CONFIG);
  private nightScoreAccumulatorMs = 0;
  private nightOverlay?: Phaser.GameObjects.Rectangle;
  private phaseNotice?: Phaser.GameObjects.Text;
  private dashButton?: Phaser.GameObjects.Arc;
  private dashCooldownFill?: Phaser.GameObjects.Arc;
  private dashCooldownText?: Phaser.GameObjects.Text;
  private dashState: DashState = createDashState(DASH_CONFIG);
  private catIsHidden = false;
  private posterCombo: PosterComboState = createPosterComboState(POSTER_COMBO_WINDOW_MS);
  private catchState: CatchState = {
    catches: 0,
    maxCatches: 3,
    invulnerableUntilMs: 0,
    ended: false,
  };

  constructor() {
    super('GameScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.score = 0;
    this.collectedPosterCount = 0;
    this.totalCollectedPosterCount = 0;
    this.survivedNightCount = 0;
    this.dayClearAwarded = false;
    this.bestScore = loadBestScore(window.localStorage);
    this.catIsHidden = false;
    this.posters = [];
    this.posterSprites.clear();
    this.humans = [];
    this.bushes = [];
    this.dayNight = createDayNightState(DAY_NIGHT_CONFIG);
    this.nightScoreAccumulatorMs = 0;
    this.nightOverlay = undefined;
    this.phaseNotice = undefined;
    this.hidingText = undefined;
    this.dashButton = undefined;
    this.dashCooldownFill = undefined;
    this.dashCooldownText = undefined;
    this.dashState = createDashState(DASH_CONFIG);
    this.posterCombo = createPosterComboState(POSTER_COMBO_WINDOW_MS);
    this.catchState = { catches: 0, maxCatches: 3, invulnerableUntilMs: 0, ended: false };

    this.drawBudvaYard(width, height);
    this.createPosters();
    this.createHumans();
    this.nightOverlay = this.add.rectangle(width / 2, height / 2, width, height, 0x09142f, 0)
      .setDepth(40)
      .setVisible(false);

    this.cat = new Cat(this, CAT_RESPAWN);
    this.scoreText = this.add.text(24, 20, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '20px',
      color: '#2f241d',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 10, y: 7 },
    }).setDepth(200);
    this.updateHud();
    this.hidingText = this.add.text(24, 62, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#b3261e',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 10, y: 6 },
    }).setDepth(200);
    this.updateHidingIndicator(false);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const dashButtonCenter = { x: width - 78, y: height - 92 };
      const tappedDashButton = distance(dashButtonCenter, { x: pointer.worldX, y: pointer.worldY }) <= 56;
      if (!this.catchState.ended && !tappedDashButton) {
        this.cat?.setTarget({ x: pointer.worldX, y: pointer.worldY });
      }
    });

    if (import.meta.env.DEV) {
      this.input.keyboard?.on('keydown-N', () => this.fastForwardCurrentPhase());
    }

    this.input.keyboard?.on('keydown-SPACE', () => this.tryDash(this.time.now));

    this.createDashButton(width, height);

    this.add.text(width / 2, height - 28, 'Срывай объявления и не заходи в красные зоны людей ♪', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#4d2c1d',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 8, y: 5 },
    }).setOrigin(0.5);

    if (import.meta.env.DEV) {
      this.add.text(width - 24, height - 28, 'Dev: N = следующая фаза', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '15px',
        color: '#5d4037',
        backgroundColor: 'rgba(255,255,255,0.64)',
        padding: { x: 7, y: 4 },
      }).setOrigin(1, 0.5);
    }
  }

  update(time: number, delta: number): void {
    if (this.catchState.ended) {
      return;
    }

    this.cat?.update(delta);
    this.updateDayNight(delta);

    for (const human of this.humans) {
      human.update(delta);
    }

    this.collectPostersNearCat(time);
    this.updateHidingIndicator(true);
    this.checkHumanDetection(time);
    this.updateDashButton(time);
  }

  private updateHidingIndicator(showTransitionPopup: boolean): void {
    if (!this.cat) {
      return;
    }

    const update = updateHidingStatus(this.catIsHidden, this.isCatInBush(this.cat.position));
    this.catIsHidden = update.isHidden;
    const status = getHidingStatus(this.catIsHidden);
    this.hidingText?.setText(status.label);
    this.hidingText?.setColor(status.color);

    if (!showTransitionPopup || update.event === 'none') {
      return;
    }

    const message = update.event === 'entered' ? 'Чешка спряталась 🌿' : 'Чешка снова на виду!';
    this.showPopup(this.cat.position.x, this.cat.position.y - 68, message, status.color);
  }

  private fastForwardCurrentPhase(): void {
    if (this.catchState.ended) {
      return;
    }

    this.dayNight = fastForwardToPhaseEnd(this.dayNight);
    this.showPopup(CAT_RESPAWN.x, CAT_RESPAWN.y - 132, 'Dev: следующая фаза через 1 мс', '#6d4c9f');
    this.updateHud();
  }

  private tryDash(timeMs: number): void {
    if (!this.cat || this.catchState.ended) {
      return;
    }

    const result = performDash(this.dashState, this.cat.position, this.cat.targetPosition, timeMs);
    this.dashState = result.state;
    this.updateDashButton(timeMs);

    if (!result.dashed) {
      const waitSeconds = Math.ceil((this.dashState.availableAtMs - timeMs) / 1000);
      this.showPopup(this.cat.position.x, this.cat.position.y - 54, `Рывок через ${waitSeconds}с`, '#7c4d2b');
      return;
    }

    this.cat.snapTo(result.position);
    this.showPopup(result.position.x, result.position.y - 54, 'Прыг-скок! ✦', '#6d4c9f');
  }

  private createDashButton(width: number, height: number): void {
    this.dashButton = this.add.circle(width - 78, height - 92, 43, 0x6d4c9f, 0.88)
      .setStrokeStyle(4, 0x3b255d)
      .setDepth(210)
      .setInteractive({ useHandCursor: true });

    this.dashCooldownFill = this.add.circle(width - 78, height - 92, 38, 0x20172b, 0.68)
      .setDepth(210.5)
      .setVisible(false);

    this.add.text(width - 78, height - 98, 'Рывок', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '17px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5).setDepth(211);

    this.dashCooldownText = this.add.text(width - 78, height - 76, 'готов', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#eadcff',
      align: 'center',
    }).setOrigin(0.5).setDepth(211);

    this.dashButton.on('pointerdown', () => this.tryDash(this.time.now));
    this.updateDashButton(this.time.now);
  }

  private updateDashButton(timeMs: number): void {
    const ready = isDashReady(this.dashState, timeMs);
    this.dashButton?.setFillStyle(ready ? 0x6d4c9f : 0x7c6f8f, ready ? 0.88 : 0.62);
    this.dashCooldownFill?.setVisible(!ready);
    this.dashCooldownFill?.setAlpha(0.25 + getDashCooldownRatio(this.dashState, timeMs) * 0.48);
    this.dashCooldownText?.setText(ready ? 'готов' : `${getDashCooldownSeconds(this.dashState, timeMs)}с`);
  }

  private updateDayNight(deltaMs: number): void {
    const previousPhase = this.dayNight.phase;
    this.dayNight = advanceDayNight(this.dayNight, deltaMs);
    const isNight = isNightLikePhase(this.dayNight.phase);

    for (const human of this.humans) {
      human.setNightMode(isNight);
    }

    this.nightOverlay?.setVisible(isNight || this.dayNight.phase === 'toNight');
    this.nightOverlay?.setAlpha(isNight ? 0.42 : this.dayNight.phase === 'toNight' ? 0.2 : 0);

    if (this.dayNight.phase === 'night') {
      this.nightScoreAccumulatorMs += deltaMs;
      while (this.nightScoreAccumulatorMs >= NIGHT_SURVIVAL_SCORE_INTERVAL_MS) {
        this.nightScoreAccumulatorMs -= NIGHT_SURVIVAL_SCORE_INTERVAL_MS;
        this.score += 1;
      }
    } else {
      this.nightScoreAccumulatorMs = 0;
    }

    if (previousPhase !== this.dayNight.phase) {
      if (previousPhase === 'night' && this.dayNight.phase === 'toDay') {
        this.survivedNightCount += 1;
        this.score += 50;
        this.showPopup(CAT_RESPAWN.x, CAT_RESPAWN.y - 112, '+50 за ночь!', '#2e7d32');
      }
      if (this.dayNight.phase === 'day') {
        this.startNewDayCycle();
      }
      this.showPhaseNotice();
    }

    this.updateHud();
  }

  private collectPostersNearCat(timeMs: number): void {
    if (!this.cat) {
      return;
    }

    const result = collectNearbyPosters(this.posters, this.cat.position, POSTER_COLLECTION_RADIUS);

    if (result.collectedIds.length === 0) {
      return;
    }

    this.posters = result.posters;
    const combo = recordPosterCombo(this.posterCombo, timeMs, result.collectedIds.length);
    this.posterCombo = combo.state;
    this.score += result.scoreDelta + combo.bonusScore;
    this.collectedPosterCount += result.collectedIds.length;
    this.totalCollectedPosterCount += result.collectedIds.length;

    for (const posterId of result.collectedIds) {
      const sprite = this.posterSprites.get(posterId);
      sprite?.paper.destroy();
      sprite?.glow.destroy();
      sprite?.mark.destroy();
      this.posterSprites.delete(posterId);
    }

    const scoreLabel = combo.bonusScore > 0 ? `+${result.scoreDelta + combo.bonusScore}  ${combo.label}` : `+${result.scoreDelta}`;
    this.showPopup(this.cat.position.x, this.cat.position.y - 34, scoreLabel, combo.bonusScore > 0 ? '#6d4c9f' : '#2e7d32');
    this.awardDayClearBonusIfReady();
    this.updateHud();
  }

  private awardDayClearBonusIfReady(): void {
    const bonus = evaluateDayClearBonus({
      phase: this.dayNight.phase,
      collectedCount: this.collectedPosterCount,
      totalCount: this.posters.length,
      alreadyAwarded: this.dayClearAwarded,
    });

    if (!bonus.shouldAward) {
      return;
    }

    this.dayClearAwarded = true;
    this.score += bonus.bonusScore;
    this.dayNight = fastForwardToPhaseEnd(this.dayNight);
    this.showPopup(CAT_RESPAWN.x, CAT_RESPAWN.y - 128, `${bonus.label}  Скоро ночь!`, '#6d4c9f');
  }

  private checkHumanDetection(timeMs: number): void {
    if (!this.cat) {
      return;
    }

    const catIsHidden = this.isCatInBush(this.cat.position);
    const detected = this.humans.some((human) => isCatDetected(human.toDetectionHuman(), this.cat!.position, catIsHidden));

    if (!detected) {
      return;
    }

    const previousCatches = this.catchState.catches;
    this.catchState = recordCatch(this.catchState, timeMs, 2000);

    if (this.catchState.catches === previousCatches) {
      return;
    }

    this.score = Math.max(0, this.score - 20);
    this.updateHud();

    if (this.catchState.ended) {
      this.showHomeResult();
      return;
    }

    this.cat.setPosition(CAT_RESPAWN);
    this.showPopup(CAT_RESPAWN.x, CAT_RESPAWN.y - 45, 'Поймали! Чешка вырвалась 🐾', '#b3261e');
  }

  private isCatInBush(catPosition: Point): boolean {
    return this.bushes.some((bush) => distance(bush, catPosition) <= bush.radius);
  }

  private updateHud(): void {
    const paws = Array.from({ length: this.catchState.maxCatches }, (_value, index) => (
      index < this.catchState.maxCatches - this.catchState.catches ? '🐾' : '—'
    )).join(' ');

    const seconds = Math.ceil(this.dayNight.remainingMs / 1000);
    this.scoreText?.setText(
      `${getPhaseLabel(this.dayNight.phase)}: ${seconds}   Цикл: ${this.dayNight.cycle}   Рейтинг: ${this.score}   Рекорд: ${this.bestScore}   Объявления: ${this.collectedPosterCount}/${this.posters.length}   Свобода: ${paws}`,
    );
  }

  private createPosters(): void {
    for (const sprite of this.posterSprites.values()) {
      sprite.paper.destroy();
      sprite.glow.destroy();
      sprite.mark.destroy();
    }
    this.posterSprites.clear();

    const difficulty = getCycleDifficulty(this.dayNight.cycle);
    this.posters = createPosterStates(difficulty.posterCount);

    for (const poster of this.posters) {
      const glow = this.add.circle(poster.x, poster.y, 28, 0xfff1a0, 0.32);
      const paper = this.add.rectangle(poster.x, poster.y, 34, 44, 0xffee75).setStrokeStyle(2, 0x7d6824);
      const mark = this.add.text(poster.x, poster.y, '!', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '20px',
        color: '#7d6824',
      }).setOrigin(0.5);

      this.posterSprites.set(poster.id, { paper, glow, mark });
    }
  }

  private createHumans(): void {
    for (const human of this.humans) {
      human.destroy();
    }

    const difficulty = getCycleDifficulty(this.dayNight.cycle);
    const speed = difficulty.humanSpeedMultiplier;
    const nightView = difficulty.nightViewMultiplier;
    const humanConfigs = [
      { path: [{ x: 250, y: 180 }, { x: 720, y: 180 }], speed: 80, dayView: 115, nightView: 190 },
      { path: [{ x: 760, y: 470 }, { x: 260, y: 470 }], speed: 70, dayView: 105, nightView: 175 },
      { path: [{ x: 220, y: 585 }, { x: 790, y: 585 }], speed: 78, dayView: 110, nightView: 185 },
      { path: [{ x: 880, y: 160 }, { x: 880, y: 520 }], speed: 72, dayView: 105, nightView: 180 },
    ];

    this.humans = humanConfigs.slice(0, difficulty.humanCount).map((config) => new Human(
      this,
      config.path,
      config.speed * speed,
      config.dayView,
      70,
      config.nightView * nightView,
    ));

    const isNight = isNightLikePhase(this.dayNight.phase);
    for (const human of this.humans) {
      human.setNightMode(isNight);
    }
  }

  private startNewDayCycle(): void {
    this.collectedPosterCount = 0;
    this.dayClearAwarded = false;
    this.createPosters();
    this.createHumans();
    this.showPopup(CAT_RESPAWN.x, CAT_RESPAWN.y - 82, `Новый день: ${this.posters.length} объявлений!`, '#2e7d32');
  }

  private showPhaseNotice(): void {
    const { width, height } = this.scale;
    this.phaseNotice?.destroy();
    const text = this.dayNight.phase === 'night'
      ? 'Ночь! Люди включили фонарики 🌙'
      : this.dayNight.phase === 'day'
        ? 'Рассвело! Срывай объявления ☀'
        : getPhaseLabel(this.dayNight.phase);

    this.phaseNotice = this.add.text(width / 2, height / 2 - 210, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '30px',
      color: '#ffffff',
      backgroundColor: 'rgba(32, 23, 43, 0.82)',
      padding: { x: 14, y: 8 },
    }).setOrigin(0.5).setDepth(210);

    this.tweens.add({
      targets: this.phaseNotice,
      alpha: 0,
      y: height / 2 - 245,
      duration: 1300,
      onComplete: () => {
        this.phaseNotice?.destroy();
        this.phaseNotice = undefined;
      },
    });
  }

  private showPopup(x: number, y: number, text: string, color: string): void {
    const popup = this.add.text(x, y, text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '24px',
      color,
      backgroundColor: 'rgba(255,255,255,0.84)',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setDepth(220);

    this.tweens.add({
      targets: popup,
      y: y - 30,
      alpha: 0,
      duration: 750,
      onComplete: () => popup.destroy(),
    });
  }

  private showHomeResult(): void {
    const { width, height } = this.scale;
    const bestScoreResult = saveBestScoreIfHigher(window.localStorage, this.score);
    this.bestScore = bestScoreResult.bestScore;
    const recordText = bestScoreResult.isNewRecord ? 'Новый рекорд! ★' : `Рекорд: ${bestScoreResult.bestScore}`;
    const resultDepth = 300;
    this.add.rectangle(width / 2, height / 2, width, height, 0x20172b, 0.72).setDepth(resultDepth);
    this.add.rectangle(width / 2, height / 2, 720, 430, 0xfff3dc).setStrokeStyle(5, 0x7c4d2b).setDepth(resultDepth + 1);
    this.add.text(width / 2, height / 2 - 155, 'Чешка вернулась домой', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '38px',
      color: '#4d2c1d',
      align: 'center',
    }).setOrigin(0.5).setDepth(resultDepth + 2);
    this.add.text(
      width / 2,
      height / 2 - 72,
      'Тебя поймали три раза. Теперь Чешка дома —\nсытая, целая и немного недовольная.\nНо двор всё ещё ждёт её следующий побег.',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '22px',
        color: '#5d4037',
        align: 'center',
        lineSpacing: 8,
      },
    ).setOrigin(0.5).setDepth(resultDepth + 2);
    this.add.text(
      width / 2,
      height / 2 + 70,
      `Рейтинг прогулки: ${this.score}\n${recordText}\nСорвано объявлений: ${this.totalCollectedPosterCount}\nПережито ночей: ${this.survivedNightCount}`,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '23px',
        color: '#2e7d32',
        align: 'center',
        lineSpacing: 6,
      },
    ).setOrigin(0.5).setDepth(resultDepth + 2);

    const restartButton = this.add.rectangle(width / 2, height / 2 + 170, 250, 52, 0x79b66a)
      .setStrokeStyle(3, 0x315a2c)
      .setDepth(resultDepth + 2)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height / 2 + 170, 'Сбежать снова', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(resultDepth + 3);
    restartButton.on('pointerdown', () => this.scene.restart());
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

    this.bushes = [
      { x: 330, y: 290, radius: 42 },
      { x: 515, y: 180, radius: 36 },
      { x: 620, y: 390, radius: 48 },
    ];

    for (const bush of this.bushes) {
      this.add.circle(bush.x, bush.y, bush.radius, 0x3f8f48);
    }

    this.add.rectangle(430, 340, 120, 52, 0x5d6f8f).setStrokeStyle(2, 0x28364e);
    this.add.text(430, 340, 'машина', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }
}
