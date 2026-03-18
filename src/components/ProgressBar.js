"use client";

import React from 'react';

const ProgressBar = ({ value, max = 100, label, color = 'var(--primary)', height = '8px' }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div style={{ width: '100%', marginBottom: 'var(--space-md)' }}>
      {(label || true) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
          <span style={{ fontWeight: '600' }}>{label}</span>
          <span className="text-muted">{value} / {max}</span>
        </div>
      )}
      <div style={{ 
        width: '100%', 
        height, 
        background: 'var(--surface-border)', 
        borderRadius: '100px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: `${percentage}%`, 
          height: '100%', 
          background: color,
          borderRadius: '100px',
          transition: 'width 0.5s ease-out'
        }} />
      </div>
    </div>
  );
};

export default ProgressBar;
