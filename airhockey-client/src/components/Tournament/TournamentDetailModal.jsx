import { EmojiEvents as TrophyIcon } from '@mui/icons-material';
import React from 'react';

import { useLanguage } from '../../../LanguageContext';
import {
  Avatar,
  AvatarSize,
  Badge,
  BadgeTone,
  Button,
  ButtonVariant,
  Modal,
  Skeleton,
} from '../ui';
import './Tournament.css';

const PARTICIPANT_SKELETON_KEYS = [
  'participant-skeleton-1',
  'participant-skeleton-2',
  'participant-skeleton-3',
];

const ParticipantsSection = ({ participants, tournamentTexts, youLabel }) => {
  if (participants.isLoading) {
    return (
      <ul className='tournament-participants' aria-busy='true'>
        {PARTICIPANT_SKELETON_KEYS.map((skeletonKey) => (
          <li key={skeletonKey} className='tournament-participant'>
            <Skeleton width='2rem' height='2rem' isRound />
            <Skeleton width='8rem' />
          </li>
        ))}
      </ul>
    );
  }
  if (participants.hasError) {
    return (
      <p className='tournament-detail-muted'>
        {tournamentTexts.detail.participantsError}
      </p>
    );
  }
  if (participants.rows.length === 0) {
    return (
      <p className='tournament-detail-muted'>
        {tournamentTexts.detail.participantsEmpty}
      </p>
    );
  }

  return (
    <ul className='tournament-participants'>
      {participants.rows.map((participant) => (
        <li key={participant.id} className='tournament-participant'>
          <Avatar name={participant.displayName} size={AvatarSize.SMALL} />
          <span className='tournament-participant-name'>
            {participant.displayName}
          </span>
          {participant.isCurrentUser && (
            <Badge tone={BadgeTone.ACCENT}>{youLabel}</Badge>
          )}
          {participant.eloLabel && (
            <span className='tournament-participant-elo'>
              {participant.eloLabel}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

const TournamentDetailModal = ({ card, participants, onClose, onJoin }) => {
  const { translations } = useLanguage();
  const tournamentTexts = translations.competitive.tournaments;

  return (
    <Modal
      isOpen={Boolean(card)}
      title={card?.name ?? ''}
      onClose={onClose}
      footer={
        card && (
          <>
            <Button variant={ButtonVariant.SECONDARY} onClick={onClose}>
              {tournamentTexts.actions.close}
            </Button>
            {(card.isJoinable || card.isJoining) && (
              <Button isLoading={card.isJoining} onClick={() => onJoin(card)}>
                {card.joinLabel}
              </Button>
            )}
          </>
        )
      }
    >
      {card && (
        <div className='tournament-detail'>
          <p>{card.description}</p>

          <dl className='tournament-detail-facts'>
            <div>
              <dt>{tournamentTexts.fields.format}</dt>
              <dd>{card.formatLabel}</dd>
            </div>
            <div>
              <dt>{tournamentTexts.fields.players}</dt>
              <dd>{card.playersLabel}</dd>
            </div>
            <div>
              <dt>{tournamentTexts.fields.start}</dt>
              <dd>{card.startLabel}</dd>
            </div>
            <div>
              <dt>{tournamentTexts.fields.end}</dt>
              <dd>{card.endLabel}</dd>
            </div>
          </dl>

          {card.hasPrizes && (
            <section className='tournament-detail-section'>
              <h3 className='tournament-detail-heading'>
                {tournamentTexts.detail.prizes}
              </h3>
              <ul className='tournament-prizes'>
                {card.prizeRows.map((prizeRow) => (
                  <li
                    key={prizeRow.place}
                    className={`tournament-prize tournament-prize-${prizeRow.place}`}
                  >
                    <TrophyIcon aria-hidden='true' />
                    <span className='tournament-prize-place'>
                      {prizeRow.placeLabel}
                    </span>
                    <span>{prizeRow.prizeLabel}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className='tournament-detail-section'>
            <h3 className='tournament-detail-heading'>
              {tournamentTexts.detail.participants}
            </h3>
            <ParticipantsSection
              participants={participants}
              tournamentTexts={tournamentTexts}
              youLabel={translations.competitive.common.you}
            />
          </section>
        </div>
      )}
    </Modal>
  );
};

export default TournamentDetailModal;
