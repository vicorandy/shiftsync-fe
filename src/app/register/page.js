"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Select from '@/components/Select';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name || 'role']: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        background: 'hsl(230, 20%, 4%)'
      }}>
        <Card className="glass" style={{ maxWidth: '400px', textAlign: 'center' }}>
          <div style={{ color: 'var(--success)', fontSize: '3rem', marginBottom: 'var(--space-md)' }}>✓</div>
          <h2>Access Requested</h2>
          <p className="text-muted">Your account has been created. Redirecting to login...</p>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'radial-gradient(circle at 90% 10%, hsl(230, 30%, 10%) 0%, hsl(230, 20%, 4%) 90%)',
      padding: 'var(--space-md)'
    }}>
      <Card 
        className="glass" 
        style={{ width: '100%', maxWidth: '450px', padding: 'var(--space-xl)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-xs)' }}>Join ShiftSync</h1>
          <p className="text-muted">Restaurant staff scheduling made simple</p>
        </div>

        {error && (
          <div style={{ 
            background: 'hsla(0, 75%, 55%, 0.1)', 
            color: 'var(--error)', 
            padding: 'var(--space-sm)', 
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            marginBottom: 'var(--space-md)',
            border: '1px solid hsla(0, 75%, 55%, 0.2)'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Sarah Miller"
            required
            disabled={isLoading}
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="sarah@coastaleats.com"
            required
            disabled={isLoading}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
          <Select
            label="Role"
            name="role"
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            options={[
              { label: 'Staff Member', value: 'STAFF' },
              { label: 'Location Manager', value: 'MANAGER' },
              { label: 'Admin (Corporate)', value: 'ADMIN' },
            ]}
            disabled={isLoading}
          />
          
          <Button 
            type="button" 
            variant="ghost"
            className="auth-back-btn"
            disabled={isLoading}
            onClick={() => router.push('/login')}
          >
            ← Back to Login
          </Button>
          <Button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </Card>
      
      {/* Decorative Blur Elements */}
      <div style={{ 
        position: 'absolute', 
        top: '15%', 
        right: '15%', 
        width: '400px', 
        height: '400px', 
        background: 'var(--accent)', 
        filter: 'blur(180px)', 
        opacity: 0.1, 
        zIndex: -1 
      }} />
    </div>
  );
}
