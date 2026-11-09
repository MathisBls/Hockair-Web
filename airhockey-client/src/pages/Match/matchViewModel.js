import { Side } from '../../game/constants';
import { FeedEntryType } from '../../game/engine/matchEngine';
import { formatTranslation } from '../../i18n/formatTranslation';

const SECONDS_PER_MINUTE = 60;

export const formatClock = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const buildFeedItems = (feed, gameTexts, playerName, botName) => {
  const getName = (side) => (side === Side.PLAYER ? playerName : botName);

  return [...feed].reverse().map((entry) => {
    const feedTexts = gameTexts.feed;
    let text = '';
    switch (entry.type) {
      case FeedEntryType.KICKOFF:
        text = feedTexts.kickoff;
        break;
      case FeedEntryType.SHOT:
        text = formatTranslation(feedTexts.shot, {
          player: getName(entry.side),
          speed: entry.kmh,
        });
        break;
      case FeedEntryType.SAVE:
        text = formatTranslation(feedTexts.save, {
          player: getName(entry.side),
        });
        break;
      case FeedEntryType.GOAL:
        text = formatTranslation(feedTexts.goal, {
          player: getName(entry.side),
          playerScore: entry.score[Side.PLAYER],
          botScore: entry.score[Side.BOT],
        });
        break;
      case FeedEntryType.SUDDEN_DEATH:
        text = feedTexts.suddenDeath;
        break;
      default:
        break;
    }

    return {
      id: entry.id,
      timeLabel: formatClock(entry.atSeconds),
      text,
      type: entry.type,
      side: entry.side ?? null,
    };
  });
};

export const STAT_KEYS = ['shots', 'shotsOnTarget', 'saves', 'maxShotKmh'];

export const buildStatRows = (stats, gameTexts) =>
  STAT_KEYS.map((statKey) => {
    const playerValue = stats[Side.PLAYER][statKey];
    const botValue = stats[Side.BOT][statKey];
    const total = playerValue + botValue;
    const isSpeed = statKey === 'maxShotKmh';

    return {
      statKey,
      label: isSpeed ? gameTexts.stats.maxShot : gameTexts.stats[statKey],
      playerLabel: isSpeed
        ? formatTranslation(gameTexts.kmh, { speed: playerValue })
        : String(playerValue),
      botLabel: isSpeed
        ? formatTranslation(gameTexts.kmh, { speed: botValue })
        : String(botValue),
      playerShare: total > 0 ? playerValue / total : 0.5,
    };
  });
