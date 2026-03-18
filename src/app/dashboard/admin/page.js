"use client";

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    onDuty: 0,
    openShifts: 0,
    pendingSwaps: 0
  });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await api.get('/admin/notifications');
        console.log('[Admin Debug] Notifications Data:', notifications);
        setRecentNotifications(notifications.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch admin notifications:', err);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  // 2. Fetch All Shifts
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const nextWeek = new Date();
        nextWeek.setDate(now.getDate() + 14);

        const allShifts = await api.get('/shifts', { start: startOfDay.toISOString(), end: nextWeek.toISOString() });
        console.log('[Admin Debug] All Shifts Data:', allShifts);

        const openShiftsCount = allShifts.filter(s => s.assignments?.length < s.headcount).length;
        
        setStats(prev => ({
          ...prev,
          openShifts: openShiftsCount
        }));
        setUpcomingShifts(allShifts.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch admin shifts:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchShifts();
  }, [user]);

  // 3. Fetch On-Duty Analytics
  useEffect(() => {
    const fetchOnDuty = async () => {
      try {
        const onDutyList = await api.get('/analytics/on-duty');
        console.log('[Admin Debug] On-Duty Data:', onDutyList);
        
        setStats(prev => ({
          ...prev,
          onDuty: onDutyList.length || 0
        }));
      } catch (err) {
        console.error('Failed to fetch admin on-duty analytics:', err);
      }
    };
    if (user) fetchOnDuty();
  }, [user]);

  // 4. Fetch Swaps
  useEffect(() => {
    const fetchSwaps = async () => {
      try {
        const swapData = await api.get('/swaps');
        console.log('[Admin Debug] Swaps Data:', swapData);

        const pendingCount = swapData.filter(s => s.status === 'PENDING_APPROVAL' || s.status === 'PENDING_ACCEPTANCE').length;
        
        setStats(prev => ({
          ...prev,
          pendingSwaps: pendingCount
        }));
      } catch (err) {
        console.error('Failed to fetch admin swaps:', err);
      }
    };
    if (user) fetchSwaps();
  }, [user]);

  return (
    <AppShell>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ margin: 0 }}>System Overview</h1>
        <p className="text-muted">Global administrative dashboard for Coastal Eats.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)'
      }}>
        <Card title="Total On Duty" subtitle="Staff clocked in across all locations">
          <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: 'var(--space-md) 0' }}>{stats.onDuty}</div>
          <Badge variant="success">Network Wide</Badge>
        </Card>

        <Card title="Unfilled Shifts" subtitle="Across all regions">
          <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: 'var(--space-md) 0', color: 'var(--error)' }}>{stats.openShifts}</div>
          <Button variant="secondary" style={{ width: '100%' }}>Manage All Shifts</Button>
        </Card>

        <Card title="Total Pending Swaps" subtitle="Awaiting manager or system approval">
          <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: 'var(--space-md) 0', color: 'var(--warning)' }}>{stats.pendingSwaps}</div>
          <Button variant="secondary" style={{ width: '100%' }}>Review Queue</Button>
        </Card>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '2fr 1fr', 
        gap: 'var(--space-lg)' 
      }}>
        <div style={{ display: 'grid', gap: 'var(--space-lg)', gridTemplateColumns: '1fr' }}>
          <Card title="Recent Shift Activity" subtitle="Real-time updates from all locations">
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 'var(--space-md)',
              marginTop: 'var(--space-md)'
            }}>
              {upcomingShifts.length > 0 ? upcomingShifts.map((shift) => (
                <div key={shift.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 'var(--space-md)',
                  background: 'var(--bg-color)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--surface-border)'
                }}>
                  <div>
                    <div style={{ fontWeight: '600' }}>{shift.skill?.name || 'Staff Shift'}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{shift.location?.name || 'Store Location'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: '600' }}>{new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <Badge variant="primary">{new Date(shift.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</Badge>
                  </div>
                </div>
              )) : <p className="text-muted">No recent activity detected.</p>}
            </div>
          </Card>
        </div>

        <Card title="System Notifications">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            {recentNotifications.length > 0 ? recentNotifications.map(notif => (
              <div key={notif.id} style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: notif.type === 'SUCCESS' ? 'var(--success)' : notif.type === 'WARNING' ? 'var(--warning)' : 'var(--primary)',
                  marginTop: '6px'
                }} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{notif.title || 'Notification'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notif.message}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            )) : <p className="text-muted">No recent system notifications.</p>}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
