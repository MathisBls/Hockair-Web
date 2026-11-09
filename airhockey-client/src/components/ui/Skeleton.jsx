import React from 'react';

const Skeleton = ({ width = '100%', height = '1rem', isRound = false }) => (
  <span
    className={`ui-skeleton ${isRound ? 'ui-skeleton-round' : ''}`}
    style={{ width, height }}
    aria-hidden='true'
  />
);

export default Skeleton;
