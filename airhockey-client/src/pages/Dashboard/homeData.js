import { BotTier } from '../../game/bots';
import {
  DEFAULT_GOAL_TARGET,
  DEFAULT_TIME_LIMIT_SECONDS,
} from '../../game/constants';
import { buildMatchSearchParams } from '../../game/matchSettings';

export const HomeRoute = Object.freeze({
  PLAY: '/play',
  QUICK_MATCH: '/play/bot',
  ARCADE: '/arcade',
  CHALLENGES: '/challenges',
  TOURNAMENTS: '/tournaments',
  LEADERBOARD: '/leaderboard',
  REGISTER: '/register',
  LOGIN: '/login',
  PROFILE: '/profile',
  STATS: '/stats',
});

export const HomeApiPath = Object.freeze({
  USER_PROFILE: '/api/users/profile',
  TOURNAMENTS: '/api/tournaments',
});

export const RequestStatus = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
});

const QUICK_MATCH_MALLET_SKIN_ID = 'cyan';
const QUICK_MATCH_TABLE_THEME_ID = 'neon';

export const buildQuickMatchPath = (botId) =>
  `${HomeRoute.QUICK_MATCH}?${buildMatchSearchParams({
    botId,
    goalTarget: DEFAULT_GOAL_TARGET,
    timeLimitSeconds: DEFAULT_TIME_LIMIT_SECONDS,
    malletSkinId: QUICK_MATCH_MALLET_SKIN_ID,
    tableThemeId: QUICK_MATCH_TABLE_THEME_ID,
  })}`;

export const QUICK_PLAY_BOT_ID_BY_TIER = Object.freeze({
  [BotTier.BEGINNER]: 'bouncy',
  [BotTier.INTERMEDIATE]: 'blitz',
  [BotTier.ADVANCED]: 'viper',
  [BotTier.MASTER]: 'inferno',
});

export const ArcadeGameId = Object.freeze({
  TARGET_RUSH: 'target-rush',
  GOALIE_REFLEX: 'goalie-reflex',
  BANK_SHOT: 'bank-shot',
});

export const ARCADE_GAME_IDS = Object.values(ArcadeGameId);

export const TOURNAMENT_PREVIEW_LIMIT = 3;

export const TournamentStatus = Object.freeze({
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  FINISHED: 'finished',
});

export const LEADERBOARD_PREVIEW_LIMIT = 5;

export const CountryCode = Object.freeze({
  FRANCE: 'FR',
  CANADA: 'CA',
  JAPAN: 'JP',
  BRAZIL: 'BR',
  GERMANY: 'DE',
  UNITED_STATES: 'US',
  SPAIN: 'ES',
});

export const LEADERBOARD_TOP_PLAYERS = [
  {
    rank: 1,
    userId: 'leaderboard-user-1',
    username: 'IcePhantom',
    country: CountryCode.CANADA,
    elo: 2418,
    eloDelta: 12,
    victories: 412,
    defeats: 96,
  },
  {
    rank: 2,
    userId: 'leaderboard-user-2',
    username: 'RailMaster',
    country: CountryCode.FRANCE,
    elo: 2377,
    eloDelta: -4,
    victories: 388,
    defeats: 121,
  },
  {
    rank: 3,
    userId: 'leaderboard-user-3',
    username: 'KuroganeP',
    country: CountryCode.JAPAN,
    elo: 2341,
    eloDelta: 21,
    victories: 296,
    defeats: 77,
  },
  {
    rank: 4,
    userId: 'leaderboard-user-4',
    username: 'Bankshot_BR',
    country: CountryCode.BRAZIL,
    elo: 2290,
    eloDelta: 0,
    victories: 351,
    defeats: 140,
  },
  {
    rank: 5,
    userId: 'leaderboard-user-5',
    username: 'PuckNoir',
    country: CountryCode.GERMANY,
    elo: 2264,
    eloDelta: 8,
    victories: 274,
    defeats: 102,
  },
  {
    rank: 6,
    userId: 'leaderboard-user-6',
    username: 'SlapStar',
    country: CountryCode.UNITED_STATES,
    elo: 2239,
    eloDelta: -9,
    victories: 260,
    defeats: 118,
  },
];

export const DailyChallengeId = Object.freeze({
  CLEAN_SHEET: 'cleanSheet',
  SPEED_DEMON: 'speedDemon',
  WIN_STREAK: 'winStreak',
  BANK_SHOTS: 'bankShots',
  COMEBACK: 'comeback',
});

export const DAILY_CHALLENGES = [
  {
    id: DailyChallengeId.CLEAN_SHEET,
    target: 1,
    rewardCoins: 150,
    rewardXp: 80,
  },
  {
    id: DailyChallengeId.SPEED_DEMON,
    target: 3,
    rewardCoins: 100,
    rewardXp: 60,
  },
  {
    id: DailyChallengeId.WIN_STREAK,
    target: 3,
    rewardCoins: 200,
    rewardXp: 120,
  },
  {
    id: DailyChallengeId.BANK_SHOTS,
    target: 5,
    rewardCoins: 120,
    rewardXp: 70,
  },
  {
    id: DailyChallengeId.COMEBACK,
    target: 1,
    rewardCoins: 180,
    rewardXp: 100,
  },
];

export const NewsCategory = Object.freeze({
  UPDATE: 'update',
  EVENT: 'event',
  COMMUNITY: 'community',
});

export const NEWS_ITEMS = [
  {
    id: 'botLadder',
    category: NewsCategory.UPDATE,
    version: '2.4',
    publishedAt: '2026-11-05',
  },
  {
    id: 'arcadeLaunch',
    category: NewsCategory.UPDATE,
    version: '2.3',
    publishedAt: '2026-10-28',
  },
  {
    id: 'winterCup',
    category: NewsCategory.EVENT,
    version: null,
    publishedAt: '2026-10-21',
  },
  {
    id: 'clubsSpotlight',
    category: NewsCategory.COMMUNITY,
    version: null,
    publishedAt: '2026-10-14',
  },
];

export const BeginnerTipId = Object.freeze({
  STAY_HOME: 'stayHome',
  USE_RAILS: 'useRails',
  READ_ANGLES: 'readAngles',
  CONTROL_SPEED: 'controlSpeed',
});

export const BEGINNER_TIP_IDS = Object.values(BeginnerTipId);

export const BotAvatarSize = Object.freeze({
  SMALL: 'small',
  MEDIUM: 'medium',
});
