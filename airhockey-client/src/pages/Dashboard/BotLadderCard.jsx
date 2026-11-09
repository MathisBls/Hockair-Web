import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import BotAvatar from '../../components/BotAvatar/BotAvatar';
import {
  Badge,
  BadgeTone,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  ProgressBar,
} from '../../components/ui';
import { BOTS } from '../../game/bots';
import { getBeatenBotIds } from '../../game/progress';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';

import { BotAvatarSize, buildQuickMatchPath } from './homeData';

const LadderStepStatus = Object.freeze({
  BEATEN: 'beaten',
  NEXT: 'next',
  PENDING: 'pending',
});

const BADGE_TONE_BY_STEP_STATUS = {
  [LadderStepStatus.BEATEN]: BadgeTone.SUCCESS,
  [LadderStepStatus.NEXT]: BadgeTone.ACCENT,
  [LadderStepStatus.PENDING]: BadgeTone.NEUTRAL,
};

const getStepStatus = (botId, beatenBotIds, nextBotId) => {
  if (beatenBotIds.includes(botId)) {
    return LadderStepStatus.BEATEN;
  }

  return botId === nextBotId ? LadderStepStatus.NEXT : LadderStepStatus.PENDING;
};

const BotLadderCard = () => {
  const { translations } = useLanguage();
  const navigate = useNavigate();
  const ladderTexts = translations.page.home.ladder;
  const heroTexts = translations.page.home.hero;
  const [beatenBotIds] = useState(getBeatenBotIds);

  const viewModel = useMemo(() => {
    const nextBot = BOTS.find((bot) => !beatenBotIds.includes(bot.id));
    const beatenCount = BOTS.filter((bot) =>
      beatenBotIds.includes(bot.id)
    ).length;
    const statusLabels = {
      [LadderStepStatus.BEATEN]: ladderTexts.beaten,
      [LadderStepStatus.NEXT]: ladderTexts.nextTarget,
      [LadderStepStatus.PENDING]: ladderTexts.toBeat,
    };

    return {
      isComplete: !nextBot,
      progressRatio: beatenCount / BOTS.length,
      progressLabel: formatPluralTranslation(
        ladderTexts.progress,
        beatenCount,
        {
          total: BOTS.length,
        }
      ),
      steps: BOTS.map((bot) => {
        const status = getStepStatus(bot.id, beatenBotIds, nextBot?.id);

        return {
          bot,
          status,
          isBeaten: status === LadderStepStatus.BEATEN,
          isNext: status === LadderStepStatus.NEXT,
          name: translations.bots[bot.id]?.name ?? bot.id,
          tierLabel: heroTexts.tiers[bot.tier],
          ratingLabel: formatTranslation(heroTexts.rating, {
            rating: bot.rating,
          }),
          statusLabel: statusLabels[status],
          badgeTone: BADGE_TONE_BY_STEP_STATUS[status],
          actionLabel:
            status === LadderStepStatus.BEATEN
              ? ladderTexts.rematch
              : ladderTexts.challenge,
          actionVariant:
            status === LadderStepStatus.NEXT
              ? ButtonVariant.SECONDARY
              : ButtonVariant.GHOST,
          path: buildQuickMatchPath(bot.id),
        };
      }),
    };
  }, [beatenBotIds, ladderTexts, heroTexts, translations]);

  return (
    <Card title={ladderTexts.title} subtitle={ladderTexts.subtitle}>
      <div className='home-ladder-progress'>
        <span className='home-ladder-progress-label'>
          {viewModel.progressLabel}
        </span>
        <ProgressBar
          ratio={viewModel.progressRatio}
          label={viewModel.progressLabel}
        />
      </div>
      <ol className='home-ladder-list'>
        {viewModel.steps.map((step) => (
          <li
            key={step.bot.id}
            className={`home-ladder-step ${step.isNext ? 'home-ladder-step-next' : ''}`}
          >
            <BotAvatar
              color={step.bot.color}
              accent={step.bot.accent}
              mood={step.bot.mood}
              size={BotAvatarSize.SMALL}
              isBeaten={step.isBeaten}
            />
            <div className='home-ladder-step-text'>
              <span className='home-ladder-step-name'>{step.name}</span>
              <span className='home-ladder-step-meta'>
                {step.tierLabel} · {step.ratingLabel}
              </span>
            </div>
            <Badge tone={step.badgeTone}>{step.statusLabel}</Badge>
            <Button
              variant={step.actionVariant}
              size={ButtonSize.SMALL}
              onClick={() => navigate(step.path)}
            >
              {step.actionLabel}
            </Button>
          </li>
        ))}
      </ol>
      {viewModel.isComplete && (
        <div className='home-ladder-complete'>
          <TrophyIcon className='home-ladder-complete-icon' />
          <div>
            <p className='home-ladder-complete-title'>
              {ladderTexts.completeTitle}
            </p>
            <p className='home-ladder-complete-description'>
              {ladderTexts.completeDescription}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default BotLadderCard;
