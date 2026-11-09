import {
  Flag as ResignIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as ExitFullscreenIcon,
  ViewSidebar as PanelIcon,
  VolumeOff as SoundOffIcon,
  VolumeUp as SoundOnIcon,
} from '@mui/icons-material';
import React, { useEffect, useRef, useState } from 'react';

const RESIGN_CONFIRM_MILLISECONDS = 3000;

const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(
    () => document.fullscreenElement !== null
  );

  useEffect(() => {
    const handleChange = () =>
      setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', handleChange);

    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen?.();
    }
  };

  return { isFullscreen, toggleFullscreen };
};

const MatchToolbar = ({
  gameTexts,
  isMuted,
  isPanelOpen,
  isResignDisabled,
  onToggleMute,
  onTogglePanel,
  onResign,
}) => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const [isConfirmingResign, setIsConfirmingResign] = useState(false);
  const resignTimeoutRef = useRef(0);

  useEffect(() => () => clearTimeout(resignTimeoutRef.current), []);

  const handleResignClick = () => {
    clearTimeout(resignTimeoutRef.current);
    if (isConfirmingResign) {
      setIsConfirmingResign(false);
      onResign();

      return;
    }
    setIsConfirmingResign(true);
    resignTimeoutRef.current = setTimeout(
      () => setIsConfirmingResign(false),
      RESIGN_CONFIRM_MILLISECONDS
    );
  };

  return (
    <div className='match-toolbar' onClick={(event) => event.stopPropagation()}>
      <button
        type='button'
        className='match-action'
        onClick={onToggleMute}
        title={isMuted ? gameTexts.soundOff : gameTexts.soundOn}
      >
        {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
      </button>
      <button
        type='button'
        className={`match-action ${isPanelOpen ? 'match-action-active' : ''}`}
        onClick={onTogglePanel}
        title={isPanelOpen ? gameTexts.hidePanel : gameTexts.showPanel}
      >
        <PanelIcon />
      </button>
      <button
        type='button'
        className='match-action'
        onClick={toggleFullscreen}
        title={isFullscreen ? gameTexts.exitFullscreen : gameTexts.fullscreen}
      >
        {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
      </button>
      <button
        type='button'
        className={`match-action match-action-resign ${isConfirmingResign ? 'match-action-confirm' : ''}`}
        onClick={handleResignClick}
        disabled={isResignDisabled}
      >
        <ResignIcon />
        {isConfirmingResign ? gameTexts.confirmResign : gameTexts.resign}
      </button>
    </div>
  );
};

export default MatchToolbar;
