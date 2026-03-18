"use client";

import React from 'react';

const Card = ({ children, title, subtitle, footer, className = "", ...props }) => {
  return (
    <div className={`card ${className}`} style={{ height: 'fit-content' }} {...props}>
      {(title || subtitle) && (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          {subtitle && <p className="text-muted" style={{ marginTop: 'var(--space-xs)' }}>{subtitle}</p>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
      {footer && (
        <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--surface-border)' }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
