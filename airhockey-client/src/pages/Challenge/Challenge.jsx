import {
  ArrowForward as PlayIcon,
  Bolt as XpIcon,
  CallSplit as BankIcon,
  CheckCircle as ClaimedIcon,
  CalendarMonth as WeeklyIcon,
  EventAvailable as DailyIcon,
  Flag as ChallengeIcon,
  GpsFixed as TargetIcon,
  MonetizationOn as CoinsIcon,
  Redeem as ClaimIcon,
  Shield as ShieldIcon,
  SmartToy as BotsIcon,
  SportsEsports as RunsIcon,
  Star as StarsIcon,
} from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import {
  Badge,
  BadgeTone,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  EmptyState,
  PageContainer,
  PageHeader,
  ProgressBar,
  Skeleton,
  StatTile,
  Tabs,
} from '../../components/ui';

import {
  buildProgressContext,
  claimChallenge,
  getClaimedChallengeIds,
} from './challengeProgress';
import { ChallengePeriod, fetchChallenges } from './challengesData';
import {
  buildChallengeRows,
  buildChallengeSummary,
  buildPeriodTabs,
  ChallengeIconKind,
} from './challengeViewModel';
import './Challenge.css';

const ARCADE_PATH = '/arcade';
const SKELETON_ROW_COUNT = 3;

const LoadStatus = Object.freeze({
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
});

const ICON_BY_KIND = {
  [ChallengeIconKind.TARGET]: TargetIcon,
  [ChallengeIconKind.SHIELD]: ShieldIcon,
  [ChallengeIconKind.BANK]: BankIcon,
  [ChallengeIconKind.RUNS]: RunsIcon,
  [ChallengeIconKind.BOTS]: BotsIcon,
  [ChallengeIconKind.STARS]: StarsIcon,
};

const SKELETON_ROW_IDS = Array.from(
  { length: SKELETON_ROW_COUNT },
  (_, index) => `skeleton-${index}`
);

const ChallengeRowSkeleton = () => (
  <li className='challenge-row'>
    <Skeleton width='2.75rem' height='2.75rem' isRound />
    <div className='challenge-main'>
      <Skeleton width='60%' height='1rem' />
      <Skeleton width='35%' height='0.75rem' />
      <Skeleton width='100%' height='0.5rem' />
    </div>
  </li>
);

const ChallengeRow = ({ row, texts, onClaim, onPlay }) => {
  const Icon = ICON_BY_KIND[row.icon];

  return (
    <li
      className={`challenge-row ${row.isClaimed ? 'challenge-row-done' : ''}`}
    >
      <span className='challenge-icon' aria-hidden='true'>
        <Icon />
      </span>
      <div className='challenge-main'>
        <div className='challenge-title-line'>
          <h3 className='challenge-title'>{row.title}</h3>
          {row.isHardTier && (
            <Badge tone={BadgeTone.ACCENT}>{row.tierLabel}</Badge>
          )}
        </div>
        <p className='challenge-context'>{row.contextLabel}</p>
        <div className='challenge-progress'>
          <ProgressBar ratio={row.progressRatio} label={row.title} />
          <span className='challenge-progress-label'>{row.progressLabel}</span>
        </div>
      </div>
      <div className='challenge-rewards'>
        <span className='challenge-reward challenge-reward-coins'>
          <CoinsIcon aria-hidden='true' />
          {row.coinsLabel}
        </span>
        <span className='challenge-reward'>
          <XpIcon aria-hidden='true' />
          {row.xpLabel}
        </span>
      </div>
      <div className='challenge-action'>
        {row.isClaimable && (
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.SMALL}
            icon={<ClaimIcon />}
            onClick={() => onClaim(row.id)}
          >
            {texts.claim}
          </Button>
        )}
        {row.isClaimed && (
          <Badge tone={BadgeTone.SUCCESS} icon={<ClaimedIcon />}>
            {row.statusLabel}
          </Badge>
        )}
        {row.isInProgress && (
          <Button
            variant={ButtonVariant.GHOST}
            size={ButtonSize.SMALL}
            trailingIcon={<PlayIcon />}
            onClick={() => onPlay(row.playPath)}
          >
            {texts.play}
          </Button>
        )}
      </div>
    </li>
  );
};

const Challenge = () => {
  const navigate = useNavigate();
  const { translations, language } = useLanguage();
  const texts = translations.page.challenges;
  const arcadeTexts = translations.page.arcade;
  const now = useMemo(() => new Date(), []);
  const [reloadId, setReloadId] = useState(0);
  const [loadState, setLoadState] = useState({
    status: LoadStatus.LOADING,
    challenges: null,
  });
  const [claimedIds, setClaimedIds] = useState(getClaimedChallengeIds);
  const [activePeriod, setActivePeriod] = useState(ChallengePeriod.DAILY);
  const progressContext = useMemo(() => buildProgressContext(now), [now]);

  useEffect(() => {
    let isCurrent = true;
    setLoadState({ status: LoadStatus.LOADING, challenges: null });
    fetchChallenges(now)
      .then((challenges) => {
        if (isCurrent) {
          setLoadState({ status: LoadStatus.READY, challenges });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setLoadState({ status: LoadStatus.ERROR, challenges: null });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [now, reloadId]);

  const { status, challenges } = loadState;
  const view = useMemo(() => {
    if (!challenges) {
      return null;
    }
    const rowOptions = {
      progressContext,
      claimedIds,
      texts,
      arcadeTexts,
      language,
    };
    const dailyRows = buildChallengeRows({
      ...rowOptions,
      challenges: challenges.daily,
    });
    const weeklyRows = buildChallengeRows({
      ...rowOptions,
      challenges: challenges.weekly,
    });

    return {
      rowsByPeriod: {
        [ChallengePeriod.DAILY]: dailyRows,
        [ChallengePeriod.WEEKLY]: weeklyRows,
      },
      tabs: buildPeriodTabs(dailyRows, weeklyRows, texts),
      summary: buildChallengeSummary({
        dailyRows,
        weeklyRows,
        challenges,
        now,
        texts,
        language,
      }),
    };
  }, [
    challenges,
    progressContext,
    claimedIds,
    texts,
    arcadeTexts,
    language,
    now,
  ]);

  const activeRows = view ? view.rowsByPeriod[activePeriod] : [];
  const isLoading = status === LoadStatus.LOADING;
  const hasError = status === LoadStatus.ERROR;
  const isEmpty = status === LoadStatus.READY && activeRows.length === 0;
  const hasRows = status === LoadStatus.READY && activeRows.length > 0;
  const loadingValue = <Skeleton width='4rem' height='1.75rem' />;
  const loadingTabs = buildPeriodTabs(null, null, texts);

  return (
    <PageContainer>
      <PageHeader
        eyebrow={texts.eyebrow}
        title={texts.title}
        description={texts.description}
        actions={
          <Button
            variant={ButtonVariant.SECONDARY}
            icon={<RunsIcon />}
            onClick={() => navigate(ARCADE_PATH)}
          >
            {texts.openArcade}
          </Button>
        }
      />

      <div className='challenge-summary'>
        <StatTile
          icon={<DailyIcon />}
          label={texts.summary.daily}
          value={view ? view.summary.dailyValue : loadingValue}
          detail={view?.summary.dailyDetail}
        />
        <StatTile
          icon={<WeeklyIcon />}
          label={texts.summary.weekly}
          value={view ? view.summary.weeklyValue : loadingValue}
          detail={view?.summary.weeklyDetail}
        />
        <StatTile
          icon={<CoinsIcon />}
          label={texts.summary.coins}
          value={view ? view.summary.coinsValue : loadingValue}
          detail={view?.summary.coinsDetail}
        />
      </div>

      <Card isPadded={false} className='challenge-card'>
        <div className='challenge-card-header'>
          <Tabs
            tabs={view ? view.tabs : loadingTabs}
            activeTab={activePeriod}
            onChange={setActivePeriod}
            ariaLabel={texts.title}
          />
        </div>
        {isLoading && (
          <ul className='challenge-list' aria-busy='true'>
            {SKELETON_ROW_IDS.map((rowId) => (
              <ChallengeRowSkeleton key={rowId} />
            ))}
          </ul>
        )}
        {hasError && (
          <EmptyState
            icon={<ChallengeIcon />}
            title={texts.error.title}
            description={texts.error.description}
            action={
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={() => setReloadId((currentId) => currentId + 1)}
              >
                {texts.error.retry}
              </Button>
            }
          />
        )}
        {isEmpty && (
          <EmptyState
            icon={<ChallengeIcon />}
            title={texts.empty.title}
            description={texts.empty.description}
          />
        )}
        {hasRows && (
          <ul className='challenge-list'>
            {activeRows.map((row) => (
              <ChallengeRow
                key={row.id}
                row={row}
                texts={texts}
                onClaim={(challengeId) =>
                  setClaimedIds(claimChallenge(challengeId))
                }
                onPlay={navigate}
              />
            ))}
          </ul>
        )}
      </Card>
    </PageContainer>
  );
};

export default Challenge;
