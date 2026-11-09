import {
  Favorite as LifeIcon,
  FavoriteBorder as LostLifeIcon,
} from '@mui/icons-material';
import React from 'react';

import StarRating from './StarRating';

const ArcadeHud = ({ model }) => (
  <div className='arcade-hud' aria-live='polite'>
    <div className='arcade-hud-bar'>
      {model.stats.map((stat) => (
        <div
          key={stat.id}
          className={`arcade-hud-stat ${stat.isPrimary ? 'arcade-hud-stat-primary' : ''} ${stat.isWarning ? 'arcade-hud-stat-warning' : ''}`}
        >
          <span className='arcade-hud-label'>{stat.label}</span>
          <strong className='arcade-hud-value'>{stat.value}</strong>
          {stat.detail && (
            <span className='arcade-hud-detail'>{stat.detail}</span>
          )}
        </div>
      ))}
      {model.lives.length > 0 && (
        <div className='arcade-hud-stat' aria-label={model.livesLabel}>
          <span className='arcade-hud-label'>{model.livesLabel}</span>
          <span className='arcade-hud-lives'>
            {model.lives.map((life) =>
              life.isLost ? (
                <LostLifeIcon key={life.id} className='arcade-life-lost' />
              ) : (
                <LifeIcon key={life.id} className='arcade-life' />
              )
            )}
          </span>
        </div>
      )}
      {model.potentialStars && (
        <div className='arcade-hud-stat'>
          <span className='arcade-hud-label'>{model.potentialStarsLabel}</span>
          <StarRating
            starSlots={model.potentialStars}
            label={model.potentialStarsLabel}
          />
        </div>
      )}
    </div>
    {model.toast && (
      <div
        key={model.toast.id}
        className={`arcade-toast arcade-toast-${model.toast.tone}`}
      >
        {model.toast.text}
      </div>
    )}
  </div>
);

export default ArcadeHud;
