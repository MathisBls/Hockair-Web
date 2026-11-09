import { PlayArrow as PlayIcon } from '@mui/icons-material';
import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import BotAvatar from '../../components/BotAvatar/BotAvatar';
import { Button, ButtonSize, Card } from '../../components/ui';
import { BOT_TIERS, findBot } from '../../game/bots';
import { formatTranslation } from '../../i18n/formatTranslation';

import {
  BotAvatarSize,
  buildQuickMatchPath,
  HomeRoute,
  QUICK_PLAY_BOT_ID_BY_TIER,
} from './homeData';

const TableIllustration = () => (
  <svg
    className='home-hero-table'
    viewBox='0 0 120 200'
    role='img'
    aria-hidden='true'
  >
    <rect
      x={4}
      y={4}
      width={112}
      height={192}
      rx={18}
      className='home-hero-table-rail'
    />
    <rect
      x={12}
      y={12}
      width={96}
      height={176}
      rx={12}
      className='home-hero-table-surface'
    />
    <line x1={12} y1={100} x2={108} y2={100} className='home-hero-table-line' />
    <circle cx={60} cy={100} r={18} className='home-hero-table-line' />
    <path d='M38 12 A22 22 0 0 0 82 12' className='home-hero-table-line' />
    <path d='M38 188 A22 22 0 0 1 82 188' className='home-hero-table-line' />
    <rect
      x={42}
      y={8}
      width={36}
      height={5}
      rx={2}
      className='home-hero-table-goal-opponent'
    />
    <rect
      x={42}
      y={187}
      width={36}
      height={5}
      rx={2}
      className='home-hero-table-goal-player'
    />
    <circle
      cx={60}
      cy={44}
      r={10}
      className='home-hero-table-mallet-opponent'
    />
    <circle cx={74} cy={128} r={5} className='home-hero-table-puck' />
    <circle cx={52} cy={158} r={10} className='home-hero-table-mallet-player' />
  </svg>
);

const PlayHeroCard = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const heroTexts = translations.page.home.hero;

  const quickPlayOptions = useMemo(
    () =>
      BOT_TIERS.map((tier) => {
        const bot = findBot(QUICK_PLAY_BOT_ID_BY_TIER[tier]);
        const botName = translations.bots[bot.id]?.name ?? bot.id;

        return {
          tier,
          bot,
          botName,
          tierLabel: heroTexts.tiers[tier],
          ratingLabel: formatTranslation(heroTexts.rating, {
            rating: bot.rating,
          }),
          ariaLabel: formatTranslation(heroTexts.quickPlayAriaLabel, {
            bot: botName,
          }),
          path: buildQuickMatchPath(bot.id),
        };
      }),
    [translations, heroTexts]
  );

  return (
    <Card className='home-hero' isPadded={false}>
      <div className='home-hero-main'>
        <div className='home-hero-text'>
          <span className='ui-eyebrow'>{heroTexts.eyebrow}</span>
          <h2 className='home-hero-title'>{heroTexts.title}</h2>
          <p className='home-hero-description'>{heroTexts.description}</p>
          <Button
            size={ButtonSize.LARGE}
            icon={<PlayIcon />}
            className='home-hero-cta'
            onClick={() => navigate(HomeRoute.PLAY)}
          >
            {heroTexts.play}
          </Button>
        </div>
        <TableIllustration />
      </div>
      <div className='home-hero-quick'>
        <h3 className='home-section-label'>{heroTexts.quickPlayTitle}</h3>
        <ul className='home-quick-list'>
          {quickPlayOptions.map((option) => (
            <li key={option.tier}>
              <Link
                to={option.path}
                className='home-quick-option'
                aria-label={option.ariaLabel}
              >
                <BotAvatar
                  color={option.bot.color}
                  accent={option.bot.accent}
                  mood={option.bot.mood}
                  size={BotAvatarSize.SMALL}
                />
                <span className='home-quick-option-text'>
                  <span className='home-quick-option-tier'>
                    {option.tierLabel}
                  </span>
                  <span className='home-quick-option-meta'>
                    {option.botName} · {option.ratingLabel}
                  </span>
                </span>
                <PlayIcon className='home-quick-option-icon' fontSize='small' />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default PlayHeroCard;
