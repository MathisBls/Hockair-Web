import {
  ArrowBack as BackIcon,
  ArrowForward as NextIcon,
  EmojiEvents as TrophyIcon,
  Replay as RetryIcon,
  ViewModule as LevelsIcon,
} from '@mui/icons-material';
import React from 'react';

import {
  Badge,
  BadgeTone,
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/ui';

import StarRating from './StarRating';

const ArcadeResultPanel = ({
  model,
  texts,
  hasLevels,
  onRetry,
  onNextLevel,
  onShowLevels,
  onBack,
}) => (
  <div className='arcade-overlay'>
    <section
      className='arcade-panel arcade-panel-compact'
      aria-labelledby='arcade-result-title'
    >
      <header className='arcade-result-header'>
        {model.isNewBest && (
          <Badge tone={BadgeTone.WARNING} icon={<TrophyIcon />}>
            {texts.result.newBest}
          </Badge>
        )}
        <h2 id='arcade-result-title' className='arcade-panel-title'>
          {model.title}
        </h2>
        {model.scoreValue && (
          <strong className='arcade-result-score'>{model.scoreValue}</strong>
        )}
        {model.starSlots && (
          <StarRating starSlots={model.starSlots} label={model.scoreCaption} />
        )}
        <span className='arcade-result-caption'>{model.scoreCaption}</span>
      </header>

      <dl className='arcade-result-stats'>
        {model.stats.map((stat) => (
          <div key={stat.id} className='arcade-result-stat'>
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
        <div className='arcade-result-stat'>
          <dt>{texts.personalBest}</dt>
          <dd>{model.bestValue}</dd>
        </div>
      </dl>

      <div className='arcade-result-actions'>
        {model.nextLevelId ? (
          <Button
            size={ButtonSize.LARGE}
            trailingIcon={<NextIcon />}
            onClick={() => onNextLevel(model.nextLevelId)}
            isFullWidth
          >
            {texts.bankShot.nextLevel}
          </Button>
        ) : (
          <Button
            size={ButtonSize.LARGE}
            icon={<RetryIcon />}
            onClick={onRetry}
            isFullWidth
          >
            {texts.result.retry}
          </Button>
        )}
        <div className='arcade-result-secondary'>
          {model.nextLevelId && (
            <Button
              variant={ButtonVariant.SECONDARY}
              icon={<RetryIcon />}
              onClick={onRetry}
            >
              {texts.result.retry}
            </Button>
          )}
          {hasLevels && (
            <Button
              variant={ButtonVariant.SECONDARY}
              icon={<LevelsIcon />}
              onClick={onShowLevels}
            >
              {texts.bankShot.levels}
            </Button>
          )}
          <Button
            variant={ButtonVariant.GHOST}
            icon={<BackIcon />}
            onClick={onBack}
          >
            {texts.backToArcade}
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default ArcadeResultPanel;
