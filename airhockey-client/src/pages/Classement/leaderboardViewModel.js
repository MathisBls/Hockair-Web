import { buildAssetUrl } from '../../api/apiClient';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';
import {
  computeWinRate,
  formatInteger,
  formatPercent,
  formatSignedInteger,
} from '../Profile/playerFormatting';

import { CURRENT_PLAYER_ID, LeaderboardScope } from './leaderboardData';

export const TrendDirection = Object.freeze({
  UP: 'up',
  DOWN: 'down',
  FLAT: 'flat',
});

const getTrendDirection = (eloChange) => {
  if (eloChange > 0) {
    return TrendDirection.UP;
  }

  return eloChange < 0 ? TrendDirection.DOWN : TrendDirection.FLAT;
};

export const buildLeaderboardRow = (entry, { language, translations }) => {
  const commonTexts = translations.competitive.common;
  const leaderboardTexts = translations.competitive.leaderboard;
  const winRate = computeWinRate(entry.victories, entry.defeats);
  const trendValueLabel = formatSignedInteger(language, entry.eloChange);
  const isCurrentPlayer = entry.userId === CURRENT_PLAYER_ID;

  return {
    userId: entry.userId,
    rank: entry.rank,
    rankLabel: formatInteger(language, entry.rank),
    username: entry.username,
    profilePictureUrl: buildAssetUrl(entry.profilePicture),
    countryCode: entry.countryCode,
    eloLabel: formatInteger(language, entry.elo),
    recordLabel: formatTranslation(commonTexts.recordValue, {
      victories: formatInteger(language, entry.victories),
      defeats: formatInteger(language, entry.defeats),
    }),
    gamesLabel: formatPluralTranslation(
      leaderboardTexts.games,
      entry.victories + entry.defeats,
      { count: formatInteger(language, entry.victories + entry.defeats) }
    ),
    winRateLabel:
      winRate === null ? commonTexts.noValue : formatPercent(language, winRate),
    winRateRatio: winRate ?? 0,
    trendDirection: getTrendDirection(entry.eloChange),
    trendValueLabel,
    trendAriaLabel: formatTranslation(leaderboardTexts.trendLabel, {
      value: trendValueLabel,
    }),
    isCurrentPlayer,
    youLabel: isCurrentPlayer ? commonTexts.you : null,
  };
};

export const buildCurrentPlayerSummary = (
  currentPlayerEntry,
  totalCount,
  { language, translations }
) =>
  currentPlayerEntry
    ? {
        ...buildLeaderboardRow(currentPlayerEntry, { language, translations }),
        eloValueLabel: formatTranslation(
          translations.competitive.common.eloValue,
          { elo: formatInteger(language, currentPlayerEntry.elo) }
        ),
        positionLabel: formatTranslation(
          translations.competitive.leaderboard.yourRank,
          {
            rank: formatInteger(language, currentPlayerEntry.rank),
            total: formatInteger(language, totalCount),
          }
        ),
      }
    : null;

export const buildEmptyStateTexts = (scope, leaderboardTexts) =>
  scope === LeaderboardScope.FRIENDS
    ? {
        title: leaderboardTexts.friendsEmptyTitle,
        description: leaderboardTexts.friendsEmptyDescription,
      }
    : {
        title: leaderboardTexts.emptyTitle,
        description: leaderboardTexts.emptyDescription,
      };
