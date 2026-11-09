const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_DAY = 86400;
const SECONDS_PER_WEEK = 604800;
const SECONDS_PER_MONTH = 2592000;

const BASE_XP_PER_LEVEL = 500;

const RELATIVE_TIME_STEPS = [
  { unit: 'month', seconds: SECONDS_PER_MONTH },
  { unit: 'week', seconds: SECONDS_PER_WEEK },
  { unit: 'day', seconds: SECONDS_PER_DAY },
  { unit: 'hour', seconds: SECONDS_PER_HOUR },
  { unit: 'minute', seconds: SECONDS_PER_MINUTE },
];

export const computeWinRate = (victories = 0, defeats = 0) => {
  const gamesPlayed = victories + defeats;

  return gamesPlayed > 0 ? victories / gamesPlayed : null;
};

export const formatInteger = (language, value) =>
  new Intl.NumberFormat(language, { maximumFractionDigits: 0 }).format(value);

export const formatDecimal = (language, value) =>
  new Intl.NumberFormat(language, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);

export const formatSignedInteger = (language, value) =>
  new Intl.NumberFormat(language, {
    maximumFractionDigits: 0,
    signDisplay: 'exceptZero',
  }).format(value);

export const formatPercent = (language, ratio) =>
  new Intl.NumberFormat(language, {
    style: 'percent',
    maximumFractionDigits: 0,
  }).format(ratio);

export const formatDate = (language, date) =>
  new Intl.DateTimeFormat(language, { dateStyle: 'medium' }).format(
    new Date(date)
  );

export const formatDateTime = (language, date) =>
  new Intl.DateTimeFormat(language, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));

export const formatShortDate = (language, date) =>
  new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short' }).format(
    new Date(date)
  );

export const formatRelativeTime = (language, date, now = new Date()) => {
  const elapsedSeconds =
    (new Date(date).getTime() - now.getTime()) / MILLISECONDS_PER_SECOND;
  const formatter = new Intl.RelativeTimeFormat(language, { numeric: 'auto' });
  const matchingStep = RELATIVE_TIME_STEPS.find(
    (step) => Math.abs(elapsedSeconds) >= step.seconds
  );

  return matchingStep
    ? formatter.format(
        Math.round(elapsedSeconds / matchingStep.seconds),
        matchingStep.unit
      )
    : formatter.format(0, 'minute');
};

export const getRequiredXpForLevel = (level) =>
  BASE_XP_PER_LEVEL * Math.max(level, 1);

export const buildLevelProgress = (level = 1, xp = 0) => {
  const requiredXp = getRequiredXpForLevel(level);

  return {
    level,
    currentXp: xp,
    requiredXp,
    ratio: Math.min(xp / requiredXp, 1),
  };
};
