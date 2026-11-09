import { DEFAULT_BOT_ID, findBot } from './bots';
import {
  DEFAULT_GOAL_TARGET,
  DEFAULT_TIME_LIMIT_SECONDS,
  GOAL_TARGET_OPTIONS,
  TIME_LIMIT_OPTIONS_SECONDS,
} from './constants';
import {
  DEFAULT_MALLET_SKIN_ID,
  DEFAULT_TABLE_THEME_ID,
  findMalletSkin,
  findTableTheme,
} from './theme';

export const MatchQueryParam = Object.freeze({
  BOT: 'bot',
  GOALS: 'goals',
  TIME: 'time',
  SKIN: 'skin',
  TABLE: 'table',
});

const pickAllowedNumber = (rawValue, allowedValues, fallback) => {
  const parsedValue = Number(rawValue);

  return allowedValues.includes(parsedValue) ? parsedValue : fallback;
};

export const normalizeMatchSettings = (rawSettings = {}) => ({
  botId: findBot(rawSettings.botId ?? DEFAULT_BOT_ID).id,
  goalTarget: pickAllowedNumber(
    rawSettings.goalTarget,
    GOAL_TARGET_OPTIONS,
    DEFAULT_GOAL_TARGET
  ),
  timeLimitSeconds: pickAllowedNumber(
    rawSettings.timeLimitSeconds,
    TIME_LIMIT_OPTIONS_SECONDS,
    DEFAULT_TIME_LIMIT_SECONDS
  ),
  malletSkinId: findMalletSkin(
    rawSettings.malletSkinId ?? DEFAULT_MALLET_SKIN_ID
  ).id,
  tableThemeId: findTableTheme(
    rawSettings.tableThemeId ?? DEFAULT_TABLE_THEME_ID
  ).id,
});

export const buildMatchSearchParams = (settings) =>
  new URLSearchParams({
    [MatchQueryParam.BOT]: settings.botId,
    [MatchQueryParam.GOALS]: String(settings.goalTarget),
    [MatchQueryParam.TIME]: String(settings.timeLimitSeconds),
    [MatchQueryParam.SKIN]: settings.malletSkinId,
    [MatchQueryParam.TABLE]: settings.tableThemeId,
  });

export const parseMatchSearchParams = (searchParams) =>
  normalizeMatchSettings({
    botId: searchParams.get(MatchQueryParam.BOT),
    goalTarget: searchParams.get(MatchQueryParam.GOALS),
    timeLimitSeconds: searchParams.get(MatchQueryParam.TIME),
    malletSkinId: searchParams.get(MatchQueryParam.SKIN),
    tableThemeId: searchParams.get(MatchQueryParam.TABLE),
  });
