import {
  COUNTDOWN_SECONDS,
  GameEventType,
  GOAL_CELEBRATION_SECONDS,
  HALF_LENGTH,
  MALLET,
  MatchPhase,
  MatchResult,
  METERS_PER_SECOND_TO_KMH,
  PHYSICS,
  REPLAY_PLAYBACK_RATE,
  REPLAY_SAMPLE_SECONDS,
  Side,
} from '../constants';

import { BotBrain } from './botBrain';
import { createMatchStore } from './matchStore';
import {
  BOT_HOME_Z,
  createWorld,
  getPuckSpeed,
  isHeadingIntoGoal,
  PLAYER_HOME_Z,
  stepWorld,
} from './physics';
import { ReplayBuffer } from './replayBuffer';

const INTRO_SECONDS = 1.4;
const SERVE_DISTANCE = 0.42;
const SHOT_MIN_SPEED = 1.5;
const HIT_STOP_STRENGTH = 3.6;
const HIT_STOP_SECONDS = 0.05;
const GOAL_SLOW_MOTION_SCALE = 0.25;
const GOAL_SLOW_MOTION_SECONDS = 0.5;
const FEED_LIMIT = 60;
const MAX_FRAME_SECONDS = 0.1;
const STUCK_PUCK_RELAUNCH_SPEED = 1.4;

export const FeedEntryType = Object.freeze({
  KICKOFF: 'kickoff',
  SHOT: 'shot',
  SAVE: 'save',
  GOAL: 'goal',
  SUDDEN_DEATH: 'suddenDeath',
});

const getOpponent = (side) => (side === Side.PLAYER ? Side.BOT : Side.PLAYER);

const toKmh = (speed) => Math.round(speed * METERS_PER_SECOND_TO_KMH);

const createSideStats = () => ({
  shots: 0,
  shotsOnTarget: 0,
  saves: 0,
  hits: 0,
  maxShotKmh: 0,
});

const lerp = (from, to, ratio) => from + (to - from) * ratio;

const interpolateBody = (from, to, ratio, target) => {
  target.x = lerp(from.x, to.x, ratio);
  target.z = lerp(from.z, to.z, ratio);
  target.vx = lerp(from.vx, to.vx, ratio);
  target.vz = lerp(from.vz, to.vz, ratio);
  target.angle = lerp(from.angle ?? 0, to.angle ?? 0, ratio);
};

export class MatchEngine {
  constructor({ bot, goalTarget, timeLimitSeconds }) {
    this.bot = bot;
    this.goalTarget = goalTarget;
    this.timeLimitSeconds = timeLimitSeconds;
    this.world = createWorld();
    this.brain = new BotBrain(bot.brain);
    this.replay = new ReplayBuffer();
    this.pendingVfxEvents = [];
    this.phase = MatchPhase.INTRO;
    this.phaseSeconds = 0;
    this.accumulatorSeconds = 0;
    this.hitStopSeconds = 0;
    this.slowMotionSeconds = 0;
    this.elapsedSeconds = 0;
    this.servingSide = Side.PLAYER;
    this.replayClip = [];
    this.replayCursor = 0;
    this.lastEmittedReplayFrame = -1;
    this.stuckSeconds = 0;
    this.threatenedSide = null;
    this.feedSequence = 0;
    this.shotSequence = 0;
    this.renderState = {
      puck: { x: 0, z: 0, vx: 0, vz: 0, angle: 0 },
      playerMallet: { x: 0, z: PLAYER_HOME_Z, vx: 0, vz: 0 },
      botMallet: { x: 0, z: BOT_HOME_Z, vx: 0, vz: 0 },
      isReplay: false,
      timeScale: 1,
    };
    this.store = createMatchStore({
      phase: MatchPhase.INTRO,
      score: { [Side.PLAYER]: 0, [Side.BOT]: 0 },
      countdownValue: COUNTDOWN_SECONDS,
      elapsedSeconds: 0,
      remainingSeconds: timeLimitSeconds,
      feed: [],
      stats: {
        [Side.PLAYER]: createSideStats(),
        [Side.BOT]: createSideStats(),
      },
      lastGoal: null,
      lastShot: null,
      result: null,
      isSuddenDeath: false,
      kickoffId: 0,
    });
    this.placeForServe();
  }

  get snapshot() {
    return this.store.getSnapshot();
  }

  setPlayerTarget(x, z) {
    const mallet = this.world.mallets[Side.PLAYER];
    mallet.targetX = x;
    mallet.targetZ = z;
  }

  drainVfxEvents() {
    const events = this.pendingVfxEvents;
    this.pendingVfxEvents = [];

    return events;
  }

  placeForServe() {
    const { puck, mallets } = this.world;
    const serveZ =
      this.servingSide === Side.PLAYER ? SERVE_DISTANCE : -SERVE_DISTANCE;
    Object.assign(puck, { x: 0, z: serveZ, vx: 0, vz: 0, spin: 0 });
    Object.assign(mallets[Side.BOT], {
      x: 0,
      z: BOT_HOME_Z,
      targetX: 0,
      targetZ: BOT_HOME_Z,
      vx: 0,
      vz: 0,
    });
    mallets[Side.PLAYER].maxSpeed = MALLET.maxSpeed;
    this.brain.reset();
    this.replay.clear();
    this.threatenedSide = null;
    this.stuckSeconds = 0;
  }

  setPhase(phase) {
    this.phase = phase;
    this.phaseSeconds = 0;
    this.store.patch({ phase });
  }

  pushFeedEntry(entry) {
    this.feedSequence += 1;
    const feed = [
      ...this.snapshot.feed,
      {
        id: this.feedSequence,
        atSeconds: Math.floor(this.elapsedSeconds),
        ...entry,
      },
    ].slice(-FEED_LIMIT);
    this.store.patch({ feed });
  }

  updateSideStats(side, update) {
    const stats = this.snapshot.stats;
    this.store.patch({
      stats: { ...stats, [side]: update({ ...stats[side] }) },
    });
  }

  handleMalletHit(event) {
    const { side, puckSpeed } = event;
    const opponent = getOpponent(side);
    const kmh = toKmh(puckSpeed);
    const isShot =
      puckSpeed > SHOT_MIN_SPEED &&
      (side === Side.PLAYER ? event.puckVz < 0 : event.puckVz > 0);
    const isOnTarget = isShot && isHeadingIntoGoal(this.world.puck, opponent);
    const isSave = this.threatenedSide === side;

    this.updateSideStats(side, (stats) => ({
      ...stats,
      hits: stats.hits + 1,
      shots: stats.shots + (isShot ? 1 : 0),
      shotsOnTarget: stats.shotsOnTarget + (isOnTarget ? 1 : 0),
      saves: stats.saves + (isSave ? 1 : 0),
      maxShotKmh: isShot ? Math.max(stats.maxShotKmh, kmh) : stats.maxShotKmh,
    }));

    if (isSave) {
      this.pendingVfxEvents.push({ ...event, type: GameEventType.SAVE });
      this.pushFeedEntry({ type: FeedEntryType.SAVE, side });
    }
    if (isShot) {
      this.shotSequence += 1;
      this.store.patch({ lastShot: { side, kmh, id: this.shotSequence } });
      if (isOnTarget) {
        this.pushFeedEntry({ type: FeedEntryType.SHOT, side, kmh });
      }
    }
    this.threatenedSide = isOnTarget ? opponent : null;
    if (event.strength > HIT_STOP_STRENGTH) {
      this.hitStopSeconds = HIT_STOP_SECONDS;
    }
  }

  processPhysicsEvents(events) {
    events.forEach((event) => {
      if (event.type === GameEventType.MALLET_HIT) {
        this.handleMalletHit(event);
      }
    });
    this.pendingVfxEvents.push(...events);
    this.replay.recordEvents(events);
  }

  handleGoal(scorerSide) {
    const puckSpeed = getPuckSpeed(this.world.puck);
    const score = {
      ...this.snapshot.score,
      [scorerSide]: this.snapshot.score[scorerSide] + 1,
    };
    const goalEvent = {
      type: GameEventType.GOAL,
      side: scorerSide,
      x: this.world.puck.x,
      z: scorerSide === Side.PLAYER ? -HALF_LENGTH : HALF_LENGTH,
      strength: puckSpeed,
    };
    const lastGoal = {
      scorerSide,
      kmh: toKmh(puckSpeed),
      id: this.feedSequence + 1,
    };

    this.pendingVfxEvents.push(goalEvent);
    this.replay.recordEvents([goalEvent]);
    this.replay.record(this.world, REPLAY_SAMPLE_SECONDS);
    this.replayClip = this.replay.buildClip();
    this.servingSide = getOpponent(scorerSide);
    this.slowMotionSeconds = GOAL_SLOW_MOTION_SECONDS;
    this.store.patch({ score, lastGoal });
    this.pushFeedEntry({
      type: FeedEntryType.GOAL,
      side: scorerSide,
      kmh: lastGoal.kmh,
      score,
    });
    this.setPhase(MatchPhase.GOAL);
  }

  isMatchOver() {
    const { score, isSuddenDeath } = this.snapshot;
    const hasReachedTarget =
      score[Side.PLAYER] >= this.goalTarget ||
      score[Side.BOT] >= this.goalTarget;

    return hasReachedTarget || isSuddenDeath;
  }

  finishMatch(result) {
    this.store.patch({ result });
    this.setPhase(MatchPhase.FINISHED);
  }

  finishByScore() {
    const { score } = this.snapshot;
    const result =
      score[Side.PLAYER] > score[Side.BOT] ? MatchResult.WIN : MatchResult.LOSS;
    this.finishMatch(result);
  }

  resign() {
    if (this.phase !== MatchPhase.FINISHED) {
      this.finishMatch(MatchResult.RESIGNED);
    }
  }

  skipReplay() {
    if (this.phase === MatchPhase.REPLAY) {
      this.endReplay();
    }
  }

  endReplay() {
    if (this.isMatchOver()) {
      this.finishByScore();

      return;
    }
    this.placeForServe();
    this.store.patch({ countdownValue: COUNTDOWN_SECONDS });
    this.setPhase(MatchPhase.COUNTDOWN);
  }

  updateClock() {
    const previousWholeSeconds = this.snapshot.elapsedSeconds;
    const wholeSeconds = Math.floor(this.elapsedSeconds);
    if (wholeSeconds === previousWholeSeconds) {
      return;
    }
    const remainingSeconds =
      this.timeLimitSeconds > 0
        ? Math.max(0, this.timeLimitSeconds - wholeSeconds)
        : 0;
    this.store.patch({ elapsedSeconds: wholeSeconds, remainingSeconds });

    const isTimeUp =
      this.timeLimitSeconds > 0 &&
      remainingSeconds === 0 &&
      !this.snapshot.isSuddenDeath;
    if (!isTimeUp) {
      return;
    }
    const { score } = this.snapshot;
    if (score[Side.PLAYER] === score[Side.BOT]) {
      this.store.patch({ isSuddenDeath: true });
      this.pushFeedEntry({ type: FeedEntryType.SUDDEN_DEATH });
    } else {
      this.finishByScore();
    }
  }

  unstickPuck(dt) {
    const { puck } = this.world;
    const isStill = getPuckSpeed(puck) < PHYSICS.stuckPuckSpeed;
    this.stuckSeconds = isStill ? this.stuckSeconds + dt : 0;
    if (this.stuckSeconds > PHYSICS.stuckPuckSeconds) {
      const towardOpponentHalf = puck.z > 0 ? -1 : 1;
      puck.vz = towardOpponentHalf * STUCK_PUCK_RELAUNCH_SPEED;
      puck.vx = (Math.random() - 0.5) * STUCK_PUCK_RELAUNCH_SPEED;
      this.stuckSeconds = 0;
    }
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
      const events = [];
      if (!isPuckFrozen) {
        this.brain.update(this.world, PHYSICS.stepSeconds);
      }
      const scorerSide = stepWorld(this.world, PHYSICS.stepSeconds, events, {
        isPuckFrozen,
      });
      this.processPhysicsEvents(events);
      if (this.phase === MatchPhase.PLAYING) {
        this.replay.record(this.world, PHYSICS.stepSeconds);
        if (scorerSide) {
          this.handleGoal(scorerSide);
        }
      }
    }
    if (steps === PHYSICS.maxStepsPerFrame) {
      this.accumulatorSeconds = 0;
    }
  }

  computeTimeScale(dt) {
    if (this.hitStopSeconds > 0) {
      this.hitStopSeconds -= dt;

      return 0.04;
    }
    if (this.slowMotionSeconds > 0) {
      this.slowMotionSeconds -= dt;

      return GOAL_SLOW_MOTION_SCALE;
    }

    return 1;
  }

  updateCountdown() {
    const countdownValue = Math.max(
      0,
      COUNTDOWN_SECONDS - Math.floor(this.phaseSeconds)
    );
    if (countdownValue !== this.snapshot.countdownValue) {
      this.store.patch({ countdownValue });
    }
    if (this.phaseSeconds >= COUNTDOWN_SECONDS) {
      if (this.snapshot.elapsedSeconds === 0 && this.elapsedSeconds === 0) {
        this.pushFeedEntry({ type: FeedEntryType.KICKOFF });
      }
      this.store.patch({ kickoffId: this.snapshot.kickoffId + 1 });
      this.setPhase(MatchPhase.PLAYING);
    }
  }

  emitReplayEvents(frameIndex) {
    for (
      let index = this.lastEmittedReplayFrame + 1;
      index <= frameIndex;
      index += 1
    ) {
      this.replayClip[index].events.forEach((event) => {
        this.pendingVfxEvents.push({ ...event, isReplay: true });
      });
    }
    this.lastEmittedReplayFrame = Math.max(
      this.lastEmittedReplayFrame,
      frameIndex
    );
  }

  updateReplay(dt) {
    this.replayCursor += (dt * REPLAY_PLAYBACK_RATE) / REPLAY_SAMPLE_SECONDS;
    const lastIndex = this.replayClip.length - 1;
    if (this.replayCursor >= lastIndex) {
      this.emitReplayEvents(lastIndex);
      this.endReplay();

      return;
    }
    this.emitReplayEvents(Math.floor(this.replayCursor));
  }

  startReplay() {
    if (this.replayClip.length < 2) {
      this.endReplay();

      return;
    }
    this.replayCursor = 0;
    this.lastEmittedReplayFrame = -1;
    this.setPhase(MatchPhase.REPLAY);
  }

  update(frameSeconds) {
    const dt = Math.min(frameSeconds, MAX_FRAME_SECONDS);
    this.phaseSeconds += dt;
    const timeScale = this.computeTimeScale(dt);
    this.renderState.timeScale = timeScale;

    switch (this.phase) {
      case MatchPhase.INTRO:
        this.simulate(dt, { isPuckFrozen: true });
        if (this.phaseSeconds >= INTRO_SECONDS) {
          this.setPhase(MatchPhase.COUNTDOWN);
        }
        break;
      case MatchPhase.COUNTDOWN:
        this.simulate(dt, { isPuckFrozen: true });
        this.updateCountdown();
        break;
      case MatchPhase.PLAYING:
        this.elapsedSeconds += dt * timeScale;
        this.simulate(dt * timeScale);
        this.unstickPuck(dt);
        this.updateClock();
        break;
      case MatchPhase.GOAL:
        this.simulate(dt * timeScale);
        if (this.phaseSeconds >= GOAL_CELEBRATION_SECONDS) {
          this.startReplay();
        }
        break;
      case MatchPhase.REPLAY:
        this.updateReplay(dt);
        break;
      default:
        this.simulate(dt, { isPuckFrozen: true });
        break;
    }

    return this.computeRenderState();
  }

  computeRenderState() {
    const state = this.renderState;
    state.isReplay = this.phase === MatchPhase.REPLAY;
    if (state.isReplay) {
      const lastIndex = this.replayClip.length - 1;
      const fromIndex = Math.min(Math.floor(this.replayCursor), lastIndex);
      const toIndex = Math.min(fromIndex + 1, lastIndex);
      const ratio = this.replayCursor - fromIndex;
      const from = this.replayClip[fromIndex];
      const to = this.replayClip[toIndex];
      interpolateBody(from.puck, to.puck, ratio, state.puck);
      interpolateBody(
        from.playerMallet,
        to.playerMallet,
        ratio,
        state.playerMallet
      );
      interpolateBody(from.botMallet, to.botMallet, ratio, state.botMallet);
      state.replayProgress = this.replayCursor / Math.max(lastIndex, 1);

      return state;
    }
    const { puck, mallets } = this.world;
    Object.assign(state.puck, {
      x: puck.x,
      z: puck.z,
      vx: puck.vx,
      vz: puck.vz,
      angle: puck.angle,
    });
    ['x', 'z', 'vx', 'vz'].forEach((key) => {
      state.playerMallet[key] = mallets[Side.PLAYER][key];
      state.botMallet[key] = mallets[Side.BOT][key];
    });
    state.replayProgress = 0;

    return state;
  }

  getPhaseSeconds() {
    return this.phaseSeconds;
  }

  getBotIntent() {
    return this.brain.getIntent();
  }
}
