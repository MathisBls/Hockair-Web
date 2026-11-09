import { buildAssetUrl } from '../../api/apiClient';
import { BOTS } from '../../game/bots';
import {
  GOAL_TARGET_OPTIONS,
  TIME_LIMIT_OPTIONS_SECONDS,
} from '../../game/constants';
import { normalizeMatchSettings } from '../../game/matchSettings';
import { clearBeatenBots, storeMatchSettings } from '../../game/progress';
import { MALLET_SKINS, TABLE_THEMES } from '../../game/theme';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';

export const SettingsSection = Object.freeze({
  ACCOUNT: 'account',
  GAMEPLAY: 'gameplay',
  AUDIO: 'audio',
  DISPLAY: 'display',
  PRIVACY: 'privacy',
  DANGER: 'danger',
});

export const SETTINGS_SECTION_ORDER = [
  SettingsSection.ACCOUNT,
  SettingsSection.GAMEPLAY,
  SettingsSection.AUDIO,
  SettingsSection.DISPLAY,
  SettingsSection.PRIVACY,
  SettingsSection.DANGER,
];

export const SUPPORTED_LANGUAGES = ['fr', 'en'];

export const SettingsRoute = Object.freeze({
  LOGIN: '/login',
  PROFILE: '/profile',
  SUBSCRIPTIONS: '/subscriptions',
});

export const PROFILE_API_PATH = '/api/users/profile';

const SECONDS_PER_MINUTE = 60;
const UNLIMITED_TIME_SECONDS = 0;
const MISSING_VALUE_LABEL = '—';

export const resetLocalProgress = () => {
  clearBeatenBots();
  const defaultSettings = normalizeMatchSettings();
  storeMatchSettings(defaultSettings);

  return defaultSettings;
};

export const buildSectionNavItems = (texts) =>
  SETTINGS_SECTION_ORDER.map((sectionId) => ({
    id: sectionId,
    label: texts.sections[sectionId].label,
    description: texts.sections[sectionId].description,
    isDanger: sectionId === SettingsSection.DANGER,
  }));

const formatTimeLimit = (seconds, gameplayTexts) =>
  seconds === UNLIMITED_TIME_SECONDS
    ? gameplayTexts.unlimited
    : formatTranslation(gameplayTexts.minutes, {
        minutes: seconds / SECONDS_PER_MINUTE,
      });

export const buildGameplayOptions = (gameplayTexts) => ({
  skinOptions: MALLET_SKINS.map((skin) => ({
    value: skin.id,
    label: gameplayTexts.skins[skin.labelKey],
    primaryColor: skin.body,
    secondaryColor: skin.accent,
  })),
  tableOptions: TABLE_THEMES.map((theme) => ({
    value: theme.id,
    label: gameplayTexts.tables[theme.labelKey],
    primaryColor: theme.surface,
    secondaryColor: theme.railTrim,
  })),
  goalOptions: GOAL_TARGET_OPTIONS.map((goalTarget) => ({
    value: goalTarget,
    label: formatPluralTranslation(gameplayTexts.goals, goalTarget),
  })),
  timeOptions: TIME_LIMIT_OPTIONS_SECONDS.map((seconds) => ({
    value: seconds,
    label: formatTimeLimit(seconds, gameplayTexts),
  })),
});

const formatOptionalNumber = (value, numberFormatter) =>
  typeof value === 'number'
    ? numberFormatter.format(value)
    : MISSING_VALUE_LABEL;

const formatMemberSince = (createdAt, language) => {
  const createdDate = createdAt ? new Date(createdAt) : null;

  return createdDate && !Number.isNaN(createdDate.getTime())
    ? new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(
        createdDate
      )
    : MISSING_VALUE_LABEL;
};

export const buildAccountModel = (user, accountTexts, language) => {
  const numberFormatter = new Intl.NumberFormat(language);
  const planStatus = user.subscription?.status;

  return {
    username: user.username ?? MISSING_VALUE_LABEL,
    email: user.email ?? MISSING_VALUE_LABEL,
    avatarUrl: buildAssetUrl(user.profilePicture),
    levelLabel: formatTranslation(accountTexts.levelValue, {
      level: formatOptionalNumber(user.level, numberFormatter),
    }),
    details: [
      {
        id: 'memberSince',
        label: accountTexts.memberSince,
        value: formatMemberSince(user.createdAt, language),
      },
      {
        id: 'elo',
        label: accountTexts.elo,
        value: formatOptionalNumber(user.elo, numberFormatter),
      },
      {
        id: 'plan',
        label: accountTexts.plan,
        value: accountTexts.plans[planStatus] ?? accountTexts.plans.free,
      },
      {
        id: 'coins',
        label: accountTexts.coins,
        value: formatOptionalNumber(user.money, numberFormatter),
      },
    ],
  };
};

export const buildPrivacyItems = ({
  texts,
  beatenBotCount,
  isMuted,
  language,
  isSignedIn,
}) => {
  const privacyTexts = texts.privacy;
  const items = [
    {
      id: 'progress',
      label: privacyTexts.items.progress,
      value: formatPluralTranslation(privacyTexts.beatenBots, beatenBotCount, {
        total: BOTS.length,
      }),
    },
    {
      id: 'matchSettings',
      label: privacyTexts.items.matchSettings,
      value: texts.savedLocally,
    },
    {
      id: 'audio',
      label: privacyTexts.items.audio,
      value: isMuted ? privacyTexts.soundOff : privacyTexts.soundOn,
    },
    {
      id: 'language',
      label: privacyTexts.items.language,
      value: texts.display.languages[language] ?? language,
    },
  ];

  return isSignedIn
    ? [
        ...items,
        {
          id: 'session',
          label: privacyTexts.items.session,
          value: privacyTexts.sessionActive,
        },
      ]
    : items;
};
