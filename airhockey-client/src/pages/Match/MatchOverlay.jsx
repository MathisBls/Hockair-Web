import React, { useEffect, useRef } from 'react';

import { MatchPhase, Side } from '../../game/constants';
import { formatTranslation } from '../../i18n/formatTranslation';

const POWER_SHOT_KMH = 75;
const MIN_DISPLAYED_SHOT_KMH = 30;

const ReplayProgress = ({ engine }) => {
  const fillRef = useRef(null);

  useEffect(() => {
    let animationFrameId = 0;
    const updateFill = () => {
      if (fillRef.current) {
        const progress = engine.renderState.replayProgress ?? 0;
        fillRef.current.style.transform = `scaleX(${progress})`;
      }
      animationFrameId = requestAnimationFrame(updateFill);
    };
    animationFrameId = requestAnimationFrame(updateFill);

    return () => cancelAnimationFrame(animationFrameId);
  }, [engine]);

  return (
    <div className='match-replay-progress'>
      <div ref={fillRef} />
    </div>
  );
};

const MatchOverlay = ({ snapshot, gameTexts, engine }) => {
  const {
    phase,
    countdownValue,
    lastGoal,
    lastShot,
    kickoffId,
    isSuddenDeath,
  } = snapshot;
  const isPlayerGoal = lastGoal?.scorerSide === Side.PLAYER;
  const isCountdownVisible =
    phase === MatchPhase.COUNTDOWN && countdownValue > 0;
  const isGoVisible = phase === MatchPhase.PLAYING && kickoffId > 0;
  const isShotVisible =
    phase === MatchPhase.PLAYING &&
    lastShot?.side === Side.PLAYER &&
    lastShot.kmh >= MIN_DISPLAYED_SHOT_KMH;
  const isPowerShot = isShotVisible && lastShot.kmh >= POWER_SHOT_KMH;

  return (
    <div className='match-overlay'>
      {isCountdownVisible && (
        <div key={`countdown-${countdownValue}`} className='match-countdown'>
          {countdownValue}
        </div>
      )}
      {isGoVisible && (
        <div key={`go-${kickoffId}`} className='match-go'>
          {gameTexts.go}
        </div>
      )}
      {isShotVisible && (
        <div
          key={`shot-${lastShot.id}`}
          className={`match-shot ${isPowerShot ? 'match-shot-power' : ''}`}
        >
          {isPowerShot && <strong>{gameTexts.powerShot}</strong>}
          <span>
            {formatTranslation(gameTexts.kmh, { speed: lastShot.kmh })}
          </span>
        </div>
      )}
      {phase === MatchPhase.GOAL && lastGoal && (
        <div
          className={`match-goal ${isPlayerGoal ? 'match-goal-player' : 'match-goal-bot'}`}
        >
          <span className='match-goal-title'>
            {isPlayerGoal ? gameTexts.goal : gameTexts.conceded}
          </span>
          <span className='match-goal-speed'>
            {formatTranslation(gameTexts.kmh, { speed: lastGoal.kmh })}
          </span>
        </div>
      )}
      {phase === MatchPhase.REPLAY && (
        <div className='match-replay'>
          <div className='match-replay-scanlines' />
          <div className='match-replay-badge'>
            <span className='match-replay-dot' />
            {gameTexts.replay}
          </div>
          <div className='match-replay-hint'>{gameTexts.skipReplay}</div>
          <ReplayProgress engine={engine} />
        </div>
      )}
      {isSuddenDeath && phase !== MatchPhase.FINISHED && (
        <div className='match-sudden-death'>
          <strong>{gameTexts.suddenDeath}</strong>
          <span>{gameTexts.suddenDeathHint}</span>
        </div>
      )}
    </div>
  );
};

export default MatchOverlay;
