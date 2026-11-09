import { BOTS } from '../../game/bots';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';
import {
  computeWinRate,
  formatDecimal,
  formatInteger,
  formatPercent,
  formatRelativeTime,
  formatShortDate,
  formatSignedInteger,
} from '../Profile/playerFormatting';

import {
  DAYS_BY_ELO_CHART_RANGE,
  ELO_TREND_WINDOW_DAYS,
  MatchResult,
  OpponentKind,
  PERSONAL_RECORDS_DTO,
} from './statsData';

const SECONDS_PER_MINUTE = 60;
const SECONDS_PADDING_LENGTH = 2;

const formatDuration = (durationSeconds) =>
  `${Math.floor(durationSeconds / SECONDS_PER_MINUTE)}:${String(
    durationSeconds % SECONDS_PER_MINUTE
  ).padStart(SECONDS_PADDING_LENGTH, '0')}`;

const getEloChange = (eloHistory, dayCount) => {
  const windowStart = eloHistory[Math.max(eloHistory.length - dayCount, 0)];
  const windowEnd = eloHistory.at(-1);

  return windowStart && windowEnd ? windowEnd.elo - windowStart.elo : 0;
};

export const buildKpiTiles = ({
  playerRecord,
  eloHistory,
  fastestShotDate,
  hasMatchHistory,
  language,
  translations,
}) => {
  const statsTexts = translations.competitive.stats;
  const commonTexts = translations.competitive.common;
  const gamesPlayed = playerRecord.victories + playerRecord.defeats;
  const winRate = computeWinRate(playerRecord.victories, playerRecord.defeats);

  return [
    {
      id: 'elo',
      label: statsTexts.kpis.elo,
      value: formatInteger(language, playerRecord.elo),
      detail: hasMatchHistory
        ? formatTranslation(statsTexts.kpis.eloDetail, {
            change: formatSignedInteger(
              language,
              getEloChange(eloHistory, ELO_TREND_WINDOW_DAYS)
            ),
          })
        : null,
    },
    {
      id: 'games',
      label: statsTexts.kpis.games,
      value: formatInteger(language, gamesPlayed),
      detail: formatTranslation(commonTexts.recordValue, {
        victories: formatInteger(language, playerRecord.victories),
        defeats: formatInteger(language, playerRecord.defeats),
      }),
    },
    {
      id: 'winRate',
      label: statsTexts.kpis.winRate,
      value:
        winRate === null
          ? commonTexts.noValue
          : formatPercent(language, winRate),
      detail: statsTexts.kpis.winRateDetail,
    },
    hasMatchHistory
      ? {
          id: 'bestStreak',
          label: statsTexts.kpis.bestStreak,
          value: formatPluralTranslation(
            statsTexts.kpis.bestStreakValue,
            PERSONAL_RECORDS_DTO.bestWinStreak
          ),
          detail: statsTexts.kpis.bestStreakDetail,
        }
      : {
          id: 'bestStreak',
          label: statsTexts.kpis.bestStreak,
          value: commonTexts.noValue,
          detail: statsTexts.kpis.noRecordDetail,
        },
    hasMatchHistory && fastestShotDate
      ? {
          id: 'fastestShot',
          label: statsTexts.kpis.fastestShot,
          value: formatTranslation(statsTexts.kpis.fastestShotValue, {
            speed: formatDecimal(language, PERSONAL_RECORDS_DTO.fastestShotKmh),
          }),
          detail: formatTranslation(statsTexts.kpis.fastestShotDetail, {
            date: formatRelativeTime(language, fastestShotDate),
          }),
        }
      : {
          id: 'fastestShot',
          label: statsTexts.kpis.fastestShot,
          value: commonTexts.noValue,
          detail: statsTexts.kpis.noRecordDetail,
        },
  ];
};

export const buildEloChartModel = ({
  eloHistory,
  chartRange,
  language,
  translations,
}) => {
  const chartTexts = translations.competitive.stats.eloChart;
  const dayCount = DAYS_BY_ELO_CHART_RANGE[chartRange];
  const visibleHistory = eloHistory.slice(-dayCount);
  const points = visibleHistory.map((historyPoint) => ({
    timestamp: new Date(historyPoint.date).getTime(),
    elo: historyPoint.elo,
    dateLabel: formatShortDate(language, historyPoint.date),
    eloLabel: formatTranslation(chartTexts.tooltipElo, {
      elo: formatInteger(language, historyPoint.elo),
    }),
  }));
  const firstPoint = visibleHistory[0];
  const lastPoint = visibleHistory.at(-1);

  return {
    points,
    hasPoints: points.length > 0,
    summaryLabel:
      firstPoint && lastPoint
        ? formatTranslation(chartTexts.summary, {
            start: formatInteger(language, firstPoint.elo),
            end: formatInteger(language, lastPoint.elo),
            change: formatSignedInteger(
              language,
              lastPoint.elo - firstPoint.elo
            ),
          })
        : '',
    formatTick: (timestamp) => formatShortDate(language, timestamp),
    formatValueTick: (elo) => formatInteger(language, elo),
  };
};

export const buildBotResultRows = ({
  resultsByBot,
  beatenBotIds,
  language,
  translations,
}) => {
  const byBotTexts = translations.competitive.stats.byBot;
  const commonTexts = translations.competitive.common;

  return resultsByBot.map((botResult) => {
    const bot = BOTS.find((rosterBot) => rosterBot.id === botResult.botId);
    const gamesPlayed = botResult.victories + botResult.defeats;
    const winRate = computeWinRate(botResult.victories, botResult.defeats);

    return {
      botId: botResult.botId,
      bot,
      name: translations.bots?.[botResult.botId]?.name ?? botResult.botId,
      tierLabel: translations.page?.play?.tiers?.[bot?.tier] ?? '',
      ratingLabel: formatInteger(language, bot?.rating ?? 0),
      isBeaten: beatenBotIds.includes(botResult.botId),
      hasPlayed: gamesPlayed > 0,
      recordLabel:
        gamesPlayed > 0
          ? formatTranslation(commonTexts.recordValue, {
              victories: formatInteger(language, botResult.victories),
              defeats: formatInteger(language, botResult.defeats),
            })
          : byBotTexts.notPlayed,
      winRateLabel:
        winRate === null
          ? ''
          : formatTranslation(byBotTexts.winRate, {
              rate: formatPercent(language, winRate),
            }),
      winRatio: winRate ?? 0,
    };
  });
};

export const buildRecentMatchRows = ({
  recentMatches,
  language,
  translations,
}) => {
  const recentTexts = translations.competitive.stats.recent;
  const resultTexts = translations.competitive.common.results;

  return recentMatches.map((match) => {
    const isBotOpponent = match.opponent.kind === OpponentKind.BOT;
    const bot = isBotOpponent
      ? BOTS.find((rosterBot) => rosterBot.id === match.opponent.botId)
      : null;

    return {
      matchId: match.matchId,
      result: match.result,
      isWin: match.result === MatchResult.WIN,
      resultLabel: resultTexts[match.result],
      opponentName: isBotOpponent
        ? (translations.bots?.[match.opponent.botId]?.name ??
          match.opponent.botId)
        : match.opponent.username,
      opponentKindLabel: isBotOpponent
        ? recentTexts.botOpponent
        : recentTexts.playerOpponent,
      opponentEloLabel: formatInteger(language, match.opponent.elo),
      bot,
      scoreLabel: formatTranslation(recentTexts.score, {
        player: match.playerScore,
        opponent: match.opponentScore,
      }),
      eloChangeLabel: formatSignedInteger(language, match.eloChange),
      isEloGain: match.eloChange > 0,
      durationLabel: formatDuration(match.durationSeconds),
      playedAtLabel: formatRelativeTime(language, match.playedAt),
    };
  });
};
