const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_WEEK = 7;
const MONDAY_INDEX = 1;

const padTwoDigits = (value) => String(value).padStart(2, '0');

export const getLocalDateKey = (date) =>
  `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`;

export const getStartOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const addDays = (date, dayCount) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayCount);

export const getStartOfWeek = (date) => {
  const daysSinceMonday =
    (date.getDay() - MONDAY_INDEX + DAYS_PER_WEEK) % DAYS_PER_WEEK;

  return addDays(getStartOfDay(date), -daysSinceMonday);
};

export const getWeekDateKeys = (date) => {
  const weekStart = getStartOfWeek(date);

  return Array.from({ length: DAYS_PER_WEEK }, (_, dayIndex) =>
    getLocalDateKey(addDays(weekStart, dayIndex))
  );
};

export const getDayIndexSinceEpoch = (date) =>
  Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) /
      MILLISECONDS_PER_DAY
  );

export { DAYS_PER_WEEK };
