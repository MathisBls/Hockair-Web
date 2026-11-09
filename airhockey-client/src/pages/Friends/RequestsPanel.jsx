import {
  Check as AcceptIcon,
  Close as DeclineIcon,
  MarkEmailReadOutlined as NoRequestIcon,
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

const RequestsPanel = ({
  text,
  listState,
  rows,
  summary,
  onAccept,
  onDecline,
}) => (
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
          icon={<NoRequestIcon />}
          title={text.empty.requests.title}
          description={text.empty.requests.description}
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
            <>
              <Button
                size={ButtonSize.SMALL}
                icon={<AcceptIcon />}
                isLoading={row.isBusy}
                onClick={() => onAccept(row)}
              >
                {text.actions.accept}
              </Button>
              <Button
                variant={ButtonVariant.GHOST}
                size={ButtonSize.SMALL}
                icon={<DeclineIcon />}
                disabled={row.isBusy}
                onClick={() => onDecline(row)}
              >
                {text.actions.decline}
              </Button>
            </>
          }
        />
      ))}
    </RemoteListBody>
  </section>
);

export default RequestsPanel;
