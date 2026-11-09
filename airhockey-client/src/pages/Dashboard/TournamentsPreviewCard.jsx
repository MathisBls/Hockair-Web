import {
  ArrowForward as ArrowIcon,
  ErrorOutline as ErrorIcon,
  EventBusy as EmptyIcon,
  Lock as LockIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import {
  Badge,
  BadgeTone,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  EmptyState,
  Skeleton,
} from '../../components/ui';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';

import {
  HomeRoute,
  RequestStatus,
  TOURNAMENT_PREVIEW_LIMIT,
  TournamentStatus,
} from './homeData';

const TOURNAMENT_SKELETON_KEYS = Array.from(
  { length: TOURNAMENT_PREVIEW_LIMIT },
  (_, index) => `tournament-skeleton-${index}`
);

const BADGE_TONE_BY_TOURNAMENT_STATUS = {
  [TournamentStatus.UPCOMING]: BadgeTone.NEUTRAL,
  [TournamentStatus.ONGOING]: BadgeTone.ACCENT,
};

const TournamentsPreviewCard = ({ tournamentsRequest }) => {
  const { translations, language } = useLanguage();
  const navigate = useNavigate();
  const tournamentTexts = translations.page.home.tournaments;
  const { status, result: tournaments, retry } = tournamentsRequest;

  const tournamentItems = useMemo(() => {
    const dateFormatter = new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (tournaments ?? []).map((tournament) => {
      const participantCount = tournament.participants?.length ?? 0;
      const startDate = tournament.parameters?.startDate;

      return {
        id: tournament._id,
        name: tournament.name,
        isPremium: Boolean(tournament.isPremium),
        statusLabel: tournamentTexts.status[tournament.status],
        statusTone: BADGE_TONE_BY_TOURNAMENT_STATUS[tournament.status],
        startLabel: startDate
          ? formatTranslation(tournamentTexts.startsOn, {
              date: dateFormatter.format(new Date(startDate)),
            })
          : null,
        playersLabel: formatPluralTranslation(
          tournamentTexts.players,
          participantCount,
          { max: tournament.parameters?.maxPlayers ?? participantCount }
        ),
      };
    });
  }, [tournaments, tournamentTexts, language]);

  const contentByStatus = {
    [RequestStatus.IDLE]: (
      <EmptyState
        icon={<LockIcon />}
        title={tournamentTexts.guestTitle}
        description={tournamentTexts.guestDescription}
        action={
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.SMALL}
            onClick={() => navigate(HomeRoute.LOGIN)}
          >
            {tournamentTexts.logIn}
          </Button>
        }
      />
    ),
    [RequestStatus.LOADING]: (
      <ul className='home-list' aria-busy='true'>
        {TOURNAMENT_SKELETON_KEYS.map((skeletonKey) => (
          <li key={skeletonKey} className='home-tournament-row'>
            <Skeleton width='2.5rem' height='2.5rem' />
            <div className='home-tournament-text'>
              <Skeleton width='70%' height='0.875rem' />
              <Skeleton width='45%' height='0.75rem' />
            </div>
          </li>
        ))}
      </ul>
    ),
    [RequestStatus.ERROR]: (
      <EmptyState
        icon={<ErrorIcon />}
        title={tournamentTexts.errorTitle}
        description={tournamentTexts.errorDescription}
        action={
          <Button
            variant={ButtonVariant.GHOST}
            size={ButtonSize.SMALL}
            onClick={retry}
          >
            {tournamentTexts.retry}
          </Button>
        }
      />
    ),
    [RequestStatus.SUCCESS]:
      tournamentItems.length > 0 ? (
        <ul className='home-list'>
          {tournamentItems.map((tournament) => (
            <li key={tournament.id}>
              <Link to={HomeRoute.TOURNAMENTS} className='home-tournament-row'>
                <span className='home-tournament-icon'>
                  <TrophyIcon fontSize='small' />
                </span>
                <span className='home-tournament-text'>
                  <span className='home-tournament-name'>
                    {tournament.name}
                  </span>
                  <span className='home-tournament-meta'>
                    {tournament.startLabel && (
                      <span>{tournament.startLabel}</span>
                    )}
                    <span>{tournament.playersLabel}</span>
                  </span>
                </span>
                <span className='home-tournament-badges'>
                  {tournament.isPremium && (
                    <Badge tone={BadgeTone.WARNING}>
                      {tournamentTexts.premium}
                    </Badge>
                  )}
                  <Badge tone={tournament.statusTone}>
                    {tournament.statusLabel}
                  </Badge>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<EmptyIcon />}
          title={tournamentTexts.emptyTitle}
          description={tournamentTexts.emptyDescription}
        />
      ),
  };

  return (
    <Card
      title={tournamentTexts.title}
      action={
        <Link to={HomeRoute.TOURNAMENTS} className='home-text-link'>
          {tournamentTexts.viewAll}
          <ArrowIcon fontSize='inherit' />
        </Link>
      }
    >
      {contentByStatus[status]}
    </Card>
  );
};

export default TournamentsPreviewCard;
