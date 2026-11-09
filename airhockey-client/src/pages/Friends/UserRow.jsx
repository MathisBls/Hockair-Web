import React from 'react';

import { Avatar, Skeleton } from '../../components/ui';

import { SKELETON_ROW_COUNT } from './socialConstants';

const SKELETON_ROW_KEYS = Array.from(
  { length: SKELETON_ROW_COUNT },
  (_, rowIndex) => `skeleton-${rowIndex}`
);

export const UserRow = ({ row, badge = null, actions = null }) => (
  <li className='social-user-row'>
    <Avatar name={row.username} imageUrl={row.avatarUrl} />
    <div className='social-user-identity'>
      <span className='social-user-name'>{row.username}</span>
      <span className='social-user-meta'>{row.meta}</span>
    </div>
    {badge && <div className='social-user-badge'>{badge}</div>}
    {actions && <div className='social-user-actions'>{actions}</div>}
  </li>
);

export const UserRowSkeletonList = () => (
  <ul className='social-list' aria-hidden='true'>
    {SKELETON_ROW_KEYS.map((rowKey) => (
      <li key={rowKey} className='social-user-row'>
        <Skeleton width='2.5rem' height='2.5rem' isRound />
        <div className='social-user-identity'>
          <Skeleton width='8rem' height='0.875rem' />
          <Skeleton width='5rem' height='0.75rem' />
        </div>
      </li>
    ))}
  </ul>
);
