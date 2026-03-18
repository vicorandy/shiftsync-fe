"use client";

import React from 'react';

const Badge = ({ children, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: { background: 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)', color: 'var(--primary)' },
    success: { background: 'hsla(150, 70%, 45%, 0.1)', color: 'var(--success)' },
    warning: { background: 'hsla(45, 90%, 50%, 0.1)', color: 'var(--warning)' },
    error: { background: 'hsla(0, 75%, 55%, 0.1)', color: 'var(--error)' },
    muted: { background: 'var(--surface-border)', color: 'var(--text-muted)' }
  };

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '100px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.02em',
        ...variants[variant]
      }}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
