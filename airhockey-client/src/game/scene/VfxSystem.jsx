import { useFrame } from '@react-three/fiber';
import React, { useEffect, useMemo, useRef } from 'react';
import { AdditiveBlending, Color, DoubleSide, Object3D } from 'three';

import { GameEventType, PUCK, Side } from '../constants';
import { PALETTE } from '../theme';

import { useSceneBus } from './sceneBus';

const SPARK_CAPACITY = 900;
const CONFETTI_CAPACITY = 420;
const RING_CAPACITY = 18;
const GRAVITY = -3.2;
const CONFETTI_GRAVITY = -0.9;
const FIRE_SPEED_THRESHOLD = PUCK.maxSpeed * 0.6;
const MAX_TRAUMA = 1;

const CONFETTI_COLORS = [
  PALETTE.red,
  PALETTE.cyan,
  PALETTE.gold,
  PALETTE.white,
  '#9cff57',
  '#b07cff',
].map((hex) => new Color(hex));

const randomBetween = (min, max) => min + Math.random() * (max - min);

const createParticlePool = (capacity) => ({
  cursor: 0,
  x: new Float32Array(capacity),
  y: new Float32Array(capacity),
  z: new Float32Array(capacity),
  vx: new Float32Array(capacity),
  vy: new Float32Array(capacity),
  vz: new Float32Array(capacity),
  life: new Float32Array(capacity),
  maxLife: new Float32Array(capacity),
  size: new Float32Array(capacity),
  spin: new Float32Array(capacity),
  angle: new Float32Array(capacity),
  colors: Array.from({ length: capacity }, () => new Color()),
});

const allocateParticle = (pool, capacity) => {
  const index = pool.cursor;
  pool.cursor = (pool.cursor + 1) % capacity;

  return index;
};

const VfxSystem = ({ playerColor, botColor }) => {
  const bus = useSceneBus();
  const sparksRef = useRef(null);
  const confettiRef = useRef(null);
  const ringRefs = useRef([]);
  const flashRef = useRef(null);
  const sparks = useMemo(() => createParticlePool(SPARK_CAPACITY), []);
  const confetti = useMemo(() => createParticlePool(CONFETTI_CAPACITY), []);
  const rings = useMemo(
    () =>
      Array.from({ length: RING_CAPACITY }, () => ({
        life: 0,
        maxLife: 1,
        maxScale: 1,
        color: new Color(),
      })),
    []
  );
  const ringCursor = useRef(0);
  const flash = useRef({ intensity: 0, color: new Color() });
  const dummy = useMemo(() => new Object3D(), []);
  const sideColors = useMemo(
    () => ({
      [Side.PLAYER]: new Color(playerColor),
      [Side.BOT]: new Color(botColor),
    }),
    [playerColor, botColor]
  );
  const white = useMemo(() => new Color(PALETTE.white), []);
  const gold = useMemo(() => new Color(PALETTE.gold), []);
  const fireColors = useMemo(
    () => [
      new Color(PALETTE.orange),
      new Color(PALETTE.gold),
      new Color(PALETTE.red),
    ],
    []
  );

  useEffect(() => {
    [sparksRef.current, confettiRef.current].forEach((mesh) => {
      if (!mesh) {
        return;
      }
      dummy.scale.setScalar(0);
      dummy.updateMatrix();
      for (let index = 0; index < mesh.count; index += 1) {
        mesh.setMatrixAt(index, dummy.matrix);
        mesh.setColorAt(index, white);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) {
        mesh.instanceColor.needsUpdate = true;
      }
      mesh.material.needsUpdate = true;
    });
  }, [dummy, white]);

  const spawnSparks = (origin, count, color, speed, life, upward = 0.6) => {
    for (let spawned = 0; spawned < count; spawned += 1) {
      const index = allocateParticle(sparks, SPARK_CAPACITY);
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * randomBetween(0.35, 1);
      sparks.x[index] = origin.x;
      sparks.y[index] = origin.y ?? 0.03;
      sparks.z[index] = origin.z;
      sparks.vx[index] = Math.cos(angle) * velocity;
      sparks.vz[index] = Math.sin(angle) * velocity;
      sparks.vy[index] = randomBetween(0.2, 1) * speed * upward;
      sparks.maxLife[index] = life * randomBetween(0.6, 1.2);
      sparks.life[index] = sparks.maxLife[index];
      sparks.size[index] = randomBetween(0.006, 0.016);
      sparks.colors[index]
        .copy(Math.random() < 0.3 ? white : color)
        .multiplyScalar(randomBetween(2, 4));
    }
  };

  const spawnConfetti = (origin, count, spread) => {
    for (let spawned = 0; spawned < count; spawned += 1) {
      const index = allocateParticle(confetti, CONFETTI_CAPACITY);
      confetti.x[index] = origin.x + randomBetween(-spread, spread);
      confetti.y[index] = randomBetween(0.6, 1.4);
      confetti.z[index] = origin.z + randomBetween(-spread, spread) * 0.6;
      confetti.vx[index] = randomBetween(-0.6, 0.6);
      confetti.vy[index] = randomBetween(-0.2, 0.8);
      confetti.vz[index] = randomBetween(-0.6, 0.6);
      confetti.maxLife[index] = randomBetween(2.2, 3.6);
      confetti.life[index] = confetti.maxLife[index];
      confetti.size[index] = randomBetween(0.018, 0.03);
      confetti.spin[index] = randomBetween(-12, 12);
      confetti.angle[index] = Math.random() * Math.PI;
      confetti.colors[index].copy(
        CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
      );
    }
  };

  const spawnRing = (x, z, color, maxScale, life) => {
    const ring = rings[ringCursor.current];
    ringCursor.current = (ringCursor.current + 1) % RING_CAPACITY;
    ring.life = life;
    ring.maxLife = life;
    ring.maxScale = maxScale;
    ring.color.copy(color);
    const mesh = ringRefs.current[rings.indexOf(ring)];
    if (mesh) {
      mesh.position.set(x, 0.006, z);
    }
  };

  const addTrauma = (amount, isReplay) => {
    const scaledAmount = isReplay ? amount * 0.5 : amount;
    bus.cameraTrauma = Math.min(MAX_TRAUMA, bus.cameraTrauma + scaledAmount);
  };

  const triggerFlash = (color, intensity, x, z) => {
    flash.current.intensity = Math.max(flash.current.intensity, intensity);
    flash.current.color.copy(color);
    if (flashRef.current) {
      flashRef.current.position.set(x, 0.25, z);
    }
  };

  const handleEvent = (event) => {
    const isReplay = Boolean(event.isReplay);
    switch (event.type) {
      case GameEventType.MALLET_HIT: {
        const strength = Math.min(event.strength, 8);
        const color = sideColors[event.side];
        spawnSparks(
          event,
          Math.round(6 + strength * 7),
          color,
          0.6 + strength * 0.35,
          0.45
        );
        spawnRing(event.x, event.z, color, 0.12 + strength * 0.05, 0.35);
        addTrauma(0.04 + strength * 0.035, isReplay);
        triggerFlash(color, 2 + strength * 1.2, event.x, event.z);
        break;
      }
      case GameEventType.WALL_HIT: {
        const strength = Math.min(event.strength, 8);
        spawnSparks(
          event,
          Math.round(3 + strength * 3),
          white,
          0.4 + strength * 0.2,
          0.3
        );
        spawnRing(event.x, event.z, white, 0.06 + strength * 0.025, 0.25);
        addTrauma(strength * 0.015, isReplay);
        break;
      }
      case GameEventType.SAVE: {
        spawnSparks(event, 30, gold, 2.2, 0.6, 0.9);
        spawnRing(event.x, event.z, gold, 0.5, 0.5);
        triggerFlash(gold, 6, event.x, event.z);
        break;
      }
      case GameEventType.GOAL: {
        const color = sideColors[event.side];
        spawnSparks(
          { x: event.x, y: 0.05, z: event.z },
          220,
          color,
          3.4,
          1.1,
          1.3
        );
        spawnSparks(
          { x: event.x, y: 0.05, z: event.z },
          80,
          gold,
          2.6,
          1.3,
          1.5
        );
        spawnRing(event.x, event.z, color, 1.6, 0.8);
        spawnRing(event.x, event.z, gold, 1.0, 0.6);
        spawnRing(event.x, event.z, white, 2.4, 1.1);
        spawnConfetti(
          { x: event.x, z: event.z * 0.7 },
          isReplay ? 120 : 260,
          0.8
        );
        addTrauma(0.95, isReplay);
        triggerFlash(color, 18, event.x, event.z);
        bus.goalFlash.side = event.side;
        bus.goalFlash.intensity = 1;
        break;
      }
      default:
        break;
    }
  };

  const spawnFireTrail = () => {
    const puck = bus.renderState?.puck;
    if (!puck) {
      return;
    }
    const speed = Math.hypot(puck.vx, puck.vz);
    if (speed < FIRE_SPEED_THRESHOLD) {
      return;
    }
    const embers = Math.round((speed - FIRE_SPEED_THRESHOLD) * 1.6) + 1;
    for (let spawned = 0; spawned < embers; spawned += 1) {
      const index = allocateParticle(sparks, SPARK_CAPACITY);
      sparks.x[index] = puck.x + randomBetween(-0.02, 0.02);
      sparks.y[index] = 0.02;
      sparks.z[index] = puck.z + randomBetween(-0.02, 0.02);
      sparks.vx[index] = -puck.vx * 0.08 + randomBetween(-0.15, 0.15);
      sparks.vz[index] = -puck.vz * 0.08 + randomBetween(-0.15, 0.15);
      sparks.vy[index] = randomBetween(0.3, 0.9);
      sparks.maxLife[index] = randomBetween(0.2, 0.45);
      sparks.life[index] = sparks.maxLife[index];
      sparks.size[index] = randomBetween(0.006, 0.013);
      sparks.colors[index]
        .copy(fireColors[spawned % fireColors.length])
        .multiplyScalar(3);
    }
  };

  const updateSparks = (dt) => {
    const mesh = sparksRef.current;
    for (let index = 0; index < SPARK_CAPACITY; index += 1) {
      if (sparks.life[index] <= 0) {
        continue;
      }
      sparks.life[index] -= dt;
      const drag = Math.exp(-3 * dt);
      sparks.vx[index] *= drag;
      sparks.vz[index] *= drag;
      sparks.vy[index] += GRAVITY * dt;
      sparks.x[index] += sparks.vx[index] * dt;
      sparks.y[index] += sparks.vy[index] * dt;
      sparks.z[index] += sparks.vz[index] * dt;
      if (sparks.y[index] < 0.005) {
        sparks.y[index] = 0.005;
        sparks.vy[index] *= -0.4;
      }
      const remaining = Math.max(sparks.life[index], 0) / sparks.maxLife[index];
      dummy.position.set(sparks.x[index], sparks.y[index], sparks.z[index]);
      dummy.rotation.set(remaining * 6, remaining * 4, 0);
      dummy.scale.setScalar(sparks.size[index] * remaining);
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, sparks.colors[index]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  };

  const updateConfetti = (dt, elapsed) => {
    const mesh = confettiRef.current;
    for (let index = 0; index < CONFETTI_CAPACITY; index += 1) {
      if (confetti.life[index] <= 0) {
        continue;
      }
      confetti.life[index] -= dt;
      const drag = Math.exp(-2.2 * dt);
      confetti.vx[index] =
        confetti.vx[index] * drag + Math.sin(elapsed * 3 + index) * 0.6 * dt;
      confetti.vz[index] *= drag;
      confetti.vy[index] = Math.max(
        confetti.vy[index] + CONFETTI_GRAVITY * dt,
        -0.35
      );
      confetti.x[index] += confetti.vx[index] * dt;
      confetti.y[index] += confetti.vy[index] * dt;
      confetti.z[index] += confetti.vz[index] * dt;
      confetti.angle[index] += confetti.spin[index] * dt;
      if (confetti.y[index] < 0.004) {
        confetti.y[index] = 0.004;
        confetti.vx[index] = 0;
        confetti.vz[index] = 0;
        confetti.spin[index] = 0;
      }
      const remaining = Math.min(1, confetti.life[index] / 0.4);
      dummy.position.set(
        confetti.x[index],
        confetti.y[index],
        confetti.z[index]
      );
      dummy.rotation.set(
        confetti.angle[index],
        confetti.angle[index] * 0.7,
        index
      );
      dummy.scale.set(confetti.size[index], confetti.size[index] * 0.6, 1);
      dummy.scale.multiplyScalar(Math.max(remaining, 0));
      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
      mesh.setColorAt(index, confetti.colors[index]);
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
    }
  };

  const updateRings = (dt) => {
    rings.forEach((ring, index) => {
      const mesh = ringRefs.current[index];
      if (!mesh) {
        return;
      }
      ring.life = Math.max(0, ring.life - dt);
      const progress = 1 - ring.life / ring.maxLife;
      mesh.visible = ring.life > 0;
      const eased = 1 - (1 - progress) ** 3;
      mesh.scale.setScalar(Math.max(eased * ring.maxScale, 0.001));
      mesh.material.opacity = (1 - progress) * 0.9;
      mesh.material.color.copy(ring.color).multiplyScalar(2.5);
    });
  };

  useFrame((state, delta) => {
    if (!sparksRef.current || !confettiRef.current) {
      return;
    }
    const dt = Math.min(delta, 0.05);
    bus.frameEvents.forEach(handleEvent);
    spawnFireTrail();
    updateSparks(dt);
    updateConfetti(dt, state.clock.elapsedTime);
    updateRings(dt);

    flash.current.intensity *= Math.exp(-9 * dt);
    if (flashRef.current) {
      flashRef.current.intensity = flash.current.intensity;
      flashRef.current.color.copy(flash.current.color);
    }
    bus.goalFlash.intensity = Math.max(0, bus.goalFlash.intensity - dt * 0.6);
  });

  return (
    <group>
      <instancedMesh
        ref={sparksRef}
        args={[null, null, SPARK_CAPACITY]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh
        ref={confettiRef}
        args={[null, null, CONFETTI_CAPACITY]}
        frustumCulled={false}
        castShadow
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial side={DoubleSide} />
      </instancedMesh>
      {rings.map((ring, index) => (
        <mesh
          key={`ring-${index}`}
          ref={(mesh) => {
            ringRefs.current[index] = mesh;
          }}
          rotation={[-Math.PI / 2, 0, 0]}
          visible={false}
        >
          <ringGeometry args={[0.88, 1, 48]} />
          <meshBasicMaterial
            transparent
            toneMapped={false}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      <pointLight ref={flashRef} intensity={0} distance={1.6} decay={1.4} />
    </group>
  );
};

export default VfxSystem;
