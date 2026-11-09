import { ObstacleKind } from './engine/obstacles';

export const MAX_STARS_PER_LEVEL = 3;
const DEFAULT_SHOTS = 3;

export const BANK_SHOT_LEVELS = [
  {
    id: 'first-bank',
    start: { x: 0, z: 0.4 },
    shots: DEFAULT_SHOTS,
    obstacles: [
      { kind: ObstacleKind.BLOCK, x: 0, z: -0.55, width: 0.62, depth: 0.07 },
    ],
  },
  {
    id: 'side-door',
    start: { x: -0.32, z: 0.4 },
    shots: DEFAULT_SHOTS,
    obstacles: [
      {
        kind: ObstacleKind.BLOCK,
        x: -0.14,
        z: -0.62,
        width: 0.78,
        depth: 0.07,
      },
      { kind: ObstacleKind.BLOCK, x: 0.1, z: -0.2, width: 0.5, depth: 0.07 },
    ],
  },
  {
    id: 'pinball',
    start: { x: 0.2, z: 0.45 },
    shots: DEFAULT_SHOTS,
    obstacles: [
      { kind: ObstacleKind.BUMPER, x: 0, z: -0.42, radius: 0.09 },
      { kind: ObstacleKind.BUMPER, x: -0.26, z: -0.68, radius: 0.07 },
      { kind: ObstacleKind.BUMPER, x: 0.26, z: -0.68, radius: 0.07 },
      { kind: ObstacleKind.BUMPER, x: 0, z: -0.86, radius: 0.065 },
    ],
  },
  {
    id: 'sliding-wall',
    start: { x: 0, z: 0.45 },
    shots: DEFAULT_SHOTS,
    obstacles: [
      {
        kind: ObstacleKind.BLOCK,
        x: 0,
        z: -0.6,
        width: 0.42,
        depth: 0.07,
        motion: { amplitude: 0.3, periodSeconds: 3.2 },
      },
      { kind: ObstacleKind.BUMPER, x: -0.38, z: -0.25, radius: 0.06 },
      { kind: ObstacleKind.BUMPER, x: 0.38, z: -0.25, radius: 0.06 },
    ],
  },
  {
    id: 'zigzag',
    start: { x: 0.3, z: 0.5 },
    shots: DEFAULT_SHOTS,
    obstacles: [
      { kind: ObstacleKind.BLOCK, x: 0.2, z: -0.38, width: 0.8, depth: 0.07 },
      { kind: ObstacleKind.BLOCK, x: -0.2, z: -0.72, width: 0.8, depth: 0.07 },
    ],
  },
  {
    id: 'goalkeeper',
    start: { x: -0.2, z: 0.45 },
    shots: DEFAULT_SHOTS,
    obstacles: [
      {
        kind: ObstacleKind.BLOCK,
        x: 0,
        z: -0.96,
        width: 0.2,
        depth: 0.06,
        motion: { amplitude: 0.17, periodSeconds: 1.8 },
      },
      { kind: ObstacleKind.BUMPER, x: -0.3, z: -0.5, radius: 0.07 },
      { kind: ObstacleKind.BUMPER, x: 0.3, z: -0.5, radius: 0.07 },
      { kind: ObstacleKind.BLOCK, x: 0, z: -0.3, width: 0.24, depth: 0.07 },
    ],
  },
  {
    id: 'narrow-gap',
    start: { x: 0.4, z: 0.55 },
    shots: DEFAULT_SHOTS,
    obstacles: [
      { kind: ObstacleKind.BLOCK, x: -0.1, z: -0.5, width: 0.9, depth: 0.07 },
      { kind: ObstacleKind.BUMPER, x: 0.2, z: -0.85, radius: 0.07 },
      { kind: ObstacleKind.BLOCK, x: 0.38, z: -0.2, width: 0.18, depth: 0.07 },
    ],
  },
  {
    id: 'gauntlet',
    start: { x: 0, z: 0.5 },
    shots: DEFAULT_SHOTS + 1,
    obstacles: [
      { kind: ObstacleKind.BLOCK, x: 0, z: -0.25, width: 0.36, depth: 0.07 },
      {
        kind: ObstacleKind.BLOCK,
        x: 0,
        z: -0.62,
        width: 0.3,
        depth: 0.07,
        motion: { amplitude: 0.26, periodSeconds: 2.4 },
      },
      { kind: ObstacleKind.BUMPER, x: -0.34, z: -0.82, radius: 0.07 },
      { kind: ObstacleKind.BUMPER, x: 0.34, z: -0.82, radius: 0.07 },
      { kind: ObstacleKind.BUMPER, x: 0, z: -0.92, radius: 0.05 },
    ],
  },
];

export const BANK_SHOT_MAX_STARS =
  BANK_SHOT_LEVELS.length * MAX_STARS_PER_LEVEL;

export const findBankShotLevelIndex = (levelId) =>
  BANK_SHOT_LEVELS.findIndex((level) => level.id === levelId);

export const computeStarsForShot = (shotNumber) =>
  Math.max(1, MAX_STARS_PER_LEVEL + 1 - shotNumber);

export const isBankShotLevelUnlocked = (levelIndex, starsByLevel) =>
  levelIndex === 0 ||
  (starsByLevel[BANK_SHOT_LEVELS[levelIndex - 1]?.id] ?? 0) > 0;
