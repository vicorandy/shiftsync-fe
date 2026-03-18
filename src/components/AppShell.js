"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import Button from './Button';
import Badge from './Badge';

const Sidebar = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { label: 'Schedule', href: '/schedule', icon: '📅', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { label: 'Staff', href: '/staff', icon: '👥', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Analytics', href: '/analytics', icon: '📈', roles: ['ADMIN', 'MANAGER'] },
    { label: 'Settings', href: '/settings', icon: '⚙️', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div style={{
      width: isOpen ? '280px' : '0',
      height: '100vh',
      background: 'var(--surface-color)',
      borderRight: '1px solid var(--surface-border)',
      transition: 'var(--transition-base)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      zIndex: 100,
    }}>
      <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--surface-border)' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', margin: 0 }}>ShiftSync</h2>
      </div>

      <nav style={{ flex: 1, padding: 'var(--space-md)' }}>
        {filteredItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-md)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--space-xs)',
                background: isActive ? 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)' : 'transparent',
                color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? '600' : '400',
                transition: 'var(--transition-fast)',
                cursor: 'pointer'
              }}>
                <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: 'var(--space-md)', borderTop: '1px solid var(--surface-border)' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-md)',
          padding: 'var(--space-sm)',
          marginBottom: 'var(--space-md)'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700'
          }}>
            {user?.name?.[0]}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</div>
          </div>
        </div>
        <Button variant="ghost" onClick={logout} style={{ width: '100%', justifyContent: 'flex-start' }}>
          Logout
        </Button>
      </div>
    </div>
  );
};

const Topbar = ({ onMenuClick, notificationCount }) => {
  return (
    <div style={{
      height: '70px',
      background: 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur)',
      borderBottom: '1px solid var(--surface-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-xl)',
      position: 'sticky',
      top: 0,
      zIndex: 90,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <Button variant="ghost" onClick={onMenuClick} style={{ padding: 'var(--space-xs)' }}>
          ☰
        </Button>
        <span style={{ color: 'var(--text-muted)' }}>Coastal Eats / Dashboard</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.5rem' }}>🔔</span>
          {notificationCount > 0 && (
            <div style={{ 
              position: 'absolute', 
              top: '-5px', 
              right: '-5px', 
              background: 'var(--error)', 
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              border: '2px solid var(--surface-color)'
            }}>
              {notificationCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AppShell({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const socket = useSocket();

  React.useEffect(() => {
    if (socket) {
      socket.on('notification', (data) => {
        setNotificationCount(prev => prev + 1);
      });

      return () => {
        socket.off('notification');
      };
    }
  }, [socket]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div style={{ 
        flex: 1, 
        marginLeft: isSidebarOpen ? '280px' : '0', 
        transition: 'var(--transition-base)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Topbar 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          notificationCount={notificationCount}
        />
        <main style={{ padding: 'var(--space-xl)', flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
