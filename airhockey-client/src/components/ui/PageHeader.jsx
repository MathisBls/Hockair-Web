import React from 'react';

const PageHeader = ({
  eyebrow = null,
  title,
  description = null,
  actions = null,
}) => (
  <header className='ui-page-header'>
    <div className='ui-page-header-text'>
      {eyebrow && <span className='ui-eyebrow'>{eyebrow}</span>}
      <h1 className='ui-page-title'>{title}</h1>
      {description && <p className='ui-page-description'>{description}</p>}
    </div>
    {actions && <div className='ui-page-header-actions'>{actions}</div>}
  </header>
);

export default PageHeader;
