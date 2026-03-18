"use client";

import React from 'react';
import Card from './Card';
import Badge from './Badge';
import Button from './Button';

const StaffCard = ({ staff, onEdit }) => {
  return (
    <Card className="hover-lift">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-md)' }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: 'var(--radius-md)', 
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.25rem',
          fontWeight: '700'
        }}>
          {staff.name?.[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{staff.name}</h3>
            <Badge variant={staff.isAvailable ? "success" : "muted"}>
              {staff.isAvailable ? "Available" : "On Break"}
            </Badge>
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '2px' }}>{staff.email}</div>
          
          <div style={{ display: 'flex', gap: 'var(--space-xs)', flexWrap: 'wrap', marginTop: 'var(--space-md)' }}>
            {staff.skills?.map((skill, index) => (
              <Badge key={`${skill}-${index}`} variant="primary" style={{ fontSize: '0.65rem' }}>{skill}</Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: 'var(--space-md)', 
        paddingTop: 'var(--space-md)', 
        borderTop: '1px solid var(--surface-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '0.8rem' }}>
          <span style={{ fontWeight: '600' }}>{staff.weeklyHours || 0}h</span> / 40h this week
        </div>
        <Button variant="secondary" onClick={() => onEdit?.(staff)} style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
          Manage
        </Button>
      </div>

      <style jsx>{`
        .hover-lift:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </Card>
  );
};

export default StaffCard;
