import React, { useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const RALLY_DURATION = '3.6s';
const RALLY_KEY_TIMES = '0;0.25;0.5;0.75;1';

const PUCK_X_VALUES = '70;170;70;170;70';
const PUCK_Y_VALUES = '62;50;84;92;62';
const PLAYER_MALLET_Y_VALUES = '62;73;84;73;62';
const OPPONENT_MALLET_Y_VALUES = '71;50;71;92;71';

const PLAYER_MALLET_X = 56;
const OPPONENT_MALLET_X = 184;
const RESTING_PUCK = Object.freeze({ x: 120, y: 70 });
const RESTING_MALLET_Y = 70;

const isMotionReducedByUser = () =>
  typeof window !== 'undefined' &&
  Boolean(window.matchMedia?.(REDUCED_MOTION_QUERY).matches);

const RallyAnimation = ({ attributeName, values }) => (
  <animate
    attributeName={attributeName}
    values={values}
    keyTimes={RALLY_KEY_TIMES}
    dur={RALLY_DURATION}
    repeatCount='indefinite'
  />
);

const TableIllustration = ({ label }) => {
  const [isAnimated] = useState(() => !isMotionReducedByUser());

  return (
    <svg
      className='auth-table'
      viewBox='0 0 240 140'
      role='img'
      aria-label={label}
    >
      <rect
        className='auth-table-frame'
        x='12'
        y='8'
        width='216'
        height='124'
        rx='18'
      />
      <rect
        className='auth-table-surface'
        x='20'
        y='14'
        width='200'
        height='112'
        rx='12'
      />
      <line className='auth-table-line' x1='120' y1='14' x2='120' y2='126' />
      <circle className='auth-table-line' cx='120' cy='70' r='18' />
      <path className='auth-table-line' d='M20 46 A24 24 0 0 1 20 94' />
      <path className='auth-table-line' d='M220 46 A24 24 0 0 0 220 94' />
      <rect
        className='auth-table-goal auth-table-goal-player'
        x='17'
        y='54'
        width='4'
        height='32'
        rx='2'
      />
      <rect
        className='auth-table-goal auth-table-goal-opponent'
        x='219'
        y='54'
        width='4'
        height='32'
        rx='2'
      />
      <circle
        className='auth-table-mallet auth-table-mallet-player'
        cx={PLAYER_MALLET_X}
        cy={RESTING_MALLET_Y}
        r='9'
      >
        {isAnimated && (
          <RallyAnimation attributeName='cy' values={PLAYER_MALLET_Y_VALUES} />
        )}
      </circle>
      <circle
        className='auth-table-mallet auth-table-mallet-opponent'
        cx={OPPONENT_MALLET_X}
        cy={RESTING_MALLET_Y}
        r='9'
      >
        {isAnimated && (
          <RallyAnimation
            attributeName='cy'
            values={OPPONENT_MALLET_Y_VALUES}
          />
        )}
      </circle>
      <circle
        className='auth-table-puck'
        cx={RESTING_PUCK.x}
        cy={RESTING_PUCK.y}
        r='5'
      >
        {isAnimated && (
          <>
            <RallyAnimation attributeName='cx' values={PUCK_X_VALUES} />
            <RallyAnimation attributeName='cy' values={PUCK_Y_VALUES} />
          </>
        )}
      </circle>
    </svg>
  );
};

export default TableIllustration;
