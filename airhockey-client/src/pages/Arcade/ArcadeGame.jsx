import {
  ArrowBack as BackIcon,
  SportsEsports as ArcadeIcon,
  VolumeOff as SoundOffIcon,
  VolumeUp as SoundOnIcon,
} from '@mui/icons-material';
import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useLanguage } from '../../../LanguageContext';
import { ArcadeGameId, findArcadeGame } from '../../arcade/arcadeGames';
import {
  recordArcadeSession,
  recordBankShotLevel,
} from '../../arcade/arcadeProgress';
import { playArcadeEvents } from '../../arcade/arcadeSounds';
import { ArcadePhase } from '../../arcade/engine/arcadeEngine';
import { BankShotEngine } from '../../arcade/engine/bankShotEngine';
import { GoalieReflexEngine } from '../../arcade/engine/goalieReflexEngine';
import { TargetRushEngine } from '../../arcade/engine/targetRushEngine';
import ArcadeCanvas from '../../arcade/scene/ArcadeCanvas';
import ArcadeObstacles from '../../arcade/scene/ArcadeObstacles';
import ArcadeTargets from '../../arcade/scene/ArcadeTargets';
import {
  Button,
  ButtonVariant,
  EmptyState,
  PageContainer,
} from '../../components/ui';
import { soundEngine } from '../../game/audio/soundEngine';
import { BotMood, findBot } from '../../game/bots';
import { useMatchSnapshot } from '../../game/engine/matchStore';
import { normalizeMatchSettings } from '../../game/matchSettings';
import { getStoredMatchSettings } from '../../game/progress';
import { findMalletSkin, findTableTheme } from '../../game/theme';

import ArcadeHud from './ArcadeHud';
import ArcadeResultPanel from './ArcadeResultPanel';
import ArcadeStartPanel from './ArcadeStartPanel';
import {
  buildBankShotLevels,
  buildHudModel,
  buildResultModel,
  buildStartModel,
  findDefaultBankShotLevelId,
} from './arcadeViewModel';
import './ArcadeGame.css';

const ARCADE_PATH = '/arcade';
const SHOOTER_BOT_ID = 'viper';
const QUIT_KEYS = ['Escape'];
const POINTER_HIDDEN_PHASES = [ArcadePhase.COUNTDOWN, ArcadePhase.PLAYING];
const HUD_PHASES = [
  ArcadePhase.INTRO,
  ArcadePhase.COUNTDOWN,
  ArcadePhase.PLAYING,
];

const ENGINE_FACTORY_BY_GAME_ID = {
  [ArcadeGameId.TARGET_RUSH]: () => new TargetRushEngine(),
  [ArcadeGameId.GOALIE_REFLEX]: () => new GoalieReflexEngine(),
  [ArcadeGameId.BANK_SHOT]: () =>
    new BankShotEngine({ levelId: findDefaultBankShotLevelId() }),
};

const recordSession = (gameId, snapshot) =>
  gameId === ArcadeGameId.BANK_SHOT
    ? recordBankShotLevel(snapshot.levelId, snapshot.stars)
    : recordArcadeSession(gameId, snapshot.finalScore);

const buildSceneContent = (game, engine, snapshot, tableTheme) => {
  if (game.id === ArcadeGameId.TARGET_RUSH) {
    return <ArcadeTargets targets={engine.renderState.targets} />;
  }
  if (game.id === ArcadeGameId.BANK_SHOT) {
    return (
      <ArcadeObstacles
        key={snapshot.levelId}
        obstacles={engine.obstacles}
        markers={engine.renderState.markers}
        theme={tableTheme}
      />
    );
  }

  return null;
};

const ArcadeSession = ({ game }) => {
  const navigate = useNavigate();
  const { translations, language } = useLanguage();
  const texts = translations.page.arcade;
  const gameTexts = texts.games[game.translationKey];
  const [settings] = useState(() =>
    normalizeMatchSettings(getStoredMatchSettings())
  );
  const malletSkin = findMalletSkin(settings.malletSkinId);
  const tableTheme = findTableTheme(settings.tableThemeId);
  const shooter =
    game.id === ArcadeGameId.GOALIE_REFLEX ? findBot(SHOOTER_BOT_ID) : null;
  const engine = useMemo(() => ENGINE_FACTORY_BY_GAME_ID[game.id](), [game]);
  const snapshot = useMatchSnapshot(engine.store);
  const { phase, countdownValue, kickoffId, sessionId } = snapshot;
  const [isMuted, setIsMuted] = useState(() => soundEngine.getMuted());
  const [sessionRecord, setSessionRecord] = useState(null);
  const [progressVersion, setProgressVersion] = useState(0);
  const recordedSessionIdRef = useRef(0);
  const hasLevels = game.id === ArcadeGameId.BANK_SHOT;

  const handleFrameEvents = useCallback((events) => {
    playArcadeEvents(events);
  }, []);

  useEffect(() => {
    if (phase === ArcadePhase.COUNTDOWN && countdownValue > 0) {
      soundEngine.playCountdownTick(false);
    }
  }, [phase, countdownValue]);

  useEffect(() => {
    if (kickoffId > 0) {
      soundEngine.playCountdownTick(true);
    }
  }, [kickoffId]);

  useEffect(() => {
    const isNewFinish =
      phase === ArcadePhase.FINISHED &&
      recordedSessionIdRef.current !== sessionId;
    if (!isNewFinish) {
      return;
    }
    recordedSessionIdRef.current = sessionId;
    setSessionRecord(recordSession(game.id, engine.snapshot));
    setProgressVersion((version) => version + 1);
  }, [phase, sessionId, game.id, engine]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        QUIT_KEYS.includes(event.key) &&
        HUD_PHASES.includes(engine.arcadePhase)
      ) {
        engine.abandon();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  const startModel = useMemo(
    () => buildStartModel(game, texts, language),
    [game, texts, language, progressVersion]
  );
  const levels = useMemo(
    () => (hasLevels ? buildBankShotLevels(texts, snapshot.levelId) : null),
    [hasLevels, texts, snapshot.levelId, progressVersion]
  );
  const hudModel = useMemo(
    () => buildHudModel(game, snapshot, texts, language),
    [game, snapshot, texts, language]
  );
  const resultModel = useMemo(
    () =>
      phase === ArcadePhase.FINISHED
        ? buildResultModel(game, snapshot, sessionRecord, texts, language)
        : null,
    [phase, game, snapshot, sessionRecord, texts, language]
  );
  const sceneContent = buildSceneContent(game, engine, snapshot, tableTheme);
  const isPointerHidden = POINTER_HIDDEN_PHASES.includes(phase);
  const isHudVisible = HUD_PHASES.includes(phase);
  const isCountdownVisible =
    phase === ArcadePhase.COUNTDOWN && countdownValue > 0;
  const isStartVisible = phase === ArcadePhase.READY;

  const startSession = () => {
    setSessionRecord(null);
    engine.start();
  };

  const startLevel = (levelId) => {
    engine.selectLevel(levelId);
    startSession();
  };

  const toggleMute = () => {
    soundEngine.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const goBackToArcade = () => navigate(ARCADE_PATH);

  return (
    <div className='arcade-stage'>
      <div
        className={`arcade-canvas ${isPointerHidden ? 'arcade-canvas-playing' : ''}`}
      >
        <Suspense
          fallback={<div className='arcade-loading'>{texts.loading}</div>}
        >
          <ArcadeCanvas
            engine={engine}
            malletSkin={malletSkin}
            playerMood={BotMood.HAPPY}
            tableTheme={tableTheme}
            shooter={shooter}
            onFrameEvents={handleFrameEvents}
          >
            {sceneContent}
          </ArcadeCanvas>
        </Suspense>
      </div>

      <div className='arcade-topbar'>
        <Button
          variant={ButtonVariant.SECONDARY}
          icon={<BackIcon />}
          onClick={goBackToArcade}
        >
          {texts.backToArcade}
        </Button>
        <span className='arcade-topbar-title'>
          <ArcadeIcon aria-hidden='true' />
          {gameTexts.name}
        </span>
        <Button
          variant={ButtonVariant.SECONDARY}
          icon={isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
          onClick={toggleMute}
          aria-label={isMuted ? texts.soundOff : texts.soundOn}
          title={isMuted ? texts.soundOff : texts.soundOn}
        />
      </div>

      {isHudVisible && <ArcadeHud model={hudModel} />}
      {isHudVisible && <p className='arcade-quit-hint'>{texts.quitHint}</p>}
      {isCountdownVisible && (
        <div className='arcade-countdown' key={countdownValue}>
          {countdownValue}
        </div>
      )}

      {isStartVisible && (
        <ArcadeStartPanel
          model={startModel}
          texts={texts}
          levels={levels}
          onSelectLevel={(levelId) => engine.selectLevel(levelId)}
          onStart={startSession}
          onBack={goBackToArcade}
        />
      )}

      {resultModel && (
        <ArcadeResultPanel
          model={resultModel}
          texts={texts}
          hasLevels={hasLevels}
          onRetry={startSession}
          onNextLevel={startLevel}
          onShowLevels={() => engine.abandon()}
          onBack={goBackToArcade}
        />
      )}
    </div>
  );
};

const ArcadeGame = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { translations } = useLanguage();
  const texts = translations.page.arcade;
  const game = findArcadeGame(gameId);

  if (!game) {
    return (
      <PageContainer>
        <EmptyState
          icon={<ArcadeIcon />}
          title={texts.notFound.title}
          description={texts.notFound.description}
          action={
            <Button onClick={() => navigate(ARCADE_PATH)}>
              {texts.backToArcade}
            </Button>
          }
        />
      </PageContainer>
    );
  }

  return <ArcadeSession key={game.id} game={game} />;
};

export default ArcadeGame;
