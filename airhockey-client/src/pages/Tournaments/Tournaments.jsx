import {
  ErrorOutline as ErrorIcon,
  EventBusy as NoEventIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useLanguage } from '../../../LanguageContext';
import { ApiError } from '../../api/apiClient';
import Toast from '../../components/Toast/Toast';
import Tournament from '../../components/Tournament/Tournament';
import TournamentDetailModal from '../../components/Tournament/TournamentDetailModal';
import {
  Button,
  ButtonVariant,
  Card,
  EmptyState,
  PageContainer,
  PageHeader,
  Skeleton,
  Tabs,
} from '../../components/ui';
import { formatTranslation } from '../../i18n/formatTranslation';
import { RequestStatus } from '../Profile/requestStatus';
import { useUserProfile } from '../Profile/useUserProfile';

import {
  fetchTournamentParticipants,
  fetchTournaments,
  joinTournament,
  TournamentStatus,
} from './tournamentsData';
import {
  buildParticipantRows,
  buildTournamentCard,
  groupTournamentCardsByStatus,
} from './tournamentsViewModel';
import './Tournaments.css';

const ToastType = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
});

const HTTP_BAD_REQUEST = 400;
const SAMPLE_CURRENT_USER_ID = 'sample-current-user';

const CARD_SKELETON_KEYS = [
  'tournament-skeleton-1',
  'tournament-skeleton-2',
  'tournament-skeleton-3',
];

const INITIAL_PARTICIPANTS = { isLoading: false, hasError: false, items: [] };

const TournamentCardSkeleton = () => (
  <div className='tournaments-skeleton-card'>
    <Skeleton width='5rem' height='1.375rem' />
    <Skeleton width='70%' height='1.25rem' />
    <Skeleton height='2.5rem' />
    <Skeleton height='3rem' />
    <Skeleton width='40%' height='2.5rem' />
  </div>
);

const Tournaments = () => {
  const { translations, language } = useLanguage();
  const tournamentTexts = translations.competitive.tournaments;
  const { profile } = useUserProfile();
  const [tournaments, setTournaments] = useState([]);
  const [isSample, setIsSample] = useState(false);
  const [requestStatus, setRequestStatus] = useState(RequestStatus.LOADING);
  const [reloadCount, setReloadCount] = useState(0);
  const [activeTab, setActiveTab] = useState(TournamentStatus.UPCOMING);
  const [joinedTournamentIds, setJoinedTournamentIds] = useState([]);
  const [joiningTournamentId, setJoiningTournamentId] = useState(null);
  const [selectedTournamentId, setSelectedTournamentId] = useState(null);
  const [participants, setParticipants] = useState(INITIAL_PARTICIPANTS);
  const [toast, setToast] = useState(null);

  const currentUserId = profile?._id ?? null;

  useEffect(() => {
    let isStale = false;
    setRequestStatus(RequestStatus.LOADING);
    fetchTournaments()
      .then((result) => {
        if (!isStale) {
          setTournaments(result.tournaments);
          setIsSample(result.isSample);
          setRequestStatus(RequestStatus.SUCCESS);
        }
      })
      .catch(() => {
        if (!isStale) {
          setRequestStatus(RequestStatus.ERROR);
        }
      });

    return () => {
      isStale = true;
    };
  }, [reloadCount]);

  const selectedTournament = useMemo(
    () =>
      tournaments.find((tournament) => tournament._id === selectedTournamentId),
    [tournaments, selectedTournamentId]
  );

  useEffect(() => {
    if (!selectedTournament) {
      return undefined;
    }
    let isStale = false;
    setParticipants({ isLoading: true, hasError: false, items: [] });
    fetchTournamentParticipants(selectedTournament)
      .then((participantItems) => {
        if (!isStale) {
          setParticipants({
            isLoading: false,
            hasError: false,
            items: Array.isArray(participantItems) ? participantItems : [],
          });
        }
      })
      .catch(() => {
        if (!isStale) {
          setParticipants({ isLoading: false, hasError: true, items: [] });
        }
      });

    return () => {
      isStale = true;
    };
  }, [selectedTournament]);

  const markTournamentJoined = (tournamentId) => {
    const joiningUserId = currentUserId ?? SAMPLE_CURRENT_USER_ID;
    setJoinedTournamentIds((joinedIds) => [...joinedIds, tournamentId]);
    setTournaments((previousTournaments) =>
      previousTournaments.map((tournament) =>
        tournament._id === tournamentId &&
        !tournament.participants.includes(joiningUserId)
          ? {
              ...tournament,
              participants: [...tournament.participants, joiningUserId],
            }
          : tournament
      )
    );
  };

  const handleJoin = async (card) => {
    setJoiningTournamentId(card.id);
    try {
      await joinTournament(card.id);
      markTournamentJoined(card.id);
      setToast({
        id: Date.now(),
        type: ToastType.SUCCESS,
        message: formatTranslation(tournamentTexts.joinSuccess, {
          name: card.name,
        }),
      });
    } catch (joinError) {
      const isAlreadyJoined =
        joinError instanceof ApiError && joinError.status === HTTP_BAD_REQUEST;
      if (isAlreadyJoined) {
        markTournamentJoined(card.id);
      } else {
        setToast({
          id: Date.now(),
          type: ToastType.ERROR,
          message: tournamentTexts.joinError,
        });
      }
    } finally {
      setJoiningTournamentId(null);
    }
  };

  const handleOpenDetails = (card) => setSelectedTournamentId(card.id);

  const handleCloseDetails = useCallback(
    () => setSelectedTournamentId(null),
    []
  );

  const viewModel = useMemo(() => {
    const formattingContext = { language, translations };
    const joinContext = {
      currentUserId: currentUserId ?? SAMPLE_CURRENT_USER_ID,
      joinedTournamentIds,
      joiningTournamentId,
    };
    const cards = tournaments.map((tournament) =>
      buildTournamentCard(tournament, joinContext, formattingContext)
    );
    const cardsByStatus = groupTournamentCardsByStatus(cards);
    const activeCards = cardsByStatus[activeTab] ?? [];

    return {
      tabs: Object.values(TournamentStatus).map((status) => ({
        value: status,
        label: tournamentTexts.tabs[status],
        count: cardsByStatus[status]?.length ?? 0,
      })),
      activeCards,
      hasActiveCards: activeCards.length > 0,
      emptyTitle: tournamentTexts.empty[activeTab],
      selectedCard:
        cards.find((card) => card.id === selectedTournamentId) ?? null,
      participantsView: {
        isLoading: participants.isLoading,
        hasError: participants.hasError,
        rows: buildParticipantRows(
          participants.items,
          joinContext.currentUserId,
          profile?.username ?? null,
          formattingContext
        ),
      },
    };
  }, [
    tournaments,
    activeTab,
    joinedTournamentIds,
    joiningTournamentId,
    selectedTournamentId,
    participants,
    currentUserId,
    profile,
    language,
    translations,
    tournamentTexts,
  ]);

  const isLoading = requestStatus === RequestStatus.LOADING;
  const isError = requestStatus === RequestStatus.ERROR;
  const isReady = requestStatus === RequestStatus.SUCCESS;

  return (
    <PageContainer className='tournaments-page'>
      <PageHeader
        eyebrow={tournamentTexts.eyebrow}
        title={tournamentTexts.title}
        description={tournamentTexts.description}
      />

      <Tabs
        tabs={viewModel.tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        ariaLabel={tournamentTexts.tabsLabel}
      />

      {isSample && isReady && (
        <p className='tournaments-notice'>
          <InfoIcon aria-hidden='true' />
          {tournamentTexts.sampleNotice}
        </p>
      )}

      {isLoading && (
        <div className='tournaments-grid' aria-busy='true'>
          {CARD_SKELETON_KEYS.map((skeletonKey) => (
            <TournamentCardSkeleton key={skeletonKey} />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <EmptyState
            icon={<ErrorIcon />}
            title={tournamentTexts.errorTitle}
            description={tournamentTexts.errorDescription}
            action={
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={() => setReloadCount((count) => count + 1)}
              >
                {translations.competitive.common.retry}
              </Button>
            }
          />
        </Card>
      )}

      {isReady && viewModel.hasActiveCards && (
        <div className='tournaments-grid'>
          {viewModel.activeCards.map((card) => (
            <Tournament
              key={card.id}
              card={card}
              onJoin={handleJoin}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>
      )}

      {isReady && !viewModel.hasActiveCards && (
        <Card>
          <EmptyState
            icon={<NoEventIcon />}
            title={viewModel.emptyTitle}
            description={tournamentTexts.empty.description}
          />
        </Card>
      )}

      <TournamentDetailModal
        card={viewModel.selectedCard}
        participants={viewModel.participantsView}
        onClose={handleCloseDetails}
        onJoin={handleJoin}
      />

      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      )}
    </PageContainer>
  );
};

export default Tournaments;
