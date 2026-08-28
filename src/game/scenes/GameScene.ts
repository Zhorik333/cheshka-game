import Phaser from 'phaser';
import { getPosterPulseFrame } from '../systems/ambientAnimation';
import { Cat } from '../entities/Cat';
import { Human } from '../entities/Human';
import { loadBestScore, saveBestScoreIfHigher } from '../systems/bestScore';
import { recordCatch, type CatchState } from '../systems/catch';
import { advanceDayNight, createDayNightState, fastForwardToPhaseEnd, getPhaseLabel, isNightLikePhase, type DayNightState } from '../systems/dayNight';
import { evaluateDayClearBonus } from '../systems/dayClearBonus';
import { createDashState, getDashCooldownRatio, getDashCooldownSeconds, isDashReady, performDash, type DashState } from '../systems/dash';
import { getDetectionDangerLevel, isCatDetected, type DetectionDangerLevel } from '../systems/detection';
import { getCycleDifficulty } from '../systems/difficulty';
import { FIRST_LEVEL_DESIGN, getFirstLevelBushes, getFirstLevelHumanPatrols, type LevelDecoration, type LevelPath } from '../systems/levelDesign';
import { getHidingStatus, updateHidingStatus } from '../systems/hidingStatus';
import { getPhaseObjective } from '../systems/phaseObjective';
import { createPosterComboState, recordPosterCombo, type PosterComboState } from '../systems/posterCombo';
import { collectNearbyPosters, type PosterState } from '../systems/posterCollection';
import { configureTelegramBackButton, getTelegramBackButton } from '../telegram/backButton';
import { shareGameResult } from '../telegram/shareResult';
import { createPosterStates } from '../systems/posterLayout';
import { getResultRank } from '../systems/resultRank';
import { createGameplayTapBlockers, isGameplayTap } from '../systems/tapTarget';
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
  phaseOffsetMs: number;
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
  private objectiveText?: Phaser.GameObjects.Text;
  private hidingText?: Phaser.GameObjects.Text;
  private dangerText?: Phaser.GameObjects.Text;
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
    const cleanupBackButton = configureTelegramBackButton(
      getTelegramBackButton(window),
      () => this.scene.start('MenuScene'),
    );
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, cleanupBackButton);

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
    this.objectiveText = undefined;
    this.hidingText = undefined;
    this.dangerText = undefined;
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
    this.objectiveText = this.add.text(24, 62, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#4d2c1d',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 10, y: 6 },
    }).setDepth(200);
    this.updateObjectiveIndicator();
    this.hidingText = this.add.text(24, 104, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#b3261e',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 10, y: 6 },
    }).setDepth(200);
    this.updateHidingIndicator(false);
    this.dangerText = this.add.text(24, 146, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '18px',
      color: '#2e7d32',
      backgroundColor: 'rgba(255,255,255,0.72)',
      padding: { x: 10, y: 6 },
    }).setDepth(200);
    this.updateDangerIndicator();

    const tapBlockers = createGameplayTapBlockers(width, height, import.meta.env.DEV);
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const tapPoint = { x: pointer.worldX, y: pointer.worldY };
      if (!this.catchState.ended && isGameplayTap(tapPoint, tapBlockers)) {
        this.cat?.setTarget(tapPoint);
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
    this.updateObjectiveIndicator();
    this.updateHidingIndicator(true);
    this.updateDangerIndicator();
    this.checkHumanDetection(time);
    this.updateDashButton(time);
    this.updatePosterAnimations(time);
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

  private updateObjectiveIndicator(): void {
    this.objectiveText?.setText(getPhaseObjective({
      phase: this.dayNight.phase,
      remainingMs: this.dayNight.remainingMs,
      collectedPosters: this.collectedPosterCount,
      totalPosters: this.posters.length,
    }));
  }

  private updateDangerIndicator(): void {
    if (!this.cat) {
      return;
    }

    const dangerLevel = this.getCurrentDangerLevel();
    const dangerStatus = this.getDangerStatus(dangerLevel);
    this.dangerText?.setText(dangerStatus.label);
    this.dangerText?.setColor(dangerStatus.color);
  }

  private getCurrentDangerLevel(): DetectionDangerLevel {
    if (!this.cat) {
      return 'safe';
    }

    let level: DetectionDangerLevel = 'safe';
    for (const human of this.humans) {
      const humanLevel = getDetectionDangerLevel(human.toDetectionHuman(), this.cat.position, this.catIsHidden);
      if (humanLevel === 'detected') {
        return 'detected';
      }
      if (humanLevel === 'warning') {
        level = 'warning';
      }
    }
    return level;
  }

  private getDangerStatus(level: DetectionDangerLevel): { label: string; color: string } {
    switch (level) {
      case 'detected':
        return { label: 'Опасность: поймали!', color: '#b3261e' };
      case 'warning':
        return { label: 'Опасность: рядом фонарик!', color: '#c77700' };
      case 'safe':
        return { label: 'Опасность: спокойно', color: '#2e7d32' };
    }
  }

  private fastForwardCurrentPhase(): void {
    if (this.catchState.ended) {
      return;
    }

    this.dayNight = fastForwardToPhaseEnd(this.dayNight);
    this.showPopup(CAT_RESPAWN.x, CAT_RESPAWN.y - 132, 'Dev: следующая фаза через 1 мс', '#6d4c9f');
    this.updateObjectiveIndicator();
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
    this.updateObjectiveIndicator();
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
    this.updateObjectiveIndicator();
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
      const phaseOffsetMs = Number.parseInt(poster.id.replace('poster-', ''), 10) * 113;

      this.posterSprites.set(poster.id, { paper, glow, mark, phaseOffsetMs });
    }
    this.updatePosterAnimations(this.time.now);
  }

  private updatePosterAnimations(timeMs: number): void {
    for (const sprite of this.posterSprites.values()) {
      const pulse = getPosterPulseFrame(timeMs, sprite.phaseOffsetMs);
      sprite.glow.setAlpha(pulse.alpha);
      sprite.glow.setScale(pulse.scale);
      sprite.paper.setAngle(Math.sin((timeMs + sprite.phaseOffsetMs) / 520) * 2.2);
      sprite.mark.setY(sprite.paper.y - 1 + Math.sin((timeMs + sprite.phaseOffsetMs) / 260) * 1.5);
    }
  }

  private createHumans(): void {
    for (const human of this.humans) {
      human.destroy();
    }

    const difficulty = getCycleDifficulty(this.dayNight.cycle);
    const speed = difficulty.humanSpeedMultiplier;
    const nightView = difficulty.nightViewMultiplier;
    const levelPatrols = getFirstLevelHumanPatrols(difficulty.humanCount);

    this.humans = levelPatrols.map((config) => new Human(
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
    const rank = getResultRank({
      score: this.score,
      postersTorn: this.totalCollectedPosterCount,
      nightsSurvived: this.survivedNightCount,
    });
    const resultDepth = 300;
    this.add.rectangle(width / 2, height / 2, width, height, 0x20172b, 0.72).setDepth(resultDepth);
    this.add.rectangle(width / 2, height / 2, 720, 470, 0xfff3dc).setStrokeStyle(5, 0x7c4d2b).setDepth(resultDepth + 1);
    this.add.text(width / 2, height / 2 - 175, 'Чешка вернулась домой', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '38px',
      color: '#4d2c1d',
      align: 'center',
    }).setOrigin(0.5).setDepth(resultDepth + 2);
    this.add.text(width / 2, height / 2 - 124, `${rank.title}\n${rank.description}`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#6d4c9f',
      align: 'center',
      lineSpacing: 5,
    }).setOrigin(0.5).setDepth(resultDepth + 2);
    this.add.text(
      width / 2,
      height / 2 - 48,
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
      height / 2 + 92,
      `Рейтинг прогулки: ${this.score}\n${recordText}\nСорвано объявлений: ${this.totalCollectedPosterCount}\nПережито ночей: ${this.survivedNightCount}`,
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '23px',
        color: '#2e7d32',
        align: 'center',
        lineSpacing: 6,
      },
    ).setOrigin(0.5).setDepth(resultDepth + 2);

    const restartButton = this.add.rectangle(width / 2 - 145, height / 2 + 194, 250, 52, 0x79b66a)
      .setStrokeStyle(3, 0x315a2c)
      .setDepth(resultDepth + 2)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2 - 145, height / 2 + 194, 'Сбежать снова', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(resultDepth + 3);
    restartButton.on('pointerdown', () => this.scene.restart());

    const shareButton = this.add.rectangle(width / 2 + 145, height / 2 + 194, 250, 52, 0x6d4c9f)
      .setStrokeStyle(3, 0x3b255d)
      .setDepth(resultDepth + 2)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2 + 145, height / 2 + 194, 'Поделиться', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '22px',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(resultDepth + 3);
    shareButton.on('pointerdown', () => {
      shareGameResult({
        locationHref: window.location.href,
        telegramWebApp: (window as { Telegram?: { WebApp?: { openTelegramLink?: (url: string) => void } } }).Telegram?.WebApp,
        assignLocation: (url) => window.location.assign(url),
      }, {
        score: this.score,
        postersTorn: this.totalCollectedPosterCount,
        nightsSurvived: this.survivedNightCount,
        rankTitle: rank.title,
      });
    });
  }

  private drawBudvaYard(width: number, height: number): void {
    this.add.rectangle(width / 2, height / 2, width, height, 0xd8c49a);

    for (const path of FIRST_LEVEL_DESIGN.paths) {
      this.drawStonePath(path);
    }

    for (const zone of FIRST_LEVEL_DESIGN.zones) {
      const shape = this.add.rectangle(zone.x, zone.y, zone.width, zone.height, zone.fill);
      if (zone.stroke !== undefined) {
        shape.setStrokeStyle(3, zone.stroke);
      }
      this.add.text(zone.x, zone.y, zone.label, {
        fontFamily: 'Arial, sans-serif',
        fontSize: zone.id === 'old-wall' ? '16px' : '18px',
        color: zone.labelColor,
        align: 'center',
      }).setOrigin(0.5);
    }

    this.drawLevelDecorations(FIRST_LEVEL_DESIGN.decorations);

    this.bushes = getFirstLevelBushes();
    for (const bush of this.bushes) {
      this.add.circle(bush.x, bush.y, bush.radius + 8, 0x2d6e37, 0.18);
      this.add.circle(bush.x - 9, bush.y + 4, bush.radius * 0.74, 0x3f8f48);
      this.add.circle(bush.x + 11, bush.y - 3, bush.radius * 0.68, 0x4da65a);
      this.add.circle(bush.x + 1, bush.y + 12, bush.radius * 0.56, 0x2f7d3b);
      this.add.text(bush.x, bush.y + bush.radius + 14, 'укрытие', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        color: '#21552a',
        backgroundColor: 'rgba(255,255,255,0.54)',
        padding: { x: 3, y: 1 },
      }).setOrigin(0.5);
    }
  }

  private drawStonePath(path: LevelPath): void {
    const graphics = this.add.graphics();
    graphics.lineStyle(path.width, path.fill, path.alpha);
    const [start, ...points] = path.points;
    if (!start) {
      return;
    }
    graphics.beginPath();
    graphics.moveTo(start.x, start.y);
    for (const point of points) {
      graphics.lineTo(point.x, point.y);
    }
    graphics.strokePath();

    graphics.lineStyle(2, 0xfff3dc, 0.34);
    graphics.beginPath();
    graphics.moveTo(start.x, start.y);
    for (const point of points) {
      graphics.lineTo(point.x, point.y);
    }
    graphics.strokePath();
  }

  private drawLevelDecorations(decorations: LevelDecoration[]): void {
    for (const decoration of decorations) {
      if (decoration.kind === 'circle') {
        const circle = this.add.circle(decoration.x, decoration.y, decoration.radius ?? 16, decoration.fill);
        if (decoration.stroke !== undefined) {
          circle.setStrokeStyle(2, decoration.stroke);
        }
      } else {
        const rect = this.add.rectangle(decoration.x, decoration.y, decoration.width ?? 40, decoration.height ?? 40, decoration.fill);
        if (decoration.stroke !== undefined) {
          rect.setStrokeStyle(2, decoration.stroke);
        }
      }

      if (decoration.label) {
        this.add.text(decoration.x, decoration.y, decoration.label, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          color: decoration.labelColor ?? '#ffffff',
          align: 'center',
        }).setOrigin(0.5);
      }
    }
  }
}
