import {
  EmojiEvents as TrophyIcon,
  ErrorOutline as ErrorIcon,
  Groups as GroupsIcon,
  InfoOutlined as InfoIcon,
  TrendingDown as TrendDownIcon,
  TrendingFlat as TrendFlatIcon,
  TrendingUp as TrendUpIcon,
} from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react';

import { useLanguage } from '../../../LanguageContext';
import {
  Avatar,
  AvatarSize,
  Badge,
  BadgeTone,
  Button,
  ButtonVariant,
  Card,
  EmptyState,
  PageContainer,
  PageHeader,
  SegmentedControl,
  Skeleton,
} from '../../components/ui';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';
import { formatInteger } from '../Profile/playerFormatting';
import { RequestStatus } from '../Profile/requestStatus';
import { useUserProfile } from '../Profile/useUserProfile';

import {
  fetchLeaderboard,
  LEADERBOARD_PAGE_SIZE,
  LeaderboardPeriod,
  LeaderboardScope,
  PODIUM_SIZE,
} from './leaderboardData';
import {
  buildCurrentPlayerSummary,
  buildEmptyStateTexts,
  buildLeaderboardRow,
  TrendDirection,
} from './leaderboardViewModel';
import './Classement.css';

const SKELETON_ROW_COUNT = 8;
const SKELETON_ROW_KEYS = Array.from(
  { length: SKELETON_ROW_COUNT },
  (_, rowIndex) => `skeleton-row-${rowIndex}`
);
const PODIUM_SKELETON_KEYS = ['podium-second', 'podium-first', 'podium-third'];
const PODIUM_DISPLAY_ORDER = [1, 0, 2];

const TREND_ICON_BY_DIRECTION = {
  [TrendDirection.UP]: TrendUpIcon,
  [TrendDirection.DOWN]: TrendDownIcon,
  [TrendDirection.FLAT]: TrendFlatIcon,
};

const EMPTY_LEADERBOARD = {
  entries: [],
  totalCount: 0,
  currentPlayerEntry: null,
};

const TrendCell = ({ row }) => {
  const TrendIcon = TREND_ICON_BY_DIRECTION[row.trendDirection];

  return (
    <span
      className={`leaderboard-trend leaderboard-trend-${row.trendDirection}`}
      aria-label={row.trendAriaLabel}
    >
      <TrendIcon aria-hidden='true' />
      {row.trendValueLabel}
    </span>
  );
};

const PlayerIdentity = ({ row }) => (
  <div className='leaderboard-player'>
    <Avatar
      name={row.username}
      imageUrl={row.profilePictureUrl}
      size={AvatarSize.SMALL}
    />
    <div className='leaderboard-player-text'>
      <span className='leaderboard-player-name'>
        {row.username}
        {row.youLabel && <Badge tone={BadgeTone.ACCENT}>{row.youLabel}</Badge>}
      </span>
      <span className='leaderboard-player-meta'>
        {row.countryCode && (
          <span className='leaderboard-country'>{row.countryCode}</span>
        )}
        {row.gamesLabel}
      </span>
    </div>
  </div>
);

const PodiumCard = ({ row }) => (
  <article
    className={`leaderboard-podium-card leaderboard-podium-rank-${row.rank} ${row.isCurrentPlayer ? 'leaderboard-podium-card-current' : ''}`}
  >
    <span className='leaderboard-podium-rank'>
      <TrophyIcon aria-hidden='true' />
      {row.rankLabel}
    </span>
    <Avatar
      name={row.username}
      imageUrl={row.profilePictureUrl}
      size={AvatarSize.LARGE}
    />
    <span className='leaderboard-podium-name'>{row.username}</span>
    <span className='leaderboard-podium-elo'>{row.eloLabel}</span>
    <span className='leaderboard-podium-record'>
      {row.recordLabel} · {row.winRateLabel}
    </span>
  </article>
);

const LeaderboardRow = ({ row }) => (
  <tr
    className={`leaderboard-row ${row.isCurrentPlayer ? 'leaderboard-row-current' : ''}`}
  >
    <td className='leaderboard-cell-rank'>{row.rankLabel}</td>
    <td>
      <PlayerIdentity row={row} />
    </td>
    <td className='leaderboard-cell-number leaderboard-cell-elo'>
      {row.eloLabel}
    </td>
    <td className='leaderboard-cell-number leaderboard-column-optional'>
      {row.recordLabel}
    </td>
    <td className='leaderboard-cell-number'>{row.winRateLabel}</td>
    <td className='leaderboard-cell-number leaderboard-column-optional'>
      <TrendCell row={row} />
    </td>
  </tr>
);

const SkeletonRows = () =>
  SKELETON_ROW_KEYS.map((rowKey) => (
    <tr key={rowKey} className='leaderboard-row'>
      <td>
        <Skeleton width='1.5rem' />
      </td>
      <td>
        <div className='leaderboard-player'>
          <Skeleton width='2rem' height='2rem' isRound />
          <Skeleton width='8rem' />
        </div>
      </td>
      <td>
        <Skeleton width='3rem' />
      </td>
      <td className='leaderboard-column-optional'>
        <Skeleton width='5rem' />
      </td>
      <td>
        <Skeleton width='2.5rem' />
      </td>
      <td className='leaderboard-column-optional'>
        <Skeleton width='3rem' />
      </td>
    </tr>
  ));

const Classement = () => {
  const { translations, language } = useLanguage();
  const leaderboardTexts = translations.competitive.leaderboard;
  const commonTexts = translations.competitive.common;
  const { profile, isLoading: isProfileLoading } = useUserProfile();
  const [scope, setScope] = useState(LeaderboardScope.GLOBAL);
  const [period, setPeriod] = useState(LeaderboardPeriod.ALL_TIME);
  const [leaderboard, setLeaderboard] = useState(EMPTY_LEADERBOARD);
  const [requestStatus, setRequestStatus] = useState(RequestStatus.LOADING);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reloadCount, setReloadCount] = useState(0);

  const currentPlayer = useMemo(
    () =>
      profile
        ? {
            username: profile.username,
            profilePicture: profile.profilePicture,
            elo: profile.elo,
            victories: profile.victories,
            defeats: profile.defeats,
          }
        : null,
    [profile]
  );

  useEffect(() => {
    if (isProfileLoading) {
      return undefined;
    }
    let isStale = false;
    setRequestStatus(RequestStatus.LOADING);
    fetchLeaderboard({
      scope,
      period,
      offset: 0,
      limit: LEADERBOARD_PAGE_SIZE,
      currentPlayer,
    })
      .then((page) => {
        if (!isStale) {
          setLeaderboard(page);
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
  }, [scope, period, currentPlayer, isProfileLoading, reloadCount]);

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = await fetchLeaderboard({
        scope,
        period,
        offset: leaderboard.entries.length,
        limit: LEADERBOARD_PAGE_SIZE,
        currentPlayer,
      });
      setLeaderboard((previousLeaderboard) => ({
        ...nextPage,
        entries: [...previousLeaderboard.entries, ...nextPage.entries],
      }));
    } catch {
      setRequestStatus(RequestStatus.ERROR);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const viewModel = useMemo(() => {
    const formattingContext = { language, translations };
    const rows = leaderboard.entries.map((entry) =>
      buildLeaderboardRow(entry, formattingContext)
    );
    const podiumRows = rows.slice(0, PODIUM_SIZE);

    return {
      scopeOptions: [
        {
          value: LeaderboardScope.GLOBAL,
          label: leaderboardTexts.scopes.global,
        },
        {
          value: LeaderboardScope.FRIENDS,
          label: leaderboardTexts.scopes.friends,
        },
        {
          value: LeaderboardScope.COUNTRY,
          label: leaderboardTexts.scopes.country,
          isDisabled: true,
        },
      ],
      periodOptions: Object.values(LeaderboardPeriod).map((periodValue) => ({
        value: periodValue,
        label: leaderboardTexts.periods[periodValue],
      })),
      podiumRows: PODIUM_DISPLAY_ORDER.map(
        (podiumIndex) => podiumRows[podiumIndex]
      ).filter(Boolean),
      tableRows: rows.slice(PODIUM_SIZE),
      hasTableRows: rows.length > PODIUM_SIZE,
      hasEntries: rows.length > 0,
      hasMoreEntries: rows.length < leaderboard.totalCount,
      playersCountLabel: formatPluralTranslation(
        leaderboardTexts.players,
        leaderboard.totalCount,
        { count: formatInteger(language, leaderboard.totalCount) }
      ),
      showingLabel: formatTranslation(leaderboardTexts.showing, {
        shown: formatInteger(language, rows.length),
        total: formatInteger(language, leaderboard.totalCount),
      }),
      currentPlayerSummary: buildCurrentPlayerSummary(
        leaderboard.currentPlayerEntry,
        leaderboard.totalCount,
        formattingContext
      ),
      emptyStateTexts: buildEmptyStateTexts(scope, leaderboardTexts),
    };
  }, [leaderboard, language, translations, leaderboardTexts, scope]);

  const isLoading = requestStatus === RequestStatus.LOADING;
  const isError = requestStatus === RequestStatus.ERROR;
  const isEmpty =
    requestStatus === RequestStatus.SUCCESS && !viewModel.hasEntries;
  const isReady =
    requestStatus === RequestStatus.SUCCESS && viewModel.hasEntries;

  return (
    <PageContainer className='leaderboard-page'>
      <PageHeader
        eyebrow={leaderboardTexts.eyebrow}
        title={leaderboardTexts.title}
        description={leaderboardTexts.description}
      />

      <div className='leaderboard-filters'>
        <SegmentedControl
          options={viewModel.scopeOptions}
          value={scope}
          onChange={setScope}
          ariaLabel={leaderboardTexts.scopeLabel}
        />
        <SegmentedControl
          options={viewModel.periodOptions}
          value={period}
          onChange={setPeriod}
          ariaLabel={leaderboardTexts.periodLabel}
        />
      </div>

      <p className='leaderboard-notice'>
        <InfoIcon aria-hidden='true' />
        {leaderboardTexts.sampleNotice}
      </p>

      {isError && (
        <Card>
          <EmptyState
            icon={<ErrorIcon />}
            title={leaderboardTexts.errorTitle}
            description={leaderboardTexts.errorDescription}
            action={
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={() => setReloadCount((count) => count + 1)}
              >
                {commonTexts.retry}
              </Button>
            }
          />
        </Card>
      )}

      {isEmpty && (
        <Card>
          <EmptyState
            icon={<GroupsIcon />}
            title={viewModel.emptyStateTexts.title}
            description={viewModel.emptyStateTexts.description}
          />
        </Card>
      )}

      {(isLoading || isReady) && (
        <section
          className='leaderboard-podium'
          aria-label={leaderboardTexts.podiumLabel}
          aria-busy={isLoading}
        >
          {isLoading
            ? PODIUM_SKELETON_KEYS.map((skeletonKey) => (
                <div key={skeletonKey} className='leaderboard-podium-card'>
                  <Skeleton width='4rem' height='4rem' isRound />
                  <Skeleton width='6rem' />
                  <Skeleton width='4rem' height='1.5rem' />
                </div>
              ))
            : viewModel.podiumRows.map((row) => (
                <PodiumCard key={row.userId} row={row} />
              ))}
        </section>
      )}

      {viewModel.currentPlayerSummary && isReady && (
        <Card className='leaderboard-you' isPadded={false}>
          <div className='leaderboard-you-content'>
            <span className='leaderboard-you-label'>
              {leaderboardTexts.yourPosition}
            </span>
            <PlayerIdentity row={viewModel.currentPlayerSummary} />
            <div className='leaderboard-you-figures'>
              <span className='leaderboard-you-rank'>
                {viewModel.currentPlayerSummary.positionLabel}
              </span>
              <span className='leaderboard-you-elo'>
                {viewModel.currentPlayerSummary.eloValueLabel}
              </span>
            </div>
          </div>
        </Card>
      )}

      {(isLoading || (isReady && viewModel.hasTableRows)) && (
        <Card isPadded={false} className='leaderboard-table-card'>
          <div className='leaderboard-table-scroll'>
            <table className='leaderboard-table'>
              <thead>
                <tr>
                  <th scope='col'>{leaderboardTexts.columns.rank}</th>
                  <th scope='col'>{leaderboardTexts.columns.player}</th>
                  <th scope='col' className='leaderboard-cell-number'>
                    {leaderboardTexts.columns.elo}
                  </th>
                  <th
                    scope='col'
                    className='leaderboard-cell-number leaderboard-column-optional'
                  >
                    {leaderboardTexts.columns.record}
                  </th>
                  <th scope='col' className='leaderboard-cell-number'>
                    {leaderboardTexts.columns.winRate}
                  </th>
                  <th
                    scope='col'
                    className='leaderboard-cell-number leaderboard-column-optional'
                  >
                    {leaderboardTexts.columns.trend}
                  </th>
                </tr>
              </thead>
              <tbody aria-busy={isLoading}>
                {isLoading ? (
                  <SkeletonRows />
                ) : (
                  viewModel.tableRows.map((row) => (
                    <LeaderboardRow key={row.userId} row={row} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          {isReady && (
            <div className='leaderboard-table-footer'>
              <span>
                {viewModel.showingLabel} · {viewModel.playersCountLabel}
              </span>
              {viewModel.hasMoreEntries && (
                <Button
                  variant={ButtonVariant.SECONDARY}
                  isLoading={isLoadingMore}
                  onClick={handleLoadMore}
                >
                  {leaderboardTexts.loadMore}
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {!profile && isReady && (
        <Card>
          <EmptyState
            title={leaderboardTexts.notRankedTitle}
            description={leaderboardTexts.notRankedDescription}
          />
        </Card>
      )}
    </PageContainer>
  );
};

export default Classement;
