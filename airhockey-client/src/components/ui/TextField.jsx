import React, { useId } from 'react';

const TextField = ({
  label,
  hint = null,
  error = null,
  icon = null,
  trailing = null,
  className = '',
  ...inputProps
}) => {
  const inputId = useId();
  const describedById = error || hint ? `${inputId}-description` : undefined;

  return (
    <div className={`ui-field ${error ? 'ui-field-error' : ''} ${className}`}>
      {label && (
        <label className='ui-field-label' htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className='ui-field-control'>
        {icon && <span className='ui-field-icon'>{icon}</span>}
        <input
          id={inputId}
          className='ui-field-input'
          aria-invalid={Boolean(error)}
          aria-describedby={describedById}
          {...inputProps}
        />
        {trailing}
      </div>
      {(error || hint) && (
        <p id={describedById} className='ui-field-description'>
          {error ?? hint}
        </p>
      )}
    </div>
  );
};

export default TextField;
