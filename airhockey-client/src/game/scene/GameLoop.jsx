import { useFrame } from '@react-three/fiber';
import { useMemo } from 'react';
import { PerspectiveCamera, Plane, Raycaster, Vector3 } from 'three';

import { MatchPhase } from '../constants';

import { PLAY_CAMERA_POSITION, PLAY_CAMERA_TARGET } from './CameraRig';
import { useSceneBus } from './sceneBus';

const LOOP_PRIORITY = -1;
const CONTROLLABLE_PHASES = [MatchPhase.COUNTDOWN, MatchPhase.PLAYING];

const GameLoop = ({ engine, onFrameEvents }) => {
  const bus = useSceneBus();
  const tablePlane = useMemo(() => new Plane(new Vector3(0, 1, 0), 0), []);
  const raycaster = useMemo(() => new Raycaster(), []);
  const hitPoint = useMemo(() => new Vector3(), []);
  const aimCamera = useMemo(() => new PerspectiveCamera(), []);

  useFrame(({ pointer, camera }, delta) => {
    if (CONTROLLABLE_PHASES.includes(engine.phase)) {
      aimCamera.fov = camera.fov;
      aimCamera.aspect = camera.aspect;
      aimCamera.near = camera.near;
      aimCamera.far = camera.far;
      aimCamera.position.copy(PLAY_CAMERA_POSITION);
      aimCamera.lookAt(PLAY_CAMERA_TARGET);
      aimCamera.updateProjectionMatrix();
      aimCamera.updateMatrixWorld();
      raycaster.setFromCamera(pointer, aimCamera);
      if (raycaster.ray.intersectPlane(tablePlane, hitPoint)) {
        engine.setPlayerTarget(hitPoint.x, hitPoint.z);
      }
    }
    bus.renderState = engine.update(delta);
    bus.phase = engine.phase;
    bus.phaseSeconds = engine.getPhaseSeconds();
    bus.botIntent = engine.getBotIntent();
    bus.frameEvents = engine.drainVfxEvents();
    if (bus.frameEvents.length > 0) {
      onFrameEvents(bus.frameEvents);
    }
  }, LOOP_PRIORITY);

  return null;
};

export default GameLoop;
