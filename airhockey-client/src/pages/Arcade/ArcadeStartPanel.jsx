import {
  ArrowBack as BackIcon,
  EmojiEvents as TrophyIcon,
  Mouse as MouseIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import React from 'react';

import {
  Badge,
  BadgeTone,
  Button,
  ButtonSize,
  ButtonVariant,
} from '../../components/ui';

import BankShotLevelPicker from './BankShotLevelPicker';

const ArcadeStartPanel = ({
  model,
  texts,
  levels,
  onSelectLevel,
  onStart,
  onBack,
}) => (
  <div className='arcade-overlay'>
    <section className='arcade-panel' aria-labelledby='arcade-start-title'>
      <header className='arcade-panel-header'>
        <Badge tone={BadgeTone.NEUTRAL}>{model.difficultyLabel}</Badge>
        <h2 id='arcade-start-title' className='arcade-panel-title'>
          {model.title}
        </h2>
        <p className='arcade-panel-description'>{model.description}</p>
      </header>

      <div className='arcade-panel-body'>
        <div className='arcade-rules'>
          <h3 className='arcade-section-title'>{texts.start.howToPlay}</h3>
          <ol className='arcade-rule-list'>
            {model.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </div>
        <div className='arcade-best'>
          <TrophyIcon className='arcade-best-icon' aria-hidden='true' />
          <div>
            <span className='arcade-best-label'>{texts.personalBest}</span>
            <strong className='arcade-best-value'>{model.bestValue}</strong>
          </div>
        </div>
      </div>

      {levels && (
        <BankShotLevelPicker
          levels={levels}
          title={texts.bankShot.chooseLevel}
          lockedLabel={texts.bankShot.locked}
          onSelect={onSelectLevel}
        />
      )}

      <div className='arcade-panel-footer'>
        <span className='arcade-controls-hint'>
          <MouseIcon aria-hidden='true' />
          {texts.start.controls}
        </span>
        <div className='arcade-panel-actions'>
          <Button
            variant={ButtonVariant.GHOST}
            icon={<BackIcon />}
            onClick={onBack}
          >
            {texts.backToArcade}
          </Button>
          <Button size={ButtonSize.LARGE} icon={<PlayIcon />} onClick={onStart}>
            {texts.start.play}
          </Button>
        </div>
      </div>
    </section>
  </div>
);

export default ArcadeStartPanel;
