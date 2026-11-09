import { buildAssetUrl } from '../../api/apiClient';
import { formatTranslation } from '../../i18n/formatTranslation';
import { OpponentKind } from '../Stats/statsData';

import {
  formatDate,
  formatInteger,
  formatPercent,
  formatRelativeTime,
  buildLevelProgress,
  computeWinRate,
} from './playerFormatting';
import {
  ACHIEVEMENT_DEFINITIONS,
  ActivityKind,
  SubscriptionStatus,
} from './profileData';

export const MINIMUM_PASSWORD_LENGTH = 6;

export const EMPTY_PROFILE_FORM = Object.freeze({
  username: '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
});

export const buildProfileForm = (profile) => ({
  ...EMPTY_PROFILE_FORM,
  username: profile?.username ?? '',
  email: profile?.email ?? '',
});

export const validateProfileForm = (form, errorTexts) => {
  const errors = {};
  if (!form.username.trim()) {
    errors.username = errorTexts.usernameRequired;
  }
  if (!form.email.includes('@')) {
    errors.email = errorTexts.invalidEmail;
  }
  if (form.newPassword) {
    if (!form.currentPassword) {
      errors.currentPassword = errorTexts.currentPasswordRequired;
    }
    if (form.newPassword.length < MINIMUM_PASSWORD_LENGTH) {
      errors.newPassword = errorTexts.passwordTooShort;
    }
    if (form.newPassword !== form.confirmNewPassword) {
      errors.confirmNewPassword = errorTexts.passwordMismatch;
    }
  }

  return errors;
};

export const buildUpdateUserRequest = (form) => ({
  username: form.username.trim(),
  email: form.email.trim(),
  ...(form.newPassword
    ? {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }
    : {}),
});

export const buildProfileHeader = (profile, { language, translations }) => {
  const profileTexts = translations.competitive.profile;
  const levelProgress = buildLevelProgress(profile.level, profile.xp);
  const winRate = computeWinRate(profile.victories, profile.defeats);
  const subscriptionStatus = Object.values(SubscriptionStatus).includes(
    profile.subscription?.status
  )
    ? profile.subscription.status
    : SubscriptionStatus.FREE;

  return {
    username: profile.username,
    profilePictureUrl: buildAssetUrl(profile.profilePicture),
    planLabel: profileTexts.plans[subscriptionStatus],
    subscriptionStatus,
    memberSinceLabel: profile.createdAt
      ? formatTranslation(profileTexts.memberSince, {
          date: formatDate(language, profile.createdAt),
        })
      : null,
    levelLabel: formatTranslation(profileTexts.level, {
      level: formatInteger(language, levelProgress.level),
    }),
    xpLabel: formatTranslation(profileTexts.xp, {
      current: formatInteger(language, levelProgress.currentXp),
      required: formatInteger(language, levelProgress.requiredXp),
    }),
    xpRatio: levelProgress.ratio,
    recordItems: [
      {
        id: 'elo',
        label: profileTexts.record.elo,
        value: formatInteger(language, profile.elo ?? 0),
      },
      {
        id: 'victories',
        label: profileTexts.record.victories,
        value: formatInteger(language, profile.victories ?? 0),
      },
      {
        id: 'defeats',
        label: profileTexts.record.defeats,
        value: formatInteger(language, profile.defeats ?? 0),
      },
      {
        id: 'winRate',
        label: profileTexts.record.winRate,
        value:
          winRate === null
            ? translations.competitive.common.noValue
            : formatPercent(language, winRate),
      },
    ],
  };
};

export const buildAchievementsView = (
  { profile, beatenBotIds },
  { language, translations }
) => {
  const achievementTexts = translations.competitive.profile.achievements;
  const achievements = ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const progress = Math.min(
      definition.measureProgress({ profile, beatenBotIds }),
      definition.target
    );
    const isUnlocked = progress >= definition.target;

    return {
      id: definition.id,
      name: achievementTexts.items[definition.id].name,
      description: achievementTexts.items[definition.id].description,
      isUnlocked,
      progressRatio: progress / definition.target,
      progressLabel: isUnlocked
        ? achievementTexts.unlocked
        : formatTranslation(achievementTexts.progress, {
            current: formatInteger(language, progress),
            target: formatInteger(language, definition.target),
          }),
    };
  });
  const unlockedCount = achievements.filter(
    (achievement) => achievement.isUnlocked
  ).length;

  return {
    achievements,
    summaryLabel: formatTranslation(achievementTexts.unlockedCount, {
      unlocked: formatInteger(language, unlockedCount),
      total: formatInteger(language, achievements.length),
    }),
  };
};

const getOpponentName = (opponent, translations) =>
  opponent.kind === OpponentKind.BOT
    ? (translations.bots?.[opponent.botId]?.name ?? opponent.botId)
    : opponent.username;

const buildActivityLabel = (activity, translations) => {
  const activityTexts = translations.competitive.profile.activity.items;
  switch (activity.kind) {
    case ActivityKind.MATCH_WIN:
    case ActivityKind.MATCH_LOSS:
      return formatTranslation(activityTexts[activity.kind], {
        opponent: getOpponentName(activity.opponent, translations),
      });
    case ActivityKind.LEVEL_UP:
      return formatTranslation(activityTexts.levelUp, {
        level: activity.level,
      });
    case ActivityKind.TOURNAMENT_JOIN:
      return formatTranslation(activityTexts.tournamentJoin, {
        name: activity.tournamentName,
      });
    default:
      return '';
  }
};

export const buildActivityRows = (activities, { language, translations }) =>
  activities.map((activity) => ({
    id: activity.activityId,
    kind: activity.kind,
    label: buildActivityLabel(activity, translations),
    timeLabel: formatRelativeTime(language, activity.occurredAt),
  }));
