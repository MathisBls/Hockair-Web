import { Outlines } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useMemo, useRef } from 'react';
import { LatheGeometry, Vector2 } from 'three';

import { BotMood } from '../bots';
import { GameEventType, MALLET } from '../constants';
import { PALETTE } from '../theme';

import { createGlowColor } from './glowColor';
import { useSceneBus } from './sceneBus';
import { getToonGradient } from './toonGradient';

const RADIUS = MALLET.radius;
const KNOB_RADIUS = RADIUS * 0.52;
const KNOB_Y = 0.098;
const EYE_RADIUS = KNOB_RADIUS * 0.36;
const PUPIL_RADIUS = EYE_RADIUS * 0.55;
const EYE_SPREAD = KNOB_RADIUS * 0.42;
const EYE_HEIGHT = KNOB_Y + KNOB_RADIUS * 0.2;
const EYE_FORWARD = KNOB_RADIUS * 0.82;
const SQUASH_STIFFNESS = 520;
const SQUASH_DAMPING = 16;
const MAX_LEAN_RADIANS = 0.38;
const OUTLINE_THICKNESS = 0.006;

const BROW_ANGLE_BY_MOOD = {
  [BotMood.HAPPY]: -0.25,
  [BotMood.FOCUSED]: 0.15,
  [BotMood.ANGRY]: 0.55,
  [BotMood.SLEEPY]: -0.05,
  [BotMood.COOL]: 0.3,
};

const createBodyGeometry = () => {
  const profile = [
    [0, 0],
    [RADIUS * 0.96, 0],
    [RADIUS, 0.006],
    [RADIUS, 0.024],
    [RADIUS * 0.94, 0.032],
    [RADIUS * 0.6, 0.038],
    [RADIUS * 0.34, 0.048],
    [RADIUS * 0.27, 0.062],
    [RADIUS * 0.27, KNOB_Y - KNOB_RADIUS * 0.6],
    [0, KNOB_Y - KNOB_RADIUS * 0.6],
  ].map(([radius, height]) => new Vector2(radius, height));

  return new LatheGeometry(profile, 40);
};

const Eye = ({ xSign, eyeRef, pupilRef }) => (
  <group ref={eyeRef} position={[xSign * EYE_SPREAD, EYE_HEIGHT, -EYE_FORWARD]}>
    <mesh scale={[1, 1.25, 0.7]}>
      <sphereGeometry args={[EYE_RADIUS, 20, 16]} />
      <meshBasicMaterial color={PALETTE.white} />
      <Outlines thickness={OUTLINE_THICKNESS * 0.6} color={PALETTE.ink} />
    </mesh>
    <mesh ref={pupilRef} position={[0, 0, -EYE_RADIUS * 0.6]}>
      <sphereGeometry args={[PUPIL_RADIUS, 16, 12]} />
      <meshBasicMaterial color={PALETTE.ink} />
    </mesh>
  </group>
);

const Brow = ({ xSign, angle }) => (
  <mesh
    position={[
      xSign * EYE_SPREAD,
      EYE_HEIGHT + EYE_RADIUS * 1.55,
      -EYE_FORWARD * 0.92,
    ]}
    rotation={[0, 0, -xSign * angle]}
  >
    <boxGeometry args={[EYE_RADIUS * 2.1, EYE_RADIUS * 0.45, 0.006]} />
    <meshBasicMaterial color={PALETTE.ink} />
  </mesh>
);

const Mallet = ({ side, stateKey, bodyColor, accentColor, mood, facing }) => {
  const bus = useSceneBus();
  const rootRef = useRef(null);
  const bodyRef = useRef(null);
  const leftEyeRef = useRef(null);
  const rightEyeRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const ringRef = useRef(null);
  const motion = useRef({
    squash: 0,
    squashVelocity: 0,
    leanX: 0,
    leanZ: 0,
    blinkTimer: 2 + Math.random() * 3,
    blinkSeconds: 0,
    glow: 0,
  });
  const bodyGeometry = useMemo(createBodyGeometry, []);
  const ringGlow = useMemo(() => createGlowColor(bodyColor, 1.8), [bodyColor]);
  const browAngle = BROW_ANGLE_BY_MOOD[mood] ?? 0;

  useFrame((_, delta) => {
    const state = bus.renderState;
    if (!state || !rootRef.current || !bodyRef.current) {
      return;
    }
    const mallet = state[stateKey];
    const dt = Math.min(delta, 0.05);
    const current = motion.current;

    bus.frameEvents.forEach((event) => {
      if (event.type === GameEventType.MALLET_HIT && event.side === side) {
        current.squashVelocity += Math.min(event.strength, 6) * 0.9;
        current.glow = 1;
      }
    });

    const squashAcceleration =
      -SQUASH_STIFFNESS * current.squash -
      SQUASH_DAMPING * current.squashVelocity;
    current.squashVelocity += squashAcceleration * dt;
    current.squash += current.squashVelocity * dt;
    const squash = Math.max(-0.35, Math.min(0.35, current.squash));
    bodyRef.current.scale.set(1 + squash * 0.6, 1 - squash, 1 + squash * 0.6);

    const targetLeanX = Math.max(
      -MAX_LEAN_RADIANS,
      Math.min(MAX_LEAN_RADIANS, mallet.vz * 0.06)
    );
    const targetLeanZ = Math.max(
      -MAX_LEAN_RADIANS,
      Math.min(MAX_LEAN_RADIANS, -mallet.vx * 0.06)
    );
    const leanBlend = 1 - Math.exp(-14 * dt);
    current.leanX += (targetLeanX - current.leanX) * leanBlend;
    current.leanZ += (targetLeanZ - current.leanZ) * leanBlend;

    rootRef.current.position.set(mallet.x, 0, mallet.z);
    rootRef.current.rotation.set(current.leanX, 0, current.leanZ);

    current.blinkTimer -= dt;
    if (current.blinkTimer <= 0) {
      current.blinkSeconds = 0.12;
      current.blinkTimer = 2 + Math.random() * 3.5;
    }
    current.blinkSeconds = Math.max(0, current.blinkSeconds - dt);
    const eyeOpen = current.blinkSeconds > 0 ? 0.12 : 1;
    leftEyeRef.current.scale.y = eyeOpen;
    rightEyeRef.current.scale.y = eyeOpen;

    const lookX = (state.puck.x - mallet.x) * facing;
    const lookZ = (state.puck.z - mallet.z) * facing;
    const lookLength = Math.hypot(lookX, lookZ) || 1;
    const pupilX = (lookX / lookLength) * EYE_RADIUS * 0.45;
    const pupilZ = -EYE_RADIUS * 0.62 + (lookZ / lookLength) * EYE_RADIUS * 0.2;
    leftPupilRef.current.position.set(pupilX, 0, pupilZ);
    rightPupilRef.current.position.set(pupilX, 0, pupilZ);

    current.glow = Math.max(0, current.glow - dt * 3);
    if (ringRef.current) {
      ringRef.current.material.color
        .copy(ringGlow)
        .multiplyScalar(1 + current.glow * 2.5);
      ringRef.current.scale.setScalar(1 + current.glow * 0.5);
    }
  });

  return (
    <group ref={rootRef}>
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.002, 0]}
      >
        <ringGeometry args={[RADIUS * 1.05, RADIUS * 1.22, 40]} />
        <meshBasicMaterial
          color={ringGlow}
          toneMapped={false}
          transparent
          opacity={0.85}
        />
      </mesh>
      <group ref={bodyRef} rotation={[0, facing > 0 ? 0 : Math.PI, 0]}>
        <mesh geometry={bodyGeometry} castShadow>
          <meshToonMaterial color={bodyColor} gradientMap={getToonGradient()} />
          <Outlines thickness={OUTLINE_THICKNESS} color={PALETTE.ink} />
        </mesh>
        <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[RADIUS * 0.8, 0.006, 8, 40]} />
          <meshToonMaterial
            color={accentColor}
            gradientMap={getToonGradient()}
          />
        </mesh>
        <mesh position={[0, KNOB_Y, 0]} castShadow>
          <sphereGeometry args={[KNOB_RADIUS, 28, 20]} />
          <meshToonMaterial color={bodyColor} gradientMap={getToonGradient()} />
          <Outlines thickness={OUTLINE_THICKNESS} color={PALETTE.ink} />
        </mesh>
        <mesh
          position={[
            KNOB_RADIUS * 0.35,
            KNOB_Y + KNOB_RADIUS * 0.55,
            KNOB_RADIUS * 0.1,
          ]}
        >
          <sphereGeometry args={[KNOB_RADIUS * 0.18, 10, 8]} />
          <meshBasicMaterial color={PALETTE.white} transparent opacity={0.8} />
        </mesh>
        <Eye xSign={-1} eyeRef={leftEyeRef} pupilRef={leftPupilRef} />
        <Eye xSign={1} eyeRef={rightEyeRef} pupilRef={rightPupilRef} />
        <Brow xSign={-1} angle={browAngle} />
        <Brow xSign={1} angle={browAngle} />
      </group>
    </group>
  );
};

export default Mallet;
