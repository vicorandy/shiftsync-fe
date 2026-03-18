"use client";

import React from 'react';

const Select = ({ label, value, onChange, options, error, className = "", ...props }) => {
  return (
    <div className={`input-group ${className}`} style={{ marginBottom: 'var(--space-md)', width: '100%' }}>
      {label && (
        <label style={{ 
          display: 'block', 
          marginBottom: 'var(--space-xs)', 
          fontSize: '0.875rem', 
          fontWeight: '600',
          color: 'var(--text-secondary)'
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={onChange}
          className={`select-field ${error ? 'border-error' : ''}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div style={{
          position: 'absolute',
          right: 'var(--space-md)',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'var(--text-muted)'
        }}>
          ▼
        </div>
      </div>
      {error && (
        <span style={{ 
          display: 'block', 
          marginTop: 'var(--space-xs)', 
          fontSize: '0.75rem', 
          color: 'var(--error)' 
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;
