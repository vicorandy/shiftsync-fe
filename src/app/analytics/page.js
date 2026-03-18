"use client";

import React, { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import ProgressBar from '@/components/ProgressBar';
import { api } from '@/lib/api';

export default function AnalyticsPage() {
  const [reportData, setReportData] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const query = {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
        locationId: 'uuid-location-1' // Default for now
      };

      // Fetch fairness distribution report
      const fairness = await api.get('/analytics/fairness', query);
      setReportData(fairness);

      // Fetch compliance metrics
      const compliance = await api.get('/analytics/compliance', query);
      setComplianceData(compliance);

    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const staffFairness = reportData?.report || [];
  const metrics = complianceData?.metrics || { restRule: 0, weeklyLimit: 0, overtimePrevention: 0 };
  
  // Calculate aggregate fairness score if data exists
  const fairnessScore = staffFairness.length > 0 
    ? Math.round(staffFairness.reduce((acc, s) => acc + (s.premiumShifts / (s.totalHours || 1)), 0) / staffFairness.length * 100)
    : 0;

  return (
    <AppShell>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ margin: 0 }}>Labor Analytics</h1>
        <p className="text-muted">Tracking scheduling fairness and compliance.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)'
      }}>
        <Card title="Fairness Score" subtitle="Equitable distribution of premium shifts">
          <div style={{ textAlign: 'center', padding: 'var(--space-md) 0' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: '800', color: 'var(--primary)' }}>{fairnessScore}%</div>
            <Badge variant="success">{fairnessScore > 70 ? 'Excellent' : 'Needs Review'}</Badge>
          </div>
          <p style={{ fontSize: '0.875rem', marginTop: 'var(--space-md)' }}>
            Premium shift distribution based on current staffing levels.
          </p>
        </Card>

        <Card title="Compliance Health" subtitle="Labor law & rest rule adherence">
          <div style={{ marginTop: 'var(--space-md)' }}>
            <ProgressBar label="Rest Rule Compliance" value={metrics.restRule} color={metrics.restRule > 90 ? "var(--success)" : "var(--warning)"} />
            <ProgressBar label="Weekly Hour Limits" value={metrics.weeklyLimit} color={metrics.weeklyLimit > 90 ? "var(--success)" : "var(--warning)"} />
            <ProgressBar label="Overtime Prevention" value={metrics.overtimePrevention} color={metrics.overtimePrevention > 90 ? "var(--success)" : "var(--warning)"} />
          </div>
        </Card>
      </div>

      <Card title="Staff Distribution Report" subtitle="Premium shift allocation vs Total hours">
        <div style={{ overflowX: 'auto', marginTop: 'var(--space-md)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <th style={{ padding: 'var(--space-sm) 0' }}>STAFF MEMBER</th>
                <th>TOTAL HOURS</th>
                <th>PREMIUM SHIFTS</th>
                <th>FAIRNESS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4">Loading report...</td></tr>
              ) : staffFairness.length > 0 ? staffFairness.map((staff, i) => (
                <tr key={i} style={{ borderBottom: i < staffFairness.length - 1 ? '1px solid var(--surface-border)' : 'none' }}>
                  <td style={{ padding: 'var(--space-md) 0', fontWeight: '600' }}>{staff.name}</td>
                  <td>{Math.round(staff.totalHours)}h</td>
                  <td>{staff.premiumShifts}</td>
                  <td style={{ width: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                      <div style={{ flex: 1, height: '4px', background: 'var(--surface-border)', borderRadius: '2px' }}>
                        <div style={{ width: `${Math.min(100, (staff.totalHours / 40) * 100)}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px' }} />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{Math.round((staff.totalHours / 40) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4">No data available for the selected period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
