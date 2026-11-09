import {
  ErrorOutline as ErrorIcon,
  ForumOutlined as SelectConversationIcon,
  PeopleOutline as FriendsIcon,
  PersonSearchOutlined as UnknownContactIcon,
} from '@mui/icons-material';
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import Toast from '../../components/Toast/Toast';
import {
  Button,
  ButtonSize,
  ButtonVariant,
  EmptyState,
  PageContainer,
  PageHeader,
} from '../../components/ui';
import { fetchFriends } from '../Friends/friendsApi';
import {
  buildFriendsTabRoute,
  FRIENDS_ROUTE,
  FriendsTab,
  INBOX_ROUTE,
  LoadStatus,
  PLAY_ROUTE,
} from '../Friends/socialConstants';
import {
  useCurrentUser,
  useRemoteList,
  useToast,
} from '../Friends/socialHooks';

import ConversationList from './ConversationList';
import {
  buildConversationListSections,
  resolveSelectedContact,
} from './conversationModel';
import ConversationPane from './ConversationPane';
import { useConversationSummaries } from './messengerHooks';
import './Discussion.css';

const Messenger = ({ selectedContactId = null }) => {
  const { translations, language } = useLanguage();
  const text = translations.social.messages;
  const friendsText = translations.social.friends;
  const navigate = useNavigate();
  const { currentUser, status: profileStatus } = useCurrentUser();
  const currentUserId = currentUser?._id ?? null;
  const friendsList = useRemoteList(fetchFriends);
  const conversationSummaries = useConversationSummaries(currentUserId);
  const { toast, showToast } = useToast();
  const [filterQuery, setFilterQuery] = useState('');

  const isProfileUnavailable = profileStatus === LoadStatus.ERROR;
  const isListLoading =
    !isProfileUnavailable &&
    (conversationSummaries.status === LoadStatus.LOADING ||
      friendsList.status === LoadStatus.LOADING);
  const hasListLoadError =
    isProfileUnavailable ||
    conversationSummaries.status === LoadStatus.ERROR ||
    friendsList.status === LoadStatus.ERROR;

  const sections = useMemo(
    () =>
      buildConversationListSections({
        summaries: conversationSummaries.summaries,
        friends: friendsList.items,
        selectedContactId,
        filterQuery,
        currentUserId,
        language,
        messagesText: text,
      }),
    [
      conversationSummaries.summaries,
      friendsList.items,
      selectedContactId,
      filterQuery,
      currentUserId,
      language,
      text,
    ]
  );

  const selectedContact = useMemo(
    () =>
      resolveSelectedContact({
        selectedContactId,
        summaries: conversationSummaries.summaries,
        friends: friendsList.items,
        friendsText,
      }),
    [
      selectedContactId,
      conversationSummaries.summaries,
      friendsList.items,
      friendsText,
    ]
  );

  const layoutClassName = selectedContactId
    ? 'messenger-layout messenger-layout-has-selection'
    : 'messenger-layout';

  const retryLists = () => {
    conversationSummaries.retry();
    friendsList.retry();
  };
  const openInbox = () => navigate(INBOX_ROUTE);
  const openFriends = () => navigate(FRIENDS_ROUTE);
  const openFriendSearch = () => navigate(buildFriendsTabRoute(FriendsTab.ADD));
  const openPlay = () => navigate(PLAY_ROUTE);

  const renderConversation = () => {
    if (!selectedContactId) {
      return (
        <div className='messenger-placeholder'>
          <EmptyState
            icon={<SelectConversationIcon />}
            title={text.selectConversation.title}
            description={text.selectConversation.description}
          />
        </div>
      );
    }
    if (isProfileUnavailable) {
      return (
        <div className='messenger-placeholder'>
          <EmptyState
            icon={<ErrorIcon />}
            title={text.loadError.title}
            description={text.loadError.description}
          />
        </div>
      );
    }
    if (!selectedContact && isListLoading) {
      return <div className='messenger-placeholder' />;
    }
    if (!selectedContact) {
      return (
        <div className='messenger-placeholder'>
          <EmptyState
            icon={<UnknownContactIcon />}
            title={text.conversationNotFound.title}
            description={text.conversationNotFound.description}
            action={
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.SMALL}
                onClick={openInbox}
              >
                {text.conversationNotFound.action}
              </Button>
            }
          />
        </div>
      );
    }

    return (
      <ConversationPane
        key={selectedContact.contactId}
        contact={selectedContact}
        currentUserId={currentUserId}
        text={text}
        language={language}
        onConversationRead={conversationSummaries.markSummaryAsRead}
        onConversationChanged={conversationSummaries.reload}
        onBack={openInbox}
        onChallenge={openPlay}
        showToast={showToast}
      />
    );
  };

  return (
    <PageContainer isWide className='messenger-page'>
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      )}
      <PageHeader
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
        actions={
          <Button
            variant={ButtonVariant.SECONDARY}
            icon={<FriendsIcon />}
            onClick={openFriends}
          >
            {text.friendsAction}
          </Button>
        }
      />
      <div className={layoutClassName}>
        <ConversationList
          text={text}
          sections={sections}
          filterQuery={filterQuery}
          onFilterChange={setFilterQuery}
          onRetry={retryLists}
          onFindFriends={openFriendSearch}
          isLoading={isListLoading}
          hasLoadError={hasListLoadError}
        />
        <div className='messenger-main'>{renderConversation()}</div>
      </div>
    </PageContainer>
  );
};

export default Messenger;
