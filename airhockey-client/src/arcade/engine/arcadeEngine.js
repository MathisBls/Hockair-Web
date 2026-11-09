import {
  COUNTDOWN_SECONDS,
  MatchPhase,
  PHYSICS,
  Side,
} from '../../game/constants';
import { createMatchStore } from '../../game/engine/matchStore';
import {
  BOT_HOME_Z,
  createWorld,
  PLAYER_HOME_Z,
  stepWorld,
} from '../../game/engine/physics';

import { moveObstacle, resolveObstacles } from './obstacles';

export const ArcadePhase = Object.freeze({
  READY: 'ready',
  INTRO: MatchPhase.INTRO,
  COUNTDOWN: MatchPhase.COUNTDOWN,
  PLAYING: MatchPhase.PLAYING,
  FINISHED: MatchPhase.FINISHED,
});

export const ArcadeEventType = Object.freeze({
  TARGET_HIT: 'targetHit',
  TARGET_MISSED: 'targetMissed',
  COMBO_LOST: 'comboLost',
  SHOT_FIRED: 'shotFired',
  LIFE_LOST: 'lifeLost',
  SHOT_SPENT: 'shotSpent',
  LEVEL_CLEARED: 'levelCleared',
  GAME_OVER: 'gameOver',
});

const CAMERA_PHASE_BY_ARCADE_PHASE = {
  [ArcadePhase.READY]: MatchPhase.FINISHED,
  [ArcadePhase.INTRO]: MatchPhase.INTRO,
  [ArcadePhase.COUNTDOWN]: MatchPhase.COUNTDOWN,
  [ArcadePhase.PLAYING]: MatchPhase.PLAYING,
  [ArcadePhase.FINISHED]: MatchPhase.FINISHED,
};

const INTRO_SECONDS = 1.4;
const MAX_FRAME_SECONDS = 0.1;
const PROXY_MAX_SPEED = 1e4;
export const HIDDEN_PUCK_Z = 50;
const PARKED_MALLET_Z = -50;

const createPuckBody = () => ({
  x: 0,
  z: HIDDEN_PUCK_Z,
  vx: 0,
  vz: 0,
  spin: 0,
  angle: 0,
});

const createRenderBody = (z) => ({ x: 0, z, vx: 0, vz: 0, angle: 0 });

const createProxyMallet = () => ({
  x: 0,
  z: PARKED_MALLET_Z,
  vx: 0,
  vz: 0,
  targetX: 0,
  targetZ: PARKED_MALLET_Z,
  maxSpeed: 0,
  hitCooldown: 0,
});

const parkMallet = (mallet) => {
  Object.assign(mallet, {
    x: 0,
    z: PARKED_MALLET_Z,
    targetX: 0,
    targetZ: PARKED_MALLET_Z,
    vx: 0,
    vz: 0,
    maxSpeed: 0,
  });
};

const followMallet = (proxy, previousPosition, mallet) => {
  proxy.x = previousPosition.x;
  proxy.z = previousPosition.z;
  proxy.targetX = mallet.x;
  proxy.targetZ = mallet.z;
  proxy.maxSpeed = PROXY_MAX_SPEED;
};

const copyBody = (source, target) => {
  target.x = source.x;
  target.z = source.z;
  target.vx = source.vx;
  target.vz = source.vz;
  target.angle = source.angle ?? 0;
};

export class ArcadeEngine {
  constructor({
    puckCount,
    hasShooter = false,
    countdownSeconds = COUNTDOWN_SECONDS,
    initialSnapshot,
  }) {
    this.mallets = createWorld().mallets;
    this.hasShooter = hasShooter;
    if (!hasShooter) {
      parkMallet(this.mallets[Side.BOT]);
    }
    this.previousMalletPositions = {
      [Side.PLAYER]: { x: 0, z: PLAYER_HOME_Z },
      [Side.BOT]: { x: 0, z: BOT_HOME_Z },
    };
    this.frozenPuck = { ...createPuckBody(), z: 0 };
    this.puckSlots = Array.from({ length: puckCount }, (_, index) => ({
      index,
      body: createPuckBody(),
      isActive: false,
      isPlayerContactEnabled: true,
      proxies: {
        [Side.PLAYER]: createProxyMallet(),
        [Side.BOT]: createProxyMallet(),
      },
    }));
    this.obstacles = [];
    this.pendingVfxEvents = [];
    this.countdownSeconds = countdownSeconds;
    this.arcadePhase = ArcadePhase.READY;
    this.phaseSeconds = 0;
    this.playSeconds = 0;
    this.accumulatorSeconds = 0;
    this.renderState = {
      puck: createRenderBody(0),
      puckViews: this.puckSlots.map(() => ({
        puck: createRenderBody(HIDDEN_PUCK_Z),
      })),
      playerMallet: createRenderBody(PLAYER_HOME_Z),
      botMallet: createRenderBody(BOT_HOME_Z),
      targets: [],
      obstacles: this.obstacles,
      markers: [],
      isReplay: false,
      replayProgress: 0,
      timeScale: 1,
    };
    this.store = createMatchStore({
      phase: ArcadePhase.READY,
      countdownValue: countdownSeconds,
      kickoffId: 0,
      sessionId: 0,
      ...initialSnapshot,
    });
  }

  get snapshot() {
    return this.store.getSnapshot();
  }

  get phase() {
    return CAMERA_PHASE_BY_ARCADE_PHASE[this.arcadePhase];
  }

  get puckCount() {
    return this.puckSlots.length;
  }

  setPlayerTarget(x, z) {
    const mallet = this.mallets[Side.PLAYER];
    mallet.targetX = x;
    mallet.targetZ = z;
  }

  setShooterTarget(x, z) {
    const mallet = this.mallets[Side.BOT];
    mallet.targetX = x;
    mallet.targetZ = z;
  }

  drainVfxEvents() {
    const events = this.pendingVfxEvents;
    this.pendingVfxEvents = [];

    return events;
  }

  emit(event) {
    this.pendingVfxEvents.push(event);
  }

  getPhaseSeconds() {
    return this.phaseSeconds;
  }

  getBotIntent() {
    return null;
  }

  setPhase(phase) {
    this.arcadePhase = phase;
    this.phaseSeconds = 0;
    this.store.patch({ phase });
  }

  start() {
    this.puckSlots.forEach((slot) => this.deactivatePuck(slot));
    this.playSeconds = 0;
    this.accumulatorSeconds = 0;
    this.resetSession();
    this.store.patch({
      countdownValue: this.countdownSeconds,
      sessionId: this.snapshot.sessionId + 1,
    });
    this.setPhase(ArcadePhase.INTRO);
  }

  abandon() {
    this.puckSlots.forEach((slot) => this.deactivatePuck(slot));
    this.setPhase(ArcadePhase.READY);
  }

  finish(resultPatch) {
    this.store.patch(resultPatch);
    this.setPhase(ArcadePhase.FINISHED);
  }

  activatePuck(slot, { x, z, vx = 0, vz = 0 }) {
    Object.assign(slot.body, { x, z, vx, vz, spin: 0 });
    slot.isActive = true;
    slot.isPlayerContactEnabled = true;
    slot.proxies[Side.PLAYER].hitCooldown = 0;
    slot.proxies[Side.BOT].hitCooldown = 0;
  }

  deactivatePuck(slot) {
    Object.assign(slot.body, { x: 0, z: HIDDEN_PUCK_Z, vx: 0, vz: 0 });
    slot.isActive = false;
  }

  findFreeSlot() {
    return this.puckSlots.find((slot) => !slot.isActive) ?? null;
  }

  getActiveSlots() {
    return this.puckSlots.filter((slot) => slot.isActive);
  }

  getFocusSlot() {
    return this.puckSlots.find((slot) => slot.isActive) ?? null;
  }

  resetSession() {}

  onPlayStart() {}

  beforePhysicsStep() {}

  handlePuckStep() {}

  updatePlaying() {}

  stepMallets(dt) {
    [Side.PLAYER, Side.BOT].forEach((side) => {
      this.previousMalletPositions[side].x = this.mallets[side].x;
      this.previousMalletPositions[side].z = this.mallets[side].z;
    });
    stepWorld({ puck: this.frozenPuck, mallets: this.mallets }, dt, [], {
      isPuckFrozen: true,
    });
  }

  syncProxies(slot) {
    const playerProxy = slot.proxies[Side.PLAYER];
    const botProxy = slot.proxies[Side.BOT];
    if (slot.isPlayerContactEnabled) {
      followMallet(
        playerProxy,
        this.previousMalletPositions[Side.PLAYER],
        this.mallets[Side.PLAYER]
      );
    } else {
      parkMallet(playerProxy);
    }
    if (this.hasShooter) {
      followMallet(
        botProxy,
        this.previousMalletPositions[Side.BOT],
        this.mallets[Side.BOT]
      );
    } else {
      parkMallet(botProxy);
    }
  }

  stepPucks(dt) {
    this.puckSlots.forEach((slot) => {
      if (!slot.isActive) {
        return;
      }
      this.syncProxies(slot);
      const events = [];
      const scorerSide = stepWorld(
        { puck: slot.body, mallets: slot.proxies },
        dt,
        events
      );
      resolveObstacles(this.obstacles, slot.body, events);
      events.forEach((event) => {
        event.puckIndex = slot.index;
      });
      this.pendingVfxEvents.push(...events);
      this.handlePuckStep(slot, scorerSide, events, dt);
    });
  }

  simulate(gameSeconds, { isPuckFrozen = false } = {}) {
    this.accumulatorSeconds += gameSeconds;
    let steps = 0;
    while (
      this.accumulatorSeconds >= PHYSICS.stepSeconds &&
      steps < PHYSICS.maxStepsPerFrame
    ) {
      this.accumulatorSeconds -= PHYSICS.stepSeconds;
      steps += 1;
      this.obstacles.forEach((obstacle) =>
        moveObstacle(obstacle, this.playSeconds, PHYSICS.stepSeconds)
      );
      this.beforePhysicsStep(PHYSICS.stepSeconds);
      this.stepMallets(PHYSICS.stepSeconds);
      if (!isPuckFrozen) {
        this.stepPucks(PHYSICS.stepSeconds);
      }
    }
    if (steps === PHYSICS.maxStepsPerFrame) {
      this.accumulatorSeconds = 0;
    }
  }

  updateCountdown() {
    const countdownValue = Math.max(
      0,
      this.countdownSeconds - Math.floor(this.phaseSeconds)
    );
    if (countdownValue !== this.snapshot.countdownValue) {
      this.store.patch({ countdownValue });
    }
    if (this.phaseSeconds >= this.countdownSeconds) {
      this.store.patch({ kickoffId: this.snapshot.kickoffId + 1 });
      this.setPhase(ArcadePhase.PLAYING);
      this.onPlayStart();
    }
  }

  update(frameSeconds) {
    const dt = Math.min(frameSeconds, MAX_FRAME_SECONDS);
    this.phaseSeconds += dt;

    switch (this.arcadePhase) {
      case ArcadePhase.INTRO:
        this.simulate(dt, { isPuckFrozen: true });
        if (this.phaseSeconds >= INTRO_SECONDS) {
          this.setPhase(ArcadePhase.COUNTDOWN);
        }
        break;
      case ArcadePhase.COUNTDOWN:
        this.simulate(dt, { isPuckFrozen: true });
        this.updateCountdown();
        break;
      case ArcadePhase.PLAYING:
        this.playSeconds += dt;
        this.simulate(dt);
        this.updatePlaying(dt);
        break;
      default:
        this.simulate(dt);
        break;
    }

    return this.computeRenderState();
  }

  computeRenderState() {
    const state = this.renderState;
    this.puckSlots.forEach((slot, index) => {
      copyBody(slot.body, state.puckViews[index].puck);
    });
    const focusSlot = this.getFocusSlot();
    copyBody(focusSlot ? focusSlot.body : this.frozenPuck, state.puck);
    copyBody(this.mallets[Side.PLAYER], state.playerMallet);
    copyBody(this.mallets[Side.BOT], state.botMallet);
    state.obstacles = this.obstacles;

    return state;
  }
}
