import {
  Bolt as EloIcon,
  CameraAlt as CameraIcon,
  EmojiEvents as TrophyIcon,
  ErrorOutline as ErrorIcon,
  Groups as TournamentIcon,
  Lock as LockIcon,
  MilitaryTech as MedalIcon,
  SmartToy as BotIcon,
  SportsScore as MatchIcon,
  TrendingUp as LevelIcon,
  WorkspacePremium as PremiumIcon,
  Whatshot as FireIcon,
} from '@mui/icons-material';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useLanguage } from '../../../LanguageContext';
import { apiRequest, HttpMethod } from '../../api/apiClient';
import Toast from '../../components/Toast/Toast';
import {
  Avatar,
  AvatarSize,
  Badge,
  BadgeTone,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  EmptyState,
  PageContainer,
  PageHeader,
  ProgressBar,
  Skeleton,
  TextField,
} from '../../components/ui';
import { getBeatenBotIds } from '../../game/progress';

import {
  AchievementId,
  ActivityKind,
  buildRecentActivityDto,
  SubscriptionStatus,
} from './profileData';
import {
  buildAchievementsView,
  buildActivityRows,
  buildProfileForm,
  buildProfileHeader,
  buildUpdateUserRequest,
  EMPTY_PROFILE_FORM,
  validateProfileForm,
} from './profileViewModel';
import { useUserProfile } from './useUserProfile';
import './Profile.css';

const UPDATE_USER_PATH = '/api/users/update';
const UPLOAD_PROFILE_PICTURE_PATH = '/api/users/upload-profile-picture';
const PROFILE_PICTURE_FIELD = 'file';
const ACCEPTED_IMAGE_TYPES = 'image/*';

const ToastType = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
});

const PLAN_BADGE_TONE_BY_STATUS = {
  [SubscriptionStatus.FREE]: BadgeTone.NEUTRAL,
  [SubscriptionStatus.PREMIUM]: BadgeTone.WARNING,
  [SubscriptionStatus.PRO]: BadgeTone.WARNING,
};

const ACHIEVEMENT_ICON_BY_ID = {
  [AchievementId.FIRST_WIN]: <MatchIcon />,
  [AchievementId.TEN_WINS]: <MedalIcon />,
  [AchievementId.FIFTY_WINS]: <TrophyIcon />,
  [AchievementId.ELO_THOUSAND]: <EloIcon />,
  [AchievementId.ELO_FIFTEEN_HUNDRED]: <PremiumIcon />,
  [AchievementId.LEVEL_TEN]: <LevelIcon />,
  [AchievementId.BEAT_MASTER]: <FireIcon />,
  [AchievementId.BEAT_ALL_BOTS]: <BotIcon />,
};

const ACTIVITY_ICON_BY_KIND = {
  [ActivityKind.MATCH_WIN]: <MatchIcon />,
  [ActivityKind.MATCH_LOSS]: <MatchIcon />,
  [ActivityKind.LEVEL_UP]: <LevelIcon />,
  [ActivityKind.TOURNAMENT_JOIN]: <TournamentIcon />,
};

const FORM_FIELDS = [
  { name: 'username', type: 'text', autoComplete: 'username' },
  { name: 'email', type: 'email', autoComplete: 'email' },
  {
    name: 'currentPassword',
    type: 'password',
    autoComplete: 'current-password',
  },
  {
    name: 'newPassword',
    type: 'password',
    autoComplete: 'new-password',
    hintKey: 'newPasswordHint',
  },
  {
    name: 'confirmNewPassword',
    type: 'password',
    autoComplete: 'new-password',
  },
];

const ProfileHeaderSkeleton = () => (
  <Card className='profile-identity'>
    <div className='profile-identity-main'>
      <Skeleton width='6rem' height='6rem' isRound />
      <Skeleton width='10rem' height='1.5rem' />
      <Skeleton width='8rem' />
    </div>
    <Skeleton height='0.375rem' />
    <Skeleton height='4rem' />
  </Card>
);

const Profile = () => {
  const { translations, language } = useLanguage();
  const profileTexts = translations.competitive.profile;
  const { profile, isLoading, error, setProfile, reloadProfile } =
    useUserProfile();
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(EMPTY_PROFILE_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setForm(buildProfileForm(profile));
  }, [profile]);

  const showToast = (type, message) =>
    setToast({ id: Date.now(), type, message });

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setForm((previousForm) => ({ ...previousForm, [name]: value }));
  };

  const handleReset = () => {
    setForm(buildProfileForm(profile));
    setFormErrors({});
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateProfileForm(form, profileTexts.errors);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    setIsSaving(true);
    try {
      const response = await apiRequest(UPDATE_USER_PATH, {
        method: HttpMethod.PUT,
        body: buildUpdateUserRequest(form),
      });
      setProfile((previousProfile) => ({
        ...previousProfile,
        username: response?.user?.username ?? form.username,
        email: response?.user?.email ?? form.email,
      }));
      showToast(ToastType.SUCCESS, profileTexts.updateSuccess);
    } catch {
      showToast(ToastType.ERROR, profileTexts.updateError);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePictureChange = async (event) => {
    const [selectedFile] = event.target.files ?? [];
    event.target.value = '';
    if (!selectedFile) {
      return;
    }
    const pictureFormData = new FormData();
    pictureFormData.append(PROFILE_PICTURE_FIELD, selectedFile);
    setIsUploading(true);
    try {
      const response = await apiRequest(UPLOAD_PROFILE_PICTURE_PATH, {
        method: HttpMethod.POST,
        formData: pictureFormData,
      });
      setProfile((previousProfile) => ({
        ...previousProfile,
        profilePicture:
          response?.user?.profilePicture ?? previousProfile.profilePicture,
      }));
      showToast(ToastType.SUCCESS, profileTexts.pictureUpdated);
    } catch {
      showToast(ToastType.ERROR, profileTexts.uploadError);
    } finally {
      setIsUploading(false);
    }
  };

  const viewModel = useMemo(() => {
    if (!profile) {
      return null;
    }
    const formattingContext = { language, translations };
    const beatenBotIds = getBeatenBotIds();
    const activityRows = buildActivityRows(
      buildRecentActivityDto({
        level: profile.level ?? 1,
        gamesPlayed: (profile.victories ?? 0) + (profile.defeats ?? 0),
        beatenBotIds,
      }),
      formattingContext
    );

    return {
      header: buildProfileHeader(profile, formattingContext),
      achievementsView: buildAchievementsView(
        { profile, beatenBotIds },
        formattingContext
      ),
      activityRows,
      hasActivity: activityRows.length > 0,
    };
  }, [profile, language, translations]);

  const formFields = useMemo(
    () =>
      FORM_FIELDS.map((field) => ({
        ...field,
        label: profileTexts.edit[field.name],
        hint: field.hintKey ? profileTexts.edit[field.hintKey] : null,
      })),
    [profileTexts]
  );

  if (error && !profile) {
    return (
      <PageContainer>
        <PageHeader eyebrow={profileTexts.eyebrow} title={profileTexts.title} />
        <Card>
          <EmptyState
            icon={<ErrorIcon />}
            title={profileTexts.loadErrorTitle}
            description={profileTexts.loadErrorDescription}
            action={
              <Button variant={ButtonVariant.SECONDARY} onClick={reloadProfile}>
                {translations.competitive.common.retry}
              </Button>
            }
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer className='profile-page'>
      <PageHeader
        eyebrow={profileTexts.eyebrow}
        title={profileTexts.title}
        description={profileTexts.description}
      />

      <div className='profile-top'>
        {isLoading || !viewModel ? (
          <ProfileHeaderSkeleton />
        ) : (
          <Card className='profile-identity'>
            <div className='profile-identity-main'>
              <div className='profile-avatar'>
                <Avatar
                  name={viewModel.header.username}
                  imageUrl={viewModel.header.profilePictureUrl}
                  size={AvatarSize.EXTRA_LARGE}
                />
                <input
                  ref={fileInputRef}
                  type='file'
                  accept={ACCEPTED_IMAGE_TYPES}
                  className='profile-file-input'
                  onChange={handlePictureChange}
                  tabIndex={-1}
                  aria-hidden='true'
                />
              </div>
              <Button
                variant={ButtonVariant.SECONDARY}
                size={ButtonSize.SMALL}
                icon={<CameraIcon />}
                isLoading={isUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {profileTexts.changePhoto}
              </Button>
              <h2 className='profile-username'>{viewModel.header.username}</h2>
              <div className='profile-identity-meta'>
                <Badge
                  tone={
                    PLAN_BADGE_TONE_BY_STATUS[
                      viewModel.header.subscriptionStatus
                    ]
                  }
                >
                  {viewModel.header.planLabel}
                </Badge>
                {viewModel.header.memberSinceLabel && (
                  <span>{viewModel.header.memberSinceLabel}</span>
                )}
              </div>
            </div>

            <div className='profile-level'>
              <div className='profile-level-text'>
                <span className='profile-level-label'>
                  {viewModel.header.levelLabel}
                </span>
                <span className='profile-level-xp'>
                  {viewModel.header.xpLabel}
                </span>
              </div>
              <ProgressBar
                ratio={viewModel.header.xpRatio}
                label={profileTexts.xpLabel}
              />
            </div>

            <dl className='profile-record'>
              {viewModel.header.recordItems.map((recordItem) => (
                <div key={recordItem.id} className='profile-record-item'>
                  <dt>{recordItem.label}</dt>
                  <dd>{recordItem.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}

        <Card
          className='profile-edit'
          title={profileTexts.edit.title}
          subtitle={profileTexts.edit.subtitle}
        >
          <form className='profile-form' onSubmit={handleSubmit} noValidate>
            {formFields.map((field) => (
              <TextField
                key={field.name}
                className={`profile-field-${field.name}`}
                label={field.label}
                hint={field.hint}
                error={formErrors[field.name] ?? null}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                value={form[field.name]}
                onChange={handleFieldChange}
                disabled={isLoading}
              />
            ))}
            <div className='profile-form-actions'>
              <Button
                variant={ButtonVariant.GHOST}
                onClick={handleReset}
                disabled={isSaving}
              >
                {profileTexts.edit.reset}
              </Button>
              <Button type='submit' isLoading={isSaving} disabled={isLoading}>
                {profileTexts.edit.save}
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {viewModel && (
        <div className='profile-bottom'>
          <Card
            className='profile-achievements'
            title={profileTexts.achievements.title}
            subtitle={viewModel.achievementsView.summaryLabel}
          >
            <ul className='profile-achievement-grid'>
              {viewModel.achievementsView.achievements.map((achievement) => (
                <li
                  key={achievement.id}
                  className={`profile-achievement ${achievement.isUnlocked ? 'profile-achievement-unlocked' : ''}`}
                >
                  <span className='profile-achievement-icon'>
                    {achievement.isUnlocked ? (
                      ACHIEVEMENT_ICON_BY_ID[achievement.id]
                    ) : (
                      <LockIcon />
                    )}
                  </span>
                  <div className='profile-achievement-text'>
                    <span className='profile-achievement-name'>
                      {achievement.name}
                    </span>
                    <span className='profile-achievement-description'>
                      {achievement.description}
                    </span>
                    <ProgressBar
                      ratio={achievement.progressRatio}
                      label={achievement.progressLabel}
                    />
                    <span className='profile-achievement-progress'>
                      {achievement.progressLabel}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card
            className='profile-activity'
            title={profileTexts.activity.title}
          >
            {viewModel.hasActivity ? (
              <ol className='profile-activity-list'>
                {viewModel.activityRows.map((activityRow) => (
                  <li
                    key={activityRow.id}
                    className={`profile-activity-item profile-activity-${activityRow.kind}`}
                  >
                    <span className='profile-activity-icon'>
                      {ACTIVITY_ICON_BY_KIND[activityRow.kind]}
                    </span>
                    <span className='profile-activity-label'>
                      {activityRow.label}
                    </span>
                    <span className='profile-activity-time'>
                      {activityRow.timeLabel}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <EmptyState
                icon={<MatchIcon />}
                title={profileTexts.activity.emptyTitle}
                description={profileTexts.activity.emptyDescription}
              />
            )}
          </Card>
        </div>
      )}

      {toast && (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      )}
    </PageContainer>
  );
};

export default Profile;
