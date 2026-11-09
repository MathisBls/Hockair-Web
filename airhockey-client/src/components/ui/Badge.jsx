import React from 'react';

export const BadgeTone = Object.freeze({
  NEUTRAL: 'neutral',
  ACCENT: 'accent',
  SUCCESS: 'success',
  WARNING: 'warning',
  INFO: 'info',
});

const Badge = ({ tone = BadgeTone.NEUTRAL, icon = null, children }) => (
  <span className={`ui-badge ui-badge-${tone}`}>
    {icon}
    {children}
  </span>
);

export default Badge;
