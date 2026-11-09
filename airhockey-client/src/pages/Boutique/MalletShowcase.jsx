import { ContactShadows, Float } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import React, { useEffect, useMemo } from 'react';
import { Vector3 } from 'three';

import { BotMood } from '../../game/bots';
import { Side } from '../../game/constants';
import Mallet from '../../game/scene/Mallet';
import { createSceneBus, SceneBusContext } from '../../game/scene/sceneBus';
import { PALETTE } from '../../game/theme';

const SHOWCASE_SCALE = 8;
const LOOK_DISTANCE = 1.2;
const CAMERA_POSITION = [0, 1.6, -4.4];
const CAMERA_FIELD_OF_VIEW = 30;
const LOOK_TARGET = new Vector3(0, 0.55, 0);
const SHOWCASE_STATE_KEY = 'showcaseMallet';

const createShowcaseBus = () => {
  const bus = createSceneBus();
  bus.renderState = {
    puck: { x: 0, z: -LOOK_DISTANCE },
    [SHOWCASE_STATE_KEY]: { x: 0, z: 0, vx: 0, vz: 0 },
  };

  return bus;
};

const PointerGaze = ({ bus }) => {
  useFrame(({ pointer }) => {
    bus.renderState.puck.x = -pointer.x * LOOK_DISTANCE;
  });

  return null;
};

const CameraAim = () => {
  const camera = useThree((state) => state.camera);

  useEffect(() => {
    camera.lookAt(LOOK_TARGET);
  }, [camera]);

  return null;
};

const MalletShowcase = ({ bodyColor, accentColor }) => {
  const bus = useMemo(createShowcaseBus, []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: CAMERA_FIELD_OF_VIEW, position: CAMERA_POSITION }}
    >
      <SceneBusContext.Provider value={bus}>
        <CameraAim />
        <PointerGaze bus={bus} />
        <hemisphereLight args={[PALETTE.white, PALETTE.blue, 1.2]} />
        <directionalLight position={[-2, 4, -3]} intensity={2.2} />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <group position={[0, 0.1, 0]} scale={SHOWCASE_SCALE}>
            <Mallet
              side={Side.PLAYER}
              stateKey={SHOWCASE_STATE_KEY}
              bodyColor={bodyColor}
              accentColor={accentColor}
              mood={BotMood.COOL}
              facing={1}
            />
          </group>
        </Float>
        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.45}
          scale={3}
          blur={2.4}
        />
      </SceneBusContext.Provider>
    </Canvas>
  );
};

export default MalletShowcase;
