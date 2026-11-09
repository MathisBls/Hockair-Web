import React from 'react';

import BotAvatar from '../../components/BotAvatar/BotAvatar';

const PlayerBar = ({
  name,
  subtitle,
  color,
  accent,
  mood,
  score,
  goalTarget,
  isMirrored = false,
}) => {
  const goalPips = Array.from({ length: goalTarget }, (_, index) => ({
    index,
    isFilled: index < score,
  }));

  return (
    <div
      className={`match-player-bar ${isMirrored ? 'match-player-bar-mirrored' : ''}`}
      style={{ '--player-color': color }}
    >
      <BotAvatar color={color} accent={accent} mood={mood} size='small' />
      <div className='match-player-identity'>
        <strong>{name}</strong>
        <span>{subtitle}</span>
      </div>
      <div className='match-goal-pips'>
        {goalPips.map(({ index, isFilled }) => (
          <span
            key={index}
            className={`match-goal-pip ${isFilled ? 'match-goal-pip-filled' : ''}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PlayerBar;
