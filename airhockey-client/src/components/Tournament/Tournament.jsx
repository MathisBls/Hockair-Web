import {
  CalendarMonth as CalendarIcon,
  CheckCircle as JoinedIcon,
  EmojiEvents as TrophyIcon,
  Groups as PlayersIcon,
  WorkspacePremium as PremiumIcon,
} from '@mui/icons-material';
import React from 'react';

import { useLanguage } from '../../../LanguageContext';
import { Badge, BadgeTone, Button, ButtonVariant, ProgressBar } from '../ui';
import './Tournament.css';

const TournamentJoinButton = ({ card, onJoin }) =>
  card.isJoinable || card.isJoining ? (
    <Button isLoading={card.isJoining} onClick={() => onJoin(card)}>
      {card.joinLabel}
    </Button>
  ) : (
    <span className={`tournament-join-state tournament-join-${card.joinState}`}>
      {card.isJoined && <JoinedIcon aria-hidden='true' />}
      {card.joinLabel}
    </span>
  );

const Tournament = ({ card, onJoin, onOpenDetails }) => {
  const { translations } = useLanguage();
  const tournamentTexts = translations.competitive.tournaments;

  return (
    <article className='tournament-card'>
      <header className='tournament-card-header'>
        <div className='tournament-card-badges'>
          <Badge>{card.typeLabel}</Badge>
          {card.isPremium && (
            <Badge tone={BadgeTone.WARNING} icon={<PremiumIcon />}>
              {tournamentTexts.premium}
            </Badge>
          )}
        </div>
        <h3 className='tournament-card-name'>{card.name}</h3>
        <p className='tournament-card-description'>{card.description}</p>
      </header>

      <dl className='tournament-card-facts'>
        <div className='tournament-card-fact'>
          <dt>{tournamentTexts.fields.format}</dt>
          <dd>{card.formatLabel}</dd>
        </div>
        <div className='tournament-card-fact'>
          <dt>
            <CalendarIcon aria-hidden='true' />
            {tournamentTexts.fields.start}
          </dt>
          <dd>{card.startLabel}</dd>
        </div>
        <div className='tournament-card-fact'>
          <dt>
            <TrophyIcon aria-hidden='true' className='tournament-prize-icon' />
            {tournamentTexts.fields.prize}
          </dt>
          <dd>{card.prizeLabel}</dd>
        </div>
      </dl>

      <div className='tournament-card-players'>
        <div className='tournament-card-players-text'>
          <span>
            <PlayersIcon aria-hidden='true' />
            {card.playersLabel}
          </span>
          {card.spotsLeftLabel && (
            <span className='tournament-card-spots'>{card.spotsLeftLabel}</span>
          )}
        </div>
        <ProgressBar
          ratio={card.fillRatio}
          label={tournamentTexts.fields.players}
        />
      </div>

      <div className='tournament-card-footer'>
        <Button
          variant={ButtonVariant.GHOST}
          onClick={() => onOpenDetails(card)}
        >
          {tournamentTexts.actions.details}
        </Button>
        <TournamentJoinButton card={card} onJoin={onJoin} />
      </div>
    </article>
  );
};

export default Tournament;
