import { Canvas, useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing';
import React, { useMemo, useRef } from 'react';
import { Vector2 } from 'three';

import { Side } from '../constants';

import Arena from './Arena';
import CameraRig from './CameraRig';
import GameLoop from './GameLoop';
import Mallet from './Mallet';
import Puck from './Puck';
import { createSceneBus, SceneBusContext, useSceneBus } from './sceneBus';
import Table from './Table';
import VfxSystem from './VfxSystem';

const PLAYER_FACING = 1;
const BOT_FACING = -1;
const MAX_ABERRATION = 0.006;

const ImpactAberration = () => {
  const bus = useSceneBus();
  const effectRef = useRef(null);
  const offset = useMemo(() => new Vector2(0, 0), []);

  useFrame(() => {
    if (!effectRef.current) {
      return;
    }
    const amount = bus.cameraTrauma * bus.cameraTrauma * MAX_ABERRATION;
    effectRef.current.offset.set(amount, amount * 0.6);
  });

  return (
    <ChromaticAberration
      ref={effectRef}
      offset={offset}
      radialModulation={false}
      modulationOffset={0}
    />
  );
};

const GameCanvas = ({
  engine,
  bot,
  malletSkin,
  tableTheme,
  playerMood,
  onFrameEvents,
}) => {
  const bus = useMemo(createSceneBus, []);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 46, near: 0.05, far: 30, position: [2.6, 2.4, -2.4] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <SceneBusContext.Provider value={bus}>
        <GameLoop engine={engine} onFrameEvents={onFrameEvents} />
        <CameraRig />
        <Arena theme={tableTheme} />
        <Table theme={tableTheme} />
        <Puck />
        <Mallet
          side={Side.PLAYER}
          stateKey='playerMallet'
          bodyColor={malletSkin.body}
          accentColor={malletSkin.accent}
          mood={playerMood}
          facing={PLAYER_FACING}
        />
        <Mallet
          side={Side.BOT}
          stateKey='botMallet'
          bodyColor={bot.color}
          accentColor={bot.accent}
          mood={bot.mood}
          facing={BOT_FACING}
        />
        <VfxSystem playerColor={malletSkin.body} botColor={bot.color} />
        <EffectComposer multisampling={4}>
          <Bloom
            mipmapBlur
            luminanceThreshold={1}
            luminanceSmoothing={0.2}
            intensity={1.15}
          />
          <ImpactAberration />
          <Vignette eskil={false} offset={0.2} darkness={0.75} />
        </EffectComposer>
      </SceneBusContext.Provider>
    </Canvas>
  );
};

export default GameCanvas;
