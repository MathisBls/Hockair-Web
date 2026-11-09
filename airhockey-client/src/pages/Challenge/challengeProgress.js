import {
  getArcadeDailyHistory,
  getBankShotTotalStars,
} from '../../arcade/arcadeProgress';
import { getLocalDateKey, getWeekDateKeys } from '../../arcade/calendar';
import { getBeatenBotIds } from '../../game/progress';

import { ChallengeMetric, ChallengePeriod } from './challengesData';

const CLAIMED_CHALLENGES_STORAGE_KEY = 'hockair.challenges.claimed';
const MAX_STORED_CLAIMS = 60;

export const ChallengeStatus = Object.freeze({
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
  CLAIMED: 'claimed',
});

export const getClaimedChallengeIds = () => {
  try {
    const storedIds = JSON.parse(
      localStorage.getItem(CLAIMED_CHALLENGES_STORAGE_KEY) ?? '[]'
    );

    return Array.isArray(storedIds) ? storedIds : [];
  } catch {
    return [];
  }
};

export const claimChallenge = (challengeId) => {
  const claimedIds = getClaimedChallengeIds();
  if (claimedIds.includes(challengeId)) {
    return claimedIds;
  }
  const nextClaimedIds = [...claimedIds, challengeId].slice(-MAX_STORED_CLAIMS);
  try {
    localStorage.setItem(
      CLAIMED_CHALLENGES_STORAGE_KEY,
      JSON.stringify(nextClaimedIds)
    );
  } catch {
    // Storage can be unavailable (private mode); the claim then lasts for this session only.
  }

  return nextClaimedIds;
};

export const buildProgressContext = (date) => ({
  history: getArcadeDailyHistory(),
  dateKeysByPeriod: {
    [ChallengePeriod.DAILY]: [getLocalDateKey(date)],
    [ChallengePeriod.WEEKLY]: getWeekDateKeys(date),
  },
  bankShotStars: getBankShotTotalStars(),
  beatenBotCount: getBeatenBotIds().length,
});

const collectGameEntries = (context, period, gameId) =>
  context.dateKeysByPeriod[period].flatMap((dateKey) => {
    const dayEntry = context.history[dateKey] ?? {};

    return gameId ? [dayEntry[gameId] ?? {}] : Object.values(dayEntry);
  });

const sumField = (entries, field) =>
  entries.reduce((total, entry) => total + (entry[field] ?? 0), 0);

const maxField = (entries, field) =>
  entries.reduce((best, entry) => Math.max(best, entry[field] ?? 0), 0);

export const isAllTimeMetric = (metric) =>
  metric === ChallengeMetric.BANK_SHOT_STARS ||
  metric === ChallengeMetric.BOTS_BEATEN;

export const computeChallengeProgress = (challenge, context) => {
  const entries = collectGameEntries(
    context,
    challenge.period,
    challenge.gameId
  );
  switch (challenge.metric) {
    case ChallengeMetric.ARCADE_BEST_SCORE:
      return maxField(entries, 'bestScore');
    case ChallengeMetric.ARCADE_TOTAL_SCORE:
      return sumField(entries, 'totalScore');
    case ChallengeMetric.ARCADE_RUNS:
      return sumField(entries, 'plays');
    case ChallengeMetric.BANK_SHOT_STARS:
      return context.bankShotStars;
    case ChallengeMetric.BOTS_BEATEN:
      return context.beatenBotCount;
    default:
      return 0;
  }
};

export const getChallengeStatus = (progress, target, isClaimed) => {
  if (isClaimed) {
    return ChallengeStatus.CLAIMED;
  }

  return progress >= target
    ? ChallengeStatus.COMPLETED
    : ChallengeStatus.IN_PROGRESS;
};
