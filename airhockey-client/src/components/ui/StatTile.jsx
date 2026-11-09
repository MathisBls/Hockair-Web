import React from 'react';

const StatTile = ({ label, value, detail = null, icon = null }) => (
  <div className='ui-stat'>
    <div className='ui-stat-label'>
      {icon}
      {label}
    </div>
    <div className='ui-stat-value'>{value}</div>
    {detail && <div className='ui-stat-detail'>{detail}</div>}
  </div>
);

export default StatTile;
