"use client";

import React, { useEffect } from 'react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = '500px' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-md)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--surface-color)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: maxWidth,
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--surface-border)',
        overflow: 'hidden',
        animation: 'modalSlideUp 0.3s ease-out'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: 'var(--space-lg)',
          borderBottom: '1px solid var(--surface-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
          <Button variant="ghost" onClick={onClose} style={{ padding: 'var(--space-xs)', fontSize: '1.5rem', lineHeight: 1 }}>
            &times;
          </Button>
        </div>
        
        <div style={{ padding: 'var(--space-lg)', maxHeight: '70vh', overflowY: 'auto' }}>
          {children}
        </div>

        {footer && (
          <div style={{
            padding: 'var(--space-lg)',
            borderTop: '1px solid var(--surface-border)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 'var(--space-sm)',
            background: 'var(--bg-color)'
          }}>
            {footer}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Modal;
