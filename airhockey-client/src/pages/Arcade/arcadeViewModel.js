import {
  ARCADE_GAMES,
  ArcadeDifficulty,
  ArcadeGameId,
} from '../../arcade/arcadeGames';
import {
  getArcadeBestScore,
  getArcadeDailyHistory,
  getBankShotStarsByLevel,
  getBankShotTotalStars,
} from '../../arcade/arcadeProgress';
import {
  BANK_SHOT_LEVELS,
  BANK_SHOT_MAX_STARS,
  computeStarsForShot,
  isBankShotLevelUnlocked,
  MAX_STARS_PER_LEVEL,
} from '../../arcade/bankShotLevels';
import { getLocalDateKey, getWeekDateKeys } from '../../arcade/calendar';
import { BankShotState } from '../../arcade/engine/bankShotEngine';
import { GOALIE_LIVES } from '../../arcade/engine/goalieReflexEngine';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';
import { formatClock } from '../Match/matchViewModel';

export const ToastTone = Object.freeze({
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NEUTRAL: 'neutral',
});

const DIFFICULTY_LEVEL_COUNT = 3;
const DIFFICULTY_RANK = {
  [ArcadeDifficulty.EASY]: 1,
  [ArcadeDifficulty.MEDIUM]: 2,
  [ArcadeDifficulty.HARD]: 3,
};

export const formatNumber = (value, language) =>
  new Intl.NumberFormat(language).format(value);

export const buildStarSlots = (stars) =>
  Array.from({ length: MAX_STARS_PER_LEVEL }, (_, index) => ({
    id: `star-${index}`,
    isEarned: index < stars,
  }));

export const formatScoreWithUnit = (game, score, texts, language) =>
  formatPluralTranslation(texts.scoreUnits[game.scoreUnit], score, {
    value: formatNumber(score, language),
  });

const formatBestScore = (game, best, texts, language) => {
  if (best <= 0) {
    return texts.noBest;
  }
  if (game.id === ArcadeGameId.BANK_SHOT) {
    return formatTranslation(texts.starsOutOf, {
      count: formatNumber(best, language),
      total: BANK_SHOT_MAX_STARS,
    });
  }

  return formatScoreWithUnit(game, best, texts, language);
};

export const buildArcadeCards = (games, texts, language) =>
  games.map((game) => {
    const gameTexts = texts.games[game.translationKey];
    const best = getArcadeBestScore(game.id);

    return {
      id: game.id,
      name: gameTexts.name,
      tagline: gameTexts.tagline,
      description: gameTexts.description,
      difficulty: game.difficulty,
      difficultyLabel: texts.difficulty[game.difficulty],
      difficultyLevels: Array.from(
        { length: DIFFICULTY_LEVEL_COUNT },
        (_, index) => ({
          id: `level-${index}`,
          isFilled: index < DIFFICULTY_RANK[game.difficulty],
        })
      ),
      formatLabel: gameTexts.format,
      bestLabel: formatBestScore(game, best, texts, language),
      hasBest: best > 0,
      path: `/arcade/${game.id}`,
    };
  });

const sumPlays = (dayEntry = {}) =>
  Object.values(dayEntry).reduce(
    (total, entry) => total + (entry.plays ?? 0),
    0
  );

export const buildArcadeSummary = (texts, language) => {
  const history = getArcadeDailyHistory();
  const today = new Date();
  const playsToday = sumPlays(history[getLocalDateKey(today)]);
  const playsThisWeek = getWeekDateKeys(today).reduce(
    (total, dateKey) => total + sumPlays(history[dateKey]),
    0
  );
  const recordCount = ARCADE_GAMES.filter(
    (game) => getArcadeBestScore(game.id) > 0
  ).length;
  const clearedLevelCount = Object.values(getBankShotStarsByLevel()).filter(
    (stars) => stars > 0
  ).length;

  return {
    playsToday: formatNumber(playsToday, language),
    playsWeekLabel: formatPluralTranslation(
      texts.summary.playsThisWeek,
      playsThisWeek,
      { value: formatNumber(playsThisWeek, language) }
    ),
    recordCount: formatTranslation(texts.summary.outOf, {
      count: recordCount,
      total: ARCADE_GAMES.length,
    }),
    recordDetail: texts.summary.recordsDetail,
    starsValue: formatTranslation(texts.summary.outOf, {
      count: getBankShotTotalStars(),
      total: BANK_SHOT_MAX_STARS,
    }),
    starsDetail: formatPluralTranslation(
      texts.summary.levelsCleared,
      clearedLevelCount
    ),
  };
};

export const buildStartModel = (game, texts, language) => {
  const gameTexts = texts.games[game.translationKey];

  return {
    title: gameTexts.name,
    description: gameTexts.description,
    rules: gameTexts.rules,
    difficultyLabel: texts.difficulty[game.difficulty],
    bestValue: formatBestScore(
      game,
      getArcadeBestScore(game.id),
      texts,
      language
    ),
  };
};

export const buildBankShotLevels = (texts, selectedLevelId) => {
  const starsByLevel = getBankShotStarsByLevel();

  return BANK_SHOT_LEVELS.map((level, index) => {
    const stars = starsByLevel[level.id] ?? 0;

    return {
      id: level.id,
      numberLabel: formatTranslation(texts.bankShot.levelNumber, {
        number: index + 1,
      }),
      name: texts.bankShot.levelNames[level.id],
      starSlots: buildStarSlots(stars),
      isLocked: !isBankShotLevelUnlocked(index, starsByLevel),
      isSelected: level.id === selectedLevelId,
    };
  });
};

export const findDefaultBankShotLevelId = () => {
  const starsByLevel = getBankShotStarsByLevel();
  const firstIncomplete = BANK_SHOT_LEVELS.find(
    (level, index) =>
      isBankShotLevelUnlocked(index, starsByLevel) &&
      (starsByLevel[level.id] ?? 0) === 0
  );

  return (firstIncomplete ?? BANK_SHOT_LEVELS[0]).id;
};

const buildLatestToast = (candidates) =>
  candidates
    .filter(Boolean)
    .reduce(
      (latest, candidate) =>
        !latest || candidate.order > latest.order ? candidate : latest,
      null
    );

const buildTargetRushHud = (snapshot, texts, language) => {
  const hudTexts = texts.hud;
  const { lastHit } = snapshot;

  return {
    stats: [
      {
        id: 'score',
        label: hudTexts.score,
        value: formatNumber(snapshot.score, language),
        isPrimary: true,
      },
      {
        id: 'time',
        label: hudTexts.time,
        value: formatClock(snapshot.remainingSeconds),
        isWarning: snapshot.isTimeRunningOut,
      },
      {
        id: 'multiplier',
        label: hudTexts.multiplier,
        value: formatTranslation(hudTexts.multiplierValue, {
          value: snapshot.multiplier,
        }),
        detail: formatPluralTranslation(hudTexts.comboCount, snapshot.combo),
      },
    ],
    lives: [],
    toast: lastHit
      ? {
          id: lastHit.id,
          text: formatTranslation(hudTexts.points, {
            points: formatNumber(lastHit.points, language),
          }),
          tone: ToastTone.POSITIVE,
        }
      : null,
  };
};

const buildGoalieHud = (snapshot, texts, language) => {
  const hudTexts = texts.hud;
  const saveToast = snapshot.lastSave && {
    id: `save-${snapshot.lastSave.id}`,
    order: snapshot.lastSave.id,
    text: formatTranslation(hudTexts.save, {
      speed: formatNumber(snapshot.lastSave.kmh, language),
    }),
    tone: ToastTone.POSITIVE,
  };
  const concedeToast = snapshot.lastConcede && {
    id: `concede-${snapshot.lastConcede.id}`,
    order: snapshot.lastConcede.id,
    text: hudTexts.conceded,
    tone: ToastTone.NEGATIVE,
  };

  return {
    stats: [
      {
        id: 'score',
        label: hudTexts.saves,
        value: formatNumber(snapshot.score, language),
        isPrimary: true,
      },
      {
        id: 'level',
        label: hudTexts.level,
        value: formatNumber(snapshot.level, language),
      },
      {
        id: 'speed',
        label: hudTexts.shotSpeed,
        value: formatTranslation(hudTexts.speedValue, {
          speed: formatNumber(snapshot.lastShotKmh, language),
        }),
      },
    ],
    lives: Array.from({ length: GOALIE_LIVES }, (_, index) => ({
      id: `life-${index}`,
      isLost: index >= snapshot.lives,
    })),
    livesLabel: formatPluralTranslation(hudTexts.livesLeft, snapshot.lives),
    toast: buildLatestToast([saveToast, concedeToast]),
  };
};

const buildBankShotHud = (snapshot, texts, language) => {
  const hudTexts = texts.hud;
  const potentialStars = computeStarsForShot(snapshot.shotsUsed + 1);
  const isResetting = snapshot.shotState === BankShotState.RESETTING;

  return {
    stats: [
      {
        id: 'level',
        label: formatTranslation(texts.bankShot.levelNumber, {
          number: snapshot.levelIndex + 1,
        }),
        value: texts.bankShot.levelNames[snapshot.levelId],
        isPrimary: true,
      },
      {
        id: 'shots',
        label: hudTexts.shots,
        value: formatTranslation(hudTexts.shotsValue, {
          remaining: formatNumber(snapshot.shotsRemaining, language),
          total: formatNumber(snapshot.shotsAllowed, language),
        }),
      },
    ],
    lives: [],
    potentialStars: buildStarSlots(potentialStars),
    potentialStarsLabel: formatPluralTranslation(
      hudTexts.potentialStars,
      potentialStars
    ),
    toast:
      isResetting && snapshot.lastOutcome
        ? {
            id: `outcome-${snapshot.shotsUsed}`,
            text: texts.bankShot.outcomes[snapshot.lastOutcome],
            tone: ToastTone.NEUTRAL,
          }
        : null,
  };
};

const HUD_BUILDER_BY_GAME_ID = {
  [ArcadeGameId.TARGET_RUSH]: buildTargetRushHud,
  [ArcadeGameId.GOALIE_REFLEX]: buildGoalieHud,
  [ArcadeGameId.BANK_SHOT]: buildBankShotHud,
};

export const buildHudModel = (game, snapshot, texts, language) =>
  HUD_BUILDER_BY_GAME_ID[game.id](snapshot, texts, language);

const buildTargetRushResult = (snapshot, texts, language) => ({
  title: texts.result.timeUp,
  scoreValue: formatNumber(snapshot.score, language),
  scoreCaption: texts.hud.score,
  stats: [
    {
      id: 'targets',
      label: texts.result.targetsHit,
      value: formatNumber(snapshot.targetsHit, language),
    },
    {
      id: 'combo',
      label: texts.result.bestCombo,
      value: formatNumber(snapshot.bestCombo, language),
    },
  ],
});

const buildGoalieResult = (snapshot, texts, language) => ({
  title: texts.result.gameOver,
  scoreValue: formatNumber(snapshot.score, language),
  scoreCaption: texts.hud.saves,
  stats: [
    {
      id: 'level',
      label: texts.result.levelReached,
      value: formatNumber(snapshot.level, language),
    },
    {
      id: 'fastest',
      label: texts.result.fastestSave,
      value: formatTranslation(texts.hud.speedValue, {
        speed: formatNumber(snapshot.fastestSaveKmh, language),
      }),
    },
  ],
});

const buildBankShotResult = (snapshot, texts, language) => ({
  title: snapshot.isCleared
    ? texts.bankShot.cleared
    : texts.bankShot.outOfShots,
  scoreValue: null,
  scoreCaption: texts.bankShot.levelNames[snapshot.levelId],
  starSlots: buildStarSlots(snapshot.stars),
  stats: [
    {
      id: 'shots',
      label: texts.result.shotsUsed,
      value: formatTranslation(texts.hud.shotsValue, {
        remaining: formatNumber(snapshot.shotsUsed, language),
        total: formatNumber(snapshot.shotsAllowed, language),
      }),
    },
  ],
});

const RESULT_BUILDER_BY_GAME_ID = {
  [ArcadeGameId.TARGET_RUSH]: buildTargetRushResult,
  [ArcadeGameId.GOALIE_REFLEX]: buildGoalieResult,
  [ArcadeGameId.BANK_SHOT]: buildBankShotResult,
};

export const buildResultModel = (
  game,
  snapshot,
  sessionRecord,
  texts,
  language
) => {
  const nextLevelIndex = snapshot.levelIndex + 1;
  const hasNextLevel =
    game.id === ArcadeGameId.BANK_SHOT &&
    snapshot.isCleared &&
    nextLevelIndex < BANK_SHOT_LEVELS.length;

  return {
    ...RESULT_BUILDER_BY_GAME_ID[game.id](snapshot, texts, language),
    isNewBest: Boolean(sessionRecord?.isNewBest),
    bestValue: formatBestScore(
      game,
      getArcadeBestScore(game.id),
      texts,
      language
    ),
    nextLevelId: hasNextLevel ? BANK_SHOT_LEVELS[nextLevelIndex].id : null,
  };
};
