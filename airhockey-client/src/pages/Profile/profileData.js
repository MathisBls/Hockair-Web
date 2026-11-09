import { BOTS } from '../../game/bots';
import {
  buildRecentMatchesDto,
  buildResultsByBotDto,
  MatchResult,
} from '../Stats/statsData';

export const AchievementId = Object.freeze({
  FIRST_WIN: 'firstWin',
  TEN_WINS: 'tenWins',
  FIFTY_WINS: 'fiftyWins',
  ELO_THOUSAND: 'eloThousand',
  ELO_FIFTEEN_HUNDRED: 'eloFifteenHundred',
  LEVEL_TEN: 'levelTen',
  BEAT_MASTER: 'beatMaster',
  BEAT_ALL_BOTS: 'beatAllBots',
});

export const ActivityKind = Object.freeze({
  MATCH_WIN: 'matchWin',
  MATCH_LOSS: 'matchLoss',
  LEVEL_UP: 'levelUp',
  TOURNAMENT_JOIN: 'tournamentJoin',
});

export const SubscriptionStatus = Object.freeze({
  FREE: 'free',
  PREMIUM: 'premium',
  PRO: 'pro',
});

const MASTER_BOT_ID = 'inferno';
const MILLISECONDS_PER_HOUR = 3600000;
const RECENT_MATCH_ACTIVITY_COUNT = 4;
const LEVEL_UP_HOURS_AGO = 50;
const TOURNAMENT_JOIN_HOURS_AGO = 74;
const SAMPLE_TOURNAMENT_NAME = 'Winter Clash';

const countRosterBotsBeaten = (beatenBotIds) =>
  BOTS.filter((bot) => beatenBotIds.includes(bot.id)).length;

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: AchievementId.FIRST_WIN,
    target: 1,
    measureProgress: ({ profile }) => profile.victories ?? 0,
  },
  {
    id: AchievementId.TEN_WINS,
    target: 10,
    measureProgress: ({ profile }) => profile.victories ?? 0,
  },
  {
    id: AchievementId.FIFTY_WINS,
    target: 50,
    measureProgress: ({ profile }) => profile.victories ?? 0,
  },
  {
    id: AchievementId.ELO_THOUSAND,
    target: 1000,
    measureProgress: ({ profile }) => profile.elo ?? 0,
  },
  {
    id: AchievementId.ELO_FIFTEEN_HUNDRED,
    target: 1500,
    measureProgress: ({ profile }) => profile.elo ?? 0,
  },
  {
    id: AchievementId.LEVEL_TEN,
    target: 10,
    measureProgress: ({ profile }) => profile.level ?? 1,
  },
  {
    id: AchievementId.BEAT_MASTER,
    target: 1,
    measureProgress: ({ beatenBotIds }) =>
      beatenBotIds.includes(MASTER_BOT_ID) ? 1 : 0,
  },
  {
    id: AchievementId.BEAT_ALL_BOTS,
    target: BOTS.length,
    measureProgress: ({ beatenBotIds }) => countRosterBotsBeaten(beatenBotIds),
  },
];

export const buildRecentActivityDto = ({
  level,
  gamesPlayed,
  beatenBotIds,
  now = new Date(),
}) => {
  if (gamesPlayed === 0) {
    return [];
  }
  const matchActivities = buildRecentMatchesDto({
    resultsByBot: buildResultsByBotDto(beatenBotIds),
    now,
  })
    .slice(0, RECENT_MATCH_ACTIVITY_COUNT)
    .map((match) => ({
      activityId: `activity-${match.matchId}`,
      kind:
        match.result === MatchResult.WIN
          ? ActivityKind.MATCH_WIN
          : ActivityKind.MATCH_LOSS,
      occurredAt: match.playedAt,
      opponent: match.opponent,
    }));

  return [
    ...matchActivities,
    {
      activityId: 'activity-level-up',
      kind: ActivityKind.LEVEL_UP,
      occurredAt: new Date(
        now.getTime() - LEVEL_UP_HOURS_AGO * MILLISECONDS_PER_HOUR
      ).toISOString(),
      level,
    },
    {
      activityId: 'activity-tournament-join',
      kind: ActivityKind.TOURNAMENT_JOIN,
      occurredAt: new Date(
        now.getTime() - TOURNAMENT_JOIN_HOURS_AGO * MILLISECONDS_PER_HOUR
      ).toISOString(),
      tournamentName: SAMPLE_TOURNAMENT_NAME,
    },
  ].sort(
    (firstActivity, secondActivity) =>
      new Date(secondActivity.occurredAt).getTime() -
      new Date(firstActivity.occurredAt).getTime()
  );
};
