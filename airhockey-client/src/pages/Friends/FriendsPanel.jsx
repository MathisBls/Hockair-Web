import {
  Block as BlockIcon,
  ChatBubbleOutline as MessageIcon,
  PeopleOutline as FriendsIcon,
  PersonRemoveOutlined as RemoveIcon,
  Search as SearchIcon,
  SearchOff as NoResultIcon,
  SportsHockey as ChallengeIcon,
} from '@mui/icons-material';
import React from 'react';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  EmptyState,
  TextField,
} from '../../components/ui';
import { formatTranslation } from '../../i18n/formatTranslation';

import FriendActionsMenu from './FriendActionsMenu';
import RemoteListBody from './RemoteListBody';
import { ConfirmableFriendAction } from './socialConstants';
import { UserRow } from './UserRow';

const DANGER_MENU_ITEM_CLASS = 'social-menu-item social-menu-item-danger';

const FriendsPanel = ({
  text,
  listState,
  rows,
  summary,
  filterQuery,
  onFilterChange,
  onMessage,
  onChallenge,
  onConfirmAction,
  onFindFriends,
}) => {
  const normalizedFilter = filterQuery.trim();
  const hasActiveFilter = normalizedFilter.length > 0;
  const hasFriends = listState.items.length > 0;

  const buildMenuItems = (row) => [
    {
      key: ConfirmableFriendAction.REMOVE,
      label: text.actions.remove,
      icon: <RemoveIcon />,
      className: DANGER_MENU_ITEM_CLASS,
      onSelect: () => onConfirmAction(ConfirmableFriendAction.REMOVE, row),
    },
    {
      key: ConfirmableFriendAction.BLOCK,
      label: text.actions.block,
      icon: <BlockIcon />,
      className: DANGER_MENU_ITEM_CLASS,
      onSelect: () => onConfirmAction(ConfirmableFriendAction.BLOCK, row),
    },
  ];

  const emptyState = hasActiveFilter ? (
    <EmptyState
      icon={<NoResultIcon />}
      title={text.empty.filter.title}
      description={formatTranslation(text.empty.filter.description, {
        query: normalizedFilter,
      })}
    />
  ) : (
    <EmptyState
      icon={<FriendsIcon />}
      title={text.empty.friends.title}
      description={text.empty.friends.description}
      action={
        <Button size={ButtonSize.SMALL} onClick={onFindFriends}>
          {text.empty.friends.action}
        </Button>
      }
    />
  );

  return (
    <section className='social-panel'>
      {hasFriends && (
        <div className='social-panel-toolbar'>
          <span className='social-panel-summary'>{summary}</span>
          <TextField
            className='social-filter'
            type='search'
            icon={<SearchIcon fontSize='small' />}
            aria-label={text.filterLabel}
            placeholder={text.filterPlaceholder}
            value={filterQuery}
            onChange={(event) => onFilterChange(event.target.value)}
          />
        </div>
      )}
      <RemoteListBody
        status={listState.status}
        isEmpty={rows.length === 0}
        emptyState={emptyState}
        errorText={text.errors.load}
        retryLabel={text.actions.retry}
        onRetry={listState.retry}
      >
        {rows.map((row) => (
          <UserRow
            key={row.id}
            row={row}
            actions={
              <>
                <Button
                  variant={ButtonVariant.SECONDARY}
                  size={ButtonSize.SMALL}
                  icon={<MessageIcon />}
                  onClick={() => onMessage(row)}
                >
                  {text.actions.message}
                </Button>
                <Button
                  variant={ButtonVariant.GHOST}
                  size={ButtonSize.SMALL}
                  icon={<ChallengeIcon />}
                  onClick={onChallenge}
                >
                  {text.actions.challenge}
                </Button>
                <FriendActionsMenu
                  label={row.moreActionsLabel}
                  items={buildMenuItems(row)}
                />
              </>
            }
          />
        ))}
      </RemoteListBody>
    </section>
  );
};

export default FriendsPanel;
