"use client";

import React, { useState } from 'react';
import Badge from './Badge';

const Calendar = ({ shifts = [], onShiftClick, onAddShift, currentStaffId, canAddShift = true }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Helper to get dates for the week
  const getWeekDates = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(start.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const weekDates = getWeekDates(currentWeek);

  return (
    <div style={{ 
      background: 'var(--surface-color)', 
      borderRadius: 'var(--radius-lg)', 
      border: '1px solid var(--surface-border)',
      overflow: 'hidden'
    }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        borderBottom: '1px solid var(--surface-border)' 
      }}>
        {weekDates.map((date, i) => (
          <div key={i} style={{ 
            padding: 'var(--space-md)', 
            textAlign: 'center',
            borderRight: i < 6 ? '1px solid var(--surface-border)' : 'none',
            background: date.toDateString() === new Date().toDateString() ? 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.05)' : 'transparent'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{days[i]}</div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', marginTop: '4px' }}>{date.getDate()}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', minHeight: '600px' }}>
        {weekDates.map((date, i) => {
          const dayShifts = shifts.filter(s => new Date(s.startTime).toDateString() === date.toDateString());
          
          return (
            <div key={i} style={{ 
              padding: 'var(--space-sm)', 
              borderRight: i < 6 ? '1px solid var(--surface-border)' : 'none',
              background: i % 2 === 0 ? 'transparent' : 'hsla(230, 10%, 50%, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-sm)'
            }}>
              {dayShifts.map(shift => {
                const isMyShift = currentStaffId && shift.assignments?.some(a => a.staffProfileId === currentStaffId);
                
                return (
                  <div 
                    key={shift.id} 
                    onClick={() => onShiftClick?.(shift)}
                    style={{ 
                      padding: 'var(--space-sm)', 
                      background: isMyShift ? 'hsla(var(--primary-h), var(--primary-s), var(--primary-l), 0.1)' : 'var(--bg-color)', 
                      border: isMyShift ? '2px solid var(--primary)' : '1px solid var(--surface-border)',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'var(--transition-fast)',
                      borderLeft: isMyShift ? '2px solid var(--primary)' : `4px solid ${shift.isPublished ? 'var(--success)' : 'var(--warning)'}`
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: '750' }}>{shift.skill?.name || 'Staff Shift'}</div>
                      {isMyShift && <Badge variant="primary" style={{ fontSize: '0.6rem' }}>Me</Badge>}
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      {new Date(shift.startTime).getHours()}:00 - {new Date(shift.endTime).getHours()}:00
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.7rem' }}>👤 {shift.assignments?.length || 0}/{shift.headcount}</span>
                      {!shift.isPublished && <Badge variant="warning">Draft</Badge>}
                    </div>
                  </div>
                );
              })}
              {canAddShift && (
                <div 
                  onClick={() => onAddShift?.(date)}
                  style={{ 
                    marginTop: 'auto', 
                    padding: 'var(--space-xs)', 
                    textAlign: 'center', 
                    border: '1px dashed var(--surface-border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem'
                  }}
                >
                  + Add Shift
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
