import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { soundEngine } from '../../game/audio/soundEngine';
import { BotMood, findBot } from '../../game/bots';
import {
  GameEventType,
  MatchPhase,
  MatchResult,
  Side,
} from '../../game/constants';
import { MatchEngine } from '../../game/engine/matchEngine';
import { useMatchSnapshot } from '../../game/engine/matchStore';
import { parseMatchSearchParams } from '../../game/matchSettings';
import { markBotBeaten } from '../../game/progress';
import GameCanvas from '../../game/scene/GameCanvas';
import { findMalletSkin, findTableTheme } from '../../game/theme';
import { formatPluralTranslation } from '../../i18n/formatTranslation';

import GameOverModal from './GameOverModal';
import MatchOverlay from './MatchOverlay';
import MatchPanel from './MatchPanel';
import MatchToolbar from './MatchToolbar';
import { buildFeedItems, buildStatRows, formatClock } from './matchViewModel';
import PlayerBar from './PlayerBar';
import './Match.css';

const SKIP_REPLAY_KEYS = ['Space', 'Escape', 'Enter'];
const POINTER_HIDDEN_PHASES = [MatchPhase.COUNTDOWN, MatchPhase.PLAYING];

const MatchSession = ({ settings, onRematch }) => {
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const gameTexts = translations.game;
  const bot = findBot(settings.botId);
  const botName = translations.bots[bot.id].name;
  const malletSkin = findMalletSkin(settings.malletSkinId);
  const tableTheme = findTableTheme(settings.tableThemeId);
  const engine = useMemo(
    () =>
      new MatchEngine({
        bot,
        goalTarget: settings.goalTarget,
        timeLimitSeconds: settings.timeLimitSeconds,
      }),
    [bot, settings.goalTarget, settings.timeLimitSeconds]
  );
  const snapshot = useMatchSnapshot(engine.store);
  const [isMuted, setIsMuted] = useState(() => soundEngine.getMuted());
  const [isFirstWin, setIsFirstWin] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const { phase, score, countdownValue, kickoffId, result } = snapshot;

  const handleFrameEvents = useCallback((events) => {
    const audibleEvents = events.filter(
      (event) => !(event.isReplay && event.type === GameEventType.GOAL)
    );
    soundEngine.playEvents(audibleEvents, Side.PLAYER);
  }, []);

  useEffect(() => {
    if (phase === MatchPhase.COUNTDOWN && countdownValue > 0) {
      soundEngine.playCountdownTick(false);
    }
  }, [phase, countdownValue]);

  useEffect(() => {
    if (kickoffId > 0) {
      soundEngine.playCountdownTick(true);
    }
  }, [kickoffId]);

  useEffect(() => {
    if (phase === MatchPhase.REPLAY) {
      soundEngine.playWhoosh();
    }
  }, [phase]);

  useEffect(() => {
    if (result === MatchResult.WIN) {
      setIsFirstWin(markBotBeaten(bot.id));
    }
  }, [result, bot.id]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (SKIP_REPLAY_KEYS.includes(event.code)) {
        event.preventDefault();
        engine.skipReplay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  const toggleMute = () => {
    soundEngine.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const feedItems = useMemo(
    () => buildFeedItems(snapshot.feed, gameTexts, gameTexts.you, botName),
    [snapshot.feed, gameTexts, botName]
  );
  const statRows = useMemo(
    () => buildStatRows(snapshot.stats, gameTexts),
    [snapshot.stats, gameTexts]
  );
  const hasTimeLimit = settings.timeLimitSeconds > 0;
  const clockLabel = formatClock(
    hasTimeLimit ? snapshot.remainingSeconds : snapshot.elapsedSeconds
  );
  const clockCaption = hasTimeLimit ? gameTexts.remaining : gameTexts.elapsed;
  const goalTargetLabel = formatPluralTranslation(
    gameTexts.firstTo,
    settings.goalTarget
  );
  const isPointerHidden = POINTER_HIDDEN_PHASES.includes(phase);

  return (
    <div
      className='match-page'
      style={{ '--player-color': malletSkin.body, '--bot-color': bot.color }}
    >
      <div
        className={`match-canvas ${isPointerHidden ? 'match-canvas-playing' : ''}`}
        onClick={() => engine.skipReplay()}
      >
        <Suspense
          fallback={<div className='match-loading'>{gameTexts.loading}</div>}
        >
          <GameCanvas
            engine={engine}
            bot={bot}
            malletSkin={malletSkin}
            tableTheme={tableTheme}
            playerMood={BotMood.HAPPY}
            onFrameEvents={handleFrameEvents}
          />
        </Suspense>
        <MatchOverlay
          snapshot={snapshot}
          gameTexts={gameTexts}
          engine={engine}
        />
        {phase === MatchPhase.INTRO && (
          <div className='match-controls-hint'>{gameTexts.controlsHint}</div>
        )}
      </div>

      <header className='match-hud'>
        <PlayerBar
          name={gameTexts.you}
          subtitle={translations.page.play.skins[malletSkin.labelKey]}
          color={malletSkin.body}
          accent={malletSkin.accent}
          mood={BotMood.HAPPY}
          score={score[Side.PLAYER]}
          goalTarget={settings.goalTarget}
        />
        <div className='match-hud-center'>
          <div className='match-scoreboard'>
            <span className='match-scoreboard-player'>
              {score[Side.PLAYER]}
            </span>
            <span className='match-scoreboard-separator'>-</span>
            <span className='match-scoreboard-bot'>{score[Side.BOT]}</span>
          </div>
          <div className='match-clock'>
            <span>{clockCaption}</span>
            <strong>{clockLabel}</strong>
          </div>
          <span className='match-hud-target'>{goalTargetLabel}</span>
        </div>
        <PlayerBar
          name={botName}
          subtitle={`${translations.page.play.tiers[bot.tier]} � ${bot.rating}`}
          color={bot.color}
          accent={bot.accent}
          mood={bot.mood}
          score={score[Side.BOT]}
          goalTarget={settings.goalTarget}
          isMirrored
        />
      </header>

      <MatchToolbar
        gameTexts={gameTexts}
        isMuted={isMuted}
        isPanelOpen={isPanelOpen}
        isResignDisabled={phase === MatchPhase.FINISHED}
        onToggleMute={toggleMute}
        onTogglePanel={() => setIsPanelOpen((isOpen) => !isOpen)}
        onResign={() => engine.resign()}
      />

      {isPanelOpen && (
        <MatchPanel
          feedItems={feedItems}
          statRows={statRows}
          gameTexts={gameTexts}
        />
      )}

      {phase === MatchPhase.FINISHED && result && (
        <GameOverModal
          result={result}
          score={score}
          bot={bot}
          botName={botName}
          playerSkin={malletSkin}
          statRows={statRows}
          gameTexts={gameTexts}
          isFirstWin={isFirstWin}
          onRematch={onRematch}
          onNewOpponent={() => navigate('/play')}
        />
      )}
    </div>
  );
};

const Match = () => {
  const [searchParams] = useSearchParams();
  const settings = useMemo(
    () => parseMatchSearchParams(searchParams),
    [searchParams]
  );
  const [sessionId, setSessionId] = useState(0);

  return (
    <MatchSession
      key={`${searchParams.toString()}-${sessionId}`}
      settings={settings}
      onRematch={() => setSessionId((currentId) => currentId + 1)}
    />
  );
};

export default Match;
