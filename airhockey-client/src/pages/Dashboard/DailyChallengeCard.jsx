import {
  Schedule as ClockIcon,
  MonetizationOn as CoinIcon,
  Bolt as XpIcon,
} from '@mui/icons-material';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { Button, ButtonVariant, Card } from '../../components/ui';
import { formatPluralTranslation } from '../../i18n/formatTranslation';

import { DAILY_CHALLENGES, HomeRoute } from './homeData';

const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;
const MILLISECONDS_PER_DAY = 24 * MILLISECONDS_PER_HOUR;

const getDayIndex = (date) =>
  Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
      MILLISECONDS_PER_DAY
  );

const getHoursUntilMidnight = (date) => {
  const nextMidnight = new Date(date);
  nextMidnight.setHours(24, 0, 0, 0);

  return Math.floor(
    (nextMidnight.getTime() - date.getTime()) / MILLISECONDS_PER_HOUR
  );
};

const DailyChallengeCard = () => {
  const { translations, language } = useLanguage();
  const navigate = useNavigate();
  const challengeTexts = translations.page.home.challenge;

  const viewModel = useMemo(() => {
    const now = new Date();
    const challenge =
      DAILY_CHALLENGES[getDayIndex(now) % DAILY_CHALLENGES.length];
    const challengeTranslation = challengeTexts.items[challenge.id];
    const hoursUntilReset = getHoursUntilMidnight(now);
    const numberFormatter = new Intl.NumberFormat(language);

    return {
      title: challengeTranslation.title,
      description: formatPluralTranslation(
        challengeTranslation.description,
        challenge.target
      ),
      resetLabel:
        hoursUntilReset > 0
          ? formatPluralTranslation(challengeTexts.resetsIn, hoursUntilReset)
          : challengeTexts.resetsSoon,
      coinsLabel: formatPluralTranslation(
        challengeTexts.coins,
        challenge.rewardCoins,
        { count: numberFormatter.format(challenge.rewardCoins) }
      ),
      xpLabel: formatPluralTranslation(challengeTexts.xp, challenge.rewardXp, {
        count: numberFormatter.format(challenge.rewardXp),
      }),
    };
  }, [challengeTexts, language]);

  return (
    <Card className='home-challenge'>
      <div className='home-challenge-header'>
        <span className='ui-eyebrow'>{challengeTexts.eyebrow}</span>
        <span className='home-challenge-reset'>
          <ClockIcon fontSize='inherit' />
          {viewModel.resetLabel}
        </span>
      </div>
      <h3 className='home-challenge-title'>{viewModel.title}</h3>
      <p className='home-challenge-description'>{viewModel.description}</p>
      <div className='home-challenge-reward'>
        <span className='home-challenge-reward-label'>
          {challengeTexts.reward}
        </span>
        <span className='home-challenge-reward-item'>
          <CoinIcon fontSize='inherit' className='home-challenge-coin' />
          {viewModel.coinsLabel}
        </span>
        <span className='home-challenge-reward-item'>
          <XpIcon fontSize='inherit' />
          {viewModel.xpLabel}
        </span>
      </div>
      <Button
        variant={ButtonVariant.SECONDARY}
        isFullWidth
        onClick={() => navigate(HomeRoute.CHALLENGES)}
      >
        {challengeTexts.cta}
      </Button>
    </Card>
  );
};

export default DailyChallengeCard;
