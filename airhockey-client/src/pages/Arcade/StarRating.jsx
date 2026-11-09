import { Star as StarIcon } from '@mui/icons-material';
import React from 'react';

const StarRating = ({ starSlots, label = null }) => (
  <span className='arcade-stars' role='img' aria-label={label ?? undefined}>
    {starSlots.map((slot) => (
      <StarIcon
        key={slot.id}
        className={`arcade-star ${slot.isEarned ? 'arcade-star-earned' : ''}`}
        aria-hidden='true'
      />
    ))}
  </span>
);

export default StarRating;
