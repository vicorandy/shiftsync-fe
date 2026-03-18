"use client";

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
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
  const [mySwaps, setMySwaps] = useState([]);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [isMySwapsModalOpen, setIsMySwapsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
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
      setLoading(true);
      try {
        const userId = user?.id;

        const swapData = await api.get('/swaps/me');
        setMySwaps(swapData);

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

  const handleAcceptSwap = async (swapId) => {
    try {
      await api.post(`/swaps/${swapId}/accept`);
      alert('Swap accepted! Waiting for manager approval.');
      // Refresh swaps
      const swapData = await api.get('/swaps/me');
      setMySwaps(swapData);
    } catch (err) {
      console.error('Failed to accept swap:', err);
      alert('Failed to accept swap: ' + (err.message || 'Unknown error'));
    }
  };

  const handleRequestSwapShift = async (type) => {
    // This connects to the same logic as the schedule page
    try {
      await api.post('/swaps/request', {
        shiftId: selectedShift.id,
        type: type // 'DROP' or 'SWAP'
      });
      alert(`${type} request submitted!`);
      setIsDetailModalOpen(false);
      // Refresh swaps
      const swapData = await api.get('/swaps/me');
      setMySwaps(swapData);
    } catch (err) {
      console.error('Swap request failed:', err);
      alert('Failed to submit request: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCancelSwap = async (swapId) => {
    try {
      // Assuming PUT /api/shifts/:id cancels, but swaps likely have a delete or cancel endpoint.
      // Based on back-end, PUT /api/shifts/:id cancels PENDING swaps.
      // But for a specific swap request, we might need a DELETE /api/swaps/:id or similar.
      // Let's check src/routes/swaps.js for a cancel endpoint.
      await api.delete(`/swaps/${swapId}`); 
      alert('Request cancelled successfully.');
      const swapData = await api.get('/swaps/me');
      setMySwaps(swapData);
    } catch (err) {
      console.error('Failed to cancel swap:', err);
      alert('Failed to cancel: ' + (err.message || 'Unknown error'));
    }
  };

  const myRequests = mySwaps.filter(s =>
    (s.requesterId === (myProfile?.id || user?.staffProfileId) || s.requester?.userId === user?.id) &&
    (s.status === 'PENDING_ACCEPTANCE' || s.status === 'PENDING_APPROVAL')
  );

  const incomingRequests = mySwaps.filter(s =>
    (s.accepterId === (myProfile?.id || user?.staffProfileId) || s.accepter?.userId === user?.id) &&
    s.status === 'PENDING_ACCEPTANCE'
  );

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
          <Button 
            variant="secondary" 
            style={{ width: '100%' }}
            onClick={() => {
              setSelectedShift(stats.myNextShift);
              setIsDetailModalOpen(true);
            }}
            disabled={!stats.myNextShift}
          >
            View Details
          </Button>
        </Card>

        <Card title="Swap Requests" subtitle="Action needed from you">
          <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: 'var(--space-md) 0', color: incomingRequests.length > 0 ? 'var(--warning)' : 'inherit' }}>
            {incomingRequests.length}
          </div>
          <Button variant="secondary" style={{ width: '100%' }} onClick={() => setIsSwapModalOpen(true)}>Review Requests</Button>
        </Card>

        <Card title="My Requests" subtitle="Pending approval">
          <div style={{ fontSize: '2.5rem', fontWeight: '800', margin: 'var(--space-md) 0' }}>
            {myRequests.length}
          </div>
          <Button variant="secondary" style={{ width: '100%' }} onClick={() => setIsMySwapsModalOpen(true)}>Manage Swaps</Button>
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
                <div 
                  key={shift.id} 
                  onClick={() => {
                    setSelectedShift(shift);
                    setIsDetailModalOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-md)',
                    background: 'var(--bg-color)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--surface-border)',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--surface-border)'}
                >
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
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Incoming Swap Requests"
        footer={<Button variant="secondary" onClick={() => setIsSwapModalOpen(false)}>Close</Button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {incomingRequests.length > 0 ? incomingRequests.map(swap => (
            <div key={swap.id} style={{
              padding: 'var(--space-md)',
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                <div>
                  <div style={{ fontWeight: '700' }}>{swap.shift?.skill?.name}</div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{swap.shift?.location?.name}</div>
                </div>
                <Badge variant="warning">Swap Requested</Badge>
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
                {new Date(swap.shift?.startTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                <br />
                Requested by: <strong>{swap.requester?.user?.name}</strong>
              </div>
              <Button style={{ width: '100%' }} onClick={() => handleAcceptSwap(swap.id)}>Accept Swap Request</Button>
            </div>
          )) : <p className="text-muted">No pending swap requests for you.</p>}
        </div>
      </Modal>

      <Modal
        isOpen={isMySwapsModalOpen}
        onClose={() => setIsMySwapsModalOpen(false)}
        title="My Outgoing Requests"
        footer={<Button variant="secondary" onClick={() => setIsMySwapsModalOpen(false)}>Close</Button>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {myRequests.length > 0 ? myRequests.map(swap => (
            <div key={swap.id} style={{
              padding: 'var(--space-md)',
              border: '1px solid var(--surface-border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                <div>
                  <Badge variant={swap.type === 'SWAP' ? 'primary' : 'warning'}>{swap.type}</Badge>
                  <div style={{ fontWeight: '700', marginTop: '4px' }}>{swap.shift?.skill?.name}</div>
                </div>
                <Badge variant="secondary">{swap.status.replace('_', ' ')}</Badge>
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: 'var(--space-md)' }}>
                {new Date(swap.shift?.startTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                <br />
                {swap.type === 'SWAP' && <>Swap with: <strong>{swap.accepter?.user?.name || 'Open'}</strong></>}
              </div>
              <Button variant="danger" style={{ width: '100%' }} onClick={() => handleCancelSwap(swap.id)}>Cancel Request</Button>
            </div>
          )) : <p className="text-muted">You have no pending outgoing requests.</p>}
        </div>
      </Modal>

      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Shift Details"
        footer={<Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>Close</Button>}
      >
        {selectedShift && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div style={{ padding: 'var(--space-md)', background: 'var(--bg-color)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>{selectedShift.skill?.name || 'Staff Shift'}</div>
              <div style={{ fontWeight: '600' }}>{selectedShift.location?.name || 'Store Location'}</div>
              <div style={{ color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
                {new Date(selectedShift.startTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                <br />
                {new Date(selectedShift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(selectedShift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <Button style={{ width: '100%' }} onClick={() => handleRequestSwapShift('SWAP')}>Request Swap</Button>
              <Button variant="secondary" style={{ width: '100%' }} onClick={() => handleRequestSwapShift('DROP')}>Drop Shift</Button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Want to change this shift? Initiate a swap with a colleague or request a drop for manager approval.
            </p>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
