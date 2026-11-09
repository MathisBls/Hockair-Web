import {
  ErrorOutline as ErrorIcon,
  ForumOutlined as NoConversationIcon,
  Search as SearchIcon,
  SearchOff as NoResultIcon,
} from '@mui/icons-material';
import React from 'react';
import { Link } from 'react-router-dom';

import {
  Avatar,
  Button,
  ButtonSize,
  ButtonVariant,
  EmptyState,
  Skeleton,
  TextField,
} from '../../components/ui';
import { formatTranslation } from '../../i18n/formatTranslation';
import {
  buildConversationRoute,
  SKELETON_ROW_COUNT,
} from '../Friends/socialConstants';

const SKELETON_ITEM_KEYS = Array.from(
  { length: SKELETON_ROW_COUNT },
  (_, itemIndex) => `conversation-skeleton-${itemIndex}`
);

const ConversationSection = ({ title, items, unreadLabel }) => (
  <section className='messenger-section'>
    <h2 className='messenger-section-title'>{title}</h2>
    <ul className='messenger-items'>
      {items.map((item) => (
        <li key={item.contactId}>
          <Link
            to={buildConversationRoute(item.contactId)}
            className={item.className}
            aria-current={item.ariaCurrent}
          >
            <Avatar name={item.username} imageUrl={item.avatarUrl} />
            <span className='messenger-item-text'>
              <span className='messenger-item-top'>
                <span className='messenger-item-name'>{item.username}</span>
                <span className='messenger-item-time'>{item.timeLabel}</span>
              </span>
              <span className='messenger-item-preview'>{item.preview}</span>
            </span>
            {item.hasUnread && (
              <span
                className='messenger-unread-dot'
                role='img'
                aria-label={unreadLabel}
              />
            )}
          </Link>
        </li>
      ))}
    </ul>
  </section>
);

const ConversationListSkeleton = () => (
  <ul className='messenger-items' aria-hidden='true'>
    {SKELETON_ITEM_KEYS.map((itemKey) => (
      <li key={itemKey} className='messenger-item'>
        <Skeleton width='2.5rem' height='2.5rem' isRound />
        <span className='messenger-item-text'>
          <Skeleton width='60%' height='0.875rem' />
          <Skeleton width='85%' height='0.75rem' />
        </span>
      </li>
    ))}
  </ul>
);

const ConversationList = ({
  text,
  sections,
  filterQuery,
  onFilterChange,
  onRetry,
  onFindFriends,
  isLoading,
  hasLoadError,
}) => {
  const hasVisibleItems =
    sections.recentItems.length + sections.friendItems.length > 0;

  const renderBody = () => {
    if (isLoading) {
      return <ConversationListSkeleton />;
    }
    if (hasLoadError && !sections.hasAnyContact) {
      return (
        <EmptyState
          icon={<ErrorIcon />}
          title={text.listError.title}
          description={text.listError.description}
          action={
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SMALL}
              onClick={onRetry}
            >
              {text.listError.action}
            </Button>
          }
        />
      );
    }
    if (!sections.hasAnyContact) {
      return (
        <EmptyState
          icon={<NoConversationIcon />}
          title={text.emptyList.title}
          description={text.emptyList.description}
          action={
            <Button size={ButtonSize.SMALL} onClick={onFindFriends}>
              {text.emptyList.action}
            </Button>
          }
        />
      );
    }
    if (!hasVisibleItems) {
      return (
        <EmptyState
          icon={<NoResultIcon />}
          title={text.noFilterResult.title}
          description={formatTranslation(text.noFilterResult.description, {
            query: filterQuery.trim(),
          })}
        />
      );
    }

    return (
      <>
        {sections.recentItems.length > 0 && (
          <ConversationSection
            title={text.sections.recent}
            items={sections.recentItems}
            unreadLabel={text.unreadLabel}
          />
        )}
        {sections.friendItems.length > 0 && (
          <ConversationSection
            title={text.sections.friends}
            items={sections.friendItems}
            unreadLabel={text.unreadLabel}
          />
        )}
      </>
    );
  };

  return (
    <aside className='messenger-sidebar' aria-label={text.conversationsLabel}>
      <div className='messenger-sidebar-search'>
        <TextField
          type='search'
          icon={<SearchIcon fontSize='small' />}
          aria-label={text.filterLabel}
          placeholder={text.filterPlaceholder}
          value={filterQuery}
          onChange={(event) => onFilterChange(event.target.value)}
        />
      </div>
      <div className='messenger-sidebar-body'>{renderBody()}</div>
    </aside>
  );
};

export default ConversationList;
