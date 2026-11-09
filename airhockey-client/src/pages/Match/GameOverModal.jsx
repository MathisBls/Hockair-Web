import {
  Replay as RematchIcon,
  SmartToy as NewOpponentIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import React from 'react';

import BotAvatar from '../../components/BotAvatar/BotAvatar';
import { BotMood } from '../../game/bots';
import { MatchResult, Side } from '../../game/constants';
import { formatTranslation } from '../../i18n/formatTranslation';

const TITLE_KEY_BY_RESULT = {
  [MatchResult.WIN]: 'win',
  [MatchResult.LOSS]: 'loss',
  [MatchResult.RESIGNED]: 'resigned',
  [MatchResult.DRAW]: 'draw',
};

const SUBTITLE_KEY_BY_RESULT = {
  [MatchResult.WIN]: 'winSubtitle',
  [MatchResult.LOSS]: 'lossSubtitle',
  [MatchResult.RESIGNED]: 'resignedSubtitle',
  [MatchResult.DRAW]: 'lossSubtitle',
};

const GameOverModal = ({
  result,
  score,
  bot,
  botName,
  playerSkin,
  statRows,
  gameTexts,
  isFirstWin,
  onRematch,
  onNewOpponent,
}) => {
  const isWin = result === MatchResult.WIN;
  const resultTexts = gameTexts.result;

  return (
    <div className='match-modal-backdrop'>
      <div
        className={`match-modal ${isWin ? 'match-modal-win' : 'match-modal-loss'}`}
      >
        {isWin && <TrophyIcon className='match-modal-trophy' />}
        <h2>{resultTexts[TITLE_KEY_BY_RESULT[result]]}</h2>
        <p>
          {formatTranslation(resultTexts[SUBTITLE_KEY_BY_RESULT[result]], {
            bot: botName,
          })}
        </p>
        {isFirstWin && (
          <div className='match-modal-badge'>{resultTexts.firstWin}</div>
        )}

        <div className='match-modal-score'>
          <div className='match-modal-side'>
            <BotAvatar
              color={playerSkin.body}
              accent={playerSkin.accent}
              mood={isWin ? BotMood.HAPPY : BotMood.SLEEPY}
            />
            <span>{gameTexts.you}</span>
          </div>
          <strong>
            {score[Side.PLAYER]} - {score[Side.BOT]}
          </strong>
          <div className='match-modal-side'>
            <BotAvatar
              color={bot.color}
              accent={bot.accent}
              mood={bot.mood}
              isBeaten={isWin}
            />
            <span>{botName}</span>
          </div>
        </div>

        <ul className='match-modal-stats'>
          {statRows.map((row) => (
            <li key={row.statKey}>
              <span>{row.playerLabel}</span>
              <span className='match-stat-name'>{row.label}</span>
              <span>{row.botLabel}</span>
            </li>
          ))}
        </ul>

        <div className='match-modal-actions'>
          <button
            type='button'
            className='match-modal-primary'
            onClick={onRematch}
          >
            <RematchIcon />
            {gameTexts.rematch}
          </button>
          <button
            type='button'
            className='match-modal-secondary'
            onClick={onNewOpponent}
          >
            <NewOpponentIcon />
            {gameTexts.newOpponent}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
