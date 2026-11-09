import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, title, onClose, footer = null, children }) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div className='ui-modal-backdrop' onClick={onClose}>
      <div
        className='ui-modal'
        role='dialog'
        aria-modal='true'
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className='ui-modal-title'>{title}</h2>
        <div className='ui-modal-body'>{children}</div>
        {footer && <div className='ui-modal-footer'>{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
