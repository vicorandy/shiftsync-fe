"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Badge from '@/components/Badge';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newAvail, setNewAvail] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isRecurring: true
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.get('/staff/me');
      setProfile(data);
      setAvailabilities(data.availabilities || []);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const handleAddAvailability = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff/availability', {
        ...newAvail,
        dayOfWeek: parseInt(newAvail.dayOfWeek)
      });
      setIsAdding(false);
      fetchData();
    } catch (err) {
      console.error('Failed to add availability:', err);
      alert('Error: ' + (err.message || 'Could not save availability'));
    }
  };

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (loading) return <AppShell><p>Loading settings...</p></AppShell>;

  return (
    <AppShell>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ margin: 0 }}>Account Settings</h1>
        <p className="text-muted">Manage your profile and work preferences.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <Card title="Personal Information">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Full Name</label>
                <div style={{ fontWeight: '600' }}>{user?.name}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email Address</label>
                <div style={{ fontWeight: '600' }}>{user?.email}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role</label>
                <Badge>{user?.role}</Badge>
              </div>
            </div>
          </Card>

          <Card title="Skills & Certifications">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', marginTop: 'var(--space-md)' }}>
              {profile?.skills?.length > 0 ? profile.skills.map(skill => (
                <Badge key={skill.id} variant="primary">{skill.name}</Badge>
              )) : <p className="text-muted">No skills listed.</p>}
            </div>
          </Card>
        </div>

        <div>
          <Card 
            title="Work Availability" 
            subtitle="Define when you are available to be scheduled"
            footer={!isAdding && <Button onClick={() => setIsAdding(true)}>Add Availability</Button>}
          >
            <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {isAdding ? (
                <form onSubmit={handleAddAvailability} style={{ background: 'var(--bg-color)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <Select 
                    label="Day of the Week"
                    value={newAvail.dayOfWeek}
                    onChange={(e) => setNewAvail({...newAvail, dayOfWeek: e.target.value})}
                    options={days.map((day, i) => ({ label: day, value: i }))}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                    <Input label="Start Time" type="time" value={newAvail.startTime} onChange={(e) => setNewAvail({...newAvail, startTime: e.target.value})} />
                    <Input label="End Time" type="time" value={newAvail.endTime} onChange={(e) => setNewAvail({...newAvail, endTime: e.target.value})} />
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
                    <Button type="submit" size="sm">Save</Button>
                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsAdding(false)}>Cancel</Button>
                  </div>
                </form>
              ) : null}

              {availabilities.length > 0 ? availabilities.map((avail, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: 'var(--space-sm) var(--space-md)',
                  background: 'var(--bg-color)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--surface-border)'
                }}>
                  <div>
                    <span style={{ fontWeight: '600' }}>{days[avail.dayOfWeek]}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{avail.startTime} - {avail.endTime}</div>
                  </div>
                  <Badge variant="success">Recurring</Badge>
                </div>
              )) : !isAdding && <p className="text-muted">No availability set. Please add your working hours.</p>}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
