import { Canvas } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import React, { useMemo } from 'react';

import { Side } from '../../game/constants';
import Arena from '../../game/scene/Arena';
import CameraRig from '../../game/scene/CameraRig';
import GameLoop from '../../game/scene/GameLoop';
import Mallet from '../../game/scene/Mallet';
import { createSceneBus, SceneBusContext } from '../../game/scene/sceneBus';
import Table from '../../game/scene/Table';
import VfxSystem from '../../game/scene/VfxSystem';
import { PALETTE } from '../../game/theme';

import ArcadePucks from './ArcadePucks';

const PLAYER_FACING = 1;
const SHOOTER_FACING = -1;
const INITIAL_CAMERA_POSITION = [2.6, 2.4, -2.4];

const ArcadeCanvas = ({
  engine,
  malletSkin,
  playerMood,
  tableTheme,
  shooter = null,
  onFrameEvents,
  children,
}) => {
  const bus = useMemo(createSceneBus, []);
  const opponentColor = shooter ? shooter.color : PALETTE.red;

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        fov: 46,
        near: 0.05,
        far: 30,
        position: INITIAL_CAMERA_POSITION,
      }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <SceneBusContext.Provider value={bus}>
        <GameLoop engine={engine} onFrameEvents={onFrameEvents} />
        <CameraRig />
        <Arena theme={tableTheme} />
        <Table theme={tableTheme} />
        <ArcadePucks puckViews={engine.renderState.puckViews} />
        <Mallet
          side={Side.PLAYER}
          stateKey='playerMallet'
          bodyColor={malletSkin.body}
          accentColor={malletSkin.accent}
          mood={playerMood}
          facing={PLAYER_FACING}
        />
        {shooter && (
          <Mallet
            side={Side.BOT}
            stateKey='botMallet'
            bodyColor={shooter.color}
            accentColor={shooter.accent}
            mood={shooter.mood}
            facing={SHOOTER_FACING}
          />
        )}
        {children}
        <VfxSystem playerColor={malletSkin.body} botColor={opponentColor} />
        <EffectComposer multisampling={4}>
          <Bloom
            mipmapBlur
            luminanceThreshold={1}
            luminanceSmoothing={0.2}
            intensity={1.1}
          />
          <Vignette eskil={false} offset={0.2} darkness={0.7} />
        </EffectComposer>
      </SceneBusContext.Provider>
    </Canvas>
  );
};

export default ArcadeCanvas;
