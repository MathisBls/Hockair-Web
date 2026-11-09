import React from 'react';

import { BotMood } from '../../game/bots';
import './BotAvatar.css';

const BROW_TILT_BY_MOOD = {
  [BotMood.HAPPY]: -8,
  [BotMood.FOCUSED]: 6,
  [BotMood.ANGRY]: 22,
  [BotMood.SLEEPY]: 0,
  [BotMood.COOL]: 12,
};

const MOUTH_PATH_BY_MOOD = {
  [BotMood.HAPPY]: 'M38 66 Q50 78 62 66',
  [BotMood.FOCUSED]: 'M41 69 L59 69',
  [BotMood.ANGRY]: 'M38 72 Q50 62 62 72',
  [BotMood.SLEEPY]: 'M44 69 Q50 73 56 69',
  [BotMood.COOL]: 'M40 68 Q52 74 62 64',
};

const Eye = ({ centerX, isSleepy }) =>
  isSleepy ? (
    <path
      d={`M${centerX - 7} 50 Q${centerX} 55 ${centerX + 7} 50`}
      className='bot-avatar-ink-line'
    />
  ) : (
    <g>
      <ellipse cx={centerX} cy={49} rx={8} ry={10} className='bot-avatar-eye' />
      <circle cx={centerX + 2} cy={51} r={4.2} className='bot-avatar-pupil' />
      <circle
        cx={centerX + 3.5}
        cy={48.5}
        r={1.4}
        className='bot-avatar-shine'
      />
    </g>
  );

const BotAvatar = ({
  color,
  accent,
  mood,
  size = 'medium',
  isBeaten = false,
}) => {
  const browTilt = BROW_TILT_BY_MOOD[mood] ?? 0;
  const isSleepy = mood === BotMood.SLEEPY;

  return (
    <div className={`bot-avatar bot-avatar-${size}`}>
      <svg viewBox='0 0 100 100' role='img' aria-hidden='true'>
        <circle
          cx={50}
          cy={50}
          r={46}
          fill={accent}
          className='bot-avatar-outline'
        />
        <circle
          cx={50}
          cy={50}
          r={38}
          fill={color}
          className='bot-avatar-outline'
        />
        <circle cx={38} cy={34} r={6} className='bot-avatar-highlight' />
        <Eye centerX={38} isSleepy={isSleepy} />
        <Eye centerX={62} isSleepy={isSleepy} />
        <rect
          x={29}
          y={33}
          width={18}
          height={4.5}
          rx={2}
          className='bot-avatar-brow'
          transform={`rotate(${browTilt} 38 35)`}
        />
        <rect
          x={53}
          y={33}
          width={18}
          height={4.5}
          rx={2}
          className='bot-avatar-brow'
          transform={`rotate(${-browTilt} 62 35)`}
        />
        <path d={MOUTH_PATH_BY_MOOD[mood]} className='bot-avatar-ink-line' />
      </svg>
      {isBeaten && (
        <span className='bot-avatar-beaten' aria-hidden='true'>
          ✓
        </span>
      )}
    </div>
  );
};

export default BotAvatar;
