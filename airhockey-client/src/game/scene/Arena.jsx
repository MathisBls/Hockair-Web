import { Sparkles } from '@react-three/drei';
import React, { useMemo } from 'react';
import { Color } from 'three';

import { PALETTE } from '../theme';

import { createGlowColor } from './glowColor';
import { FLOOR_Y } from './Table';
import { getToonGradient } from './toonGradient';

const StadiumLight = ({ position, color }) => {
  const glow = useMemo(() => createGlowColor(color, 3), [color]);

  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.02, 0.02, 1.4, 8]} />
        <meshToonMaterial color={PALETTE.ink} gradientMap={getToonGradient()} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.32, 0.12, 0.06]} />
        <meshBasicMaterial color={glow} toneMapped={false} />
      </mesh>
    </group>
  );
};

const Arena = ({ theme }) => {
  const floorColor = useMemo(() => new Color(theme.floor), [theme.floor]);

  return (
    <group>
      <color attach='background' args={[theme.sky]} />
      <fog attach='fog' args={[theme.sky, 5, 10]} />
      <hemisphereLight args={[PALETTE.white, theme.floor, 0.55]} />
      <ambientLight intensity={0.15} />
      <directionalLight
        position={[1.6, 3.4, 1.4]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0004}
      />
      <pointLight
        position={[-1.6, 0.8, 0]}
        color={PALETTE.red}
        intensity={3}
        distance={4}
      />
      <pointLight
        position={[1.6, 0.8, 0]}
        color={PALETTE.cyan}
        intensity={3}
        distance={4}
      />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, FLOOR_Y, 0]}
        receiveShadow
      >
        <circleGeometry args={[7, 64]} />
        <meshToonMaterial color={floorColor} gradientMap={getToonGradient()} />
      </mesh>
      <StadiumLight
        position={[-2.6, FLOOR_Y + 0.7, -2.6]}
        color={theme.botGoal}
      />
      <StadiumLight
        position={[2.6, FLOOR_Y + 0.7, -2.6]}
        color={theme.botGoal}
      />
      <StadiumLight
        position={[-2.6, FLOOR_Y + 0.7, 2.2]}
        color={theme.playerGoal}
      />
      <StadiumLight
        position={[2.6, FLOOR_Y + 0.7, 2.2]}
        color={theme.playerGoal}
      />
      <Sparkles
        count={60}
        scale={[5, 2, 6]}
        position={[0, 0.6, 0]}
        size={2.5}
        speed={0.3}
        color={theme.railTrim}
      />
    </group>
  );
};

export default Arena;
