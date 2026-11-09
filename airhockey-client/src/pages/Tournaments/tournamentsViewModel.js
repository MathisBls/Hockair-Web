import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';
import { formatDate, formatInteger } from '../Profile/playerFormatting';

import { TournamentPrizePlace, TournamentStatus } from './tournamentsData';

export const JoinState = Object.freeze({
  AVAILABLE: 'available',
  JOINING: 'joining',
  JOINED: 'joined',
  FULL: 'full',
  CLOSED: 'closed',
});

const PARTICIPANT_ID_SUFFIX_LENGTH = 4;

const getJoinState = ({ tournament, isJoined, isJoining }) => {
  if (isJoined) {
    return JoinState.JOINED;
  }
  if (isJoining) {
    return JoinState.JOINING;
  }
  if (tournament.status !== TournamentStatus.UPCOMING) {
    return JoinState.CLOSED;
  }

  return tournament.participants.length >= tournament.parameters.maxPlayers
    ? JoinState.FULL
    : JoinState.AVAILABLE;
};

const buildPrizeRows = (prizes, tournamentTexts) =>
  Object.values(TournamentPrizePlace)
    .filter((place) => Boolean(prizes?.[place]))
    .map((place) => ({
      place,
      placeLabel: tournamentTexts.detail.places[place],
      prizeLabel: prizes[place],
    }));

export const buildTournamentCard = (
  tournament,
  { currentUserId, joinedTournamentIds, joiningTournamentId },
  { language, translations }
) => {
  const tournamentTexts = translations.competitive.tournaments;
  const maxPlayers = tournament.parameters?.maxPlayers ?? 0;
  const participantCount = tournament.participants?.length ?? 0;
  const isJoined =
    joinedTournamentIds.includes(tournament._id) ||
    (currentUserId !== null && tournament.participants.includes(currentUserId));
  const joinState = getJoinState({
    tournament,
    isJoined,
    isJoining: joiningTournamentId === tournament._id,
  });
  const startDate = tournament.parameters?.startDate;
  const endDate = tournament.parameters?.endDate;
  const spotsLeft = Math.max(maxPlayers - participantCount, 0);
  const prizeRows = buildPrizeRows(tournament.prizes, tournamentTexts);

  return {
    id: tournament._id,
    tournament,
    name: tournament.name,
    description: tournament.description || tournamentTexts.detail.noDescription,
    isPremium: Boolean(tournament.isPremium),
    typeLabel: tournamentTexts.types[tournament.type] ?? tournament.type,
    formatLabel: formatTranslation(tournamentTexts.formatValue, {
      type: tournamentTexts.types[tournament.type] ?? tournament.type,
      rules:
        tournamentTexts.rules[tournament.parameters?.rules] ??
        tournamentTexts.rules.classic,
    }),
    startLabel: startDate
      ? formatDate(language, startDate)
      : translations.competitive.common.noValue,
    endLabel: endDate
      ? formatDate(language, endDate)
      : translations.competitive.common.noValue,
    playersLabel: formatPluralTranslation(
      tournamentTexts.playersValue,
      participantCount,
      {
        count: formatInteger(language, participantCount),
        max: formatInteger(language, maxPlayers),
      }
    ),
    spotsLeftLabel:
      tournament.status === TournamentStatus.UPCOMING && spotsLeft > 0
        ? formatPluralTranslation(tournamentTexts.spotsLeft, spotsLeft)
        : null,
    fillRatio: maxPlayers > 0 ? participantCount / maxPlayers : 0,
    prizeLabel: prizeRows[0]?.prizeLabel ?? tournamentTexts.noPrize,
    prizeRows,
    hasPrizes: prizeRows.length > 0,
    joinState,
    isJoinable: joinState === JoinState.AVAILABLE,
    isJoined: joinState === JoinState.JOINED,
    isJoining: joinState === JoinState.JOINING,
    joinLabel:
      joinState === JoinState.AVAILABLE || joinState === JoinState.JOINING
        ? tournamentTexts.actions.join
        : tournamentTexts.actions[joinState],
  };
};

export const groupTournamentCardsByStatus = (tournamentCards) =>
  Object.values(TournamentStatus).reduce(
    (cardsByStatus, status) => ({
      ...cardsByStatus,
      [status]: tournamentCards.filter(
        (card) => card.tournament.status === status
      ),
    }),
    {}
  );

const getParticipantDisplayName = (
  participant,
  { currentUserId, currentUsername },
  tournamentTexts
) => {
  if (participant._id === currentUserId && currentUsername) {
    return currentUsername;
  }

  return (
    participant.username ??
    participant.name ??
    formatTranslation(tournamentTexts.unknownPlayer, {
      id: String(participant._id).slice(-PARTICIPANT_ID_SUFFIX_LENGTH),
    })
  );
};

export const buildParticipantRows = (
  participants,
  currentUserId,
  currentUsername,
  { language, translations }
) =>
  participants.map((participant) => ({
    id: participant._id,
    displayName: getParticipantDisplayName(
      participant,
      { currentUserId, currentUsername },
      translations.competitive.tournaments
    ),
    eloLabel:
      typeof participant.elo === 'number'
        ? formatTranslation(translations.competitive.common.eloValue, {
            elo: formatInteger(language, participant.elo),
          })
        : null,
    isCurrentUser: participant._id === currentUserId,
  }));
