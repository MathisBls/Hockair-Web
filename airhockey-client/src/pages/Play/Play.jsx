import {
  Computer as ComputerIcon,
  Public as OnlineIcon,
  People as FriendIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import React, { Suspense, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import BotAvatar from '../../components/BotAvatar/BotAvatar';
import { BOT_TIERS, BOTS, buildBotStatRatings, findBot } from '../../game/bots';
import {
  GOAL_TARGET_OPTIONS,
  TIME_LIMIT_OPTIONS_SECONDS,
} from '../../game/constants';
import {
  buildMatchSearchParams,
  normalizeMatchSettings,
} from '../../game/matchSettings';
import {
  getBeatenBotIds,
  getStoredMatchSettings,
  storeMatchSettings,
} from '../../game/progress';
import BotShowcase from '../../game/scene/BotShowcase';
import { MALLET_SKINS, TABLE_THEMES } from '../../game/theme';
import {
  formatPluralTranslation,
  formatTranslation,
} from '../../i18n/formatTranslation';
import './Play.css';

const SECONDS_PER_MINUTE = 60;

const PlayMode = Object.freeze({
  COMPUTER: 'computer',
  ONLINE: 'online',
  FRIEND: 'friend',
});

const PLAY_MODES = [
  { mode: PlayMode.COMPUTER, Icon: ComputerIcon, isAvailable: true },
  { mode: PlayMode.ONLINE, Icon: OnlineIcon, isAvailable: false },
  { mode: PlayMode.FRIEND, Icon: FriendIcon, isAvailable: false },
];

const OptionChip = ({ isSelected, onSelect, children, swatchColor }) => (
  <button
    type='button'
    className={`play-chip ${isSelected ? 'play-chip-selected' : ''}`}
    onClick={onSelect}
  >
    {swatchColor && (
      <span className='play-chip-swatch' style={{ background: swatchColor }} />
    )}
    {children}
  </button>
);

const Play = () => {
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const playTexts = translations.page.play;
  const [settings, setSettings] = useState(() =>
    normalizeMatchSettings(getStoredMatchSettings())
  );
  const beatenBotIds = useMemo(getBeatenBotIds, []);
  const selectedBot = findBot(settings.botId);
  const selectedBotTexts = translations.bots[selectedBot.id];
  const selectedBotStats = useMemo(
    () => buildBotStatRatings(selectedBot),
    [selectedBot]
  );
  const botsByTier = useMemo(
    () =>
      BOT_TIERS.map((tier) => ({
        tier,
        bots: BOTS.filter((bot) => bot.tier === tier),
      })).filter(({ bots }) => bots.length > 0),
    []
  );
  const timeOptions = useMemo(
    () =>
      TIME_LIMIT_OPTIONS_SECONDS.map((seconds) => ({
        seconds,
        label:
          seconds === 0
            ? playTexts.settings.noLimit
            : formatPluralTranslation(
                playTexts.settings.minutes,
                seconds / SECONDS_PER_MINUTE
              ),
      })),
    [playTexts]
  );

  const updateSettings = (partialSettings) => {
    setSettings((currentSettings) => {
      const nextSettings = { ...currentSettings, ...partialSettings };
      storeMatchSettings(nextSettings);

      return nextSettings;
    });
  };

  const startMatch = () => {
    navigate(`/play/bot?${buildMatchSearchParams(settings).toString()}`);
  };

  return (
    <div className='play-page'>
      <section className='play-stage'>
        <div className='play-stage-canvas'>
          <Suspense fallback={null}>
            <BotShowcase bot={selectedBot} />
          </Suspense>
        </div>
        <div className='play-speech-bubble' key={selectedBot.id}>
          {selectedBotTexts.quote}
        </div>
        <div className='play-stage-identity'>
          <h2>{selectedBotTexts.name}</h2>
          <span className='play-rating'>
            {formatTranslation(playTexts.rating, {
              rating: selectedBot.rating,
            })}
          </span>
          <span className={`play-tier play-tier-${selectedBot.tier}`}>
            {playTexts.tiers[selectedBot.tier]}
          </span>
        </div>
        <ul className='play-bot-stats'>
          {selectedBotStats.map(({ stat, percent }) => (
            <li key={stat}>
              <span>{playTexts.stats[stat]}</span>
              <div className='play-bot-stat-track'>
                <div
                  className='play-bot-stat-fill'
                  style={{
                    width: `${percent}%`,
                    background: selectedBot.color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <aside className='play-panel'>
        <header className='play-panel-header'>
          <h1>{playTexts.title}</h1>
          <p>{playTexts.subtitle}</p>
        </header>

        <nav className='play-modes'>
          {PLAY_MODES.map(({ mode, Icon, isAvailable }) => (
            <button
              type='button'
              key={mode}
              className={`play-mode ${mode === PlayMode.COMPUTER ? 'play-mode-active' : ''}`}
              disabled={!isAvailable}
            >
              <Icon />
              <span>{playTexts.modes[mode]}</span>
              {!isAvailable && (
                <em className='play-soon'>{playTexts.modes.soon}</em>
              )}
            </button>
          ))}
        </nav>

        <h3 className='play-section-title'>{playTexts.chooseOpponent}</h3>
        <div className='play-tiers'>
          {botsByTier.map(({ tier, bots }) => (
            <div key={tier} className='play-tier-group'>
              <span className='play-tier-label'>{playTexts.tiers[tier]}</span>
              <div className='play-bot-row'>
                {bots.map((bot) => (
                  <button
                    type='button'
                    key={bot.id}
                    className={`play-bot ${bot.id === selectedBot.id ? 'play-bot-selected' : ''}`}
                    style={{ '--bot-color': bot.color }}
                    onClick={() => updateSettings({ botId: bot.id })}
                  >
                    <BotAvatar
                      color={bot.color}
                      accent={bot.accent}
                      mood={bot.mood}
                      isBeaten={beatenBotIds.includes(bot.id)}
                    />
                    <span className='play-bot-name'>
                      {translations.bots[bot.id].name}
                    </span>
                    <span className='play-bot-rating'>{bot.rating}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h3 className='play-section-title'>{playTexts.settings.title}</h3>
        <div className='play-setting'>
          <span>{playTexts.settings.goals}</span>
          <div className='play-chip-row'>
            {GOAL_TARGET_OPTIONS.map((goalTarget) => (
              <OptionChip
                key={goalTarget}
                isSelected={settings.goalTarget === goalTarget}
                onSelect={() => updateSettings({ goalTarget })}
              >
                {goalTarget}
              </OptionChip>
            ))}
          </div>
        </div>
        <div className='play-setting'>
          <span>{playTexts.settings.timeLimit}</span>
          <div className='play-chip-row'>
            {timeOptions.map(({ seconds, label }) => (
              <OptionChip
                key={seconds}
                isSelected={settings.timeLimitSeconds === seconds}
                onSelect={() => updateSettings({ timeLimitSeconds: seconds })}
              >
                {label}
              </OptionChip>
            ))}
          </div>
        </div>
        <div className='play-setting'>
          <span>{playTexts.settings.malletColor}</span>
          <div className='play-chip-row'>
            {MALLET_SKINS.map((skin) => (
              <OptionChip
                key={skin.id}
                isSelected={settings.malletSkinId === skin.id}
                onSelect={() => updateSettings({ malletSkinId: skin.id })}
                swatchColor={skin.body}
              >
                {playTexts.skins[skin.labelKey]}
              </OptionChip>
            ))}
          </div>
        </div>
        <div className='play-setting'>
          <span>{playTexts.settings.table}</span>
          <div className='play-chip-row'>
            {TABLE_THEMES.map((theme) => (
              <OptionChip
                key={theme.id}
                isSelected={settings.tableThemeId === theme.id}
                onSelect={() => updateSettings({ tableThemeId: theme.id })}
                swatchColor={theme.railTrim}
              >
                {playTexts.tables[theme.labelKey]}
              </OptionChip>
            ))}
          </div>
        </div>

        <button type='button' className='play-start' onClick={startMatch}>
          <PlayIcon />
          {playTexts.start}
        </button>
      </aside>
    </div>
  );
};

export default Play;
