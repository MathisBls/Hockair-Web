import React from 'react';

const SegmentedControl = ({ options, value, onChange, ariaLabel }) => (
  <div className='ui-segmented' role='radiogroup' aria-label={ariaLabel}>
    {options.map((option) => (
      <button
        key={option.value}
        type='button'
        role='radio'
        aria-checked={option.value === value}
        className={`ui-segmented-option ${option.value === value ? 'ui-segmented-option-selected' : ''}`}
        onClick={() => onChange(option.value)}
        disabled={option.isDisabled}
      >
        {option.icon}
        {option.label}
      </button>
    ))}
  </div>
);

export default SegmentedControl;
