import {
  LockOpenOutlined as UnblockIcon,
  VerifiedUserOutlined as NoBlockedIcon,
} from '@mui/icons-material';
import React from 'react';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  EmptyState,
} from '../../components/ui';

import RemoteListBody from './RemoteListBody';
import { UserRow } from './UserRow';

const BlockedPanel = ({ text, listState, rows, summary, onUnblock }) => (
  <section className='social-panel'>
    {rows.length > 0 && (
      <div className='social-panel-toolbar'>
        <span className='social-panel-summary'>{summary}</span>
      </div>
    )}
    <RemoteListBody
      status={listState.status}
      isEmpty={rows.length === 0}
      emptyState={
        <EmptyState
          icon={<NoBlockedIcon />}
          title={text.empty.blocked.title}
          description={text.empty.blocked.description}
        />
      }
      errorText={text.errors.load}
      retryLabel={text.actions.retry}
      onRetry={listState.retry}
    >
      {rows.map((row) => (
        <UserRow
          key={row.id}
          row={row}
          actions={
            <Button
              variant={ButtonVariant.SECONDARY}
              size={ButtonSize.SMALL}
              icon={<UnblockIcon />}
              isLoading={row.isBusy}
              onClick={() => onUnblock(row)}
            >
              {text.actions.unblock}
            </Button>
          }
        />
      ))}
    </RemoteListBody>
  </section>
);

export default BlockedPanel;
