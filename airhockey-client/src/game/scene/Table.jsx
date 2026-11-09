import { Outlines, RoundedBox } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';

import {
  GOAL_HALF_WIDTH,
  HALF_LENGTH,
  HALF_WIDTH,
  Side,
  TABLE,
} from '../constants';
import { PALETTE } from '../theme';

import { createGlowColor } from './glowColor';
import { useSceneBus } from './sceneBus';
import { getToonGradient } from './toonGradient';

const TEXTURE_PIXELS_PER_UNIT = 600;
const OUTLINE_THICKNESS = 0.012;
const LEG_HEIGHT = 0.66;
export const FLOOR_Y = -TABLE.surfaceThickness - LEG_HEIGHT;

const drawSurfaceMarkings = (context, width, height, theme) => {
  const unit = width / TABLE.width;
  context.fillStyle = theme.surface;
  context.fillRect(0, 0, width, height);

  context.fillStyle = theme.surfaceLine;
  context.globalAlpha = 0.22;
  const holeSpacing = 0.05 * unit;
  for (let y = holeSpacing / 2; y < height; y += holeSpacing) {
    for (let x = holeSpacing / 2; x < width; x += holeSpacing) {
      context.beginPath();
      context.arc(x, y, 0.0045 * unit, 0, Math.PI * 2);
      context.fill();
    }
  }
  context.globalAlpha = 1;

  context.strokeStyle = theme.surfaceLine;
  context.lineWidth = 0.012 * unit;
  context.beginPath();
  context.moveTo(0, height / 2);
  context.lineTo(width, height / 2);
  context.stroke();

  context.beginPath();
  context.arc(width / 2, height / 2, 0.18 * unit, 0, Math.PI * 2);
  context.stroke();

  context.fillStyle = theme.surfaceLine;
  context.beginPath();
  context.arc(width / 2, height / 2, 0.025 * unit, 0, Math.PI * 2);
  context.fill();

  const creaseRadius = (GOAL_HALF_WIDTH + 0.06) * unit;
  [
    { y: 0, color: theme.botGoal, start: 0, end: Math.PI },
    { y: height, color: theme.playerGoal, start: Math.PI, end: Math.PI * 2 },
  ].forEach(({ y, color, start, end }) => {
    context.strokeStyle = color;
    context.lineWidth = 0.014 * unit;
    context.beginPath();
    context.arc(width / 2, y, creaseRadius, start, end);
    context.stroke();
    context.globalAlpha = 0.12;
    context.fillStyle = color;
    context.fill();
    context.globalAlpha = 1;
  });

  context.save();
  context.translate(width / 2, height / 2);
  context.rotate(-Math.PI / 2);
  context.globalAlpha = 0.1;
  context.fillStyle = theme.rail;
  context.font = `900 ${0.11 * unit}px Inter, Arial, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('HOCKAIR', -0.5 * unit, 0);
  context.fillText('HOCKAIR', 0.5 * unit, 0);
  context.restore();
};

const useSurfaceTexture = (theme) => {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(TABLE.width * TEXTURE_PIXELS_PER_UNIT);
    canvas.height = Math.round(TABLE.length * TEXTURE_PIXELS_PER_UNIT);
    const context = canvas.getContext('2d');
    if (context) {
      drawSurfaceMarkings(context, canvas.width, canvas.height, theme);
    }
    const canvasTexture = new CanvasTexture(canvas);
    canvasTexture.colorSpace = SRGBColorSpace;
    canvasTexture.anisotropy = 8;

    return canvasTexture;
  }, [theme]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
};

const ToonBox = ({ position, size, color, radius = 0.018, outline = true }) => (
  <RoundedBox
    args={size}
    radius={radius}
    smoothness={3}
    position={position}
    castShadow
    receiveShadow
  >
    <meshToonMaterial color={color} gradientMap={getToonGradient()} />
    {outline && <Outlines thickness={OUTLINE_THICKNESS} color={PALETTE.ink} />}
  </RoundedBox>
);

const GoalSlot = ({ side, theme }) => {
  const bus = useSceneBus();
  const glowRef = useRef(null);
  const isPlayerGoal = side === Side.PLAYER;
  const goalColor = isPlayerGoal ? theme.playerGoal : theme.botGoal;
  const baseGlow = useMemo(() => createGlowColor(goalColor, 1.6), [goalColor]);
  const zSign = isPlayerGoal ? 1 : -1;

  useFrame(() => {
    if (!glowRef.current) {
      return;
    }
    const scoredHere =
      bus.goalFlash.side !== null &&
      bus.goalFlash.side !== side &&
      bus.goalFlash.intensity > 0;
    const boost = scoredHere ? 1 + bus.goalFlash.intensity * 5 : 1;
    glowRef.current.material.color.copy(baseGlow).multiplyScalar(boost);
  });

  return (
    <group position={[0, 0, zSign * (HALF_LENGTH + TABLE.railThickness / 2)]}>
      <mesh position={[0, -0.03, 0]}>
        <boxGeometry
          args={[TABLE.goalWidth, 0.05, TABLE.railThickness + 0.002]}
        />
        <meshBasicMaterial color={PALETTE.black} />
      </mesh>
      <mesh
        ref={glowRef}
        position={[0, -0.004, zSign * (TABLE.railThickness / 2 - 0.006)]}
      >
        <boxGeometry args={[TABLE.goalWidth, 0.012, 0.012]} />
        <meshBasicMaterial color={baseGlow} toneMapped={false} />
      </mesh>
    </group>
  );
};

const NeonStrip = ({ position, size, color }) => {
  const glow = useMemo(() => createGlowColor(color, 2.2), [color]);

  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshBasicMaterial color={glow} toneMapped={false} />
    </mesh>
  );
};

const Rails = ({ theme }) => {
  const thickness = TABLE.railThickness;
  const railHeight = TABLE.railHeight + TABLE.surfaceThickness;
  const railCenterY = TABLE.railHeight - railHeight / 2;
  const sideRailLength = TABLE.length + thickness * 2;
  const endRailLength = HALF_WIDTH - GOAL_HALF_WIDTH + thickness;
  const endRailCenterX = GOAL_HALF_WIDTH + endRailLength / 2;
  const trimY = TABLE.railHeight + 0.002;

  return (
    <group>
      {[-1, 1].map((sign) => (
        <group key={`side-${sign}`}>
          <ToonBox
            position={[sign * (HALF_WIDTH + thickness / 2), railCenterY, 0]}
            size={[thickness, railHeight, sideRailLength]}
            color={theme.rail}
          />
          <NeonStrip
            position={[sign * (HALF_WIDTH + 0.012), trimY, 0]}
            size={[0.012, 0.006, TABLE.length]}
            color={theme.railTrim}
          />
        </group>
      ))}
      {[-1, 1].map((zSign) =>
        [-1, 1].map((xSign) => (
          <group key={`end-${zSign}-${xSign}`}>
            <ToonBox
              position={[
                xSign * endRailCenterX,
                railCenterY,
                zSign * (HALF_LENGTH + thickness / 2),
              ]}
              size={[endRailLength, railHeight, thickness]}
              color={theme.rail}
            />
            <NeonStrip
              position={[
                xSign * (GOAL_HALF_WIDTH + (HALF_WIDTH - GOAL_HALF_WIDTH) / 2),
                trimY,
                zSign * (HALF_LENGTH + 0.012),
              ]}
              size={[HALF_WIDTH - GOAL_HALF_WIDTH, 0.006, 0.012]}
              color={zSign > 0 ? theme.playerGoal : theme.botGoal}
            />
          </group>
        ))
      )}
    </group>
  );
};

const TableBase = ({ theme }) => {
  const bodyTop = -TABLE.surfaceThickness;
  const skirtHeight = 0.14;
  const legInsetX = HALF_WIDTH - 0.08;
  const legInsetZ = HALF_LENGTH - 0.12;

  return (
    <group>
      <ToonBox
        position={[0, bodyTop - skirtHeight / 2, 0]}
        size={[TABLE.width + 0.1, skirtHeight, TABLE.length + 0.1]}
        color={theme.rail}
        radius={0.03}
      />
      <NeonStrip
        position={[0, bodyTop - skirtHeight / 2, TABLE.length / 2 + 0.052]}
        size={[TABLE.width * 0.7, 0.014, 0.006]}
        color={theme.railTrim}
      />
      <NeonStrip
        position={[0, bodyTop - skirtHeight / 2, -TABLE.length / 2 - 0.052]}
        size={[TABLE.width * 0.7, 0.014, 0.006]}
        color={theme.railTrim}
      />
      {[-1, 1].map((xSign) =>
        [-1, 1].map((zSign) => (
          <ToonBox
            key={`leg-${xSign}-${zSign}`}
            position={[
              xSign * legInsetX,
              bodyTop - LEG_HEIGHT / 2,
              zSign * legInsetZ,
            ]}
            size={[0.1, LEG_HEIGHT, 0.1]}
            color={PALETTE.ink}
            radius={0.03}
          />
        ))
      )}
    </group>
  );
};

const Table = ({ theme }) => {
  const surfaceTexture = useSurfaceTexture(theme);

  return (
    <group>
      <mesh position={[0, -TABLE.surfaceThickness / 2, 0]} receiveShadow>
        <boxGeometry
          args={[TABLE.width, TABLE.surfaceThickness, TABLE.length]}
        />
        <meshToonMaterial color={theme.rail} gradientMap={getToonGradient()} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.0005, 0]}
        receiveShadow
      >
        <planeGeometry args={[TABLE.width, TABLE.length]} />
        <meshToonMaterial
          map={surfaceTexture}
          gradientMap={getToonGradient()}
        />
      </mesh>
      <Rails theme={theme} />
      <GoalSlot side={Side.PLAYER} theme={theme} />
      <GoalSlot side={Side.BOT} theme={theme} />
      <TableBase theme={theme} />
    </group>
  );
};

export default Table;
