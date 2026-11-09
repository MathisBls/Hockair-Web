import {
  ArrowForward as ArrowIcon,
  CallMade as BankShotIcon,
  GpsFixed as TargetIcon,
  SportsHockey as GoalieIcon,
} from '@mui/icons-material';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { Card } from '../../components/ui';

import { ARCADE_GAME_IDS, ArcadeGameId, HomeRoute } from './homeData';

const ICON_BY_ARCADE_GAME_ID = {
  [ArcadeGameId.TARGET_RUSH]: TargetIcon,
  [ArcadeGameId.GOALIE_REFLEX]: GoalieIcon,
  [ArcadeGameId.BANK_SHOT]: BankShotIcon,
};

const ArcadeTeaserCard = () => {
  const { translations } = useLanguage();
  const arcadeTexts = translations.page.home.arcade;

  const games = useMemo(
    () =>
      ARCADE_GAME_IDS.map((gameId) => ({
        id: gameId,
        Icon: ICON_BY_ARCADE_GAME_ID[gameId],
        name: arcadeTexts.games[gameId].name,
        description: arcadeTexts.games[gameId].description,
        path: `${HomeRoute.ARCADE}/${gameId}`,
      })),
    [arcadeTexts]
  );

  return (
    <Card
      title={arcadeTexts.title}
      subtitle={arcadeTexts.subtitle}
      action={
        <Link to={HomeRoute.ARCADE} className='home-text-link'>
          {arcadeTexts.open}
          <ArrowIcon fontSize='inherit' />
        </Link>
      }
    >
      <ul className='home-arcade-grid'>
        {games.map(({ id, Icon, name, description, path }) => (
          <li key={id}>
            <Link to={path} className='home-arcade-game'>
              <span className='home-arcade-game-icon'>
                <Icon fontSize='small' />
              </span>
              <span className='home-arcade-game-name'>{name}</span>
              <span className='home-arcade-game-description'>
                {description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default ArcadeTeaserCard;
