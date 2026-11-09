import { GameEventType, PUCK } from '../../game/constants';

export const ObstacleKind = Object.freeze({
  BLOCK: 'block',
  BUMPER: 'bumper',
});

const BLOCK_RESTITUTION = PUCK.wallRestitution;
const BUMPER_RESTITUTION = 1.02;
const MIN_EVENT_STRENGTH = 0.25;
const HIT_GLOW_SECONDS = 0.35;
const EPSILON = 1e-6;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const createObstacleState = (definition) => ({
  ...definition,
  baseX: definition.x,
  vx: 0,
  vz: 0,
  hitGlowSeconds: 0,
});

export const moveObstacle = (obstacle, elapsedSeconds, dt) => {
  obstacle.hitGlowSeconds = Math.max(0, obstacle.hitGlowSeconds - dt);
  if (!obstacle.motion) {
    return;
  }
  const { amplitude, periodSeconds, phaseOffset = 0 } = obstacle.motion;
  const angularSpeed = (Math.PI * 2) / periodSeconds;
  const angle = elapsedSeconds * angularSpeed + phaseOffset;
  const nextX = obstacle.baseX + Math.sin(angle) * amplitude;
  obstacle.vx = Math.cos(angle) * amplitude * angularSpeed;
  obstacle.x = nextX;
};

const findContactNormal = (obstacle, puck) => {
  if (obstacle.kind === ObstacleKind.BUMPER) {
    const offsetX = puck.x - obstacle.x;
    const offsetZ = puck.z - obstacle.z;
    const distance = Math.hypot(offsetX, offsetZ);
    const contactDistance = obstacle.radius + PUCK.radius;
    if (distance >= contactDistance || distance < EPSILON) {
      return null;
    }

    return {
      normalX: offsetX / distance,
      normalZ: offsetZ / distance,
      depth: contactDistance - distance,
    };
  }

  const halfWidth = obstacle.width / 2;
  const halfDepth = obstacle.depth / 2;
  const closestX = clamp(
    puck.x,
    obstacle.x - halfWidth,
    obstacle.x + halfWidth
  );
  const closestZ = clamp(
    puck.z,
    obstacle.z - halfDepth,
    obstacle.z + halfDepth
  );
  const offsetX = puck.x - closestX;
  const offsetZ = puck.z - closestZ;
  const distance = Math.hypot(offsetX, offsetZ);
  if (distance >= PUCK.radius) {
    return null;
  }
  if (distance > EPSILON) {
    return {
      normalX: offsetX / distance,
      normalZ: offsetZ / distance,
      depth: PUCK.radius - distance,
    };
  }

  const penetrationX = halfWidth - Math.abs(puck.x - obstacle.x);
  const penetrationZ = halfDepth - Math.abs(puck.z - obstacle.z);
  if (penetrationX < penetrationZ) {
    return {
      normalX: Math.sign(puck.x - obstacle.x) || 1,
      normalZ: 0,
      depth: penetrationX + PUCK.radius,
    };
  }

  return {
    normalX: 0,
    normalZ: Math.sign(puck.z - obstacle.z) || 1,
    depth: penetrationZ + PUCK.radius,
  };
};

const resolveObstacle = (obstacle, puck, events) => {
  const contact = findContactNormal(obstacle, puck);
  if (!contact) {
    return;
  }
  const { normalX, normalZ, depth } = contact;
  puck.x += normalX * depth;
  puck.z += normalZ * depth;

  const relativeVx = puck.vx - obstacle.vx;
  const relativeVz = puck.vz - obstacle.vz;
  const approachSpeed = relativeVx * normalX + relativeVz * normalZ;
  if (approachSpeed >= 0) {
    return;
  }
  const restitution =
    obstacle.kind === ObstacleKind.BUMPER
      ? BUMPER_RESTITUTION
      : BLOCK_RESTITUTION;
  puck.vx -= (1 + restitution) * approachSpeed * normalX;
  puck.vz -= (1 + restitution) * approachSpeed * normalZ;
  puck.spin *= -0.5;

  if (-approachSpeed > MIN_EVENT_STRENGTH) {
    obstacle.hitGlowSeconds = HIT_GLOW_SECONDS;
    events.push({
      type: GameEventType.WALL_HIT,
      x: puck.x - normalX * PUCK.radius,
      z: puck.z - normalZ * PUCK.radius,
      strength: -approachSpeed,
    });
  }
};

export const resolveObstacles = (obstacles, puck, events) => {
  obstacles.forEach((obstacle) => resolveObstacle(obstacle, puck, events));
};

export const getObstacleHitGlow = (obstacle) =>
  obstacle.hitGlowSeconds / HIT_GLOW_SECONDS;
