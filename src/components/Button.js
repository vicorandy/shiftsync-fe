"use client";

import React from 'react';

const Button = ({ children, onClick, type = "button", variant = "primary", disabled = false, className = "", ...props }) => {
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
