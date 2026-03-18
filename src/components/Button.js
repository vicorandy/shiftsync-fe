"use client";

import React from 'react';

const Button = ({ children, onClick, type = "button", variant = "primary", disabled = false, className = "", ...props }) => {
  const baseStyles = {
    padding: 'var(--space-sm) var(--space-md)',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'var(--transition-fast)',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-sm)',
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: {
      background: 'var(--primary)',
      color: 'white',
    },
    secondary: {
      background: 'var(--surface-color)',
      color: 'var(--text-primary)',
      border: '1px solid var(--surface-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-primary)',
    },
    danger: {
      background: 'var(--error)',
      color: 'white',
    }
  };

  const style = { ...baseStyles, ...variants[variant] };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={style}
      className={`btn-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
