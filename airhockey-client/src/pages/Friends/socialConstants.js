export const FriendsTab = Object.freeze({
  FRIENDS: 'friends',
  REQUESTS: 'requests',
  BLOCKED: 'blocked',
  ADD: 'add',
});

export const LoadStatus = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  ERROR: 'error',
});

export const ToastType = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
});

export const SearchRelation = Object.freeze({
  FRIEND: 'friend',
  INCOMING_REQUEST: 'incomingRequest',
  REQUEST_SENT: 'requestSent',
  BLOCKED: 'blocked',
  NONE: 'none',
});

export const ConfirmableFriendAction = Object.freeze({
  REMOVE: 'remove',
  BLOCK: 'block',
});

export const HttpStatus = Object.freeze({
  BAD_REQUEST: 400,
});

export const TAB_QUERY_PARAM = 'tab';
export const SEARCH_DEBOUNCE_MS = 300;
export const MINIMUM_SEARCH_LENGTH = 2;
export const SKELETON_ROW_COUNT = 4;

export const FRIENDS_ROUTE = '/friends';
export const INBOX_ROUTE = '/friends/chat';
export const PLAY_ROUTE = '/play';

export const buildConversationRoute = (contactId) =>
  `${INBOX_ROUTE}/${contactId}`;

export const buildFriendsTabRoute = (tab) =>
  `${FRIENDS_ROUTE}?${new URLSearchParams({ [TAB_QUERY_PARAM]: tab })}`;
