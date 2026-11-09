import { soundEngine } from '../game/audio/soundEngine';
import { Side } from '../game/constants';

import { ArcadeEventType } from './engine/arcadeEngine';

const TARGET_BASE_FREQUENCY = 523.25;
const SEMITONE_RATIO = 2 ** (1 / 12);
const MAX_COMBO_SEMITONES = 12;
const MAJOR_ARPEGGIO_SEMITONES = [0, 4, 7, 12];
const ARPEGGIO_STEP_SECONDS = 0.08;

const playTargetHit = ({ combo, isGolden }) => {
  const semitones = Math.min(combo - 1, MAX_COMBO_SEMITONES);
  const frequency = TARGET_BASE_FREQUENCY * SEMITONE_RATIO ** semitones;
  soundEngine.playTone({
    frequency,
    endFrequency: frequency * 1.5,
    duration: 0.16,
    type: 'triangle',
    volume: 0.18,
  });
  if (isGolden) {
    soundEngine.playTone({
      frequency: frequency * 2,
      duration: 0.3,
      type: 'sine',
      volume: 0.12,
      delay: 0.06,
    });
  }
};

const playComboLost = () => {
  soundEngine.playTone({
    frequency: 330,
    endFrequency: 180,
    duration: 0.22,
    type: 'triangle',
    volume: 0.1,
  });
};

const playLifeLost = () => {
  soundEngine.playTone({
    frequency: 220,
    endFrequency: 110,
    duration: 0.45,
    type: 'square',
    volume: 0.08,
  });
};

const playShotSpent = () => {
  soundEngine.playTone({
    frequency: 392,
    endFrequency: 262,
    duration: 0.2,
    type: 'triangle',
    volume: 0.12,
  });
};

const playLevelCleared = ({ stars }) => {
  MAJOR_ARPEGGIO_SEMITONES.slice(0, stars + 1).forEach((semitones, index) => {
    soundEngine.playTone({
      frequency: TARGET_BASE_FREQUENCY * SEMITONE_RATIO ** semitones,
      duration: 0.28,
      type: 'triangle',
      volume: 0.16,
      delay: 0.25 + index * ARPEGGIO_STEP_SECONDS * 1.6,
    });
  });
};

const playGameOver = () => {
  [0, 7, 12].forEach((semitones, index) => {
    soundEngine.playTone({
      frequency: (TARGET_BASE_FREQUENCY / 2) * SEMITONE_RATIO ** semitones,
      duration: 0.5,
      type: 'triangle',
      volume: 0.12,
      delay: index * ARPEGGIO_STEP_SECONDS,
    });
  });
};

const ARCADE_SOUND_BY_EVENT_TYPE = {
  [ArcadeEventType.TARGET_HIT]: playTargetHit,
  [ArcadeEventType.COMBO_LOST]: playComboLost,
  [ArcadeEventType.LIFE_LOST]: playLifeLost,
  [ArcadeEventType.SHOT_SPENT]: playShotSpent,
  [ArcadeEventType.LEVEL_CLEARED]: playLevelCleared,
  [ArcadeEventType.GAME_OVER]: playGameOver,
};

export const playArcadeEvents = (events) => {
  soundEngine.playEvents(events, Side.PLAYER);
  events.forEach((event) => {
    ARCADE_SOUND_BY_EVENT_TYPE[event.type]?.(event);
  });
};
