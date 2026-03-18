"use client";

import React, { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import StaffCard from '@/components/StaffCard';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Modal from '@/components/Modal';
import { api } from '@/lib/api';

export default function StaffPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      // Assuming GET /staff returns the full list of staff
      const data = await api.get('/staff');
      // Map backend data to simple format for StaffCard
      const mappedData = data.map(s => ({
        id: s.id,
        name: s.user?.name || 'Unknown',
        email: s.user?.email || '',
        skills: s.skills?.map(sk => sk.skill?.name) || [],
        isAvailable: true, // Placeholder for now
        weeklyHours: 0
      }));
      setStaffList(mappedData);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staffList.filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.skills || []).some(sk => sk.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AppShell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ margin: 0 }}>Staff Directory</h1>
          <p className="text-muted">Manage skills, certifications, and availability.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Staff Member</Button>
      </div>

      <div style={{ marginBottom: 'var(--space-xl)', maxWidth: '500px' }}>
        <Input
          placeholder="Search by name or skill..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        {loading ? <p>Loading staff...</p> : filteredStaff.map(staff => (
          <StaffCard
            key={staff.id}
            staff={staff}
            onEdit={() => console.log('Edit', staff)}
          />
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite New Staff"
        footer={(
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button>Send Invitation</Button>
          </>
        )}
      >
        <p className="text-muted" style={{ marginBottom: 'var(--space-md)' }}>
          Staff members will receive an email to set up their profile and availability.
        </p>
        <Input label="Full Name" placeholder="e.g. Michael Chen" />
        <Input label="Email Address" placeholder="e.g. michael@coastaleats.com" />
      </Modal>
    </AppShell>
  );
}
