import { Outlines, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';

import { createGlowColor } from '../../game/scene/glowColor';
import { getToonGradient } from '../../game/scene/toonGradient';
import { PALETTE } from '../../game/theme';
import { getObstacleHitGlow, ObstacleKind } from '../engine/obstacles';

const OBSTACLE_HEIGHT = 0.05;
const TRIM_HEIGHT = 0.008;
const OUTLINE_THICKNESS = 0.008;
const BASE_GLOW = 1.4;
const HIT_GLOW_BOOST = 3;
const MARKER_Y = 0.003;
const FLAT_ROTATION = [-Math.PI / 2, 0, 0];

const useTrimGlow = (obstacle, trimColor) => {
  const trimRef = useRef(null);
  const groupRef = useRef(null);
  const baseGlow = useMemo(
    () => createGlowColor(trimColor, BASE_GLOW),
    [trimColor]
  );

  useFrame(() => {
    if (!groupRef.current || !trimRef.current) {
      return;
    }
    groupRef.current.position.set(obstacle.x, 0, obstacle.z);
    const boost = 1 + getObstacleHitGlow(obstacle) * HIT_GLOW_BOOST;
    trimRef.current.material.color.copy(baseGlow).multiplyScalar(boost);
  });

  return { groupRef, trimRef, baseGlow };
};

const BlockObstacle = ({ obstacle, bodyColor, trimColor }) => {
  const { groupRef, trimRef, baseGlow } = useTrimGlow(obstacle, trimColor);

  return (
    <group ref={groupRef} position={[obstacle.x, 0, obstacle.z]}>
      <RoundedBox
        args={[obstacle.width, OBSTACLE_HEIGHT, obstacle.depth]}
        radius={0.012}
        smoothness={3}
        position={[0, OBSTACLE_HEIGHT / 2, 0]}
        castShadow
        receiveShadow
      >
        <meshToonMaterial color={bodyColor} gradientMap={getToonGradient()} />
        <Outlines thickness={OUTLINE_THICKNESS} color={PALETTE.ink} />
      </RoundedBox>
      <mesh ref={trimRef} position={[0, OBSTACLE_HEIGHT + TRIM_HEIGHT / 2, 0]}>
        <boxGeometry
          args={[obstacle.width * 0.86, TRIM_HEIGHT, obstacle.depth * 0.3]}
        />
        <meshBasicMaterial color={baseGlow} toneMapped={false} />
      </mesh>
    </group>
  );
};

const BumperObstacle = ({ obstacle, bodyColor, trimColor }) => {
  const { groupRef, trimRef, baseGlow } = useTrimGlow(obstacle, trimColor);

  return (
    <group ref={groupRef} position={[obstacle.x, 0, obstacle.z]}>
      <mesh position={[0, OBSTACLE_HEIGHT / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry
          args={[obstacle.radius, obstacle.radius, OBSTACLE_HEIGHT, 36]}
        />
        <meshToonMaterial color={bodyColor} gradientMap={getToonGradient()} />
        <Outlines thickness={OUTLINE_THICKNESS} color={PALETTE.ink} />
      </mesh>
      <mesh
        ref={trimRef}
        rotation={FLAT_ROTATION}
        position={[0, OBSTACLE_HEIGHT + 0.001, 0]}
      >
        <ringGeometry
          args={[obstacle.radius * 0.45, obstacle.radius * 0.7, 36]}
        />
        <meshBasicMaterial color={baseGlow} toneMapped={false} />
      </mesh>
    </group>
  );
};

const OBSTACLE_COMPONENT_BY_KIND = {
  [ObstacleKind.BLOCK]: BlockObstacle,
  [ObstacleKind.BUMPER]: BumperObstacle,
};

const StartMarker = ({ marker }) => (
  <mesh rotation={FLAT_ROTATION} position={[marker.x, MARKER_Y, marker.z]}>
    <ringGeometry args={[marker.radius * 0.86, marker.radius, 40]} />
    <meshBasicMaterial color={PALETTE.ink} transparent opacity={0.35} />
  </mesh>
);

const ArcadeObstacles = ({ obstacles, markers, theme }) => (
  <group>
    {obstacles.map((obstacle, index) => {
      const ObstacleComponent = OBSTACLE_COMPONENT_BY_KIND[obstacle.kind];

      return (
        <ObstacleComponent
          key={`obstacle-${index}`}
          obstacle={obstacle}
          bodyColor={theme.rail}
          trimColor={obstacle.motion ? PALETTE.gold : theme.railTrim}
        />
      );
    })}
    {markers.map((marker, index) => (
      <StartMarker key={`marker-${index}`} marker={marker} />
    ))}
  </group>
);

export default ArcadeObstacles;
