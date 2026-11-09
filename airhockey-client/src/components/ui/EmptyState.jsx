import React from 'react';

const EmptyState = ({
  icon = null,
  title,
  description = null,
  action = null,
}) => (
  <div className='ui-empty'>
    {icon && <div className='ui-empty-icon'>{icon}</div>}
    <p className='ui-empty-title'>{title}</p>
    {description && <p className='ui-empty-description'>{description}</p>}
    {action}
  </div>
);

export default EmptyState;
