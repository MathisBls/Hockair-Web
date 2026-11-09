import {
  GameEventType,
  GOAL_HALF_WIDTH,
  HALF_LENGTH,
  HALF_WIDTH,
  METERS_PER_SECOND_TO_KMH,
  PUCK,
  Side,
} from '../../game/constants';
import { BOT_HOME_Z, getPuckSpeed } from '../../game/engine/physics';

import { ArcadeEngine, ArcadeEventType } from './arcadeEngine';

export const GOALIE_LIVES = 3;
const PUCK_SLOT_COUNT = 3;
const LAUNCH_Z = -0.62;
const LAUNCH_MAX_X = 0.36;
const SHOOTER_Z = BOT_HOME_Z;
const AIM_Z = HALF_LENGTH + 0.2;
const AIM_SPREAD = (GOAL_HALF_WIDTH - PUCK.radius) * 0.85;
const BANK_WALL_X = HALF_WIDTH - PUCK.radius;
const FIRST_SHOT_DELAY_SECONDS = 0.6;
const BASE_SHOT_SPEED = 2.3;
const SHOT_SPEED_PER_SAVE = 0.13;
const MAX_SHOT_SPEED = 6.6;
const BASE_COOLDOWN_SECONDS = 1.45;
const COOLDOWN_PER_SAVE = 0.05;
const MIN_COOLDOWN_SECONDS = 0.35;
const BASE_WINDUP_SECONDS = 0.6;
const MIN_WINDUP_SECONDS = 0.3;
const WINDUP_PER_SAVE = 0.012;
const BANK_SHOTS_FROM_SAVES = 3;
const BANK_CHANCE_PER_SAVE = 0.04;
const MAX_BANK_CHANCE = 0.5;
const DOUBLE_SHOTS_FROM_SAVES = 10;
const DOUBLE_SHOT_CHANCE = 0.3;
const DOUBLE_SHOT_DELAY_SECONDS = 0.2;
const CLEARED_DESPAWN_Z = -0.45;
const STUCK_SPEED = 0.3;
const STUCK_SECONDS = 1;
const LIFE_LOST_GRACE_SECONDS = 0.9;
const SAVES_PER_LEVEL = 5;
const SHOOTER_MAX_SPEED = 3.2;

const ShotState = Object.freeze({
  WINDUP: 'windup',
  INCOMING: 'incoming',
  CLEARED: 'cleared',
});

const randomBetween = (min, max) => min + Math.random() * (max - min);

const toKmh = (speed) => Math.round(speed * METERS_PER_SECOND_TO_KMH);

export const getGoalieLevel = (saves) =>
  1 + Math.floor(saves / SAVES_PER_LEVEL);

export class GoalieReflexEngine extends ArcadeEngine {
  constructor() {
    super({
      puckCount: PUCK_SLOT_COUNT,
      hasShooter: true,
      initialSnapshot: GoalieReflexEngine.buildInitialSnapshot(),
    });
    this.mallets[Side.BOT].maxSpeed = SHOOTER_MAX_SPEED;
    this.resetSession();
  }

  static buildInitialSnapshot() {
    return {
      score: 0,
      lives: GOALIE_LIVES,
      level: 1,
      lastShotKmh: 0,
      fastestSaveKmh: 0,
      lastSave: null,
      lastConcede: null,
    };
  }

  resetSession() {
    this.shotCooldown = FIRST_SHOT_DELAY_SECONDS;
    this.pendingDoubleShot = null;
    this.eventSequence = 0;
    this.puckSlots.forEach((slot) => {
      slot.shotState = ShotState.WINDUP;
      slot.windupSeconds = 0;
      slot.stuckSeconds = 0;
      slot.aim = null;
    });
    this.setShooterTarget(0, SHOOTER_Z);
    this.store.patch(GoalieReflexEngine.buildInitialSnapshot());
  }

  getSaves() {
    return this.snapshot.score;
  }

  getShotSpeed() {
    return Math.min(
      MAX_SHOT_SPEED,
      BASE_SHOT_SPEED + this.getSaves() * SHOT_SPEED_PER_SAVE
    );
  }

  getWindupSeconds() {
    return Math.max(
      MIN_WINDUP_SECONDS,
      BASE_WINDUP_SECONDS - this.getSaves() * WINDUP_PER_SAVE
    );
  }

  getCooldownSeconds() {
    return Math.max(
      MIN_COOLDOWN_SECONDS,
      BASE_COOLDOWN_SECONDS - this.getSaves() * COOLDOWN_PER_SAVE
    );
  }

  pickAimX() {
    const targetX = randomBetween(-AIM_SPREAD, AIM_SPREAD);
    const saves = this.getSaves();
    const bankChance = Math.min(
      MAX_BANK_CHANCE,
      (saves - BANK_SHOTS_FROM_SAVES) * BANK_CHANCE_PER_SAVE
    );
    if (saves < BANK_SHOTS_FROM_SAVES || Math.random() > bankChance) {
      return targetX;
    }
    const wallX = Math.random() < 0.5 ? -BANK_WALL_X : BANK_WALL_X;

    return 2 * wallX - targetX;
  }

  prepareShot(launchX, windupSeconds) {
    const slot = this.findFreeSlot();
    if (!slot) {
      return false;
    }
    this.activatePuck(slot, { x: launchX, z: LAUNCH_Z });
    slot.shotState = ShotState.WINDUP;
    slot.windupSeconds = windupSeconds;
    slot.stuckSeconds = 0;
    slot.aim = { x: this.pickAimX(), speed: this.getShotSpeed() };

    return true;
  }

  fireShot(slot) {
    const puck = slot.body;
    const deltaX = slot.aim.x - puck.x;
    const deltaZ = AIM_Z - puck.z;
    const distance = Math.hypot(deltaX, deltaZ);
    puck.vx = (deltaX / distance) * slot.aim.speed;
    puck.vz = (deltaZ / distance) * slot.aim.speed;
    slot.shotState = ShotState.INCOMING;
    this.emit({
      type: GameEventType.MALLET_HIT,
      side: Side.BOT,
      x: puck.x,
      z: puck.z - PUCK.radius,
      strength: slot.aim.speed,
      puckIndex: slot.index,
    });
    this.emit({ type: ArcadeEventType.SHOT_FIRED });
    this.store.patch({ lastShotKmh: toKmh(slot.aim.speed) });
  }

  beginNextShot() {
    const launchX = randomBetween(-LAUNCH_MAX_X, LAUNCH_MAX_X);
    const windupSeconds = this.getWindupSeconds();
    if (!this.prepareShot(launchX, windupSeconds)) {
      return;
    }
    this.setShooterTarget(launchX, SHOOTER_Z);
    this.shotCooldown = windupSeconds + this.getCooldownSeconds();
    const isDoubleShot =
      this.getSaves() >= DOUBLE_SHOTS_FROM_SAVES &&
      Math.random() < DOUBLE_SHOT_CHANCE;
    if (isDoubleShot) {
      this.pendingDoubleShot = {
        x: -launchX,
        windupSeconds: windupSeconds + DOUBLE_SHOT_DELAY_SECONDS,
      };
    }
  }

  registerSave(slot, hitEvent) {
    const saves = this.getSaves() + 1;
    const kmh = toKmh(slot.aim.speed);
    slot.shotState = ShotState.CLEARED;
    this.eventSequence += 1;
    this.emit({
      type: GameEventType.SAVE,
      side: Side.PLAYER,
      x: hitEvent.x,
      z: hitEvent.z,
      strength: hitEvent.strength,
    });
    this.store.patch({
      score: saves,
      level: getGoalieLevel(saves),
      fastestSaveKmh: Math.max(this.snapshot.fastestSaveKmh, kmh),
      lastSave: { id: this.eventSequence, kmh },
    });
  }

  registerConcede(slot) {
    const lives = this.snapshot.lives - 1;
    const puck = slot.body;
    this.eventSequence += 1;
    this.emit({
      type: GameEventType.GOAL,
      side: Side.BOT,
      x: puck.x,
      z: HALF_LENGTH,
      strength: getPuckSpeed(puck),
    });
    this.emit({ type: ArcadeEventType.LIFE_LOST, lives });
    this.deactivatePuck(slot);
    this.shotCooldown = Math.max(this.shotCooldown, LIFE_LOST_GRACE_SECONDS);
    this.store.patch({ lives, lastConcede: { id: this.eventSequence } });
    if (lives <= 0) {
      this.getActiveSlots().forEach((activeSlot) =>
        this.deactivatePuck(activeSlot)
      );
      this.emit({ type: ArcadeEventType.GAME_OVER });
      this.finish({ finalScore: this.getSaves() });
    }
  }

  handlePuckStep(slot, scorerSide, events, dt) {
    if (scorerSide === Side.BOT) {
      this.registerConcede(slot);

      return;
    }
    if (scorerSide === Side.PLAYER) {
      this.deactivatePuck(slot);

      return;
    }
    const puck = slot.body;
    events.forEach((event) => {
      const isClearingHit =
        event.type === GameEventType.MALLET_HIT &&
        event.side === Side.PLAYER &&
        event.puckVz < 0;
      if (isClearingHit && slot.shotState === ShotState.INCOMING) {
        this.registerSave(slot, event);
      }
    });

    if (slot.shotState === ShotState.CLEARED && puck.z < CLEARED_DESPAWN_Z) {
      this.deactivatePuck(slot);

      return;
    }
    if (slot.shotState === ShotState.WINDUP) {
      return;
    }
    const isStuck = getPuckSpeed(puck) < STUCK_SPEED;
    slot.stuckSeconds = isStuck ? slot.stuckSeconds + dt : 0;
    if (slot.stuckSeconds > STUCK_SECONDS) {
      this.deactivatePuck(slot);
    }
  }

  updatePlaying(dt) {
    this.puckSlots.forEach((slot) => {
      if (!slot.isActive || slot.shotState !== ShotState.WINDUP) {
        return;
      }
      slot.windupSeconds -= dt;
      if (slot.windupSeconds <= 0) {
        this.fireShot(slot);
      }
    });
    if (this.pendingDoubleShot) {
      const { x, windupSeconds } = this.pendingDoubleShot;
      this.pendingDoubleShot = null;
      this.prepareShot(x, windupSeconds);
    }
    this.shotCooldown -= dt;
    if (this.shotCooldown <= 0) {
      this.beginNextShot();
    }
  }

  getFocusSlot() {
    const activeSlots = this.getActiveSlots();
    if (activeSlots.length === 0) {
      return null;
    }

    return activeSlots.reduce((closest, slot) =>
      slot.body.z > closest.body.z ? slot : closest
    );
  }
}
