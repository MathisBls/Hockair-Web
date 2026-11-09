import {
  ArrowForward as ArrowIcon,
  TrendingDown as TrendDownIcon,
  TrendingFlat as TrendFlatIcon,
  TrendingUp as TrendUpIcon,
} from '@mui/icons-material';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { Avatar, AvatarSize, Card } from '../../components/ui';
import { formatTranslation } from '../../i18n/formatTranslation';

import {
  HomeRoute,
  LEADERBOARD_PREVIEW_LIMIT,
  LEADERBOARD_TOP_PLAYERS,
} from './homeData';

const EloTrend = Object.freeze({
  UP: 'up',
  DOWN: 'down',
  FLAT: 'flat',
});

const TREND_ICON_BY_ELO_TREND = {
  [EloTrend.UP]: TrendUpIcon,
  [EloTrend.DOWN]: TrendDownIcon,
  [EloTrend.FLAT]: TrendFlatIcon,
};

const CHAMPION_RANK = 1;

const getEloTrend = (eloDelta) => {
  if (eloDelta > 0) {
    return EloTrend.UP;
  }

  return eloDelta < 0 ? EloTrend.DOWN : EloTrend.FLAT;
};

const LeaderboardPreviewCard = () => {
  const { translations, language } = useLanguage();
  const leaderboardTexts = translations.page.home.leaderboard;

  const players = useMemo(() => {
    const numberFormatter = new Intl.NumberFormat(language);
    const trendTemplates = {
      [EloTrend.UP]: leaderboardTexts.trendUp,
      [EloTrend.DOWN]: leaderboardTexts.trendDown,
      [EloTrend.FLAT]: leaderboardTexts.trendFlat,
    };

    return LEADERBOARD_TOP_PLAYERS.slice(0, LEADERBOARD_PREVIEW_LIMIT).map(
      (player) => {
        const trend = getEloTrend(player.eloDelta);

        return {
          id: player.userId,
          rank: player.rank,
          isChampion: player.rank === CHAMPION_RANK,
          rankLabel: formatTranslation(leaderboardTexts.rankLabel, {
            rank: player.rank,
          }),
          username: player.username,
          country: player.country,
          eloLabel: numberFormatter.format(player.elo),
          trend,
          TrendIcon: TREND_ICON_BY_ELO_TREND[trend],
          trendLabel: formatTranslation(trendTemplates[trend], {
            delta: numberFormatter.format(player.eloDelta),
          }),
        };
      }
    );
  }, [leaderboardTexts, language]);

  return (
    <Card
      title={leaderboardTexts.title}
      action={
        <Link to={HomeRoute.LEADERBOARD} className='home-text-link'>
          {leaderboardTexts.viewAll}
          <ArrowIcon fontSize='inherit' />
        </Link>
      }
    >
      <ol className='home-list'>
        {players.map((player) => (
          <li key={player.id} className='home-leader-row'>
            <span
              className={`home-leader-rank ${player.isChampion ? 'home-leader-rank-champion' : ''}`}
              aria-label={player.rankLabel}
            >
              {player.rank}
            </span>
            <Avatar name={player.username} size={AvatarSize.SMALL} />
            <span className='home-leader-name'>
              {player.username}
              <span className='home-leader-country'>{player.country}</span>
            </span>
            <span className='home-leader-elo'>{player.eloLabel}</span>
            <span
              className={`home-leader-trend home-leader-trend-${player.trend}`}
              title={leaderboardTexts.trendLabel}
            >
              <player.TrendIcon fontSize='inherit' />
              {player.trendLabel}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
};

export default LeaderboardPreviewCard;
