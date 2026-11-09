import { BOTS } from '../../game/bots';

import {
  createSeededRandom,
  pickCenteredRandom,
  pickRandomInteger,
} from './seededRandom';

export const MatchResult = Object.freeze({
  WIN: 'win',
  LOSS: 'lose',
  DRAW: 'draw',
});

export const OpponentKind = Object.freeze({
  BOT: 'bot',
  PLAYER: 'player',
});

export const EloChartRange = Object.freeze({
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
});

export const DAYS_BY_ELO_CHART_RANGE = Object.freeze({
  [EloChartRange.MONTH]: 30,
  [EloChartRange.QUARTER]: 90,
  [EloChartRange.YEAR]: 365,
});

export const ELO_TREND_WINDOW_DAYS = 30;

export const SAMPLE_PLAYER_RECORD = Object.freeze({
  elo: 1240,
  victories: 86,
  defeats: 61,
});

const MILLISECONDS_PER_DAY = 86400000;
const MILLISECONDS_PER_MINUTE = 60000;
const STATS_SEED = 7331;
const ELO_HISTORY_DAYS = DAYS_BY_ELO_CHART_RANGE[EloChartRange.YEAR];
const ELO_DAILY_DRIFT = 1.2;
const ELO_DAILY_VOLATILITY = 14;
const ELO_REST_DAY_RATIO = 0.35;
const MINIMUM_ELO = 100;
const RECENT_MATCH_COUNT = 8;
const GOALS_TO_WIN = 7;
const MATCH_DURATION_RANGE_SECONDS = { minimum: 150, maximum: 420 };
const MATCH_ELO_CHANGE_RANGE = { minimum: 6, maximum: 18 };
const MATCH_SPACING_RANGE_MINUTES = { minimum: 40, maximum: 1800 };
const BOT_GAMES_RANGE = { minimum: 3, maximum: 24 };
const ONLINE_OPPONENT_RATIO = 0.4;

const SAMPLE_WIN_PROBABILITY =
  SAMPLE_PLAYER_RECORD.victories /
  (SAMPLE_PLAYER_RECORD.victories + SAMPLE_PLAYER_RECORD.defeats);

const SAMPLE_ONLINE_OPPONENTS = [
  { username: 'IceWarden', elo: 1268 },
  { username: 'QuickWrist', elo: 1215 },
  { username: 'LunaSlide', elo: 1302 },
  { username: 'TempoTaro', elo: 1190 },
];

export const PERSONAL_RECORDS_DTO = Object.freeze({
  bestWinStreak: 7,
  fastestShotKmh: 63.4,
  fastestShotDaysAgo: 12,
});

const startOfDay = (date) => {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);

  return dayStart;
};

export const buildEloHistoryDto = (currentElo, now = new Date()) => {
  const random = createSeededRandom(STATS_SEED);
  const today = startOfDay(now).getTime();

  return Array.from({ length: ELO_HISTORY_DAYS }).reduce(
    (history, _, dayOffset) => {
      const nextDayElo = history[0]?.elo ?? currentElo;
      const isRestDay = random() < ELO_REST_DAY_RATIO;
      const dailyChange = isRestDay
        ? 0
        : ELO_DAILY_DRIFT + pickCenteredRandom(random) * ELO_DAILY_VOLATILITY;
      const elo =
        dayOffset === 0
          ? currentElo
          : Math.max(MINIMUM_ELO, Math.round(nextDayElo - dailyChange));

      return [
        {
          date: new Date(
            today - dayOffset * MILLISECONDS_PER_DAY
          ).toISOString(),
          elo,
        },
        ...history,
      ];
    },
    []
  );
};

const buildBotOpponent = (random, playedBots) => {
  const bot = playedBots[pickRandomInteger(random, 0, playedBots.length - 1)];

  return { kind: OpponentKind.BOT, botId: bot.id, elo: bot.rating };
};

const buildPlayerOpponent = (random) => {
  const opponent =
    SAMPLE_ONLINE_OPPONENTS[
      pickRandomInteger(random, 0, SAMPLE_ONLINE_OPPONENTS.length - 1)
    ];

  return { kind: OpponentKind.PLAYER, ...opponent };
};

const isWinPossible = (opponent, resultsByBot) =>
  opponent.kind === OpponentKind.PLAYER ||
  resultsByBot.some(
    (botResult) => botResult.botId === opponent.botId && botResult.victories > 0
  );

export const buildRecentMatchesDto = ({ resultsByBot, now = new Date() }) => {
  const random = createSeededRandom(STATS_SEED + 1);
  const playedBots = BOTS.filter((bot) =>
    resultsByBot.some(
      (botResult) =>
        botResult.botId === bot.id &&
        botResult.victories + botResult.defeats > 0
    )
  );

  return Array.from({ length: RECENT_MATCH_COUNT }).reduce(
    (matches, _, matchIndex) => {
      const previousPlayedAt =
        matches.at(-1)?.playedAt ?? new Date(now).toISOString();
      const playedAt = new Date(
        new Date(previousPlayedAt).getTime() -
          pickRandomInteger(
            random,
            MATCH_SPACING_RANGE_MINUTES.minimum,
            MATCH_SPACING_RANGE_MINUTES.maximum
          ) *
            MILLISECONDS_PER_MINUTE
      ).toISOString();
      const opponent =
        playedBots.length === 0 || random() < ONLINE_OPPONENT_RATIO
          ? buildPlayerOpponent(random)
          : buildBotOpponent(random, playedBots);
      const isWin =
        random() < SAMPLE_WIN_PROBABILITY &&
        isWinPossible(opponent, resultsByBot);
      const losingScore = pickRandomInteger(random, 0, GOALS_TO_WIN - 1);
      const eloChange = pickRandomInteger(
        random,
        MATCH_ELO_CHANGE_RANGE.minimum,
        MATCH_ELO_CHANGE_RANGE.maximum
      );

      return [
        ...matches,
        {
          matchId: `sample-match-${matchIndex + 1}`,
          opponent,
          result: isWin ? MatchResult.WIN : MatchResult.LOSS,
          playerScore: isWin ? GOALS_TO_WIN : losingScore,
          opponentScore: isWin ? losingScore : GOALS_TO_WIN,
          eloChange: isWin ? eloChange : -eloChange,
          durationSeconds: pickRandomInteger(
            random,
            MATCH_DURATION_RANGE_SECONDS.minimum,
            MATCH_DURATION_RANGE_SECONDS.maximum
          ),
          playedAt,
        },
      ];
    },
    []
  );
};

export const buildResultsByBotDto = (beatenBotIds) => {
  const random = createSeededRandom(STATS_SEED + 2);

  return BOTS.map((bot, botIndex) => {
    const isBeaten = beatenBotIds.includes(bot.id);
    const isPlayed = isBeaten || botIndex <= beatenBotIds.length;
    const gamesPlayed = isPlayed
      ? pickRandomInteger(
          random,
          BOT_GAMES_RANGE.minimum,
          BOT_GAMES_RANGE.maximum
        )
      : 0;
    const victories = isBeaten
      ? Math.max(1, Math.round(gamesPlayed * (1 - botIndex / BOTS.length)))
      : 0;

    return {
      botId: bot.id,
      victories,
      defeats: gamesPlayed - victories,
    };
  });
};

export const buildNewPlayerResultsByBotDto = (beatenBotIds) =>
  BOTS.map((bot) => ({
    botId: bot.id,
    victories: beatenBotIds.includes(bot.id) ? 1 : 0,
    defeats: 0,
  }));

export const getFastestShotDate = (now = new Date()) =>
  new Date(
    now.getTime() -
      PERSONAL_RECORDS_DTO.fastestShotDaysAgo * MILLISECONDS_PER_DAY
  );
