import { MoreHoriz as MoreIcon } from '@mui/icons-material';
import React, { useEffect, useRef, useState } from 'react';

import { Button, ButtonSize, ButtonVariant } from '../../components/ui';

const FriendActionsMenu = ({ label, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((wasOpen) => !wasOpen);

  const selectItem = (item) => {
    setIsOpen(false);
    item.onSelect();
  };

  return (
    <div className='social-menu' ref={menuRef}>
      <Button
        variant={ButtonVariant.GHOST}
        size={ButtonSize.SMALL}
        icon={<MoreIcon />}
        aria-label={label}
        aria-haspopup='menu'
        aria-expanded={isOpen}
        onClick={toggleMenu}
      />
      {isOpen && (
        <ul className='social-menu-list' role='menu' aria-label={label}>
          {items.map((item) => (
            <li key={item.key} role='none'>
              <button
                type='button'
                role='menuitem'
                className={item.className}
                onClick={() => selectItem(item)}
              >
                {item.icon}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendActionsMenu;
