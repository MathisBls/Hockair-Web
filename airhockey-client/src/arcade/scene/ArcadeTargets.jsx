import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import { Color } from 'three';

import { PALETTE } from '../../game/theme';
import { TargetKind } from '../engine/targetRushEngine';

const SURFACE_Y = 0.0035;
const LAYER_GAP = 0.0006;
const POP_SECONDS = 0.28;
const POP_OVERSHOOT = 1.7;
const TIMER_RING_GROWTH = 0.7;
const BLINK_BELOW_RATIO = 0.3;
const BLINK_FREQUENCY = 14;
const FLAT_ROTATION = [-Math.PI / 2, 0, 0];

const easeOutBack = (progress) => {
  const shifted = progress - 1;

  return 1 + (POP_OVERSHOOT + 1) * shifted ** 3 + POP_OVERSHOOT * shifted ** 2;
};

const TargetMarker = ({ target }) => {
  const groupRef = useRef(null);
  const outerRef = useRef(null);
  const centerRef = useRef(null);
  const timerRef = useRef(null);
  const colors = useMemo(
    () => ({
      [TargetKind.STANDARD]: new Color(PALETTE.red),
      [TargetKind.GOLDEN]: new Color(PALETTE.gold).multiplyScalar(1.6),
    }),
    []
  );

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    group.visible = target.isActive;
    if (!target.isActive) {
      return;
    }
    const popProgress = Math.min(target.ageSeconds / POP_SECONDS, 1);
    const scale = target.radius * easeOutBack(popProgress);
    group.position.set(target.x, SURFACE_Y, target.z);
    group.scale.set(scale, scale, scale);
    const kindColor = colors[target.kind];
    outerRef.current.material.color.copy(kindColor);
    centerRef.current.material.color.copy(kindColor);

    const lifeRatio = Math.max(target.lifeSeconds / target.maxLifeSeconds, 0);
    const timerScale = 1 + lifeRatio * TIMER_RING_GROWTH;
    timerRef.current.scale.set(timerScale, timerScale, timerScale);
    const isBlinking =
      lifeRatio < BLINK_BELOW_RATIO &&
      Math.sin(clock.elapsedTime * BLINK_FREQUENCY) > 0;
    timerRef.current.material.opacity = isBlinking ? 0.2 : 0.85;
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={outerRef} rotation={FLAT_ROTATION}>
        <circleGeometry args={[1, 40]} />
        <meshBasicMaterial toneMapped={false} />
      </mesh>
      <mesh rotation={FLAT_ROTATION} position={[0, LAYER_GAP, 0]}>
        <ringGeometry args={[0.42, 0.68, 40]} />
        <meshBasicMaterial color={PALETTE.white} />
      </mesh>
      <mesh
        ref={centerRef}
        rotation={FLAT_ROTATION}
        position={[0, LAYER_GAP * 2, 0]}
      >
        <circleGeometry args={[0.24, 32]} />
        <meshBasicMaterial toneMapped={false} />
      </mesh>
      <mesh ref={timerRef} rotation={FLAT_ROTATION}>
        <ringGeometry args={[1.08, 1.18, 48]} />
        <meshBasicMaterial color={PALETTE.ink} transparent depthWrite={false} />
      </mesh>
    </group>
  );
};

const ArcadeTargets = ({ targets }) =>
  targets.map((target) => (
    <TargetMarker key={`target-${target.index}`} target={target} />
  ));

export default ArcadeTargets;
