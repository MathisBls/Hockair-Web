import React from 'react';

const Card = ({
  as: Element = 'section',
  title = null,
  subtitle = null,
  action = null,
  isPadded = true,
  isInteractive = false,
  className = '',
  children,
  ...elementProps
}) => (
  <Element
    className={`ui-card ${isPadded ? 'ui-card-padded' : ''} ${isInteractive ? 'ui-card-interactive' : ''} ${className}`}
    {...elementProps}
  >
    {(title || action) && (
      <header className='ui-card-header'>
        <div>
          {title && <h3 className='ui-card-title'>{title}</h3>}
          {subtitle && <p className='ui-card-subtitle'>{subtitle}</p>}
        </div>
        {action}
      </header>
    )}
    {children}
  </Element>
);

export default Card;
