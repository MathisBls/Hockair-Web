export const TABLE = {
  width: 1.2,
  length: 2.2,
  goalWidth: 0.38,
  railHeight: 0.07,
  railThickness: 0.08,
  surfaceThickness: 0.12,
};

export const HALF_WIDTH = TABLE.width / 2;
export const HALF_LENGTH = TABLE.length / 2;
export const GOAL_HALF_WIDTH = TABLE.goalWidth / 2;

export const PUCK = {
  radius: 0.042,
  height: 0.018,
  maxSpeed: 7.5,
  friction: 0.18,
  wallRestitution: 0.88,
  malletRestitution: 0.92,
};

export const MALLET = {
  radius: 0.068,
  maxSpeed: 9,
  centerLineGap: 0.01,
};

export const PHYSICS = {
  stepSeconds: 1 / 240,
  maxStepsPerFrame: 24,
  stuckPuckSpeed: 0.08,
  stuckPuckSeconds: 4,
};

export const Side = Object.freeze({
  PLAYER: 'player',
  BOT: 'bot',
});

export const MatchPhase = Object.freeze({
  INTRO: 'intro',
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  GOAL: 'goal',
  REPLAY: 'replay',
  FINISHED: 'finished',
});

export const GameEventType = Object.freeze({
  MALLET_HIT: 'malletHit',
  WALL_HIT: 'wallHit',
  GOAL: 'goal',
  SAVE: 'save',
});

export const MatchResult = Object.freeze({
  WIN: 'win',
  LOSS: 'loss',
  DRAW: 'draw',
  RESIGNED: 'resigned',
});

export const COUNTDOWN_SECONDS = 3;
export const GOAL_CELEBRATION_SECONDS = 1.6;
export const REPLAY_SECONDS = 3.2;
export const REPLAY_PLAYBACK_RATE = 0.55;
export const REPLAY_SAMPLE_SECONDS = 1 / 60;

export const GOAL_TARGET_OPTIONS = [3, 5, 7];
export const DEFAULT_GOAL_TARGET = 5;
export const TIME_LIMIT_OPTIONS_SECONDS = [0, 180, 300];
export const DEFAULT_TIME_LIMIT_SECONDS = 0;

export const METERS_PER_SECOND_TO_KMH = 3.6 * 4;
