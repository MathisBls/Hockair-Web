import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import React from 'react';

import {
  Avatar,
  AvatarSize,
  Button,
  ButtonVariant,
  EmptyState,
  Skeleton,
} from '../../components/ui';

import { SettingRow } from './SettingsControls';

const ACCOUNT_SKELETON_KEYS = ['first', 'second', 'third', 'fourth'];

const AccountSkeleton = () => (
  <div className='settings-account' aria-busy='true'>
    <div className='settings-account-identity'>
      <Skeleton width='4rem' height='4rem' isRound />
      <div className='settings-account-names'>
        <Skeleton width='10rem' height='1.25rem' />
        <Skeleton width='14rem' />
      </div>
    </div>
    <dl className='settings-account-details'>
      {ACCOUNT_SKELETON_KEYS.map((skeletonKey) => (
        <div key={skeletonKey}>
          <Skeleton width='5rem' />
          <Skeleton width='7rem' height='1.25rem' />
        </div>
      ))}
    </dl>
  </div>
);

const AccountSection = ({
  account,
  isLoading,
  hasError,
  texts,
  onRetry,
  onEditProfile,
  onManagePlan,
  onLogout,
}) => (
  <div className='settings-panel-stack'>
    {isLoading && <AccountSkeleton />}
    {hasError && (
      <EmptyState
        icon={<ErrorOutlineRoundedIcon />}
        title={texts.errorTitle}
        description={texts.errorDescription}
        action={
          <Button variant={ButtonVariant.SECONDARY} onClick={onRetry}>
            {texts.retry}
          </Button>
        }
      />
    )}
    {account && (
      <div className='settings-account'>
        <div className='settings-account-identity'>
          <Avatar
            name={account.username}
            imageUrl={account.avatarUrl}
            size={AvatarSize.EXTRA_LARGE}
          />
          <div className='settings-account-names'>
            <span className='settings-account-username'>
              {account.username}
            </span>
            <span className='settings-account-email'>{account.email}</span>
            <span className='settings-account-level'>{account.levelLabel}</span>
          </div>
          <div className='settings-account-actions'>
            <Button variant={ButtonVariant.SECONDARY} onClick={onEditProfile}>
              {texts.editProfile}
            </Button>
            <Button variant={ButtonVariant.GHOST} onClick={onManagePlan}>
              {texts.managePlan}
            </Button>
          </div>
        </div>
        <dl className='settings-account-details'>
          {account.details.map((detail) => (
            <div key={detail.id}>
              <dt>{detail.label}</dt>
              <dd>{detail.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    )}
    <SettingRow
      label={texts.logout}
      hint={texts.logoutDescription}
      control={
        <Button
          variant={ButtonVariant.SECONDARY}
          icon={<LogoutRoundedIcon />}
          onClick={onLogout}
        >
          {texts.logout}
        </Button>
      }
    />
  </div>
);

export default AccountSection;
