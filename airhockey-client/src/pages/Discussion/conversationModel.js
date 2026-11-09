import { buildAssetUrl } from '../../api/apiClient';
import { formatTranslation } from '../../i18n/formatTranslation';

import {
  fetchChatList,
  fetchConversationMessages,
  fetchLatestMessages,
} from './messagesApi';

export const CONVERSATION_POLL_INTERVAL_MS = 5000;
export const INBOX_POLL_INTERVAL_MS = 20000;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_COMPOSER_ROWS = 5;

const MESSAGE_GROUP_WINDOW_MS = 5 * 60 * 1000;
const RECENT_WEEKDAY_SPAN_IN_DAYS = 6;
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export const TimelineItemKind = Object.freeze({
  DAY: 'day',
  GROUP: 'group',
});

const isIncomingUnreadMessage = (message, currentUserId) =>
  String(message.receiverId) === currentUserId && !message.read;

export const hasIncomingUnreadMessage = (messages, currentUserId) =>
  messages.some((message) => isIncomingUnreadMessage(message, currentUserId));

const buildConversationSummary = ({ contact, lastMessage, hasUnread }) => ({
  contactId: String(contact._id),
  username: contact.username ?? '',
  profilePicture: contact.profilePicture ?? '',
  lastMessage,
  hasUnread,
});

const loadSummariesFromLatestMessages = async (currentUserId) => {
  const latestEntries = await fetchLatestMessages();

  return latestEntries
    .filter((entry) => entry.userDetails && entry.lastMessage)
    .map((entry) =>
      buildConversationSummary({
        contact: entry.userDetails,
        lastMessage: entry.lastMessage,
        hasUnread: isIncomingUnreadMessage(entry.lastMessage, currentUserId),
      })
    );
};

const loadSummariesFromChatList = async (currentUserId) => {
  const contacts = await fetchChatList();

  return Promise.all(
    contacts.map(async (contact) => {
      const messages = await fetchConversationMessages(contact._id);

      return buildConversationSummary({
        contact,
        lastMessage: messages.at(-1) ?? null,
        hasUnread: hasIncomingUnreadMessage(messages, currentUserId),
      });
    })
  );
};

let isLatestMessagesEndpointAvailable = true;

export const loadConversationSummaries = async (currentUserId) => {
  if (!isLatestMessagesEndpointAvailable) {
    return loadSummariesFromChatList(currentUserId);
  }
  try {
    return await loadSummariesFromLatestMessages(currentUserId);
  } catch {
    isLatestMessagesEndpointAvailable = false;

    return loadSummariesFromChatList(currentUserId);
  }
};

const getStartOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const countCalendarDaysBetween = (earlierDate, laterDate) =>
  Math.round(
    (getStartOfDay(laterDate) - getStartOfDay(earlierDate)) /
      MILLISECONDS_PER_DAY
  );

const formatListTimeLabel = (sentAt, now, language) => {
  const elapsedDays = countCalendarDaysBetween(sentAt, now);
  if (elapsedDays === 0) {
    return new Intl.DateTimeFormat(language, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(sentAt);
  }
  if (elapsedDays <= RECENT_WEEKDAY_SPAN_IN_DAYS) {
    return new Intl.DateTimeFormat(language, { weekday: 'short' }).format(
      sentAt
    );
  }

  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
  }).format(sentAt);
};

const formatDayLabel = (sentAt, now, language, messagesText) => {
  const elapsedDays = countCalendarDaysBetween(sentAt, now);
  if (elapsedDays === 0) {
    return messagesText.today;
  }
  if (elapsedDays === 1) {
    return messagesText.yesterday;
  }
  const isSameYear = sentAt.getFullYear() === now.getFullYear();

  return new Intl.DateTimeFormat(language, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: isSameYear ? undefined : 'numeric',
  }).format(sentAt);
};

const buildListItemClassName = (isSelected, hasUnread) =>
  [
    'messenger-item',
    isSelected ? 'messenger-item-selected' : '',
    hasUnread ? 'messenger-item-unread' : '',
  ]
    .filter(Boolean)
    .join(' ');

const buildConversationPreview = (lastMessage, currentUserId, messagesText) =>
  String(lastMessage.senderId) === currentUserId
    ? formatTranslation(messagesText.ownPreview, {
        content: lastMessage.content,
      })
    : lastMessage.content;

export const buildConversationListSections = ({
  summaries,
  friends,
  selectedContactId,
  filterQuery,
  currentUserId,
  language,
  messagesText,
}) => {
  const now = new Date();
  const normalizedFilter = filterQuery.trim().toLowerCase();
  const matchesFilter = (username) =>
    username.toLowerCase().includes(normalizedFilter);

  const recentConversations = summaries
    .filter((summary) => summary.lastMessage)
    .sort(
      (firstSummary, secondSummary) =>
        new Date(secondSummary.lastMessage.createdAt) -
        new Date(firstSummary.lastMessage.createdAt)
    );
  const contactIdsWithMessages = new Set(
    recentConversations.map((summary) => summary.contactId)
  );

  const recentItems = recentConversations
    .filter((summary) => matchesFilter(summary.username))
    .map((summary) => {
      const isSelected = summary.contactId === selectedContactId;
      const hasUnread = summary.hasUnread && !isSelected;

      return {
        contactId: summary.contactId,
        username: summary.username,
        avatarUrl: buildAssetUrl(summary.profilePicture),
        preview: buildConversationPreview(
          summary.lastMessage,
          currentUserId,
          messagesText
        ),
        timeLabel: formatListTimeLabel(
          new Date(summary.lastMessage.createdAt),
          now,
          language
        ),
        hasUnread,
        ariaCurrent: isSelected ? 'page' : undefined,
        className: buildListItemClassName(isSelected, hasUnread),
      };
    });

  const friendItems = friends
    .filter((friend) => !contactIdsWithMessages.has(String(friend._id)))
    .filter((friend) => matchesFilter(friend.username ?? ''))
    .map((friend) => {
      const contactId = String(friend._id);
      const isSelected = contactId === selectedContactId;

      return {
        contactId,
        username: friend.username ?? '',
        avatarUrl: buildAssetUrl(friend.profilePicture),
        preview: messagesText.noMessagePreview,
        timeLabel: '',
        hasUnread: false,
        ariaCurrent: isSelected ? 'page' : undefined,
        className: buildListItemClassName(isSelected, false),
      };
    });

  return {
    recentItems,
    friendItems,
    hasAnyContact: recentConversations.length + friends.length > 0,
  };
};

export const resolveSelectedContact = ({
  selectedContactId,
  summaries,
  friends,
  friendsText,
}) => {
  if (!selectedContactId) {
    return null;
  }
  const friend = friends.find(
    (candidate) => String(candidate._id) === selectedContactId
  );
  const summary = summaries.find(
    (candidate) => candidate.contactId === selectedContactId
  );
  if (!friend && !summary) {
    return null;
  }

  return {
    contactId: selectedContactId,
    username: friend?.username ?? summary?.username ?? '',
    avatarUrl: buildAssetUrl(friend?.profilePicture ?? summary?.profilePicture),
    meta: friend
      ? formatTranslation(friendsText.userMeta, {
          elo: friend.elo,
          level: friend.level,
        })
      : null,
  };
};

const buildGroupClassName = (isOwn) =>
  `messenger-group ${isOwn ? 'messenger-group-own' : 'messenger-group-other'}`;

export const buildMessageTimeline = ({
  messages,
  currentUserId,
  language,
  messagesText,
}) => {
  const now = new Date();
  const timeFormatter = new Intl.DateTimeFormat(language, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const fullDateFormatter = new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const timelineItems = [];
  let currentDayKey = null;
  let currentGroup = null;

  messages.forEach((message) => {
    const sentAt = new Date(message.createdAt);
    const dayKey = sentAt.toDateString();
    const isOwn = String(message.senderId) === currentUserId;

    if (dayKey !== currentDayKey) {
      currentDayKey = dayKey;
      currentGroup = null;
      timelineItems.push({
        kind: TimelineItemKind.DAY,
        key: `day-${dayKey}`,
        label: formatDayLabel(sentAt, now, language, messagesText),
      });
    }

    const canJoinCurrentGroup =
      currentGroup !== null &&
      currentGroup.isOwn === isOwn &&
      sentAt - currentGroup.lastSentAt <= MESSAGE_GROUP_WINDOW_MS;

    if (!canJoinCurrentGroup) {
      currentGroup = {
        kind: TimelineItemKind.GROUP,
        key: `group-${message._id}`,
        isOwn,
        className: buildGroupClassName(isOwn),
        messages: [],
        lastSentAt: sentAt,
        timeLabel: '',
        receiptLabel: null,
      };
      timelineItems.push(currentGroup);
    }

    currentGroup.messages.push({
      id: message._id,
      content: message.content,
      fullDateLabel: fullDateFormatter.format(sentAt),
      isDeletable: isOwn,
    });
    currentGroup.lastSentAt = sentAt;
    currentGroup.timeLabel = timeFormatter.format(sentAt);
  });

  const lastMessage = messages.at(-1);
  const isLastMessageSeen =
    lastMessage !== undefined &&
    String(lastMessage.senderId) === currentUserId &&
    lastMessage.read;
  if (isLastMessageSeen && currentGroup) {
    currentGroup.receiptLabel = messagesText.seen;
  }

  return timelineItems;
};
