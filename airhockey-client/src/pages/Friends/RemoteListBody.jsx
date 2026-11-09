import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import React from 'react';

import {
  Button,
  ButtonSize,
  ButtonVariant,
  EmptyState,
} from '../../components/ui';

import { LoadStatus } from './socialConstants';
import { UserRowSkeletonList } from './UserRow';

const RemoteListBody = ({
  status,
  isEmpty,
  emptyState,
  errorText,
  retryLabel,
  onRetry,
  children,
}) => {
  if (status === LoadStatus.LOADING) {
    return <UserRowSkeletonList />;
  }
  if (status === LoadStatus.ERROR && isEmpty) {
    return (
      <EmptyState
        icon={<ErrorIcon />}
        title={errorText.title}
        description={errorText.description}
        action={
          <Button
            variant={ButtonVariant.SECONDARY}
            size={ButtonSize.SMALL}
            onClick={onRetry}
          >
            {retryLabel}
          </Button>
        }
      />
    );
  }
  if (isEmpty) {
    return emptyState;
  }

  return <ul className='social-list'>{children}</ul>;
};

export default RemoteListBody;
