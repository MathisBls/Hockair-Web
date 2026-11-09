import { ArcadeGameId, findArcadeGame } from '../../arcade/arcadeGames';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';

import {
  ChallengeStatus,
  computeChallengeProgress,
  getChallengeStatus,
  isAllTimeMetric,
} from './challengeProgress';
import {
  ChallengeMetric,
  ChallengePeriod,
  ChallengeTier,
} from './challengesData';

export const ChallengeIconKind = Object.freeze({
  TARGET: 'target',
  SHIELD: 'shield',
  BANK: 'bank',
  RUNS: 'runs',
  BOTS: 'bots',
  STARS: 'stars',
});

const ICON_BY_GAME_ID = {
  [ArcadeGameId.TARGET_RUSH]: ChallengeIconKind.TARGET,
  [ArcadeGameId.GOALIE_REFLEX]: ChallengeIconKind.SHIELD,
  [ArcadeGameId.BANK_SHOT]: ChallengeIconKind.BANK,
};

const ICON_BY_METRIC = {
  [ChallengeMetric.BANK_SHOT_STARS]: ChallengeIconKind.STARS,
  [ChallengeMetric.BOTS_BEATEN]: ChallengeIconKind.BOTS,
};

const PLAY_PATH = '/play';
const ARCADE_PATH = '/arcade';
const MILLISECONDS_PER_MINUTE = 60 * 1000;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;

const formatNumber = (value, language) =>
  new Intl.NumberFormat(language).format(value);

const getChallengeIcon = (challenge) =>
  ICON_BY_METRIC[challenge.metric] ??
  ICON_BY_GAME_ID[challenge.gameId] ??
  ChallengeIconKind.RUNS;

const getChallengePath = (challenge) => {
  if (challenge.metric === ChallengeMetric.BOTS_BEATEN) {
    return PLAY_PATH;
  }

  return challenge.gameId ? `${ARCADE_PATH}/${challenge.gameId}` : ARCADE_PATH;
};

const getGameName = (gameId, arcadeTexts) => {
  const game = findArcadeGame(gameId);

  return game ? arcadeTexts.games[game.translationKey].name : null;
};

export const formatTimeUntil = (endDate, now, texts) => {
  const totalMinutes = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / MILLISECONDS_PER_MINUTE)
  );
  const days = Math.floor(totalMinutes / (MINUTES_PER_HOUR * HOURS_PER_DAY));
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR) % HOURS_PER_DAY;
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const parts =
    days > 0
      ? [
          formatPluralTranslation(texts.duration.days, days),
          formatPluralTranslation(texts.duration.hours, hours),
        ]
      : [
          formatPluralTranslation(texts.duration.hours, hours),
          formatPluralTranslation(texts.duration.minutes, minutes),
        ];

  return formatTranslation(texts.resetsIn, { duration: parts.join(' ') });
};

const buildContextLabel = (challenge, texts, arcadeTexts) => {
  const scopeLabel = isAllTimeMetric(challenge.metric)
    ? texts.scope.allTime
    : texts.scope[challenge.period];
  const gameName = getGameName(challenge.gameId, arcadeTexts);

  return gameName ? `${gameName} · ${scopeLabel}` : scopeLabel;
};

export const buildChallengeRows = ({
  challenges,
  progressContext,
  claimedIds,
  texts,
  arcadeTexts,
  language,
}) =>
  challenges.map((challenge) => {
    const progress = computeChallengeProgress(challenge, progressContext);
    const clampedProgress = Math.min(progress, challenge.target);
    const status = getChallengeStatus(
      progress,
      challenge.target,
      claimedIds.includes(challenge.id)
    );

    return {
      id: challenge.id,
      icon: getChallengeIcon(challenge),
      title: formatPluralTranslation(
        texts.titles[challenge.templateId],
        challenge.target,
        { target: formatNumber(challenge.target, language) }
      ),
      contextLabel: buildContextLabel(challenge, texts, arcadeTexts),
      isHardTier: challenge.tier === ChallengeTier.HARD,
      tierLabel: texts.tiers[challenge.tier],
      progressRatio: clampedProgress / challenge.target,
      progressLabel: formatTranslation(texts.progress, {
        current: formatNumber(clampedProgress, language),
        target: formatNumber(challenge.target, language),
      }),
      coinsLabel: formatPluralTranslation(
        texts.reward.coins,
        challenge.reward.coins,
        { value: formatNumber(challenge.reward.coins, language) }
      ),
      xpLabel: formatTranslation(texts.reward.xp, {
        value: formatNumber(challenge.reward.xp, language),
      }),
      status,
      statusLabel: texts.status[status],
      isClaimable: status === ChallengeStatus.COMPLETED,
      isClaimed: status === ChallengeStatus.CLAIMED,
      isInProgress: status === ChallengeStatus.IN_PROGRESS,
      playPath: getChallengePath(challenge),
      coins: challenge.reward.coins,
    };
  });

const countDone = (rows) =>
  rows.filter((row) => row.status !== ChallengeStatus.IN_PROGRESS).length;

export const buildChallengeSummary = ({
  dailyRows,
  weeklyRows,
  challenges,
  now,
  texts,
  language,
}) => {
  const claimedCoins = [...dailyRows, ...weeklyRows]
    .filter((row) => row.isClaimed)
    .reduce((total, row) => total + row.coins, 0);
  const firstDaily = challenges.daily[0];
  const firstWeekly = challenges.weekly[0];

  return {
    dailyValue: formatTranslation(texts.summary.outOf, {
      count: countDone(dailyRows),
      total: dailyRows.length,
    }),
    dailyDetail: firstDaily
      ? formatTimeUntil(new Date(firstDaily.endsAt), now, texts)
      : null,
    weeklyValue: formatTranslation(texts.summary.outOf, {
      count: countDone(weeklyRows),
      total: weeklyRows.length,
    }),
    weeklyDetail: firstWeekly
      ? formatTimeUntil(new Date(firstWeekly.endsAt), now, texts)
      : null,
    coinsValue: formatNumber(claimedCoins, language),
    coinsDetail: formatPluralTranslation(
      texts.summary.coinsDetail,
      claimedCoins
    ),
  };
};

const formatTabCount = (rows) =>
  rows ? `${countDone(rows)}/${rows.length}` : undefined;

export const buildPeriodTabs = (dailyRows, weeklyRows, texts) => [
  {
    value: ChallengePeriod.DAILY,
    label: texts.tabs.daily,
    count: formatTabCount(dailyRows),
  },
  {
    value: ChallengePeriod.WEEKLY,
    label: texts.tabs.weekly,
    count: formatTabCount(weeklyRows),
  },
];
