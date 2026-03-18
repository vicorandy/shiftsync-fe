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
          style={{
            width: '100%',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-md)',
            border: error ? '1px solid var(--error)' : '1px solid var(--surface-border)',
            background: 'var(--surface-color)',
            color: 'var(--text-primary)',
            fontSize: '1rem',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = 'var(--primary)';
            e.target.style.boxShadow = `0 0 0 4px ${error ? 'hsla(0, 80%, 60%, 0.1)' : 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)'}`;
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--surface-border)';
            e.target.style.boxShadow = 'none';
          }}
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
