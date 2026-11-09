import {
  GameEventType,
  HALF_LENGTH,
  HALF_WIDTH,
  PUCK,
  Side,
} from '../../game/constants';
import { getPuckSpeed } from '../../game/engine/physics';

import { ArcadeEngine, ArcadeEventType, ArcadePhase } from './arcadeEngine';

export const TargetKind = Object.freeze({
  STANDARD: 'standard',
  GOLDEN: 'golden',
});

export const TARGET_RUSH_SECONDS = 60;
const TARGET_SLOT_COUNT = 4;
const ACTIVE_TARGET_COUNT = 3;
const SPAWN_DELAY_SECONDS = 0.35;
const GOLDEN_TARGET_CHANCE = 0.16;
const TARGET_DEFINITIONS = {
  [TargetKind.STANDARD]: { radius: 0.085, lifeSeconds: 5.5, points: 100 },
  [TargetKind.GOLDEN]: { radius: 0.06, lifeSeconds: 3.2, points: 300 },
};
const MIN_TARGET_SCALE = 0.72;
const SPAWN_MIN_X = -(HALF_WIDTH - 0.13);
const SPAWN_MAX_X = HALF_WIDTH - 0.13;
const SPAWN_MIN_Z = -HALF_LENGTH + 0.2;
const SPAWN_MAX_Z = -0.22;
const MIN_TARGET_SPACING = 0.24;
const SPAWN_ATTEMPTS = 12;
const SWAY_START_SECONDS = 25;
const SWAY_AMPLITUDE = 0.14;
const SWAY_PERIOD_SECONDS = 2.6;
const HIT_TOLERANCE = PUCK.radius * 0.6;
const SERVE_Z = 0.42;
const SERVE_DELAY_SECONDS = 0.5;
const STUCK_SPEED = 0.15;
const STUCK_SECONDS = 1.2;
const PLAYER_HALF_ENTRY_Z = 0.05;
const COMBO_THRESHOLDS = [0, 3, 6, 10];
const TIME_WARNING_SECONDS = 10;

const randomBetween = (min, max) => min + Math.random() * (max - min);

export const getComboMultiplier = (combo) =>
  COMBO_THRESHOLDS.filter((threshold) => combo >= threshold).length;

const createTargetSlot = (index) => ({
  index,
  id: 0,
  kind: TargetKind.STANDARD,
  x: 0,
  baseX: 0,
  z: 0,
  radius: 0,
  lifeSeconds: 0,
  maxLifeSeconds: 1,
  ageSeconds: 0,
  swayAmplitude: 0,
  swayPhase: 0,
  isActive: false,
});

export class TargetRushEngine extends ArcadeEngine {
  constructor() {
    super({
      puckCount: 1,
      initialSnapshot: TargetRushEngine.buildInitialSnapshot(),
    });
    this.targets = Array.from({ length: TARGET_SLOT_COUNT }, (_, index) =>
      createTargetSlot(index)
    );
    this.renderState.targets = this.targets;
    this.resetSession();
  }

  static buildInitialSnapshot() {
    return {
      score: 0,
      combo: 0,
      bestCombo: 0,
      multiplier: 1,
      targetsHit: 0,
      remainingSeconds: TARGET_RUSH_SECONDS,
      isTimeRunningOut: false,
      lastHit: null,
    };
  }

  resetSession() {
    this.targets.forEach((target) => {
      target.isActive = false;
    });
    this.targetSequence = 0;
    this.spawnCooldown = 0;
    this.serveCooldown = 0;
    this.stuckSeconds = 0;
    this.hasHitDuringRun = false;
    this.wasInOpponentHalf = false;
    this.store.patch(TargetRushEngine.buildInitialSnapshot());
  }

  onPlayStart() {
    this.servePuck();
    for (let index = 0; index < ACTIVE_TARGET_COUNT; index += 1) {
      this.spawnTarget();
    }
  }

  servePuck() {
    const [slot] = this.puckSlots;
    this.activatePuck(slot, { x: randomBetween(-0.15, 0.15), z: SERVE_Z });
    this.stuckSeconds = 0;
    this.wasInOpponentHalf = false;
    this.hasHitDuringRun = false;
  }

  getDifficultyRatio() {
    return Math.min(this.playSeconds / TARGET_RUSH_SECONDS, 1);
  }

  isSpotFree(x, z) {
    return this.targets.every(
      (target) =>
        !target.isActive ||
        Math.hypot(target.x - x, target.z - z) > MIN_TARGET_SPACING
    );
  }

  spawnTarget() {
    const slot = this.targets.find((target) => !target.isActive);
    if (!slot) {
      return;
    }
    const kind =
      Math.random() < GOLDEN_TARGET_CHANCE
        ? TargetKind.GOLDEN
        : TargetKind.STANDARD;
    const definition = TARGET_DEFINITIONS[kind];
    const difficulty = this.getDifficultyRatio();
    const scale = 1 - (1 - MIN_TARGET_SCALE) * difficulty;
    let x = 0;
    let z = 0;
    for (let attempt = 0; attempt < SPAWN_ATTEMPTS; attempt += 1) {
      x = randomBetween(SPAWN_MIN_X, SPAWN_MAX_X);
      z = randomBetween(SPAWN_MIN_Z, SPAWN_MAX_Z);
      if (this.isSpotFree(x, z)) {
        break;
      }
    }
    const isSwaying = this.playSeconds > SWAY_START_SECONDS;
    this.targetSequence += 1;
    Object.assign(slot, {
      id: this.targetSequence,
      kind,
      x,
      baseX: x,
      z,
      radius: definition.radius * scale,
      lifeSeconds: definition.lifeSeconds * (1 - difficulty * 0.3),
      maxLifeSeconds: definition.lifeSeconds * (1 - difficulty * 0.3),
      ageSeconds: 0,
      swayAmplitude: isSwaying ? SWAY_AMPLITUDE * randomBetween(0.6, 1) : 0,
      swayPhase: Math.random() * Math.PI * 2,
      isActive: true,
    });
  }

  beforePhysicsStep(dt) {
    if (this.arcadePhase !== ArcadePhase.PLAYING) {
      return;
    }
    const limitX = HALF_WIDTH - 0.1;
    this.targets.forEach((target) => {
      if (!target.isActive) {
        return;
      }
      target.ageSeconds += dt;
      const swayAngle =
        (target.ageSeconds / SWAY_PERIOD_SECONDS) * Math.PI * 2 +
        target.swayPhase;
      target.x = Math.max(
        -limitX,
        Math.min(
          limitX,
          target.baseX + Math.sin(swayAngle) * target.swayAmplitude
        )
      );
    });
  }

  registerHit(target, puck) {
    const { combo, score, targetsHit, bestCombo } = this.snapshot;
    const nextCombo = combo + 1;
    const multiplier = getComboMultiplier(nextCombo);
    const points = TARGET_DEFINITIONS[target.kind].points * multiplier;
    target.isActive = false;
    this.hasHitDuringRun = true;
    this.spawnCooldown = SPAWN_DELAY_SECONDS;
    const isGolden = target.kind === TargetKind.GOLDEN;
    this.emit({
      type: isGolden ? GameEventType.SAVE : GameEventType.MALLET_HIT,
      side: Side.BOT,
      x: target.x,
      z: target.z,
      strength: 5,
    });
    this.emit({
      type: ArcadeEventType.TARGET_HIT,
      combo: nextCombo,
      isGolden,
      speed: getPuckSpeed(puck),
    });
    this.store.patch({
      score: score + points,
      combo: nextCombo,
      bestCombo: Math.max(bestCombo, nextCombo),
      multiplier,
      targetsHit: targetsHit + 1,
      lastHit: { id: target.id, points, multiplier, isGolden },
    });
  }

  breakCombo() {
    if (this.snapshot.combo > 0) {
      this.emit({ type: ArcadeEventType.COMBO_LOST });
      this.store.patch({ combo: 0, multiplier: 1 });
    }
  }

  handlePuckStep(slot, scorerSide, events, dt) {
    const puck = slot.body;
    this.targets.forEach((target) => {
      if (
        target.isActive &&
        Math.hypot(puck.x - target.x, puck.z - target.z) <
          target.radius + HIT_TOLERANCE
      ) {
        this.registerHit(target, puck);
      }
    });

    if (puck.z < 0) {
      this.wasInOpponentHalf = true;
    } else if (puck.z > PLAYER_HALF_ENTRY_Z && this.wasInOpponentHalf) {
      this.wasInOpponentHalf = false;
      if (!this.hasHitDuringRun) {
        this.breakCombo();
      }
      this.hasHitDuringRun = false;
    }

    if (scorerSide === Side.BOT) {
      this.breakCombo();
      this.deactivatePuck(slot);
      this.serveCooldown = SERVE_DELAY_SECONDS;

      return;
    }
    if (scorerSide === Side.PLAYER) {
      this.endRun(slot, SERVE_DELAY_SECONDS);

      return;
    }

    const isStuckOutOfReach = puck.z < 0 && getPuckSpeed(puck) < STUCK_SPEED;
    this.stuckSeconds = isStuckOutOfReach ? this.stuckSeconds + dt : 0;
    if (this.stuckSeconds > STUCK_SECONDS) {
      this.endRun(slot, SERVE_DELAY_SECONDS * 0.5);
    }
  }

  endRun(slot, serveDelaySeconds) {
    if (!this.hasHitDuringRun) {
      this.breakCombo();
    }
    this.deactivatePuck(slot);
    this.serveCooldown = serveDelaySeconds;
  }

  updateTargetLifetimes(dt) {
    this.targets.forEach((target) => {
      if (!target.isActive) {
        return;
      }
      target.lifeSeconds -= dt;
      if (target.lifeSeconds <= 0) {
        target.isActive = false;
        this.spawnCooldown = Math.min(this.spawnCooldown, SPAWN_DELAY_SECONDS);
        this.emit({
          type: GameEventType.WALL_HIT,
          x: target.x,
          z: target.z,
          strength: 0.3,
        });
      }
    });
    const activeCount = this.targets.filter((target) => target.isActive).length;
    this.spawnCooldown -= dt;
    if (activeCount < ACTIVE_TARGET_COUNT && this.spawnCooldown <= 0) {
      this.spawnTarget();
      this.spawnCooldown = SPAWN_DELAY_SECONDS;
    }
  }

  updatePlaying(dt) {
    this.updateTargetLifetimes(dt);
    const [slot] = this.puckSlots;
    if (!slot.isActive) {
      this.serveCooldown -= dt;
      if (this.serveCooldown <= 0) {
        this.servePuck();
      }
    }

    const remainingSeconds = Math.max(
      0,
      Math.ceil(TARGET_RUSH_SECONDS - this.playSeconds)
    );
    if (remainingSeconds !== this.snapshot.remainingSeconds) {
      this.store.patch({
        remainingSeconds,
        isTimeRunningOut: remainingSeconds <= TIME_WARNING_SECONDS,
      });
    }
    if (remainingSeconds === 0) {
      this.targets.forEach((target) => {
        target.isActive = false;
      });
      this.emit({ type: ArcadeEventType.GAME_OVER });
      this.finish({ finalScore: this.snapshot.score });
    }
  }
}
