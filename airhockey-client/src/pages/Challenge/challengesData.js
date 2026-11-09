import { ArcadeGameId } from '../../arcade/arcadeGames';
import {
  addDays,
  getDayIndexSinceEpoch,
  getLocalDateKey,
  getStartOfDay,
  getStartOfWeek,
} from '../../arcade/calendar';

export const ChallengePeriod = Object.freeze({
  DAILY: 'daily',
  WEEKLY: 'weekly',
});

export const ChallengeMetric = Object.freeze({
  ARCADE_BEST_SCORE: 'arcadeBestScore',
  ARCADE_TOTAL_SCORE: 'arcadeTotalScore',
  ARCADE_RUNS: 'arcadeRuns',
  BANK_SHOT_STARS: 'bankShotStars',
  BOTS_BEATEN: 'botsBeaten',
});

export const ChallengeTier = Object.freeze({
  STANDARD: 'standard',
  HARD: 'hard',
});

const CHALLENGES_PER_PERIOD = 3;
const DAYS_PER_WEEK = 7;
const DAILY_SEED_SALT = 7919;
const WEEKLY_SEED_SALT = 104729;
const HARD_TIER_CHANCE = 0.35;

const DAILY_TEMPLATES = [
  {
    templateId: 'daily-target-best',
    metric: ChallengeMetric.ARCADE_BEST_SCORE,
    gameId: ArcadeGameId.TARGET_RUSH,
    targets: { standard: 1500, hard: 3000 },
    reward: { coins: 60, xp: 40 },
  },
  {
    templateId: 'daily-goalie-best',
    metric: ChallengeMetric.ARCADE_BEST_SCORE,
    gameId: ArcadeGameId.GOALIE_REFLEX,
    targets: { standard: 10, hard: 20 },
    reward: { coins: 60, xp: 40 },
  },
  {
    templateId: 'daily-target-total',
    metric: ChallengeMetric.ARCADE_TOTAL_SCORE,
    gameId: ArcadeGameId.TARGET_RUSH,
    targets: { standard: 4000, hard: 8000 },
    reward: { coins: 80, xp: 50 },
  },
  {
    templateId: 'daily-goalie-total',
    metric: ChallengeMetric.ARCADE_TOTAL_SCORE,
    gameId: ArcadeGameId.GOALIE_REFLEX,
    targets: { standard: 25, hard: 45 },
    reward: { coins: 80, xp: 50 },
  },
  {
    templateId: 'daily-runs',
    metric: ChallengeMetric.ARCADE_RUNS,
    gameId: null,
    targets: { standard: 3, hard: 6 },
    reward: { coins: 40, xp: 30 },
  },
  {
    templateId: 'daily-bank-runs',
    metric: ChallengeMetric.ARCADE_RUNS,
    gameId: ArcadeGameId.BANK_SHOT,
    targets: { standard: 3, hard: 5 },
    reward: { coins: 50, xp: 35 },
  },
];

const WEEKLY_TEMPLATES = [
  {
    templateId: 'weekly-bots',
    metric: ChallengeMetric.BOTS_BEATEN,
    gameId: null,
    targets: { standard: 2, hard: 4 },
    reward: { coins: 250, xp: 150 },
  },
  {
    templateId: 'weekly-stars',
    metric: ChallengeMetric.BANK_SHOT_STARS,
    gameId: ArcadeGameId.BANK_SHOT,
    targets: { standard: 10, hard: 18 },
    reward: { coins: 220, xp: 140 },
  },
  {
    templateId: 'weekly-runs',
    metric: ChallengeMetric.ARCADE_RUNS,
    gameId: null,
    targets: { standard: 15, hard: 25 },
    reward: { coins: 200, xp: 120 },
  },
  {
    templateId: 'weekly-target-best',
    metric: ChallengeMetric.ARCADE_BEST_SCORE,
    gameId: ArcadeGameId.TARGET_RUSH,
    targets: { standard: 4000, hard: 6000 },
    reward: { coins: 300, xp: 180 },
  },
  {
    templateId: 'weekly-goalie-best',
    metric: ChallengeMetric.ARCADE_BEST_SCORE,
    gameId: ArcadeGameId.GOALIE_REFLEX,
    targets: { standard: 25, hard: 40 },
    reward: { coins: 300, xp: 180 },
  },
];

const createSeededRandom = (seed) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);

    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};

const pickTemplates = (templates, random) =>
  templates
    .map((template) => ({ template, order: random() }))
    .sort((first, second) => first.order - second.order)
    .slice(0, CHALLENGES_PER_PERIOD)
    .map(({ template }) => template);

const buildChallengeDtos = ({ templates, period, startsAt, endsAt, seed }) => {
  const random = createSeededRandom(seed);
  const periodKey = getLocalDateKey(startsAt);

  return pickTemplates(templates, random).map((template) => {
    const tier =
      random() < HARD_TIER_CHANCE ? ChallengeTier.HARD : ChallengeTier.STANDARD;
    const rewardMultiplier = tier === ChallengeTier.HARD ? 2 : 1;

    return {
      id: `${period}-${periodKey}-${template.templateId}`,
      templateId: template.templateId,
      period,
      tier,
      metric: template.metric,
      gameId: template.gameId,
      target: template.targets[tier],
      reward: {
        coins: template.reward.coins * rewardMultiplier,
        xp: template.reward.xp * rewardMultiplier,
      },
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
    };
  });
};

export const buildChallengesForDate = (date) => {
  const dayStart = getStartOfDay(date);
  const weekStart = getStartOfWeek(date);

  return {
    daily: buildChallengeDtos({
      templates: DAILY_TEMPLATES,
      period: ChallengePeriod.DAILY,
      startsAt: dayStart,
      endsAt: addDays(dayStart, 1),
      seed: getDayIndexSinceEpoch(dayStart) * DAILY_SEED_SALT,
    }),
    weekly: buildChallengeDtos({
      templates: WEEKLY_TEMPLATES,
      period: ChallengePeriod.WEEKLY,
      startsAt: weekStart,
      endsAt: addDays(weekStart, DAYS_PER_WEEK),
      seed: getDayIndexSinceEpoch(weekStart) * WEEKLY_SEED_SALT,
    }),
  };
};

export const fetchChallenges = async (date) => buildChallengesForDate(date);
