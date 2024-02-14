import React, { useEffect, useRef } from 'react';
import './style.css';

const ContextModal = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.show();
    } else {
      dialogRef.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog className="context-modal" aria-label="Контекстной меню" ref={dialogRef} onCancel={onClose} data-modal>
      <div className="context-modal__head">
        <h2 className='context-modal__title'>{title}</h2>
        <button className="context-modal__close" onClick={onClose} data-close-modal>&#x2715;</button>
      </div>
      <div className="context-modal__body">
        {children}
      </div>
    </dialog>
  );
};


export default ContextModal;
