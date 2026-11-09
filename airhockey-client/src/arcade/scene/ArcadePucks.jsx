import { useFrame } from '@react-three/fiber';
import React, { useMemo } from 'react';

import Puck from '../../game/scene/Puck';
import { SceneBusContext, useSceneBus } from '../../game/scene/sceneBus';

const SLOT_SYNC_PRIORITY = -0.5;
const EMPTY_EVENTS = [];

const PuckSlot = ({ puckView, slotIndex }) => {
  const parentBus = useSceneBus();
  const slotBus = useMemo(
    () => ({ renderState: puckView, frameEvents: EMPTY_EVENTS }),
    [puckView]
  );

  useFrame(() => {
    slotBus.frameEvents =
      parentBus.frameEvents.length > 0
        ? parentBus.frameEvents.filter((event) => event.puckIndex === slotIndex)
        : EMPTY_EVENTS;
  }, SLOT_SYNC_PRIORITY);

  return (
    <SceneBusContext.Provider value={slotBus}>
      <Puck />
    </SceneBusContext.Provider>
  );
};

const ArcadePucks = ({ puckViews }) =>
  puckViews.map((puckView, slotIndex) => (
    <PuckSlot
      key={`puck-slot-${slotIndex}`}
      puckView={puckView}
      slotIndex={slotIndex}
    />
  ));

export default ArcadePucks;
