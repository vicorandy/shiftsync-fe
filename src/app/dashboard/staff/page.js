"use client";

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myNextShift: null,
    incomingRequests: 0,
    pendingSwaps: 0
  });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Profile Hook
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.get('/staff/me');
        setMyProfile(profile);
      } catch (err) {
        console.error('Failed to fetch staff profile:', err);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  // Fetch Shifts Hook
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        const myShifts = await api.get('/shifts/me');
        const nextShift = myShifts[0];
        
        setStats(prev => ({
          ...prev,
          myNextShift: nextShift
        }));
        setUpcomingShifts(myShifts.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch shifts:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchShifts();
  }, [user]);

  // Fetch Swaps Hook
  useEffect(() => {
    const fetchSwaps = async () => {
      const profileId = myProfile?.id || user?.staffProfileId;
      if (!profileId) return;

      try {
        const userId = user?.id;

        const swapData = await api.get('/swaps/me');
        console.log('[Dashboard Debug] profileId (staff):', profileId);
        console.log('[Dashboard Debug] userId:', userId);
        console.log('[Dashboard Debug] Swap Data:', swapData);

        const incoming = swapData.filter(s =>
          (s.accepterId === profileId || s.accepterProfileId === profileId || s.accepter?.userId === userId) &&
          (s.status === 'PENDING_ACCEPTANCE' || s.status === 'PENDING_APPROVAL')
        ).length;

        const pending = swapData.filter(s =>
          (s.requesterId === profileId || s.requesterProfileId === profileId || s.requester?.userId === userId) &&
          (s.status === 'PENDING_ACCEPTANCE' || s.status === 'PENDING_APPROVAL')
        ).length;

        console.log('[Dashboard Debug] Calculated Incoming:', incoming);
        console.log('[Dashboard Debug] Calculated Pending:', pending);

        setStats(prev => ({
          ...prev,
          incomingRequests: incoming,
          pendingSwaps: pending
        }));
      } catch (err) {
        console.error('Failed to fetch swaps:', err);
      }
    };
    
    if (user && (myProfile || user?.staffProfileId)) fetchSwaps();
  }, [user, myProfile]);

  return (
    <AppShell>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ margin: 0 }}>Welcome, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted">Here's your upcoming schedule and updates.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)'
      }}>
        <Card title="My Next Shift" subtitle={stats.myNextShift ? `${new Date(stats.myNextShift.startTime).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}` : "No upcoming assignments"}>
          {stats.myNextShift ? (
            <div style={{ margin: 'var(--space-md) 0' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{new Date(stats.myNextShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              <div style={{ color: 'var(--text-muted)' }}>{stats.myNextShift.location?.name} • {stats.myNextShift.skill?.name}</div>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-md) 0', color: 'var(--text-muted)' }}>You're all clear for now!</div>
          )}
          <Button variant="secondary" style={{ width: '100%' }}>View Details</Button>
        </Card>

        <Card title="Swap Requests" subtitle="Action needed from you">
          <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: 'var(--space-md) 0', color: stats.incomingRequests > 0 ? 'var(--warning)' : 'inherit' }}>
            {stats.incomingRequests}
          </div>
          <Button variant="secondary" style={{ width: '100%' }}>Review Requests</Button>
        </Card>

        <Card title="My Requests" subtitle="Pending approval">
          <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: 'var(--space-md) 0' }}>{stats.pendingSwaps}</div>
          <Button variant="secondary" style={{ width: '100%' }}>Manage Swaps</Button>
        </Card>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-lg)'
      }}>
        <div style={{ display: 'grid', gap: 'var(--space-lg)', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
          <Card title="My Upcoming Shifts" subtitle="Your schedule for the next 14 days">
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
                    <div style={{ fontWeight: '600' }}>{new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    <Badge variant="primary">{new Date(shift.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}</Badge>
                  </div>
                </div>
              )) : <p className="text-muted">No upcoming shifts scheduled.</p>}
            </div>
          </Card>

          {/* <Card title="Team Activity" subtitle="Recent changes to the schedule">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
              {recentNotifications.filter(n => n.title.includes('Schedule') || n.title.includes('Swap')).slice(0, 5).map(notif => (
                <div key={notif.id} style={{ fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{new Date(notif.createdAt).toLocaleDateString()}</span>
                  <p style={{ margin: '4px 0 0 0' }}>{notif.message}</p>
                </div>
              ))}
            </div>
          </Card> */}
        </div>
      </div>
    </AppShell>
  );
}
