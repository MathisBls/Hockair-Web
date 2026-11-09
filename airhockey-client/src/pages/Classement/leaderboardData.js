import { createSeededRandom, pickRandomInteger } from '../Stats/seededRandom';

export const LeaderboardScope = Object.freeze({
  GLOBAL: 'global',
  FRIENDS: 'friends',
  COUNTRY: 'country',
});

export const LeaderboardPeriod = Object.freeze({
  ALL_TIME: 'allTime',
  MONTH: 'month',
  WEEK: 'week',
});

export const LEADERBOARD_PAGE_SIZE = 20;
export const PODIUM_SIZE = 3;
export const CURRENT_PLAYER_ID = 'me';

const LEADERBOARD_SEED = 20241109;
const SIMULATED_LATENCY_MS = 350;
const TOP_ELO = 2480;
const MIN_ELO_GAP = 10;
const MAX_ELO_GAP = 55;
const FRIEND_RATIO = 0.18;
const MIN_WIN_SHARE = 0.42;
const WIN_SHARE_SPREAD = 0.3;

const GAMES_RANGE_BY_PERIOD = {
  [LeaderboardPeriod.ALL_TIME]: { minimum: 120, maximum: 1400 },
  [LeaderboardPeriod.MONTH]: { minimum: 0, maximum: 140 },
  [LeaderboardPeriod.WEEK]: { minimum: 0, maximum: 40 },
};

const ELO_CHANGE_RANGE_BY_PERIOD = {
  [LeaderboardPeriod.ALL_TIME]: { minimum: -60, maximum: 90 },
  [LeaderboardPeriod.MONTH]: { minimum: -45, maximum: 60 },
  [LeaderboardPeriod.WEEK]: { minimum: -25, maximum: 30 },
};

const PERIOD_SEED_OFFSET = {
  [LeaderboardPeriod.ALL_TIME]: 0,
  [LeaderboardPeriod.MONTH]: 1000,
  [LeaderboardPeriod.WEEK]: 2000,
};

const COUNTRY_CODES = ['FR', 'DE', 'US', 'JP', 'BR', 'CA', 'ES', 'KR', 'GB'];

const PLAYER_USERNAMES = [
  'PuckMaestro',
  'IceWarden',
  'RinkRaptor',
  'Slapstorm',
  'MalletMind',
  'GlideKing',
  'NovaStrike',
  'ColdFusion',
  'BankShotBea',
  'Zamboni42',
  'RailRunner',
  'CrossCourt',
  'DeltaPuck',
  'FrostByte',
  'OneTimer',
  'SilentEdge',
  'TableTitan',
  'QuickWrist',
  'HexHockey',
  'ArcLight',
  'BlueLine',
  'KaitoAir',
  'LunaSlide',
  'MarcoRebound',
  'NinaDeflect',
  'OscarCarom',
  'PolarDrift',
  'RivetRush',
  'SashaSpin',
  'TempoTaro',
  'UltraGlide',
  'VectorVee',
  'WillowWall',
  'XenoPuck',
  'YukiFlick',
  'ZaraZoom',
  'AirAce',
  'BreezeBlock',
  'CaromCarl',
  'DashDiane',
  'EchoEmil',
  'FluxFelix',
  'GoalieGrace',
  'HaloHugo',
  'IonIris',
  'JoltJonas',
  'KiteKenji',
  'LeapLeila',
  'MistMilo',
  'NeonNoor',
  'OrbitOtto',
  'PulsePia',
  'QuasarQuinn',
  'RiftRosa',
  'SparkSven',
  'TideTheo',
  'UmbraUma',
  'VortexVik',
  'WaveWren',
  'ZenithZoe',
];

const buildPeriodStats = (playerIndex, period) => {
  const random = createSeededRandom(
    LEADERBOARD_SEED + PERIOD_SEED_OFFSET[period] + playerIndex
  );
  const gamesRange = GAMES_RANGE_BY_PERIOD[period];
  const eloChangeRange = ELO_CHANGE_RANGE_BY_PERIOD[period];
  const gamesPlayed = pickRandomInteger(
    random,
    gamesRange.minimum,
    gamesRange.maximum
  );
  const winShare = MIN_WIN_SHARE + random() * WIN_SHARE_SPREAD;
  const victories = Math.round(gamesPlayed * winShare);

  return {
    victories,
    defeats: gamesPlayed - victories,
    eloChange:
      gamesPlayed > 0
        ? pickRandomInteger(
            random,
            eloChangeRange.minimum,
            eloChangeRange.maximum
          )
        : 0,
  };
};

const buildLeaderboardPlayers = () => {
  const random = createSeededRandom(LEADERBOARD_SEED);

  return PLAYER_USERNAMES.reduce((players, username, playerIndex) => {
    const previousElo = players.at(-1)?.elo ?? TOP_ELO;
    const elo =
      playerIndex === 0
        ? TOP_ELO
        : previousElo - pickRandomInteger(random, MIN_ELO_GAP, MAX_ELO_GAP);

    return [
      ...players,
      {
        userId: `player-${playerIndex + 1}`,
        username,
        profilePicture: '',
        countryCode: COUNTRY_CODES[playerIndex % COUNTRY_CODES.length],
        elo,
        isFriend: random() < FRIEND_RATIO,
        statsByPeriod: Object.values(LeaderboardPeriod).reduce(
          (statsByPeriod, period) => ({
            ...statsByPeriod,
            [period]: buildPeriodStats(playerIndex, period),
          }),
          {}
        ),
      },
    ];
  }, []);
};

const LEADERBOARD_PLAYERS = buildLeaderboardPlayers();

const toLeaderboardEntryDto = (player, period) => ({
  userId: player.userId,
  username: player.username,
  profilePicture: player.profilePicture,
  countryCode: player.countryCode,
  elo: player.elo,
  isFriend: player.isFriend,
  ...player.statsByPeriod[period],
});

const buildCurrentPlayerEntryDto = (currentPlayer) => ({
  userId: CURRENT_PLAYER_ID,
  username: currentPlayer.username,
  profilePicture: currentPlayer.profilePicture ?? '',
  countryCode: null,
  elo: currentPlayer.elo ?? 0,
  isFriend: true,
  victories: currentPlayer.victories ?? 0,
  defeats: currentPlayer.defeats ?? 0,
  eloChange: 0,
});

const isEntryInScope = (entry, scope) =>
  scope === LeaderboardScope.FRIENDS ? entry.isFriend : true;

const hasPlayedInPeriod = (entry, period) =>
  period === LeaderboardPeriod.ALL_TIME ||
  entry.userId === CURRENT_PLAYER_ID ||
  entry.victories + entry.defeats > 0;

const waitForSimulatedLatency = () =>
  new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

export const fetchLeaderboard = async ({
  scope,
  period,
  offset,
  limit,
  currentPlayer = null,
}) => {
  await waitForSimulatedLatency();
  const playerEntries = LEADERBOARD_PLAYERS.map((player) =>
    toLeaderboardEntryDto(player, period)
  );
  const allEntries = currentPlayer
    ? [...playerEntries, buildCurrentPlayerEntryDto(currentPlayer)]
    : playerEntries;
  const rankedEntries = allEntries
    .filter((entry) => isEntryInScope(entry, scope))
    .filter((entry) => hasPlayedInPeriod(entry, period))
    .sort((firstEntry, secondEntry) => secondEntry.elo - firstEntry.elo)
    .map((entry, entryIndex) => ({ ...entry, rank: entryIndex + 1 }));

  return {
    entries: rankedEntries.slice(offset, offset + limit),
    totalCount: rankedEntries.length,
    currentPlayerEntry:
      rankedEntries.find((entry) => entry.userId === CURRENT_PLAYER_ID) ?? null,
  };
};
