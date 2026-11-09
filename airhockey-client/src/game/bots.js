export const BotTier = Object.freeze({
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  MASTER: 'master',
});

export const BotMood = Object.freeze({
  HAPPY: 'happy',
  FOCUSED: 'focused',
  ANGRY: 'angry',
  SLEEPY: 'sleepy',
  COOL: 'cool',
});

export const BOTS = [
  {
    id: 'puffy',
    tier: BotTier.BEGINNER,
    rating: 250,
    color: '#9cff57',
    accent: '#3d7a16',
    mood: BotMood.SLEEPY,
    brain: {
      reactionSeconds: 0.32,
      maxSpeed: 1.6,
      aimError: 0.22,
      aggression: 0.25,
      prediction: 0.2,
      shotPower: 0.55,
    },
  },
  {
    id: 'bouncy',
    tier: BotTier.BEGINNER,
    rating: 600,
    color: '#ffc94a',
    accent: '#8a5a12',
    mood: BotMood.HAPPY,
    brain: {
      reactionSeconds: 0.24,
      maxSpeed: 2.4,
      aimError: 0.16,
      aggression: 0.45,
      prediction: 0.4,
      shotPower: 0.7,
    },
  },
  {
    id: 'blitz',
    tier: BotTier.INTERMEDIATE,
    rating: 1100,
    color: '#00e5ff',
    accent: '#0b6f8a',
    mood: BotMood.FOCUSED,
    brain: {
      reactionSeconds: 0.16,
      maxSpeed: 3.4,
      aimError: 0.1,
      aggression: 0.6,
      prediction: 0.7,
      shotPower: 0.85,
    },
  },
  {
    id: 'viper',
    tier: BotTier.ADVANCED,
    rating: 1600,
    color: '#b07cff',
    accent: '#4b2a8a',
    mood: BotMood.COOL,
    brain: {
      reactionSeconds: 0.1,
      maxSpeed: 4.6,
      aimError: 0.06,
      aggression: 0.75,
      prediction: 0.9,
      shotPower: 1,
    },
  },
  {
    id: 'inferno',
    tier: BotTier.MASTER,
    rating: 2200,
    color: '#e94560',
    accent: '#74202c',
    mood: BotMood.ANGRY,
    brain: {
      reactionSeconds: 0.05,
      maxSpeed: 6.2,
      aimError: 0.025,
      aggression: 0.9,
      prediction: 1,
      shotPower: 1.15,
    },
  },
];

export const DEFAULT_BOT_ID = 'blitz';

export const findBot = (botId) =>
  BOTS.find((bot) => bot.id === botId) ??
  BOTS.find((bot) => bot.id === DEFAULT_BOT_ID);

const MAX_BOT_SPEED = 6.2;
const MAX_REACTION_SECONDS = 0.35;
const MAX_AIM_ERROR = 0.25;

const toPercent = (ratio) => Math.round(Math.min(Math.max(ratio, 0), 1) * 100);

export const BotStat = Object.freeze({
  SPEED: 'speed',
  REFLEXES: 'reflexes',
  PRECISION: 'precision',
  AGGRESSION: 'aggression',
});

export const buildBotStatRatings = (bot) => [
  {
    stat: BotStat.SPEED,
    percent: toPercent(bot.brain.maxSpeed / MAX_BOT_SPEED),
  },
  {
    stat: BotStat.REFLEXES,
    percent: toPercent(1 - bot.brain.reactionSeconds / MAX_REACTION_SECONDS),
  },
  {
    stat: BotStat.PRECISION,
    percent: toPercent(1 - bot.brain.aimError / MAX_AIM_ERROR),
  },
  { stat: BotStat.AGGRESSION, percent: toPercent(bot.brain.aggression) },
];

export const BOT_TIERS = Object.values(BotTier);
