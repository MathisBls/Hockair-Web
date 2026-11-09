import {
  Check as AcceptIcon,
  ErrorOutline as ErrorIcon,
  PersonAddAlt1 as AddIcon,
  PersonSearchOutlined as SearchIdleIcon,
  Search as SearchIcon,
  SearchOff as NoResultIcon,
} from '@mui/icons-material';
import React, { useEffect, useMemo, useState } from 'react';

import {
  Badge,
  BadgeTone,
  Button,
  ButtonSize,
  ButtonVariant,
  EmptyState,
  TextField,
} from '../../components/ui';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';

import { searchUsers } from './friendsApi';
import {
  LoadStatus,
  MINIMUM_SEARCH_LENGTH,
  SEARCH_DEBOUNCE_MS,
  SearchRelation,
} from './socialConstants';
import { useDebouncedValue } from './socialHooks';
import { UserRow, UserRowSkeletonList } from './UserRow';
import { buildUserRowModel } from './userRowModel';

const RELATION_BADGE_TONE = Object.freeze({
  [SearchRelation.FRIEND]: BadgeTone.SUCCESS,
  [SearchRelation.INCOMING_REQUEST]: BadgeTone.ACCENT,
  [SearchRelation.REQUEST_SENT]: BadgeTone.NEUTRAL,
  [SearchRelation.BLOCKED]: BadgeTone.NEUTRAL,
});

const resolveSearchRelation = (userId, relationIds) => {
  if (relationIds.friendIds.has(userId)) {
    return SearchRelation.FRIEND;
  }
  if (relationIds.blockedIds.has(userId)) {
    return SearchRelation.BLOCKED;
  }
  if (relationIds.incomingRequestIds.has(userId)) {
    return SearchRelation.INCOMING_REQUEST;
  }
  if (relationIds.sentRequestIds.has(userId)) {
    return SearchRelation.REQUEST_SENT;
  }

  return SearchRelation.NONE;
};

const AddFriendPanel = ({
  text,
  relationIds,
  currentUserId,
  busyUserId,
  onAdd,
  onAccept,
}) => {
  const [query, setQuery] = useState('');
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [searchState, setSearchState] = useState({
    status: LoadStatus.IDLE,
    users: [],
  });
  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    if (debouncedQuery.length < MINIMUM_SEARCH_LENGTH) {
      setSearchState({ status: LoadStatus.IDLE, users: [] });

      return undefined;
    }
    let isCurrent = true;
    setSearchState((previousState) => ({
      status: LoadStatus.LOADING,
      users: previousState.users,
    }));
    searchUsers(debouncedQuery)
      .then((users) => {
        if (isCurrent) {
          setSearchState({ status: LoadStatus.READY, users });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setSearchState({ status: LoadStatus.ERROR, users: [] });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [debouncedQuery, searchAttempt]);

  const resultRows = useMemo(
    () =>
      searchState.users
        .filter((user) => user._id !== currentUserId)
        .map((user) => {
          const relation = resolveSearchRelation(user._id, relationIds);

          return {
            ...buildUserRowModel(user, text),
            canAdd: relation === SearchRelation.NONE,
            canAccept: relation === SearchRelation.INCOMING_REQUEST,
            badgeLabel: text.badges[relation] ?? null,
            badgeTone: RELATION_BADGE_TONE[relation] ?? BadgeTone.NEUTRAL,
            isBusy: user._id === busyUserId,
          };
        }),
    [searchState.users, currentUserId, relationIds, text, busyUserId]
  );

  const retrySearch = () => setSearchAttempt((attempt) => attempt + 1);

  const renderResults = () => {
    if (searchState.status === LoadStatus.IDLE) {
      return (
        <EmptyState
          icon={<SearchIdleIcon />}
          title={text.empty.searchIdle.title}
          description={formatTranslation(text.empty.searchIdle.description, {
            count: MINIMUM_SEARCH_LENGTH,
          })}
        />
      );
    }
    if (searchState.status === LoadStatus.LOADING) {
      return <UserRowSkeletonList />;
    }
    if (searchState.status === LoadStatus.ERROR) {
      return (
        <EmptyState
          icon={<ErrorIcon />}
          title={text.errors.search.title}
          description={text.errors.search.description}
          action={
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SMALL}
              onClick={retrySearch}
            >
              {text.actions.retry}
            </Button>
          }
        />
      );
    }
    if (resultRows.length === 0) {
      return (
        <EmptyState
          icon={<NoResultIcon />}
          title={text.empty.searchNoResult.title}
          description={formatTranslation(
            text.empty.searchNoResult.description,
            { query: debouncedQuery }
          )}
        />
      );
    }

    return (
      <>
        <div className='social-panel-toolbar'>
          <span className='social-panel-summary' aria-live='polite'>
            {formatPluralTranslation(text.searchResultCount, resultRows.length)}
          </span>
        </div>
        <ul className='social-list'>
          {resultRows.map((row) => (
            <UserRow
              key={row.id}
              row={row}
              badge={
                row.badgeLabel && (
                  <Badge tone={row.badgeTone}>{row.badgeLabel}</Badge>
                )
              }
              actions={
                <>
                  {row.canAdd && (
                    <Button
                      variant={ButtonVariant.SECONDARY}
                      size={ButtonSize.SMALL}
                      icon={<AddIcon />}
                      isLoading={row.isBusy}
                      onClick={() => onAdd(row)}
                    >
                      {text.actions.add}
                    </Button>
                  )}
                  {row.canAccept && (
                    <Button
                      size={ButtonSize.SMALL}
                      icon={<AcceptIcon />}
                      isLoading={row.isBusy}
                      onClick={() => onAccept(row)}
                    >
                      {text.actions.accept}
                    </Button>
                  )}
                </>
              }
            />
          ))}
        </ul>
      </>
    );
  };

  return (
    <section className='social-panel'>
      <div className='social-search'>
        <TextField
          label={text.searchLabel}
          type='search'
          icon={<SearchIcon fontSize='small' />}
          placeholder={text.searchPlaceholder}
          hint={formatTranslation(text.searchHint, {
            count: MINIMUM_SEARCH_LENGTH,
          })}
          value={query}
          autoComplete='off'
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {renderResults()}
    </section>
  );
};

export default AddFriendPanel;
