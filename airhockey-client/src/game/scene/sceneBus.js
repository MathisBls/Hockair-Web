import { createContext, useContext } from 'react';

export const createSceneBus = () => ({
  renderState: null,
  frameEvents: [],
  phase: null,
  phaseSeconds: 0,
  cameraTrauma: 0,
  goalFlash: { side: null, intensity: 0 },
  botIntent: null,
});

export const SceneBusContext = createContext(null);

export const useSceneBus = () => useContext(SceneBusContext);
