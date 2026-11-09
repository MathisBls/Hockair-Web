import { Outlines } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  LatheGeometry,
  Vector2,
} from 'three';

import { GameEventType, HALF_LENGTH, PUCK } from '../constants';
import { PALETTE } from '../theme';

import { useSceneBus } from './sceneBus';
import { getToonGradient } from './toonGradient';

const TRAIL_POINTS = 34;
const TRAIL_Y = 0.004;
const TELEPORT_DISTANCE = 0.25;
const HIDDEN_BEYOND_Z = HALF_LENGTH + 0.12;
const SLOW_COLOR = new Color(PALETTE.cyan);
const MEDIUM_COLOR = new Color(PALETTE.redFocus);
const FAST_COLOR = new Color(PALETTE.orange);
const BLAZING_COLOR = new Color(PALETTE.gold);

const createPuckGeometry = () => {
  const radius = PUCK.radius;
  const height = PUCK.height;
  const profile = [
    [0, 0],
    [radius * 0.94, 0],
    [radius, height * 0.2],
    [radius, height * 0.8],
    [radius * 0.94, height],
    [radius * 0.7, height],
    [radius * 0.66, height * 0.82],
    [0, height * 0.82],
  ].map(([x, y]) => new Vector2(x, y));

  return new LatheGeometry(profile, 36);
};

const getSpeedColor = (speed, target) => {
  const ratio = Math.min(speed / PUCK.maxSpeed, 1);
  if (ratio < 0.35) {
    return target.copy(SLOW_COLOR).lerp(MEDIUM_COLOR, ratio / 0.35);
  }
  if (ratio < 0.7) {
    return target.copy(MEDIUM_COLOR).lerp(FAST_COLOR, (ratio - 0.35) / 0.35);
  }

  return target.copy(FAST_COLOR).lerp(BLAZING_COLOR, (ratio - 0.7) / 0.3);
};

const createTrailGeometry = () => {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(TRAIL_POINTS * 2 * 3), 3)
  );
  geometry.setAttribute(
    'color',
    new BufferAttribute(new Float32Array(TRAIL_POINTS * 2 * 3), 3)
  );
  const indices = [];
  for (let index = 0; index < TRAIL_POINTS - 1; index += 1) {
    const left = index * 2;
    indices.push(left, left + 1, left + 2, left + 1, left + 3, left + 2);
  }
  geometry.setIndex(indices);

  return geometry;
};

const Puck = () => {
  const bus = useSceneBus();
  const puckRef = useRef(null);
  const bodyRef = useRef(null);
  const stripeRef = useRef(null);
  const trailRef = useRef(null);
  const trail = useRef({
    points: Array.from({ length: TRAIL_POINTS }, () => ({ x: 0, z: 0 })),
    squash: 0,
    lastX: 0,
    lastZ: 0,
  });
  const puckGeometry = useMemo(createPuckGeometry, []);
  const trailGeometry = useMemo(createTrailGeometry, []);
  const speedColor = useMemo(() => new Color(), []);

  useFrame((_, delta) => {
    const state = bus.renderState;
    if (!state || !puckRef.current) {
      return;
    }
    const { puck } = state;
    const current = trail.current;
    const speed = Math.hypot(puck.vx, puck.vz);
    const isVisible = Math.abs(puck.z) < HIDDEN_BEYOND_Z;
    const hasTeleported =
      Math.hypot(puck.x - current.lastX, puck.z - current.lastZ) >
      TELEPORT_DISTANCE;

    if (hasTeleported) {
      current.points.forEach((point) => {
        point.x = puck.x;
        point.z = puck.z;
      });
    }
    current.lastX = puck.x;
    current.lastZ = puck.z;
    current.points.pop();
    current.points.unshift({ x: puck.x, z: puck.z });

    bus.frameEvents.forEach((event) => {
      if (
        event.type === GameEventType.MALLET_HIT ||
        event.type === GameEventType.WALL_HIT
      ) {
        current.squash = Math.min(0.45, current.squash + event.strength * 0.06);
      }
    });
    current.squash = Math.max(0, current.squash - delta * 2.5);

    puckRef.current.visible = isVisible;
    puckRef.current.position.set(puck.x, 0.001, puck.z);
    puckRef.current.rotation.y = puck.angle;
    bodyRef.current.scale.set(
      1 + current.squash * 0.4,
      1 - current.squash,
      1 + current.squash * 0.4
    );

    getSpeedColor(speed, speedColor);
    const glowIntensity = 1.4 + Math.min(speed / PUCK.maxSpeed, 1) * 3.5;
    stripeRef.current.material.color
      .copy(speedColor)
      .multiplyScalar(glowIntensity);

    const positions = trailGeometry.attributes.position.array;
    const colors = trailGeometry.attributes.color.array;
    const widthBase = PUCK.radius * (0.4 + Math.min(speed / PUCK.maxSpeed, 1));
    for (let index = 0; index < TRAIL_POINTS; index += 1) {
      const point = current.points[index];
      const nextPoint = current.points[Math.min(index + 1, TRAIL_POINTS - 1)];
      const previousPoint = current.points[Math.max(index - 1, 0)];
      let directionX = previousPoint.x - nextPoint.x;
      let directionZ = previousPoint.z - nextPoint.z;
      const length = Math.hypot(directionX, directionZ) || 1;
      directionX /= length;
      directionZ /= length;
      const fade = 1 - index / (TRAIL_POINTS - 1);
      const halfWidth = widthBase * fade;
      const offset = index * 6;
      positions[offset] = point.x - directionZ * halfWidth;
      positions[offset + 1] = TRAIL_Y;
      positions[offset + 2] = point.z + directionX * halfWidth;
      positions[offset + 3] = point.x + directionZ * halfWidth;
      positions[offset + 4] = TRAIL_Y;
      positions[offset + 5] = point.z - directionX * halfWidth;
      const brightness = fade * fade * (0.6 + glowIntensity * 0.4);
      for (let vertex = 0; vertex < 2; vertex += 1) {
        colors[offset + vertex * 3] = speedColor.r * brightness;
        colors[offset + vertex * 3 + 1] = speedColor.g * brightness;
        colors[offset + vertex * 3 + 2] = speedColor.b * brightness;
      }
    }
    trailGeometry.attributes.position.needsUpdate = true;
    trailGeometry.attributes.color.needsUpdate = true;
    trailGeometry.computeBoundingSphere();
    trailRef.current.visible = isVisible && speed > 0.15;
  });

  return (
    <group>
      <mesh ref={trailRef} geometry={trailGeometry} frustumCulled={false}>
        <meshBasicMaterial
          vertexColors
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      <group ref={puckRef}>
        <group ref={bodyRef}>
          <mesh geometry={puckGeometry} castShadow>
            <meshToonMaterial
              color={PALETTE.ink}
              gradientMap={getToonGradient()}
            />
            <Outlines thickness={0.004} color={PALETTE.ink} />
          </mesh>
          <mesh
            ref={stripeRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, PUCK.height * 0.84, 0]}
          >
            <ringGeometry args={[PUCK.radius * 0.3, PUCK.radius * 0.55, 32]} />
            <meshBasicMaterial color={PALETTE.cyan} toneMapped={false} />
          </mesh>
          <mesh position={[PUCK.radius * 0.42, PUCK.height * 0.86, 0]}>
            <boxGeometry
              args={[PUCK.radius * 0.18, 0.002, PUCK.radius * 0.12]}
            />
            <meshBasicMaterial color={PALETTE.white} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default Puck;
