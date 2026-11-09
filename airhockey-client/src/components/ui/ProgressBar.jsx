import React from 'react';

const ProgressBar = ({ ratio, label = null }) => {
  const clampedRatio = Math.min(Math.max(ratio, 0), 1);

  return (
    <div
      className='ui-progress'
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clampedRatio * 100)}
      aria-label={label ?? undefined}
    >
      <div
        className='ui-progress-fill'
        style={{ transform: `scaleX(${clampedRatio})` }}
      />
    </div>
  );
};

export default ProgressBar;
