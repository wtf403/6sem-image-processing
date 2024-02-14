import React from 'react';
import cn from 'classnames';
import './style.css';

const Button = ({ title, children, onClick, active, tooltip, disabled }) => {
  return (
    <button
      disabled={disabled}
      className={cn({
        "button-icon--active": [active],
        "button-icon": true
      })}
      onClick={onClick}
    >
      {title && <span className="visually-hidden">{title}</span>}
      {tooltip && <p className="button-icon__tooltip">{tooltip}</p>}
      {children}
    </button>
  );
};

export default Button;
