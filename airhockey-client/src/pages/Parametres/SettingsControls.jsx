import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import React, { useId } from 'react';

export const SettingRow = ({
  label,
  hint = null,
  control,
  isStacked = false,
  labelId,
}) => (
  <div className={`settings-row ${isStacked ? 'settings-row-stacked' : ''}`}>
    <div className='settings-row-text'>
      <span id={labelId} className='settings-row-label'>
        {label}
      </span>
      {hint && <span className='settings-row-hint'>{hint}</span>}
    </div>
    <div className='settings-row-control'>{control}</div>
  </div>
);

export const SettingsSwitch = ({ isChecked, onChange, labelledBy }) => (
  <button
    type='button'
    role='switch'
    aria-checked={isChecked}
    aria-labelledby={labelledBy}
    className={`settings-switch ${isChecked ? 'settings-switch-on' : ''}`}
    onClick={() => onChange(!isChecked)}
  >
    <span className='settings-switch-thumb' />
  </button>
);

export const SwatchPicker = ({ options, value, onChange, labelledBy }) => {
  const groupName = useId();

  return (
    <div
      className='settings-swatches'
      role='radiogroup'
      aria-labelledby={labelledBy}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={`settings-swatch ${option.value === value ? 'settings-swatch-selected' : ''}`}
        >
          <input
            type='radio'
            className='settings-swatch-input'
            name={groupName}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span
            className='settings-swatch-color'
            style={{
              background: option.primaryColor,
              borderColor: option.secondaryColor,
            }}
            aria-hidden='true'
          >
            {option.value === value && <CheckRoundedIcon />}
          </span>
          <span className='settings-swatch-label'>{option.label}</span>
        </label>
      ))}
    </div>
  );
};
