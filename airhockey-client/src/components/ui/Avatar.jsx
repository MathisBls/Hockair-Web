import React from 'react';

export const AvatarSize = Object.freeze({
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
  EXTRA_LARGE: 'xl',
});

const Avatar = ({ name = '', imageUrl = null, size = AvatarSize.MEDIUM }) => (
  <span className={`ui-avatar ui-avatar-${size}`} aria-hidden='true'>
    {imageUrl ? <img src={imageUrl} alt='' /> : name.charAt(0).toUpperCase()}
  </span>
);

export default Avatar;
