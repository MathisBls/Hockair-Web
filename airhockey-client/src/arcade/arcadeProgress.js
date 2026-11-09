import { ArcadeGameId } from './arcadeGames';
import { addDays, getLocalDateKey } from './calendar';

const BEST_SCORES_STORAGE_KEY = 'hockair.arcade.bestScores';
const DAILY_HISTORY_STORAGE_KEY = 'hockair.arcade.dailyHistory';
const BANK_SHOT_STARS_STORAGE_KEY = 'hockair.arcade.bankShotStars';
const HISTORY_RETENTION_DAYS = 21;

const readJson = (key, fallback) => {
  try {
    const rawValue = localStorage.getItem(key);
    const parsedValue = rawValue ? JSON.parse(rawValue) : fallback;

    return parsedValue !== null && typeof parsedValue === 'object'
      ? parsedValue
      : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); scores are then kept for this session only.
  }
};

const toSafeCount = (value) =>
  Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;

const createEmptyDailyEntry = () => ({ plays: 0, bestScore: 0, totalScore: 0 });

export const getBankShotStarsByLevel = () =>
  readJson(BANK_SHOT_STARS_STORAGE_KEY, {});

export const getBankShotTotalStars = () =>
  Object.values(getBankShotStarsByLevel()).reduce(
    (total, stars) => total + toSafeCount(stars),
    0
  );

export const getArcadeBestScore = (gameId) => {
  if (gameId === ArcadeGameId.BANK_SHOT) {
    return getBankShotTotalStars();
  }

  return toSafeCount(readJson(BEST_SCORES_STORAGE_KEY, {})[gameId]);
};

export const getArcadeDailyHistory = () =>
  readJson(DAILY_HISTORY_STORAGE_KEY, {});

const pruneHistory = (history, today) => {
  const oldestKeptKey = getLocalDateKey(
    addDays(today, -HISTORY_RETENTION_DAYS)
  );

  return Object.fromEntries(
    Object.entries(history).filter(([dateKey]) => dateKey >= oldestKeptKey)
  );
};

const recordDailyPlay = (gameId, score) => {
  const today = new Date();
  const todayKey = getLocalDateKey(today);
  const history = getArcadeDailyHistory();
  const dayEntry = history[todayKey] ?? {};
  const gameEntry = { ...createEmptyDailyEntry(), ...dayEntry[gameId] };
  const nextHistory = {
    ...history,
    [todayKey]: {
      ...dayEntry,
      [gameId]: {
        plays: toSafeCount(gameEntry.plays) + 1,
        bestScore: Math.max(toSafeCount(gameEntry.bestScore), score),
        totalScore: toSafeCount(gameEntry.totalScore) + score,
      },
    },
  };
  writeJson(DAILY_HISTORY_STORAGE_KEY, pruneHistory(nextHistory, today));
};

export const recordArcadeSession = (gameId, score) => {
  const safeScore = toSafeCount(score);
  const bestScores = readJson(BEST_SCORES_STORAGE_KEY, {});
  const previousBest = toSafeCount(bestScores[gameId]);
  const isNewBest = safeScore > previousBest;
  if (isNewBest) {
    writeJson(BEST_SCORES_STORAGE_KEY, {
      ...bestScores,
      [gameId]: safeScore,
    });
  }
  recordDailyPlay(gameId, safeScore);

  return {
    previousBest,
    best: Math.max(previousBest, safeScore),
    isNewBest,
  };
};

export const recordBankShotLevel = (levelId, stars) => {
  const starsByLevel = getBankShotStarsByLevel();
  const previousStars = toSafeCount(starsByLevel[levelId]);
  const isImprovement = stars > previousStars;
  if (isImprovement) {
    writeJson(BANK_SHOT_STARS_STORAGE_KEY, {
      ...starsByLevel,
      [levelId]: stars,
    });
  }
  recordDailyPlay(ArcadeGameId.BANK_SHOT, toSafeCount(stars));

  return {
    previousStars,
    bestStars: Math.max(previousStars, stars),
    isNewBest: isImprovement,
  };
};
