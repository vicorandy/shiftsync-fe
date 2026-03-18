"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AppShell from '@/components/AppShell';

export default function DashboardRouter() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
        return;
      }

      // Redirect based on role
      switch (user.role) {
        case 'STAFF':
          router.replace('/dashboard/staff');
          break;
        case 'MANAGER':
          router.replace('/dashboard/manager');
          break;
        case 'ADMIN':
          router.replace('/dashboard/admin');
          break;
        default:
          router.replace('/dashboard/staff'); // Default fallback
      }
    }
  }, [user, loading, router]);

  return (
    <AppShell>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '60vh',
        color: 'var(--text-muted)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loader" style={{ marginBottom: 'var(--space-md)' }}>Preparing your dashboard...</div>
          <p>Checking permissions and loading role-specific data</p>
        </div>
      </div>
      <style jsx>{`
        .loader {
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </AppShell>
  );
}
