"use client";

import React from 'react';

const Input = ({ label, type = "text", value, onChange, placeholder, error, className = "", ...props }) => {
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
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input-field ${error ? 'border-error' : ''}`}
        {...props}
      />
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

export default Input;
