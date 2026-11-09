const BEATEN_BOTS_STORAGE_KEY = 'hockair.beatenBots';
const MATCH_SETTINGS_STORAGE_KEY = 'hockair.matchSettings';

const readJson = (key, fallback) => {
  try {
    const rawValue = localStorage.getItem(key);

    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private mode); progress is then kept for this session only.
  }
};

export const getBeatenBotIds = () => {
  const storedIds = readJson(BEATEN_BOTS_STORAGE_KEY, []);

  return Array.isArray(storedIds) ? storedIds : [];
};

export const markBotBeaten = (botId) => {
  const beatenIds = getBeatenBotIds();
  if (beatenIds.includes(botId)) {
    return false;
  }
  writeJson(BEATEN_BOTS_STORAGE_KEY, [...beatenIds, botId]);

  return true;
};

export const clearBeatenBots = () => {
  try {
    localStorage.removeItem(BEATEN_BOTS_STORAGE_KEY);
  } catch {
    // Storage can be unavailable (private mode); nothing persisted to clear.
  }
};

export const getStoredMatchSettings = () =>
  readJson(MATCH_SETTINGS_STORAGE_KEY, {});

export const storeMatchSettings = (settings) =>
  writeJson(MATCH_SETTINGS_STORAGE_KEY, settings);
