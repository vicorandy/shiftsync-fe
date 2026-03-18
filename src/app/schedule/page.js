"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Calendar from '@/components/Calendar';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function SchedulePage() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    skillId: '',
    startTime: '',
    endTime: '',
    headcount: 1,
    locationId: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [locationsData, skillsData] = await Promise.all([
        api.get('/locations'),
        api.get('/skills')
      ]);

      setLocations(locationsData);
      setSkills(skillsData);
      
      if (locationsData.length > 0) {
        setFormData(prev => ({ ...prev, locationId: locationsData[0].id }));
      }
      if (skillsData.length > 0) {
        setFormData(prev => ({ ...prev, skillId: skillsData[0].id }));
      }

      if (user?.role === 'STAFF') {
        const profile = await api.get('/staff/me');
        setMyProfile(profile);
      }

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const shiftData = await api.get('/shifts', {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      });
      setShifts(shiftData);
    } catch (err) {
      console.error('Failed to fetch schedule data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleShiftClick = (shift) => {
    const isMyShift = myProfile && shift.assignments?.some(a => a.staffProfileId === myProfile.id);
    if (isMyShift) {
      setSelectedShift(shift);
      setIsSwapModalOpen(true);
    } else {
      console.log('View shift details', shift);
    }
  };

  const handleRequestSwap = async (type) => {
    try {
      await api.post('/swaps/request', {
        shiftId: selectedShift.id,
        type: type // 'SWAP' or 'DROP'
      });
      setIsSwapModalOpen(false);
      alert(`${type} request submitted!`);
    } catch (err) {
      console.error('Swap request failed:', err);
      alert('Failed to submit request: ' + (err.message || 'Unknown error'));
    }
  };

  const handleCreateShift = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shifts', { ...formData });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create shift:', err);
    }
  };

  const isStaff = user?.role === 'STAFF';

  return (
    <AppShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ margin: 0 }}>{isStaff ? 'My Schedule' : 'Shift Schedule'}</h1>
          <p className="text-muted">
            {isStaff ? 'View your assignments and manage swaps.' : 'Manage staffing levels across all locations.'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <Button variant="secondary">Download PDF</Button>
          {!isStaff && <Button onClick={() => setIsModalOpen(true)}>Create Shift</Button>}
        </div>
      </div>

      <Calendar 
        shifts={shifts} 
        onAddShift={!isStaff ? (date) => { setSelectedDate(date); setIsModalOpen(true); } : null}
        onShiftClick={handleShiftClick}
        currentStaffId={myProfile?.id}
        canAddShift={!isStaff}
      />

      {/* Admin Create Shift Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Shift"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateShift}>Create Shift</Button>
          </>
        )}
      >
        <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <Select
            label="Role Required"
            value={formData.skillId}
            onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
            options={skills.map(s => ({ label: s.name, value: s.id }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <Input 
              label="Start Time" 
              type="time" 
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input 
              label="End Time" 
              type="time" 
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>
          <Input 
            label="Headcount" 
            type="number" 
            value={formData.headcount}
            onChange={(e) => setFormData({ ...formData, headcount: parseInt(e.target.value) })}
            min={1} 
          />
          <Select
            label="Location"
            value={formData.locationId}
            onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
            options={locations.map(l => ({ label: l.name, value: l.id }))}
          />
        </form>
      </Modal>

      {/* Staff Swap/Drop Modal */}
      <Modal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
        title="Manage Shift"
        footer={<Button variant="secondary" onClick={() => setIsSwapModalOpen(false)}>Close</Button>}
      >
        {selectedShift && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selectedShift.skill?.name} at {selectedShift.location?.name}</div>
              <div style={{ color: 'var(--text-muted)' }}>
                {new Date(selectedShift.startTime).toLocaleString([], { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <Button onClick={() => handleRequestSwap('SWAP')}>Request Swap</Button>
              <Button variant="secondary" onClick={() => handleRequestSwap('DROP')}>Drop Shift</Button>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Note: Swap requests allow you to trade with a colleague. Drop requests need manager approval and coverage.
            </p>
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
