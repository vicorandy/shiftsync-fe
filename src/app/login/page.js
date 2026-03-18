"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'radial-gradient(circle at 10% 20%, hsl(230, 20%, 8%) 0%, hsl(230, 20%, 4%) 90%)',
      padding: 'var(--space-md)'
    }}>
      <Card 
        className="glass" 
        style={{ width: '100%', maxWidth: '400px', padding: 'var(--space-xl)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: 'var(--space-xs)' }}>Welcome Back</h1>
          <p className="text-muted">Sign in to ShiftSync to manage your schedule</p>
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
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@coastaleats.com"
            required
            disabled={isLoading}
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)', fontSize: '0.875rem' }}>
          <span className="text-muted">Don't have an account? </span>
          <Link href="/register" style={{ fontWeight: '600' }}>Request Access</Link>
        </div>
      </Card>
      
      {/* Decorative Blur Elements */}
      <div style={{ 
        position: 'absolute', 
        top: '10%', 
        left: '10%', 
        width: '300px', 
        height: '300px', 
        background: 'var(--primary)', 
        filter: 'blur(150px)', 
        opacity: 0.15, 
        zIndex: -1 
      }} />
      <div style={{ 
        position: 'absolute', 
        bottom: '10%', 
        right: '10%', 
        width: '300px', 
        height: '300px', 
        background: 'var(--accent)', 
        filter: 'blur(150px)', 
        opacity: 0.1, 
        zIndex: -1 
      }} />
    </div>
  );
}
