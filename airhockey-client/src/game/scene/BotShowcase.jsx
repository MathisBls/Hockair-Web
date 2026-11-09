import { ContactShadows, Float, Sparkles } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import React, { useEffect, useMemo } from 'react';
import { Vector3 } from 'three';

import { GameEventType, Side } from '../constants';
import { PALETTE } from '../theme';

import { createGlowColor } from './glowColor';
import Mallet from './Mallet';
import { createSceneBus, SceneBusContext, useSceneBus } from './sceneBus';
import { getToonGradient } from './toonGradient';

const SHOWCASE_SCALE = 9;
const LOOK_DISTANCE = 1.2;
const SHOWCASE_LOOK_TARGET = new Vector3(0, 0.62, 0);

const PointerLookDriver = () => {
  const bus = useSceneBus();

  useFrame(({ pointer }) => {
    bus.renderState.puck.x = pointer.x * LOOK_DISTANCE;
    bus.renderState.puck.z = LOOK_DISTANCE;
    bus.frameEvents = bus.pendingEvents;
    bus.pendingEvents = [];
  }, -1);

  return null;
};

const ShowcaseCameraAim = () => {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.lookAt(SHOWCASE_LOOK_TARGET);
  }, [camera]);

  return null;
};

const Pedestal = ({ color }) => {
  const glow = useMemo(() => createGlowColor(color, 2.4), [color]);

  return (
    <group position={[0, -0.02, 0]}>
      <mesh receiveShadow>
        <cylinderGeometry args={[0.95, 1.05, 0.18, 48]} />
        <meshToonMaterial
          color={PALETTE.blue}
          gradientMap={getToonGradient()}
        />
      </mesh>
      <mesh position={[0, 0.092, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.86, 0.92, 64]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
    </group>
  );
};

const BotShowcase = ({ bot }) => {
  const bus = useMemo(() => {
    const sceneBus = createSceneBus();
    sceneBus.renderState = {
      puck: { x: 0, z: 1 },
      botMallet: { x: 0, z: 0, vx: 0, vz: 0 },
    };
    sceneBus.pendingEvents = [];

    return sceneBus;
  }, []);

  const handlePoke = () => {
    bus.pendingEvents.push({
      type: GameEventType.MALLET_HIT,
      side: Side.BOT,
      strength: 5,
    });
  };

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: 30, position: [0, 1.7, 4.6] }}
      onPointerDown={handlePoke}
    >
      <SceneBusContext.Provider value={bus}>
        <ShowcaseCameraAim />
        <PointerLookDriver />
        <hemisphereLight args={[PALETTE.white, PALETTE.blue, 1.1]} />
        <directionalLight position={[2, 4, 3]} intensity={2.4} castShadow />
        <pointLight position={[-2, 1, 1]} color={PALETTE.red} intensity={6} />
        <pointLight position={[2, 1, 1]} color={PALETTE.cyan} intensity={6} />
        <Pedestal color={bot.color} />
        <Float speed={2.4} rotationIntensity={0.25} floatIntensity={0.6}>
          <group position={[0, 0.12, 0]} scale={SHOWCASE_SCALE}>
            <Mallet
              key={bot.id}
              side={Side.BOT}
              stateKey='botMallet'
              bodyColor={bot.color}
              accentColor={bot.accent}
              mood={bot.mood}
              facing={-1}
            />
          </group>
        </Float>
        <ContactShadows
          position={[0, 0.075, 0]}
          opacity={0.5}
          scale={3}
          blur={2.4}
        />
        <Sparkles
          count={40}
          scale={[3.5, 2, 2]}
          position={[0, 1, 0]}
          size={3}
          speed={0.4}
          color={bot.color}
        />
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur luminanceThreshold={1} intensity={1} />
        </EffectComposer>
      </SceneBusContext.Provider>
    </Canvas>
  );
};

export default BotShowcase;
