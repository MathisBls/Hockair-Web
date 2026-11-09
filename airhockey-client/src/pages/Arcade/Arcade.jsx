import {
  EmojiEvents as TrophyIcon,
  Flag as ChallengeIcon,
  PlayArrow as PlayIcon,
  SportsEsports as PlaysIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { ARCADE_GAMES } from '../../arcade/arcadeGames';
import {
  Badge,
  Button,
  ButtonVariant,
  Card,
  PageContainer,
  PageHeader,
  StatTile,
} from '../../components/ui';

import ArcadeIllustration from './ArcadeIllustration';
import { buildArcadeCards, buildArcadeSummary } from './arcadeViewModel';
import './Arcade.css';

const CHALLENGES_PATH = '/challenges';

const DifficultyMeter = ({ levels, label }) => (
  <span className='arcade-difficulty' role='img' aria-label={label}>
    {levels.map((level) => (
      <span
        key={level.id}
        className={`arcade-difficulty-bar ${level.isFilled ? 'arcade-difficulty-bar-filled' : ''}`}
      />
    ))}
  </span>
);

const Arcade = () => {
  const navigate = useNavigate();
  const { translations, language } = useLanguage();
  const texts = translations.page.arcade;
  const cards = useMemo(
    () => buildArcadeCards(ARCADE_GAMES, texts, language),
    [texts, language]
  );
  const summary = useMemo(
    () => buildArcadeSummary(texts, language),
    [texts, language]
  );

  return (
    <PageContainer>
      <PageHeader
        eyebrow={texts.eyebrow}
        title={texts.title}
        description={texts.description}
        actions={
          <Button
            variant={ButtonVariant.SECONDARY}
            icon={<ChallengeIcon />}
            onClick={() => navigate(CHALLENGES_PATH)}
          >
            {texts.viewChallenges}
          </Button>
        }
      />

      <div className='arcade-summary'>
        <StatTile
          icon={<PlaysIcon />}
          label={texts.summary.playsToday}
          value={summary.playsToday}
          detail={summary.playsWeekLabel}
        />
        <StatTile
          icon={<TrophyIcon />}
          label={texts.summary.records}
          value={summary.recordCount}
          detail={summary.recordDetail}
        />
        <StatTile
          icon={<StarIcon />}
          label={texts.summary.stars}
          value={summary.starsValue}
          detail={summary.starsDetail}
        />
      </div>

      <div className='arcade-grid'>
        {cards.map((card) => (
          <Card
            key={card.id}
            as='article'
            isPadded={false}
            className='arcade-card'
          >
            <div className='arcade-card-art'>
              <ArcadeIllustration gameId={card.id} />
            </div>
            <div className='arcade-card-body'>
              <div className='arcade-card-meta'>
                <Badge>{card.formatLabel}</Badge>
                <span className='arcade-card-difficulty'>
                  {card.difficultyLabel}
                  <DifficultyMeter
                    levels={card.difficultyLevels}
                    label={card.difficultyLabel}
                  />
                </span>
              </div>
              <h2 className='arcade-card-title'>{card.name}</h2>
              <p className='arcade-card-tagline'>{card.tagline}</p>
              <p className='arcade-card-description'>{card.description}</p>
              <div className='arcade-card-best'>
                <TrophyIcon
                  className={`arcade-card-best-icon ${card.hasBest ? 'arcade-card-best-icon-earned' : ''}`}
                  aria-hidden='true'
                />
                <span className='arcade-card-best-label'>
                  {texts.personalBest}
                </span>
                <strong className='arcade-card-best-value'>
                  {card.bestLabel}
                </strong>
              </div>
              <Button
                icon={<PlayIcon />}
                isFullWidth
                onClick={() => navigate(card.path)}
              >
                {texts.play}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
};

export default Arcade;
