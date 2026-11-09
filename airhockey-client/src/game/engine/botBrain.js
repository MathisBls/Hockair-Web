import {
  GOAL_HALF_WIDTH,
  HALF_LENGTH,
  HALF_WIDTH,
  MALLET,
  PUCK,
  Side,
} from '../constants';

import { BOT_HOME_Z, predictPuckXAtZ } from './physics';

const BotIntent = Object.freeze({
  RETURN_HOME: 'returnHome',
  DEFEND: 'defend',
  POSITION: 'position',
  STRIKE: 'strike',
});

const CONTACT_DISTANCE = PUCK.radius + MALLET.radius;
const DEFEND_Z = -HALF_LENGTH + 0.2;
const STRIKE_SECONDS = 0.22;
const FAST_INCOMING_SPEED = 1.4;
const SLOW_PUCK_SPEED = 0.9;

const randomBetween = (min, max) => min + Math.random() * (max - min);

export class BotBrain {
  constructor(params) {
    this.params = params;
    this.perceivedPuck = null;
    this.perceptionAge = 0;
    this.perceptionTimer = 0;
    this.intent = BotIntent.RETURN_HOME;
    this.strikeTimer = 0;
    this.shotTargetX = 0;
    this.hasCommittedToAttack = false;
    this.wasPuckInBotHalf = false;
    this.noiseX = 0;
  }

  reset() {
    this.perceivedPuck = null;
    this.intent = BotIntent.RETURN_HOME;
    this.strikeTimer = 0;
    this.hasCommittedToAttack = false;
    this.wasPuckInBotHalf = false;
  }

  perceive(puck, dt) {
    this.perceptionTimer -= dt;
    this.perceptionAge += dt;
    if (this.perceivedPuck === null || this.perceptionTimer <= 0) {
      this.perceivedPuck = { ...puck };
      this.perceptionAge = 0;
      this.perceptionTimer = this.params.reactionSeconds;
      this.noiseX = randomBetween(-1, 1) * this.params.aimError;
    }
    const age = this.perceptionAge * this.params.prediction;

    return {
      x: this.perceivedPuck.x + this.perceivedPuck.vx * age,
      z: this.perceivedPuck.z + this.perceivedPuck.vz * age,
      vx: this.perceivedPuck.vx,
      vz: this.perceivedPuck.vz,
    };
  }

  pickShotTarget() {
    const isBankShot = Math.random() < this.params.aggression * 0.35;
    const directX = randomBetween(-0.7, 0.7) * GOAL_HALF_WIDTH;
    if (!isBankShot) {
      return directX;
    }
    const wallSide = Math.random() < 0.5 ? -1 : 1;

    return wallSide * 2 * HALF_WIDTH - directX;
  }

  updateAttackCommitment(puck) {
    const isPuckInBotHalf = puck.z < 0;
    if (isPuckInBotHalf && !this.wasPuckInBotHalf) {
      this.hasCommittedToAttack = Math.random() < this.params.aggression;
      this.shotTargetX = this.pickShotTarget();
    }
    if (!isPuckInBotHalf) {
      this.hasCommittedToAttack = false;
      this.strikeTimer = 0;
    }
    this.wasPuckInBotHalf = isPuckInBotHalf;
  }

  computeStrikeAim(puck) {
    const aimX = this.shotTargetX + this.noiseX;
    const aimZ = HALF_LENGTH + 0.1;
    const deltaX = aimX - puck.x;
    const deltaZ = aimZ - puck.z;
    const length = Math.hypot(deltaX, deltaZ) || 1;

    return { dirX: deltaX / length, dirZ: deltaZ / length };
  }

  decideTarget(world, puck) {
    const mallet = world.mallets[Side.BOT];
    const puckSpeed = Math.hypot(puck.vx, puck.vz);
    const isPuckInBotHalf = puck.z < 0;
    const isIncoming = puck.vz < -0.2;

    if (this.strikeTimer > 0) {
      const { dirX, dirZ } = this.computeStrikeAim(puck);
      const reach = 0.28 * this.params.shotPower;

      return {
        intent: BotIntent.STRIKE,
        x: puck.x + dirX * reach,
        z: puck.z + dirZ * reach,
      };
    }

    if (isIncoming && puckSpeed > FAST_INCOMING_SPEED) {
      const predictedX = predictPuckXAtZ(puck, DEFEND_Z) ?? puck.x;
      const blendedX =
        puck.x + (predictedX - puck.x) * this.params.prediction + this.noiseX;

      return { intent: BotIntent.DEFEND, x: blendedX, z: DEFEND_Z };
    }

    const shouldAttack =
      isPuckInBotHalf &&
      (this.hasCommittedToAttack || puckSpeed < SLOW_PUCK_SPEED);
    if (shouldAttack) {
      const { dirX, dirZ } = this.computeStrikeAim(puck);
      const behindX = puck.x - dirX * (CONTACT_DISTANCE + 0.04);
      const behindZ = puck.z - dirZ * (CONTACT_DISTANCE + 0.04);
      const isMalletInFrontOfPuck = mallet.z > puck.z - PUCK.radius;
      if (isMalletInFrontOfPuck) {
        const sideSign = Math.sign(mallet.x - puck.x) || 1;

        return {
          intent: BotIntent.POSITION,
          x: puck.x + sideSign * (CONTACT_DISTANCE + 0.08),
          z: puck.z - CONTACT_DISTANCE - 0.06,
        };
      }
      const distanceToBehind = Math.hypot(
        mallet.x - behindX,
        mallet.z - behindZ
      );
      if (distanceToBehind < 0.05) {
        this.strikeTimer = STRIKE_SECONDS;
      }

      return { intent: BotIntent.POSITION, x: behindX, z: behindZ };
    }

    const trackRatio = 0.35 + 0.4 * this.params.prediction;

    return {
      intent: BotIntent.RETURN_HOME,
      x: puck.x * trackRatio * (GOAL_HALF_WIDTH / HALF_WIDTH) * 2,
      z: BOT_HOME_Z,
    };
  }

  update(world, dt) {
    const puck = this.perceive(world.puck, dt);
    this.updateAttackCommitment(puck);
    this.strikeTimer = Math.max(0, this.strikeTimer - dt);

    const decision = this.decideTarget(world, puck);
    const mallet = world.mallets[Side.BOT];
    const isStriking = decision.intent === BotIntent.STRIKE;
    const strikeSpeed = Math.min(
      MALLET.maxSpeed,
      this.params.maxSpeed * 1.5 * this.params.shotPower
    );

    this.intent = decision.intent;
    mallet.targetX = decision.x;
    mallet.targetZ = decision.z;
    mallet.maxSpeed = isStriking ? strikeSpeed : this.params.maxSpeed;
  }

  getIntent() {
    return this.intent;
  }
}
