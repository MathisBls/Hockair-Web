import { Lock as LockIcon } from '@mui/icons-material';
import React from 'react';

import StarRating from './StarRating';

const BankShotLevelPicker = ({ levels, title, lockedLabel, onSelect }) => (
  <div className='arcade-levels'>
    <h3 className='arcade-section-title'>{title}</h3>
    <div className='arcade-level-grid' role='radiogroup' aria-label={title}>
      {levels.map((level) => (
        <button
          key={level.id}
          type='button'
          role='radio'
          aria-checked={level.isSelected}
          className={`arcade-level ${level.isSelected ? 'arcade-level-selected' : ''}`}
          disabled={level.isLocked}
          onClick={() => onSelect(level.id)}
        >
          <span className='arcade-level-number'>{level.numberLabel}</span>
          <span className='arcade-level-name'>
            {level.isLocked ? lockedLabel : level.name}
          </span>
          {level.isLocked ? (
            <LockIcon className='arcade-level-lock' aria-hidden='true' />
          ) : (
            <StarRating starSlots={level.starSlots} />
          )}
        </button>
      ))}
    </div>
  </div>
);

export default BankShotLevelPicker;
