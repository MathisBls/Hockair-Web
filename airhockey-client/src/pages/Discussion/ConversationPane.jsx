import {
  ArrowBack as BackIcon,
  ChatBubbleOutline as StartConversationIcon,
  DeleteOutline as DeleteIcon,
  ErrorOutline as ErrorIcon,
  SportsHockey as ChallengeIcon,
} from '@mui/icons-material';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  Avatar,
  Button,
  ButtonSize,
  ButtonVariant,
  EmptyState,
  Modal,
  Skeleton,
} from '../../components/ui';
import { formatTranslation } from '../../i18n/formatTranslation';
import { LoadStatus, ToastType } from '../Friends/socialConstants';

import { buildMessageTimeline, TimelineItemKind } from './conversationModel';
import MessageComposer from './MessageComposer';
import { deleteMessage, postMessage } from './messagesApi';
import { useConversationMessages } from './messengerHooks';

const SCROLL_STICK_THRESHOLD_PX = 120;

const BUBBLE_SKELETONS = Object.freeze([
  { key: 'bubble-1', className: 'messenger-skeleton-other', width: '45%' },
  { key: 'bubble-2', className: 'messenger-skeleton-own', width: '35%' },
  { key: 'bubble-3', className: 'messenger-skeleton-other', width: '55%' },
  { key: 'bubble-4', className: 'messenger-skeleton-own', width: '40%' },
]);

const ConversationPane = ({
  contact,
  currentUserId,
  text,
  language,
  onConversationRead,
  onConversationChanged,
  onBack,
  onChallenge,
  showToast,
}) => {
  const { status, messages, appendMessage, removeMessage, retry } =
    useConversationMessages(
      contact.contactId,
      currentUserId,
      onConversationRead
    );
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messagePendingDeletion, setMessagePendingDeletion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const scrollAreaRef = useRef(null);
  const isNearBottomRef = useRef(true);

  const timeline = useMemo(
    () =>
      buildMessageTimeline({
        messages,
        currentUserId,
        language,
        messagesText: text,
      }),
    [messages, currentUserId, language, text]
  );

  const composerText = useMemo(
    () => ({
      label: formatTranslation(text.composer.label, {
        username: contact.username,
      }),
      placeholder: formatTranslation(text.composer.placeholder, {
        username: contact.username,
      }),
      emptyDescription: formatTranslation(text.emptyConversation.description, {
        username: contact.username,
      }),
    }),
    [text, contact.username]
  );

  const messageCount = messages.length;

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea && isNearBottomRef.current) {
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [messageCount, status]);

  const trackScrollPosition = () => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea) {
      return;
    }
    const distanceToBottom =
      scrollArea.scrollHeight - scrollArea.scrollTop - scrollArea.clientHeight;
    isNearBottomRef.current = distanceToBottom < SCROLL_STICK_THRESHOLD_PX;
  };

  const sendDraft = async () => {
    const content = draft.trim();
    if (!content || isSending) {
      return;
    }
    setIsSending(true);
    try {
      const sentMessage = await postMessage({
        receiverId: contact.contactId,
        content,
      });
      isNearBottomRef.current = true;
      appendMessage(sentMessage);
      setDraft('');
      onConversationChanged();
    } catch {
      showToast(text.toasts.sendFailed, ToastType.ERROR);
    } finally {
      setIsSending(false);
    }
  };

  const closeDeletion = () => setMessagePendingDeletion(null);

  const confirmDeletion = async () => {
    if (!messagePendingDeletion) {
      return;
    }
    setIsDeleting(true);
    try {
      await deleteMessage(messagePendingDeletion.id);
      removeMessage(messagePendingDeletion.id);
      showToast(text.toasts.deleted, ToastType.SUCCESS);
      onConversationChanged();
    } catch {
      showToast(text.toasts.deleteFailed, ToastType.ERROR);
    } finally {
      setIsDeleting(false);
      setMessagePendingDeletion(null);
    }
  };

  const renderTimeline = () => {
    if (status === LoadStatus.LOADING) {
      return (
        <div className='messenger-skeleton' aria-hidden='true'>
          {BUBBLE_SKELETONS.map((bubble) => (
            <div key={bubble.key} className={bubble.className}>
              <Skeleton width={bubble.width} height='2.25rem' />
            </div>
          ))}
        </div>
      );
    }
    if (status === LoadStatus.ERROR && messageCount === 0) {
      return (
        <EmptyState
          icon={<ErrorIcon />}
          title={text.loadError.title}
          description={text.loadError.description}
          action={
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SMALL}
              onClick={retry}
            >
              {text.loadError.action}
            </Button>
          }
        />
      );
    }
    if (messageCount === 0) {
      return (
        <EmptyState
          icon={<StartConversationIcon />}
          title={text.emptyConversation.title}
          description={composerText.emptyDescription}
        />
      );
    }

    return (
      <ol className='messenger-timeline'>
        {timeline.map((item) =>
          item.kind === TimelineItemKind.DAY ? (
            <li key={item.key} className='messenger-day'>
              <span>{item.label}</span>
            </li>
          ) : (
            <li key={item.key} className={item.className}>
              {item.messages.map((message) => (
                <div key={message.id} className='messenger-bubble-row'>
                  <p className='messenger-bubble' title={message.fullDateLabel}>
                    {message.content}
                  </p>
                  {message.isDeletable && (
                    <Button
                      variant={ButtonVariant.GHOST}
                      size={ButtonSize.SMALL}
                      className='messenger-bubble-action'
                      icon={<DeleteIcon />}
                      aria-label={text.deleteMessage}
                      title={text.deleteMessage}
                      onClick={() => setMessagePendingDeletion(message)}
                    />
                  )}
                </div>
              ))}
              <span className='messenger-group-meta'>
                <time>{item.timeLabel}</time>
                {item.receiptLabel && <span>{item.receiptLabel}</span>}
              </span>
            </li>
          )
        )}
      </ol>
    );
  };

  return (
    <section className='messenger-conversation' aria-label={contact.username}>
      <header className='messenger-conversation-header'>
        <Button
          variant={ButtonVariant.GHOST}
          size={ButtonSize.SMALL}
          className='messenger-back'
          icon={<BackIcon />}
          aria-label={text.back}
          onClick={onBack}
        />
        <Avatar name={contact.username} imageUrl={contact.avatarUrl} />
        <div className='messenger-conversation-identity'>
          <span className='messenger-conversation-name'>
            {contact.username}
          </span>
          {contact.meta && (
            <span className='messenger-conversation-meta'>{contact.meta}</span>
          )}
        </div>
        <Button
          variant={ButtonVariant.SECONDARY}
          size={ButtonSize.SMALL}
          icon={<ChallengeIcon />}
          onClick={onChallenge}
        >
          {text.challenge}
        </Button>
      </header>
      <div
        className='messenger-scroll-area'
        ref={scrollAreaRef}
        onScroll={trackScrollPosition}
        role='log'
      >
        {renderTimeline()}
      </div>
      <MessageComposer
        value={draft}
        onChange={setDraft}
        onSubmit={sendDraft}
        isSending={isSending}
        label={composerText.label}
        placeholder={composerText.placeholder}
        sendLabel={text.composer.send}
        hint={text.composer.hint}
      />
      <Modal
        isOpen={Boolean(messagePendingDeletion)}
        title={text.confirmDelete.title}
        onClose={closeDeletion}
        footer={
          <>
            <Button variant={ButtonVariant.GHOST} onClick={closeDeletion}>
              {text.confirmDelete.cancel}
            </Button>
            <Button
              variant={ButtonVariant.DANGER}
              isLoading={isDeleting}
              onClick={confirmDeletion}
            >
              {text.confirmDelete.confirm}
            </Button>
          </>
        }
      >
        <p>{text.confirmDelete.description}</p>
        {messagePendingDeletion && (
          <blockquote className='messenger-delete-preview'>
            {messagePendingDeletion.content}
          </blockquote>
        )}
      </Modal>
    </section>
  );
};

export default ConversationPane;
