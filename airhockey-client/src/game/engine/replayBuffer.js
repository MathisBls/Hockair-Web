import { REPLAY_SAMPLE_SECONDS, REPLAY_SECONDS, Side } from '../constants';

const CAPACITY = Math.ceil((REPLAY_SECONDS + 0.6) / REPLAY_SAMPLE_SECONDS);

const snapshotWorld = (world) => {
  const { puck, mallets } = world;
  const playerMallet = mallets[Side.PLAYER];
  const botMallet = mallets[Side.BOT];

  return {
    puck: {
      x: puck.x,
      z: puck.z,
      vx: puck.vx,
      vz: puck.vz,
      angle: puck.angle,
    },
    playerMallet: {
      x: playerMallet.x,
      z: playerMallet.z,
      vx: playerMallet.vx,
      vz: playerMallet.vz,
    },
    botMallet: {
      x: botMallet.x,
      z: botMallet.z,
      vx: botMallet.vx,
      vz: botMallet.vz,
    },
    events: [],
  };
};

export class ReplayBuffer {
  constructor() {
    this.frames = [];
    this.pendingEvents = [];
    this.accumulatedSeconds = 0;
  }

  clear() {
    this.frames = [];
    this.pendingEvents = [];
    this.accumulatedSeconds = 0;
  }

  recordEvents(events) {
    this.pendingEvents.push(...events);
  }

  record(world, dt) {
    this.accumulatedSeconds += dt;
    if (this.accumulatedSeconds < REPLAY_SAMPLE_SECONDS) {
      return;
    }
    this.accumulatedSeconds -= REPLAY_SAMPLE_SECONDS;
    const frame = snapshotWorld(world);
    frame.events = this.pendingEvents;
    this.pendingEvents = [];
    this.frames.push(frame);
    if (this.frames.length > CAPACITY) {
      this.frames.shift();
    }
  }

  buildClip() {
    const frameCount = Math.ceil(REPLAY_SECONDS / REPLAY_SAMPLE_SECONDS);

    return this.frames.slice(-frameCount);
  }
}
