import { useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Vector3 } from 'three';

import { HALF_LENGTH, MatchPhase, Side } from '../constants';

import { useSceneBus } from './sceneBus';

export const PLAY_CAMERA_POSITION = new Vector3(0, 3.05, 1.25);
export const PLAY_CAMERA_TARGET = new Vector3(0, -0.1, 0.14);
const INTRO_CAMERA_POSITION = new Vector3(2.6, 2.4, -2.4);
const MAX_SHAKE_OFFSET = 0.06;
const MAX_SHAKE_ROLL = 0.035;
const TRAUMA_DECAY_PER_SECOND = 1.6;

const easeInOutCubic = (value) =>
  value < 0.5 ? 4 * value ** 3 : 1 - (-2 * value + 2) ** 3 / 2;

const CameraRig = () => {
  const bus = useSceneBus();
  const camera = useThree((state) => state.camera);
  const desiredPosition = useMemo(() => new Vector3(), []);
  const desiredTarget = useMemo(() => new Vector3(), []);
  const currentTarget = useRef(PLAY_CAMERA_TARGET.clone());
  const isInitialized = useRef(false);

  useFrame(({ clock }, delta) => {
    const state = bus.renderState;
    if (!state) {
      return;
    }
    const dt = Math.min(delta, 0.05);
    const { puck } = state;
    const time = clock.elapsedTime;
    let followSharpness = 5;

    switch (bus.phase) {
      case MatchPhase.INTRO: {
        const progress = easeInOutCubic(Math.min(bus.phaseSeconds / 1.4, 1));
        desiredPosition.lerpVectors(
          INTRO_CAMERA_POSITION,
          PLAY_CAMERA_POSITION,
          progress
        );
        desiredTarget.copy(PLAY_CAMERA_TARGET);
        followSharpness = 40;
        break;
      }
      case MatchPhase.GOAL: {
        const goalZ =
          bus.goalFlash.side === Side.PLAYER ? -HALF_LENGTH : HALF_LENGTH;
        const toward = goalZ > 0 ? 1 : -1;
        desiredPosition.set(puck.x * 0.4, 0.75, goalZ - toward * 0.95);
        desiredTarget.set(puck.x * 0.3, 0, goalZ);
        followSharpness = 3.5;
        break;
      }
      case MatchPhase.REPLAY: {
        const orbit = Math.sin(time * 0.35) * 0.4;
        desiredPosition.set(
          1.25 + orbit * 0.3,
          0.42,
          puck.z * 0.55 + 0.35 + orbit
        );
        desiredTarget.set(puck.x * 0.5, 0, puck.z);
        followSharpness = 4;
        break;
      }
      case MatchPhase.FINISHED: {
        const angle = time * 0.18;
        desiredPosition.set(Math.sin(angle) * 2.4, 1.5, Math.cos(angle) * 2.6);
        desiredTarget.set(0, -0.1, 0);
        followSharpness = 1.5;
        break;
      }
      default: {
        desiredPosition.copy(PLAY_CAMERA_POSITION);
        desiredPosition.x += puck.x * 0.12;
        desiredTarget.copy(PLAY_CAMERA_TARGET);
        desiredTarget.x += puck.x * 0.1;
        desiredTarget.z += puck.z * 0.05;
        break;
      }
    }

    if (!isInitialized.current) {
      camera.position.copy(INTRO_CAMERA_POSITION);
      isInitialized.current = true;
    }
    const blend = 1 - Math.exp(-followSharpness * dt);
    camera.position.lerp(desiredPosition, blend);
    currentTarget.current.lerp(desiredTarget, blend);

    bus.cameraTrauma = Math.max(
      0,
      bus.cameraTrauma - TRAUMA_DECAY_PER_SECOND * dt
    );
    const shake = bus.cameraTrauma * bus.cameraTrauma;
    const noiseTime = time * 38;
    camera.position.x += Math.sin(noiseTime * 1.1) * MAX_SHAKE_OFFSET * shake;
    camera.position.y +=
      Math.sin(noiseTime * 1.7 + 1.3) * MAX_SHAKE_OFFSET * shake;
    camera.lookAt(currentTarget.current);
    camera.rotation.z +=
      Math.sin(noiseTime * 0.9 + 2.1) * MAX_SHAKE_ROLL * shake;
  });

  return null;
};

export default CameraRig;
