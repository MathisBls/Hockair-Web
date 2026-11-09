import {
  ForumOutlined as MessagesIcon,
  PersonAddAlt1 as AddFriendIcon,
} from '@mui/icons-material';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { ApiError } from '../../api/apiClient';
import Toast from '../../components/Toast/Toast';
import {
  Button,
  ButtonVariant,
  Modal,
  PageContainer,
  PageHeader,
  Tabs,
} from '../../components/ui';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';

import AddFriendPanel from './AddFriendPanel';
import BlockedPanel from './BlockedPanel';
import {
  acceptFriendRequest,
  blockFriend,
  declineFriendRequest,
  deleteFriend,
  fetchBlockedUsers,
  fetchFriendRequests,
  fetchFriends,
  sendFriendRequest,
  unblockFriend,
} from './friendsApi';
import FriendsPanel from './FriendsPanel';
import RequestsPanel from './RequestsPanel';
import {
  buildConversationRoute,
  ConfirmableFriendAction,
  FriendsTab,
  HttpStatus,
  INBOX_ROUTE,
  LoadStatus,
  PLAY_ROUTE,
  TAB_QUERY_PARAM,
  ToastType,
} from './socialConstants';
import { useCurrentUser, useRemoteList, useToast } from './socialHooks';
import { buildUserRowModel, matchesUsernameFilter } from './userRowModel';
import './Friends.css';

const FRIENDS_TAB_VALUES = Object.values(FriendsTab);

const resolveFriendsTab = (requestedTab) =>
  FRIENDS_TAB_VALUES.includes(requestedTab) ? requestedTab : FriendsTab.FRIENDS;

const buildIdSet = (users) => new Set(users.map((user) => user._id));

const buildCountWhenReady = (listState) =>
  listState.status === LoadStatus.READY ? listState.items.length : undefined;

const Friends = () => {
  const { translations } = useLanguage();
  const text = translations.social.friends;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveFriendsTab(searchParams.get(TAB_QUERY_PARAM));

  const friendsList = useRemoteList(fetchFriends);
  const requestsList = useRemoteList(fetchFriendRequests);
  const blockedList = useRemoteList(fetchBlockedUsers);
  const { currentUser } = useCurrentUser();
  const { toast, showToast } = useToast();

  const [friendsFilter, setFriendsFilter] = useState('');
  const [busyUserId, setBusyUserId] = useState(null);
  const [sentRequestIds, setSentRequestIds] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  const changeTab = useCallback(
    (tab) => setSearchParams({ [TAB_QUERY_PARAM]: tab }, { replace: true }),
    [setSearchParams]
  );

  const friendRows = useMemo(() => {
    const normalizedFilter = friendsFilter.trim().toLowerCase();

    return friendsList.items
      .map((friend) => buildUserRowModel(friend, text))
      .filter((row) => matchesUsernameFilter(row, normalizedFilter));
  }, [friendsList.items, friendsFilter, text]);

  const requestRows = useMemo(
    () =>
      requestsList.items
        .filter((request) => request.requesterId)
        .map((request) => ({
          ...buildUserRowModel(request.requesterId, text),
          isBusy: request.requesterId._id === busyUserId,
        })),
    [requestsList.items, text, busyUserId]
  );

  const blockedRows = useMemo(
    () =>
      blockedList.items.map((user) => ({
        ...buildUserRowModel(user, text),
        isBusy: user._id === busyUserId,
      })),
    [blockedList.items, text, busyUserId]
  );

  const relationIds = useMemo(
    () => ({
      friendIds: buildIdSet(friendsList.items),
      blockedIds: buildIdSet(blockedList.items),
      incomingRequestIds: buildIdSet(
        requestsList.items.map((request) => request.requesterId).filter(Boolean)
      ),
      sentRequestIds: new Set(sentRequestIds),
    }),
    [friendsList.items, blockedList.items, requestsList.items, sentRequestIds]
  );

  const tabs = useMemo(() => {
    const requestCount = buildCountWhenReady(requestsList);

    return [
      {
        value: FriendsTab.FRIENDS,
        label: text.tabs.friends,
        count: buildCountWhenReady(friendsList),
      },
      {
        value: FriendsTab.REQUESTS,
        label: text.tabs.requests,
        count: requestCount > 0 ? requestCount : undefined,
      },
      {
        value: FriendsTab.BLOCKED,
        label: text.tabs.blocked,
      },
      { value: FriendsTab.ADD, label: text.tabs.add },
    ];
  }, [text, friendsList, requestsList]);

  const summaries = useMemo(
    () => ({
      friends: formatPluralTranslation(
        text.friendCount,
        friendsList.items.length
      ),
      requests: formatPluralTranslation(text.requestCount, requestRows.length),
      blocked: formatPluralTranslation(text.blockedCount, blockedRows.length),
    }),
    [text, friendsList.items.length, requestRows.length, blockedRows.length]
  );

  const runUserAction = useCallback(
    async ({ row, request, successMessage, failureMessage, listsToReload }) => {
      setBusyUserId(row.id);
      try {
        await request(row.id);
        showToast(
          formatTranslation(successMessage, { username: row.username }),
          ToastType.SUCCESS
        );
        await Promise.all(listsToReload.map((list) => list.reload()));
      } catch {
        showToast(failureMessage, ToastType.ERROR);
      } finally {
        setBusyUserId(null);
      }
    },
    [showToast]
  );

  const acceptRequest = (row) =>
    runUserAction({
      row,
      request: acceptFriendRequest,
      successMessage: text.toasts.accepted,
      failureMessage: text.toasts.acceptFailed,
      listsToReload: [requestsList, friendsList],
    });

  const declineRequest = (row) =>
    runUserAction({
      row,
      request: declineFriendRequest,
      successMessage: text.toasts.declined,
      failureMessage: text.toasts.declineFailed,
      listsToReload: [requestsList],
    });

  const unblockUser = (row) =>
    runUserAction({
      row,
      request: unblockFriend,
      successMessage: text.toasts.unblocked,
      failureMessage: text.toasts.unblockFailed,
      listsToReload: [blockedList, friendsList],
    });

  const addFriend = async (row) => {
    setBusyUserId(row.id);
    try {
      await sendFriendRequest(row.id);
      setSentRequestIds((previousIds) => [...previousIds, row.id]);
      showToast(
        formatTranslation(text.toasts.requestSent, { username: row.username }),
        ToastType.SUCCESS
      );
    } catch (error) {
      const isAlreadySent =
        error instanceof ApiError && error.status === HttpStatus.BAD_REQUEST;
      if (isAlreadySent) {
        setSentRequestIds((previousIds) => [...previousIds, row.id]);
      }
      showToast(
        isAlreadySent
          ? formatTranslation(text.toasts.requestAlreadySent, {
              username: row.username,
            })
          : text.toasts.requestFailed,
        ToastType.ERROR
      );
    } finally {
      setBusyUserId(null);
    }
  };

  const confirmationActions = {
    [ConfirmableFriendAction.REMOVE]: {
      request: deleteFriend,
      successMessage: text.toasts.removed,
      failureMessage: text.toasts.removeFailed,
      listsToReload: [friendsList],
    },
    [ConfirmableFriendAction.BLOCK]: {
      request: blockFriend,
      successMessage: text.toasts.blocked,
      failureMessage: text.toasts.blockFailed,
      listsToReload: [friendsList, blockedList],
    },
  };

  const openConfirmation = useCallback(
    (action, row) => setPendingConfirmation({ action, row }),
    []
  );

  const closeConfirmation = useCallback(() => setPendingConfirmation(null), []);

  const confirmPendingAction = async () => {
    if (!pendingConfirmation) {
      return;
    }
    const { action, row } = pendingConfirmation;
    await runUserAction({ row, ...confirmationActions[action] });
    setPendingConfirmation(null);
  };

  const confirmationContent = useMemo(() => {
    if (!pendingConfirmation) {
      return null;
    }
    const confirmText = text.confirm[pendingConfirmation.action];
    const usernameParams = { username: pendingConfirmation.row.username };

    return {
      title: formatTranslation(confirmText.title, usernameParams),
      description: formatTranslation(confirmText.description, usernameParams),
      confirmLabel: confirmText.confirm,
      isBusy: busyUserId === pendingConfirmation.row.id,
    };
  }, [pendingConfirmation, text, busyUserId]);

  const openConversation = (row) => navigate(buildConversationRoute(row.id));
  const openPlay = () => navigate(PLAY_ROUTE);
  const openInbox = () => navigate(INBOX_ROUTE);
  const openAddFriendTab = () => changeTab(FriendsTab.ADD);

  const panelsByTab = {
    [FriendsTab.FRIENDS]: (
      <FriendsPanel
        text={text}
        listState={friendsList}
        rows={friendRows}
        summary={summaries.friends}
        filterQuery={friendsFilter}
        onFilterChange={setFriendsFilter}
        onMessage={openConversation}
        onChallenge={openPlay}
        onConfirmAction={openConfirmation}
        onFindFriends={openAddFriendTab}
      />
    ),
    [FriendsTab.REQUESTS]: (
      <RequestsPanel
        text={text}
        listState={requestsList}
        rows={requestRows}
        summary={summaries.requests}
        onAccept={acceptRequest}
        onDecline={declineRequest}
      />
    ),
    [FriendsTab.BLOCKED]: (
      <BlockedPanel
        text={text}
        listState={blockedList}
        rows={blockedRows}
        summary={summaries.blocked}
        onUnblock={unblockUser}
      />
    ),
    [FriendsTab.ADD]: (
      <AddFriendPanel
        text={text}
        relationIds={relationIds}
        currentUserId={currentUser?._id ?? null}
        busyUserId={busyUserId}
        onAdd={addFriend}
        onAccept={acceptRequest}
      />
    ),
  };

  return (
    <PageContainer className='friends-page'>
      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      )}
      <PageHeader
        eyebrow={text.eyebrow}
        title={text.title}
        description={text.description}
        actions={
          <>
            <Button
              variant={ButtonVariant.SECONDARY}
              icon={<MessagesIcon />}
              onClick={openInbox}
            >
              {text.messagesAction}
            </Button>
            <Button icon={<AddFriendIcon />} onClick={openAddFriendTab}>
              {text.tabs.add}
            </Button>
          </>
        }
      />
      <div className='friends-card'>
        <div className='friends-tabs'>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={changeTab}
            ariaLabel={text.tabsLabel}
          />
        </div>
        <div className='friends-tab-panel' role='tabpanel'>
          {panelsByTab[activeTab]}
        </div>
      </div>
      <Modal
        isOpen={Boolean(confirmationContent)}
        title={confirmationContent?.title}
        onClose={closeConfirmation}
        footer={
          <>
            <Button variant={ButtonVariant.GHOST} onClick={closeConfirmation}>
              {text.actions.cancel}
            </Button>
            <Button
              variant={ButtonVariant.DANGER}
              isLoading={confirmationContent?.isBusy}
              onClick={confirmPendingAction}
            >
              {confirmationContent?.confirmLabel}
            </Button>
          </>
        }
      >
        <p>{confirmationContent?.description}</p>
      </Modal>
    </PageContainer>
  );
};

export default Friends;
