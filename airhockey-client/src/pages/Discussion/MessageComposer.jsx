import { Send as SendIcon } from '@mui/icons-material';
import React, { useId } from 'react';

import { Button } from '../../components/ui';

import { MAX_COMPOSER_ROWS, MAX_MESSAGE_LENGTH } from './conversationModel';

const ENTER_KEY = 'Enter';

const MessageComposer = ({
  value,
  onChange,
  onSubmit,
  isSending,
  label,
  placeholder,
  sendLabel,
  hint,
}) => {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const rowCount = Math.min(value.split('\n').length, MAX_COMPOSER_ROWS);
  const isDraftEmpty = value.trim().length === 0;

  const handleKeyDown = (event) => {
    const isSubmitShortcut =
      event.key === ENTER_KEY &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing;
    if (isSubmitShortcut) {
      event.preventDefault();
      onSubmit();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form className='messenger-composer' onSubmit={handleSubmit}>
      <label className='messenger-visually-hidden' htmlFor={inputId}>
        {label}
      </label>
      <div className='messenger-composer-field'>
        <textarea
          id={inputId}
          className='messenger-composer-input'
          rows={rowCount}
          value={value}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={placeholder}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button
          type='submit'
          icon={<SendIcon />}
          aria-label={sendLabel}
          isLoading={isSending}
          disabled={isDraftEmpty}
        />
      </div>
      <p id={hintId} className='messenger-composer-hint'>
        {hint}
      </p>
    </form>
  );
};

export default MessageComposer;
