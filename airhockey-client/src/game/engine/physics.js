import {
  GameEventType,
  GOAL_HALF_WIDTH,
  HALF_LENGTH,
  HALF_WIDTH,
  MALLET,
  PUCK,
  Side,
} from '../constants';

const CONTACT_DISTANCE = PUCK.radius + MALLET.radius;
const MIN_EVENT_STRENGTH = 0.25;
const HIT_COOLDOWN_SECONDS = 0.08;
const GOAL_DEPTH = PUCK.radius * 2.2;

const createMallet = (z) => ({
  x: 0,
  z,
  vx: 0,
  vz: 0,
  targetX: 0,
  targetZ: z,
  maxSpeed: MALLET.maxSpeed,
  hitCooldown: 0,
});

export const PLAYER_HOME_Z = HALF_LENGTH - 0.25;
export const BOT_HOME_Z = -HALF_LENGTH + 0.25;

export const createWorld = () => ({
  puck: { x: 0, z: 0, vx: 0, vz: 0, spin: 0, angle: 0 },
  mallets: {
    [Side.PLAYER]: createMallet(PLAYER_HOME_Z),
    [Side.BOT]: createMallet(BOT_HOME_Z),
  },
});

export const getPuckSpeed = (puck) => Math.hypot(puck.vx, puck.vz);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const clampMalletPosition = (side, x, z) => {
  const limitX = HALF_WIDTH - MALLET.radius;
  const nearCenter = MALLET.centerLineGap + MALLET.radius;
  const nearWall = HALF_LENGTH - MALLET.radius;
  const clampedX = clamp(x, -limitX, limitX);
  const clampedZ =
    side === Side.PLAYER
      ? clamp(z, nearCenter, nearWall)
      : clamp(z, -nearWall, -nearCenter);

  return { x: clampedX, z: clampedZ };
};

const moveMallet = (side, mallet, dt) => {
  const target = clampMalletPosition(side, mallet.targetX, mallet.targetZ);
  const deltaX = target.x - mallet.x;
  const deltaZ = target.z - mallet.z;
  const distance = Math.hypot(deltaX, deltaZ);
  const maxTravel = mallet.maxSpeed * dt;
  const travelRatio = distance > maxTravel ? maxTravel / distance : 1;
  const stepX = deltaX * travelRatio;
  const stepZ = deltaZ * travelRatio;

  mallet.x += stepX;
  mallet.z += stepZ;
  mallet.vx = stepX / dt;
  mallet.vz = stepZ / dt;
  mallet.hitCooldown = Math.max(0, mallet.hitCooldown - dt);
};

const capPuckSpeed = (puck) => {
  const speed = getPuckSpeed(puck);
  if (speed > PUCK.maxSpeed) {
    const ratio = PUCK.maxSpeed / speed;
    puck.vx *= ratio;
    puck.vz *= ratio;
  }
};

const resolveMalletContact = (side, mallet, puck, events) => {
  const offsetX = puck.x - mallet.x;
  const offsetZ = puck.z - mallet.z;
  const distance = Math.hypot(offsetX, offsetZ);
  if (distance >= CONTACT_DISTANCE) {
    return;
  }

  const normalX = distance > 1e-6 ? offsetX / distance : 0;
  const normalZ =
    distance > 1e-6 ? offsetZ / distance : side === Side.PLAYER ? -1 : 1;

  puck.x = mallet.x + normalX * CONTACT_DISTANCE;
  puck.z = mallet.z + normalZ * CONTACT_DISTANCE;

  const relativeVx = puck.vx - mallet.vx;
  const relativeVz = puck.vz - mallet.vz;
  const approachSpeed = relativeVx * normalX + relativeVz * normalZ;
  if (approachSpeed >= 0) {
    return;
  }

  const impulse = -(1 + PUCK.malletRestitution) * approachSpeed;
  puck.vx += impulse * normalX;
  puck.vz += impulse * normalZ;
  puck.spin += (relativeVx * normalZ - relativeVz * normalX) * 6;
  capPuckSpeed(puck);

  if (mallet.hitCooldown <= 0 && -approachSpeed > MIN_EVENT_STRENGTH) {
    mallet.hitCooldown = HIT_COOLDOWN_SECONDS;
    events.push({
      type: GameEventType.MALLET_HIT,
      side,
      x: mallet.x + normalX * MALLET.radius,
      z: mallet.z + normalZ * MALLET.radius,
      strength: -approachSpeed,
      puckSpeed: getPuckSpeed(puck),
      puckVx: puck.vx,
      puckVz: puck.vz,
    });
  }
};

const pushWallEvent = (events, x, z, strength) => {
  if (strength > MIN_EVENT_STRENGTH) {
    events.push({ type: GameEventType.WALL_HIT, x, z, strength });
  }
};

const resolvePostContact = (puck, postX, postZ, events) => {
  const offsetX = puck.x - postX;
  const offsetZ = puck.z - postZ;
  const distance = Math.hypot(offsetX, offsetZ);
  if (distance >= PUCK.radius || distance < 1e-6) {
    return;
  }

  const normalX = offsetX / distance;
  const normalZ = offsetZ / distance;
  puck.x = postX + normalX * PUCK.radius;
  puck.z = postZ + normalZ * PUCK.radius;
  const approachSpeed = puck.vx * normalX + puck.vz * normalZ;
  if (approachSpeed < 0) {
    puck.vx -= (1 + PUCK.wallRestitution) * approachSpeed * normalX;
    puck.vz -= (1 + PUCK.wallRestitution) * approachSpeed * normalZ;
    pushWallEvent(events, postX, postZ, -approachSpeed);
  }
};

const resolveWalls = (puck, events) => {
  const limitX = HALF_WIDTH - PUCK.radius;
  if (puck.x < -limitX || puck.x > limitX) {
    const wallX = puck.x < 0 ? -HALF_WIDTH : HALF_WIDTH;
    puck.x = clamp(puck.x, -limitX, limitX);
    pushWallEvent(events, wallX, puck.z, Math.abs(puck.vx));
    puck.vx = -puck.vx * PUCK.wallRestitution;
    puck.spin *= -0.6;
  }

  const limitZ = HALF_LENGTH - PUCK.radius;
  const isInGoalMouth = Math.abs(puck.x) < GOAL_HALF_WIDTH;
  if (Math.abs(puck.z) > limitZ) {
    if (isInGoalMouth) {
      const postZ = puck.z > 0 ? HALF_LENGTH : -HALF_LENGTH;
      resolvePostContact(puck, GOAL_HALF_WIDTH, postZ, events);
      resolvePostContact(puck, -GOAL_HALF_WIDTH, postZ, events);
      if (Math.abs(puck.z) > HALF_LENGTH) {
        const limitInsideGoal = GOAL_HALF_WIDTH - PUCK.radius;
        puck.x = clamp(puck.x, -limitInsideGoal, limitInsideGoal);
      }
    } else {
      const wallZ = puck.z > 0 ? HALF_LENGTH : -HALF_LENGTH;
      puck.z = clamp(puck.z, -limitZ, limitZ);
      pushWallEvent(events, puck.x, wallZ, Math.abs(puck.vz));
      puck.vz = -puck.vz * PUCK.wallRestitution;
    }
  }
};

const separateMalletFromPuck = (side, mallet, puck) => {
  const offsetX = mallet.x - puck.x;
  const offsetZ = mallet.z - puck.z;
  const distance = Math.hypot(offsetX, offsetZ);
  if (distance >= CONTACT_DISTANCE || distance < 1e-6) {
    return;
  }

  const pushed = clampMalletPosition(
    side,
    puck.x + (offsetX / distance) * CONTACT_DISTANCE,
    puck.z + (offsetZ / distance) * CONTACT_DISTANCE
  );
  mallet.x = pushed.x;
  mallet.z = pushed.z;
};

const detectGoal = (puck) => {
  if (puck.z > HALF_LENGTH + GOAL_DEPTH) {
    return Side.BOT;
  }
  if (puck.z < -HALF_LENGTH - GOAL_DEPTH) {
    return Side.PLAYER;
  }

  return null;
};

export const stepWorld = (world, dt, events, { isPuckFrozen = false } = {}) => {
  const { puck, mallets } = world;
  moveMallet(Side.PLAYER, mallets[Side.PLAYER], dt);
  moveMallet(Side.BOT, mallets[Side.BOT], dt);

  if (isPuckFrozen) {
    return null;
  }

  const damping = Math.exp(-PUCK.friction * dt);
  puck.vx *= damping;
  puck.vz *= damping;
  puck.spin *= Math.exp(-1.5 * dt);
  puck.x += puck.vx * dt;
  puck.z += puck.vz * dt;
  puck.angle += puck.spin * dt;

  resolveMalletContact(Side.PLAYER, mallets[Side.PLAYER], puck, events);
  resolveMalletContact(Side.BOT, mallets[Side.BOT], puck, events);
  resolveWalls(puck, events);
  separateMalletFromPuck(Side.PLAYER, mallets[Side.PLAYER], puck);
  separateMalletFromPuck(Side.BOT, mallets[Side.BOT], puck);

  return detectGoal(puck);
};

export const predictPuckXAtZ = (puck, targetZ, maxSeconds = 1.6) => {
  const sampleSeconds = 1 / 120;
  const limitX = HALF_WIDTH - PUCK.radius;
  let { x, z, vx, vz } = puck;
  for (let elapsed = 0; elapsed < maxSeconds; elapsed += sampleSeconds) {
    const nextZ = z + vz * sampleSeconds;
    if ((z - targetZ) * (nextZ - targetZ) <= 0) {
      return x;
    }
    x += vx * sampleSeconds;
    z = nextZ;
    if (Math.abs(x) > limitX) {
      x = Math.sign(x) * limitX;
      vx = -vx * PUCK.wallRestitution;
    }
  }

  return null;
};

export const isHeadingIntoGoal = (puck, side) => {
  const goalZ = side === Side.PLAYER ? HALF_LENGTH : -HALF_LENGTH;
  const isMovingTowardGoal = side === Side.PLAYER ? puck.vz > 0 : puck.vz < 0;
  if (!isMovingTowardGoal) {
    return false;
  }
  const crossingX = predictPuckXAtZ(puck, goalZ, 2.5);

  return crossingX !== null && Math.abs(crossingX) < GOAL_HALF_WIDTH;
};
