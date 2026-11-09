import {
  EmojiEvents as TrophyIcon,
  Insights as StatsIcon,
  MilitaryTech as LevelIcon,
  ShowChart as EloIcon,
  Percent as WinRateIcon,
} from '@mui/icons-material';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  PageHeader,
  Skeleton,
  StatTile,
} from '../../components/ui';
import { formatTranslation } from '../../i18n/formatTranslation';

import { HomeRoute, RequestStatus } from './homeData';

const DayPeriod = Object.freeze({
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
});

const AFTERNOON_START_HOUR = 12;
const EVENING_START_HOUR = 18;
const STAT_TILE_COUNT = 4;
const PERCENT_SCALE = 100;
const STAT_SKELETON_KEYS = Array.from(
  { length: STAT_TILE_COUNT },
  (_, index) => `stat-skeleton-${index}`
);

const getDayPeriod = (date) => {
  const hour = date.getHours();
  if (hour < AFTERNOON_START_HOUR) {
    return DayPeriod.MORNING;
  }

  return hour < EVENING_START_HOUR ? DayPeriod.AFTERNOON : DayPeriod.EVENING;
};

const buildMemberStats = (profile, homeTexts, numberFormatter) => {
  const victories = profile.victories ?? 0;
  const defeats = profile.defeats ?? 0;
  const playedGames = victories + defeats;
  const winRateValue =
    playedGames > 0
      ? formatTranslation(homeTexts.stats.winRateValue, {
          percent: Math.round((victories / playedGames) * PERCENT_SCALE),
        })
      : homeTexts.stats.noGames;

  return [
    {
      id: 'elo',
      label: homeTexts.stats.elo,
      value: numberFormatter.format(profile.elo ?? 0),
      icon: <EloIcon fontSize='small' />,
    },
    {
      id: 'record',
      label: homeTexts.stats.record,
      value: formatTranslation(homeTexts.stats.recordValue, {
        victories: numberFormatter.format(victories),
        defeats: numberFormatter.format(defeats),
      }),
      icon: <TrophyIcon fontSize='small' />,
    },
    {
      id: 'winRate',
      label: homeTexts.stats.winRate,
      value: winRateValue,
      icon: <WinRateIcon fontSize='small' />,
    },
    {
      id: 'level',
      label: homeTexts.stats.level,
      value: numberFormatter.format(profile.level ?? 1),
      detail: formatTranslation(homeTexts.stats.xp, {
        xp: numberFormatter.format(profile.xp ?? 0),
      }),
      icon: <LevelIcon fontSize='small' />,
    },
  ];
};

const HomeGreeting = ({ profileRequest }) => {
  const { translations, language } = useLanguage();
  const navigate = useNavigate();
  const homeTexts = translations.page.home;
  const {
    status,
    result: profile,
    isUserAuthenticated,
    retry,
  } = profileRequest;

  const todayLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(language, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(new Date()),
    [language]
  );
  const dayPeriod = useMemo(() => getDayPeriod(new Date()), []);

  const viewModel = useMemo(() => {
    const isLoading = status === RequestStatus.LOADING;
    const hasProfile = status === RequestStatus.SUCCESS && Boolean(profile);
    const numberFormatter = new Intl.NumberFormat(language);

    const title = hasProfile
      ? formatTranslation(homeTexts.greeting[dayPeriod], {
          username: profile.username,
        })
      : homeTexts.greeting.fallback;

    return {
      isLoading,
      isGuest: !isUserAuthenticated,
      hasError: status === RequestStatus.ERROR,
      title: isUserAuthenticated ? title : homeTexts.greeting.guestTitle,
      description: isUserAuthenticated
        ? homeTexts.greeting.memberDescription
        : homeTexts.greeting.guestDescription,
      stats: hasProfile
        ? buildMemberStats(profile, homeTexts, numberFormatter)
        : [],
    };
  }, [status, profile, isUserAuthenticated, homeTexts, dayPeriod, language]);

  const guestActions = (
    <>
      <Button
        variant={ButtonVariant.GHOST}
        onClick={() => navigate(HomeRoute.LOGIN)}
      >
        {homeTexts.greeting.logIn}
      </Button>
      <Button
        variant={ButtonVariant.SECONDARY}
        onClick={() => navigate(HomeRoute.REGISTER)}
      >
        {homeTexts.greeting.signUp}
      </Button>
    </>
  );
  const memberActions = (
    <Button
      variant={ButtonVariant.GHOST}
      icon={<StatsIcon fontSize='small' />}
      onClick={() => navigate(HomeRoute.STATS)}
    >
      {homeTexts.greeting.viewStats}
    </Button>
  );

  return (
    <div className='home-greeting'>
      <PageHeader
        eyebrow={todayLabel}
        title={
          viewModel.isLoading ? (
            <Skeleton width='16rem' height='2.25rem' />
          ) : (
            viewModel.title
          )
        }
        description={viewModel.description}
        actions={viewModel.isGuest ? guestActions : memberActions}
      />
      {viewModel.isLoading && (
        <div className='home-stats' aria-busy='true'>
          {STAT_SKELETON_KEYS.map((skeletonKey) => (
            <div key={skeletonKey} className='home-stats-skeleton'>
              <Skeleton width='5rem' height='0.75rem' />
              <Skeleton width='7rem' height='1.75rem' />
            </div>
          ))}
        </div>
      )}
      {viewModel.stats.length > 0 && (
        <div className='home-stats'>
          {viewModel.stats.map((stat) => (
            <StatTile
              key={stat.id}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              icon={stat.icon}
            />
          ))}
        </div>
      )}
      {viewModel.hasError && (
        <div className='home-inline-error' role='alert'>
          <span>{homeTexts.greeting.profileError}</span>
          <Button
            variant={ButtonVariant.GHOST}
            size={ButtonSize.SMALL}
            onClick={retry}
          >
            {homeTexts.greeting.retry}
          </Button>
        </div>
      )}
    </div>
  );
};

export default HomeGreeting;
