import React from 'react';

export const ButtonVariant = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  GHOST: 'ghost',
  DANGER: 'danger',
});

export const ButtonSize = Object.freeze({
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
});

const Button = ({
  variant = ButtonVariant.PRIMARY,
  size = ButtonSize.MEDIUM,
  icon = null,
  trailingIcon = null,
  isFullWidth = false,
  isLoading = false,
  type = 'button',
  className = '',
  children,
  disabled,
  ...buttonProps
}) => (
  <button
    type={type}
    className={`ui-button ui-button-${variant} ui-button-${size} ${isFullWidth ? 'ui-button-full' : ''} ${className}`}
    disabled={disabled || isLoading}
    aria-busy={isLoading}
    {...buttonProps}
  >
    {isLoading ? <span className='ui-spinner' aria-hidden='true' /> : icon}
    {children && <span className='ui-button-label'>{children}</span>}
    {trailingIcon}
  </button>
);

export default Button;
