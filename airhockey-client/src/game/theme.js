export const PALETTE = {
  red: '#e94560',
  redFocus: '#ff5c7a',
  redDark: '#74202c',
  cyan: '#00ffff',
  blue: '#16213e',
  blueBackground: '#121522',
  black: '#0d0d0d',
  white: '#ffffff',
  ink: '#0b0d18',
  gold: '#ffc94a',
  orange: '#ff8a3d',
};

export const MALLET_SKINS = [
  { id: 'cyan', labelKey: 'cyan', body: '#00e5ff', accent: '#0b6f8a' },
  { id: 'red', labelKey: 'red', body: '#e94560', accent: '#74202c' },
  { id: 'lime', labelKey: 'lime', body: '#9cff57', accent: '#3d7a16' },
  { id: 'violet', labelKey: 'violet', body: '#b07cff', accent: '#4b2a8a' },
  { id: 'gold', labelKey: 'gold', body: '#ffc94a', accent: '#8a5a12' },
];

export const DEFAULT_MALLET_SKIN_ID = 'cyan';

export const TABLE_THEMES = [
  {
    id: 'neon',
    labelKey: 'neon',
    surface: '#e8f1ff',
    surfaceLine: '#7aa6ff',
    rail: '#16213e',
    railTrim: '#e94560',
    playerGoal: '#00ffff',
    botGoal: '#e94560',
    floor: '#121522',
    sky: '#0d0d1c',
  },
  {
    id: 'ice',
    labelKey: 'ice',
    surface: '#f4fdff',
    surfaceLine: '#5fd4ff',
    rail: '#1f4e79',
    railTrim: '#00ffff',
    playerGoal: '#00ffff',
    botGoal: '#ff5c7a',
    floor: '#0f2236',
    sky: '#0a1a2c',
  },
  {
    id: 'sunset',
    labelKey: 'sunset',
    surface: '#fff4e6',
    surfaceLine: '#ff9a62',
    rail: '#3a1838',
    railTrim: '#ffc94a',
    playerGoal: '#ffc94a',
    botGoal: '#e94560',
    floor: '#1d0f22',
    sky: '#160a1c',
  },
];

export const DEFAULT_TABLE_THEME_ID = 'neon';

export const findMalletSkin = (skinId) =>
  MALLET_SKINS.find((skin) => skin.id === skinId) ?? MALLET_SKINS[0];

export const findTableTheme = (themeId) =>
  TABLE_THEMES.find((theme) => theme.id === themeId) ?? TABLE_THEMES[0];
