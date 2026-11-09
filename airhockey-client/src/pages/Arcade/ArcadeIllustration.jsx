import React from 'react';

import { ArcadeGameId } from '../../arcade/arcadeGames';

const TableFrame = ({ children }) => (
  <svg
    className='arcade-art'
    viewBox='0 0 320 180'
    preserveAspectRatio='xMidYMid slice'
    aria-hidden='true'
  >
    <rect className='arcade-art-floor' x='0' y='0' width='320' height='180' />
    <g transform='rotate(-90 160 90) translate(105 -35)'>
      <rect
        className='arcade-art-rail'
        x='-8'
        y='-8'
        width='126'
        height='266'
        rx='14'
      />
      <rect
        className='arcade-art-surface'
        x='0'
        y='0'
        width='110'
        height='250'
        rx='8'
      />
      <line className='arcade-art-line' x1='0' y1='125' x2='110' y2='125' />
      <circle className='arcade-art-line' cx='55' cy='125' r='18' />
      <rect className='arcade-art-goal' x='34' y='-8' width='42' height='6' />
      <rect
        className='arcade-art-goal arcade-art-goal-own'
        x='34'
        y='252'
        width='42'
        height='6'
      />
      {children}
    </g>
  </svg>
);

const Target = ({ x, y, radius, isGolden = false }) => (
  <g>
    <circle
      className={isGolden ? 'arcade-art-target-gold' : 'arcade-art-target'}
      cx={x}
      cy={y}
      r={radius}
    />
    <circle className='arcade-art-target-ring' cx={x} cy={y} r={radius * 0.6} />
    <circle
      className={isGolden ? 'arcade-art-target-gold' : 'arcade-art-target'}
      cx={x}
      cy={y}
      r={radius * 0.28}
    />
  </g>
);

const Mallet = ({ x, y }) => (
  <g>
    <circle className='arcade-art-mallet' cx={x} cy={y} r='9' />
    <circle className='arcade-art-mallet-knob' cx={x} cy={y} r='4.5' />
  </g>
);

const Puck = ({ x, y }) => (
  <circle className='arcade-art-puck' cx={x} cy={y} r='5' />
);

const TargetRushArt = () => (
  <TableFrame>
    <path className='arcade-art-path' d='M55 185 L82 108 L60 58' />
    <Target x={30} y={60} radius={11} />
    <Target x={78} y={40} radius={9} isGolden />
    <Target x={60} y={92} radius={11} />
    <Puck x={82} y={108} />
    <Mallet x={50} y={200} />
  </TableFrame>
);

const GoalieReflexArt = () => (
  <TableFrame>
    <path className='arcade-art-path' d='M30 70 L65 238' />
    <path className='arcade-art-path' d='M80 60 L110 140 L50 240' />
    <Puck x={52} y={174} />
    <Puck x={98} y={108} />
    <circle className='arcade-art-shooter' cx='60' cy='30' r='9' />
    <Mallet x={58} y={228} />
  </TableFrame>
);

const BankShotArt = () => (
  <TableFrame>
    <rect
      className='arcade-art-block'
      x='25'
      y='80'
      width='60'
      height='8'
      rx='2'
    />
    <circle className='arcade-art-block' cx='30' cy='45' r='7' />
    <circle className='arcade-art-block' cx='82' cy='40' r='7' />
    <path className='arcade-art-path' d='M55 190 L108 120 L58 4' />
    <Puck x={55} y={190} />
    <Mallet x={50} y={214} />
  </TableFrame>
);

const ART_BY_GAME_ID = {
  [ArcadeGameId.TARGET_RUSH]: TargetRushArt,
  [ArcadeGameId.GOALIE_REFLEX]: GoalieReflexArt,
  [ArcadeGameId.BANK_SHOT]: BankShotArt,
};

const ArcadeIllustration = ({ gameId }) => {
  const Art = ART_BY_GAME_ID[gameId];

  return <Art />;
};

export default ArcadeIllustration;
