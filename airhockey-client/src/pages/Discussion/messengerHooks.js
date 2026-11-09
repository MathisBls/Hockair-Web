import { useCallback, useEffect, useState } from 'react';

import { LoadStatus } from '../Friends/socialConstants';

import {
  CONVERSATION_POLL_INTERVAL_MS,
  hasIncomingUnreadMessage,
  INBOX_POLL_INTERVAL_MS,
  loadConversationSummaries,
} from './conversationModel';
import { fetchConversationMessages, markMessagesAsRead } from './messagesApi';

const keepReadyStatusOnFailure = (previousStatus) =>
  previousStatus === LoadStatus.READY ? LoadStatus.READY : LoadStatus.ERROR;

export const useConversationSummaries = (currentUserId) => {
  const [summariesState, setSummariesState] = useState({
    status: LoadStatus.LOADING,
    summaries: [],
  });

  const reload = useCallback(async () => {
    if (!currentUserId) {
      return;
    }
    try {
      const summaries = await loadConversationSummaries(currentUserId);
      setSummariesState({ status: LoadStatus.READY, summaries });
    } catch {
      setSummariesState((previousState) => ({
        status: keepReadyStatusOnFailure(previousState.status),
        summaries: previousState.summaries,
      }));
    }
  }, [currentUserId]);

  const retry = useCallback(() => {
    setSummariesState((previousState) => ({
      status: LoadStatus.LOADING,
      summaries: previousState.summaries,
    }));
    reload();
  }, [reload]);

  const markSummaryAsRead = useCallback((contactId) => {
    setSummariesState((previousState) => ({
      ...previousState,
      summaries: previousState.summaries.map((summary) =>
        summary.contactId === contactId
          ? { ...summary, hasUnread: false }
          : summary
      ),
    }));
  }, []);

  useEffect(() => {
    reload();
    const intervalId = setInterval(reload, INBOX_POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [reload]);

  return { ...summariesState, reload, retry, markSummaryAsRead };
};

export const useConversationMessages = (
  contactId,
  currentUserId,
  onConversationRead
) => {
  const [messagesState, setMessagesState] = useState({
    status: LoadStatus.LOADING,
    messages: [],
  });
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    if (!contactId || !currentUserId) {
      return undefined;
    }
    let isCurrent = true;

    const loadMessages = async () => {
      try {
        const messages = await fetchConversationMessages(contactId);
        if (!isCurrent) {
          return;
        }
        setMessagesState({ status: LoadStatus.READY, messages });
        if (hasIncomingUnreadMessage(messages, currentUserId)) {
          await markMessagesAsRead(contactId);
          if (isCurrent) {
            onConversationRead(contactId);
          }
        }
      } catch {
        if (isCurrent) {
          setMessagesState((previousState) => ({
            status: keepReadyStatusOnFailure(previousState.status),
            messages: previousState.messages,
          }));
        }
      }
    };

    setMessagesState({ status: LoadStatus.LOADING, messages: [] });
    loadMessages();
    const intervalId = setInterval(loadMessages, CONVERSATION_POLL_INTERVAL_MS);

    return () => {
      isCurrent = false;
      clearInterval(intervalId);
    };
  }, [contactId, currentUserId, onConversationRead, loadAttempt]);

  const appendMessage = useCallback((message) => {
    setMessagesState((previousState) => ({
      status: LoadStatus.READY,
      messages: previousState.messages.some(
        (existingMessage) => existingMessage._id === message._id
      )
        ? previousState.messages
        : [...previousState.messages, message],
    }));
  }, []);

  const removeMessage = useCallback((messageId) => {
    setMessagesState((previousState) => ({
      ...previousState,
      messages: previousState.messages.filter(
        (message) => message._id !== messageId
      ),
    }));
  }, []);

  const retry = useCallback(
    () => setLoadAttempt((previousAttempt) => previousAttempt + 1),
    []
  );

  return { ...messagesState, appendMessage, removeMessage, retry };
};
