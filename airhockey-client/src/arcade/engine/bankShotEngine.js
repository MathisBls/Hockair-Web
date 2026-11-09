import {
  GameEventType,
  HALF_LENGTH,
  MALLET,
  PUCK,
  Side,
} from '../../game/constants';
import { getPuckSpeed } from '../../game/engine/physics';
import {
  BANK_SHOT_LEVELS,
  computeStarsForShot,
  findBankShotLevelIndex,
} from '../bankShotLevels';

import { ArcadeEngine, ArcadeEventType } from './arcadeEngine';
import { createObstacleState } from './obstacles';

export const BankShotState = Object.freeze({
  AIMING: 'aiming',
  ROLLING: 'rolling',
  RESETTING: 'resetting',
});

export const ShotOutcome = Object.freeze({
  SCORED: 'scored',
  OWN_GOAL: 'ownGoal',
  STOPPED: 'stopped',
});

const SHOT_START_SPEED = 0.3;
const PLAYER_CONTACT_GRACE_SECONDS = 0.12;
const ROLL_STOP_SPEED = 0.06;
const MAX_ROLL_SECONDS = 8;
const RESET_DELAY_SECONDS = 0.7;
const RESET_CLEARANCE = MALLET.radius + PUCK.radius + 0.03;
const START_MARKER_RADIUS = PUCK.radius * 1.6;

export class BankShotEngine extends ArcadeEngine {
  constructor({ levelId }) {
    super({
      puckCount: 1,
      countdownSeconds: 0,
      initialSnapshot: BankShotEngine.buildInitialSnapshot(),
    });
    this.selectLevel(levelId);
  }

  static buildInitialSnapshot() {
    return {
      levelId: null,
      levelIndex: 0,
      shotsAllowed: 0,
      shotsUsed: 0,
      shotsRemaining: 0,
      shotState: BankShotState.AIMING,
      lastOutcome: null,
      isCleared: false,
      stars: 0,
    };
  }

  get level() {
    return BANK_SHOT_LEVELS[this.levelIndex];
  }

  selectLevel(levelId) {
    const levelIndex = Math.max(0, findBankShotLevelIndex(levelId));
    this.levelIndex = levelIndex;
    this.obstacles = this.level.obstacles.map(createObstacleState);
    this.renderState.obstacles = this.obstacles;
    this.renderState.markers = [
      { ...this.level.start, radius: START_MARKER_RADIUS },
    ];
    this.store.patch({
      ...BankShotEngine.buildInitialSnapshot(),
      levelId: this.level.id,
      levelIndex,
      shotsAllowed: this.level.shots,
      shotsRemaining: this.level.shots,
    });
  }

  resetSession() {
    this.shotSeconds = 0;
    this.resetSeconds = 0;
    this.obstacles.forEach((obstacle) => {
      obstacle.x = obstacle.baseX;
    });
    this.store.patch({
      shotsUsed: 0,
      shotsRemaining: this.level.shots,
      shotState: BankShotState.AIMING,
      lastOutcome: null,
      isCleared: false,
      stars: 0,
    });
  }

  onPlayStart() {
    this.placePuckOnStart();
  }

  placePuckOnStart() {
    const [slot] = this.puckSlots;
    this.activatePuck(slot, this.level.start);
    this.store.patch({ shotState: BankShotState.AIMING });
  }

  startShot() {
    const shotsUsed = this.snapshot.shotsUsed + 1;
    this.shotSeconds = 0;
    this.emit({ type: ArcadeEventType.SHOT_FIRED });
    this.store.patch({
      shotsUsed,
      shotsRemaining: this.level.shots - shotsUsed,
      shotState: BankShotState.ROLLING,
      lastOutcome: null,
    });
  }

  endShot(slot, outcome) {
    if (outcome === ShotOutcome.SCORED) {
      const stars = computeStarsForShot(this.snapshot.shotsUsed);
      this.emit({
        type: GameEventType.GOAL,
        side: Side.PLAYER,
        x: slot.body.x,
        z: -HALF_LENGTH,
        strength: getPuckSpeed(slot.body),
      });
      this.emit({ type: ArcadeEventType.LEVEL_CLEARED, stars });
      this.deactivatePuck(slot);
      this.finish({ isCleared: true, stars, lastOutcome: outcome });

      return;
    }
    this.emit({ type: ArcadeEventType.SHOT_SPENT });
    if (this.snapshot.shotsRemaining <= 0) {
      this.finish({ isCleared: false, stars: 0, lastOutcome: outcome });

      return;
    }
    if (outcome === ShotOutcome.OWN_GOAL) {
      this.deactivatePuck(slot);
    }
    this.resetSeconds = RESET_DELAY_SECONDS;
    this.store.patch({
      shotState: BankShotState.RESETTING,
      lastOutcome: outcome,
    });
  }

  handlePuckStep(slot, scorerSide, events, dt) {
    const { shotState } = this.snapshot;
    if (shotState === BankShotState.AIMING) {
      if (getPuckSpeed(slot.body) > SHOT_START_SPEED) {
        this.startShot();
      }

      return;
    }
    if (shotState !== BankShotState.ROLLING) {
      return;
    }
    this.shotSeconds += dt;
    if (this.shotSeconds > PLAYER_CONTACT_GRACE_SECONDS) {
      slot.isPlayerContactEnabled = false;
    }
    if (scorerSide === Side.PLAYER) {
      this.endShot(slot, ShotOutcome.SCORED);

      return;
    }
    if (scorerSide === Side.BOT) {
      this.endShot(slot, ShotOutcome.OWN_GOAL);

      return;
    }
    const hasStopped =
      this.shotSeconds > PLAYER_CONTACT_GRACE_SECONDS &&
      getPuckSpeed(slot.body) < ROLL_STOP_SPEED;
    if (hasStopped || this.shotSeconds > MAX_ROLL_SECONDS) {
      this.endShot(slot, ShotOutcome.STOPPED);
    }
  }

  isMalletClearOfStart() {
    const mallet = this.mallets[Side.PLAYER];
    const { start } = this.level;

    return Math.hypot(mallet.x - start.x, mallet.z - start.z) > RESET_CLEARANCE;
  }

  updatePlaying(dt) {
    if (this.snapshot.shotState !== BankShotState.RESETTING) {
      return;
    }
    this.resetSeconds -= dt;
    if (this.resetSeconds <= 0 && this.isMalletClearOfStart()) {
      this.placePuckOnStart();
    }
  }
}
