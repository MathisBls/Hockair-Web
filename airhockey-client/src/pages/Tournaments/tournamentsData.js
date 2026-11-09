import { apiRequest, HttpMethod } from '../../api/apiClient';

export const TournamentStatus = Object.freeze({
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  FINISHED: 'finished',
});

export const TournamentType = Object.freeze({
  LEAGUE: 'league',
  BRACKET: 'bracket',
  POOL_AND_BRACKET: 'pool-and-bracket',
});

export const TournamentRules = Object.freeze({
  CLASSIC: 'classic',
  TIMED: 'timed',
  SUDDEN_DEATH: 'sudden death',
});

export const TournamentPrizePlace = Object.freeze({
  FIRST: 'firstPlace',
  SECOND: 'secondPlace',
  THIRD: 'thirdPlace',
});

export const TOURNAMENTS_PATH = '/api/tournaments';
export const SAMPLE_TOURNAMENT_ID_PREFIX = 'sample-tournament-';

const MILLISECONDS_PER_DAY = 86400000;

const buildTournamentPath = (tournamentId) =>
  `${TOURNAMENTS_PATH}/${encodeURIComponent(tournamentId)}`;

const buildSampleParticipantIds = (count, offset) =>
  Array.from(
    { length: count },
    (_, participantIndex) => `sample-player-${offset + participantIndex}`
  );

const SAMPLE_PARTICIPANT_USERNAMES = [
  'PuckMaestro',
  'IceWarden',
  'RinkRaptor',
  'Slapstorm',
  'MalletMind',
  'GlideKing',
  'NovaStrike',
  'ColdFusion',
  'BankShotBea',
  'RailRunner',
  'CrossCourt',
  'DeltaPuck',
  'FrostByte',
  'OneTimer',
  'SilentEdge',
  'TableTitan',
];

const SAMPLE_PARTICIPANT_BASE_ELO = 1820;
const SAMPLE_PARTICIPANT_ELO_STEP = 37;

const SAMPLE_TOURNAMENT_BLUEPRINTS = [
  {
    key: 'winter-clash',
    name: 'Winter Clash',
    description:
      'Thirty-two players, single elimination, best of three until the final.',
    type: TournamentType.BRACKET,
    rules: TournamentRules.CLASSIC,
    isPremium: false,
    maxPlayers: 32,
    participantCount: 21,
    status: TournamentStatus.UPCOMING,
    startInDays: 3,
    durationDays: 2,
    prizes: { firstPlace: '5,000 coins', secondPlace: '2,000 coins' },
  },
  {
    key: 'rookie-rumble',
    name: 'Rookie Rumble',
    description:
      'Open to players under 1,200 Elo. Pools, then a final bracket.',
    type: TournamentType.POOL_AND_BRACKET,
    rules: TournamentRules.TIMED,
    isPremium: false,
    maxPlayers: 16,
    participantCount: 16,
    status: TournamentStatus.UPCOMING,
    startInDays: 6,
    durationDays: 1,
    prizes: { firstPlace: 'Frost mallet skin' },
  },
  {
    key: 'pro-series',
    name: 'Hockair Pro Series',
    description: 'Monthly league for premium members. Every match counts.',
    type: TournamentType.LEAGUE,
    rules: TournamentRules.CLASSIC,
    isPremium: true,
    maxPlayers: 24,
    participantCount: 9,
    status: TournamentStatus.UPCOMING,
    startInDays: 12,
    durationDays: 28,
    prizes: {
      firstPlace: '20,000 coins',
      secondPlace: '8,000 coins',
      thirdPlace: '3,000 coins',
    },
  },
  {
    key: 'sudden-night',
    name: 'Sudden Death Night',
    description: 'First goal wins. Fast, brutal, and over in one evening.',
    type: TournamentType.BRACKET,
    rules: TournamentRules.SUDDEN_DEATH,
    isPremium: false,
    maxPlayers: 16,
    participantCount: 16,
    status: TournamentStatus.ONGOING,
    startInDays: 0,
    durationDays: 1,
    prizes: { firstPlace: '1,500 coins' },
  },
  {
    key: 'autumn-league',
    name: 'Autumn League',
    description: 'Round robin across eight weeks, top four to the playoffs.',
    type: TournamentType.LEAGUE,
    rules: TournamentRules.CLASSIC,
    isPremium: false,
    maxPlayers: 12,
    participantCount: 12,
    status: TournamentStatus.FINISHED,
    startInDays: -60,
    durationDays: 56,
    prizes: { firstPlace: '10,000 coins', secondPlace: '4,000 coins' },
  },
];

export const buildSampleTournaments = (now = new Date()) =>
  SAMPLE_TOURNAMENT_BLUEPRINTS.map((blueprint, blueprintIndex) => {
    const startDate = new Date(
      now.getTime() + blueprint.startInDays * MILLISECONDS_PER_DAY
    );

    return {
      _id: `${SAMPLE_TOURNAMENT_ID_PREFIX}${blueprint.key}`,
      name: blueprint.name,
      description: blueprint.description,
      image: '',
      isPremium: blueprint.isPremium,
      type: blueprint.type,
      status: blueprint.status,
      participants: buildSampleParticipantIds(
        blueprint.participantCount,
        blueprintIndex
      ),
      parameters: {
        maxPlayers: blueprint.maxPlayers,
        rules: blueprint.rules,
        startDate: startDate.toISOString(),
        endDate: new Date(
          startDate.getTime() + blueprint.durationDays * MILLISECONDS_PER_DAY
        ).toISOString(),
      },
      prizes: blueprint.prizes,
    };
  });

export const isSampleTournament = (tournamentId) =>
  tournamentId.startsWith(SAMPLE_TOURNAMENT_ID_PREFIX);

const buildSampleParticipants = (participantIds) =>
  participantIds.map((participantId, participantIndex) => ({
    _id: participantId,
    username:
      SAMPLE_PARTICIPANT_USERNAMES[
        participantIndex % SAMPLE_PARTICIPANT_USERNAMES.length
      ],
    elo:
      SAMPLE_PARTICIPANT_BASE_ELO -
      participantIndex * SAMPLE_PARTICIPANT_ELO_STEP,
  }));

const removeDuplicateTournaments = (tournaments) =>
  tournaments.filter(
    (tournament, tournamentIndex) =>
      tournaments.findIndex((candidate) => candidate._id === tournament._id) ===
      tournamentIndex
  );

export const fetchTournaments = async () => {
  const tournaments = await apiRequest(TOURNAMENTS_PATH);
  const hasPublishedTournaments =
    Array.isArray(tournaments) && tournaments.length > 0;

  return hasPublishedTournaments
    ? { tournaments: removeDuplicateTournaments(tournaments), isSample: false }
    : { tournaments: buildSampleTournaments(), isSample: true };
};

export const fetchTournamentParticipants = async (tournament) =>
  isSampleTournament(tournament._id)
    ? buildSampleParticipants(tournament.participants)
    : apiRequest(`${buildTournamentPath(tournament._id)}/participants`);

export const joinTournament = async (tournamentId) =>
  isSampleTournament(tournamentId)
    ? null
    : apiRequest(`${buildTournamentPath(tournamentId)}/join`, {
        method: HttpMethod.POST,
      });
