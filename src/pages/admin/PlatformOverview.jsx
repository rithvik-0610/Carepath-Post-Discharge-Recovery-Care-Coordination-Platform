import React from 'react';
import { Link } from 'react-router-dom';
import { useCarePath } from '../../context/CarePathContext';
import MetricCard from '../../components/MetricCard';
import {
  Users,
  Stethoscope,
  FileText,
  UserCheck,
  Activity,
  Database
} from 'lucide-react';

export default function PlatformOverview() {
  const { patients, doctors, recoveryPlans, checkins } = useCarePath();

  const activePatients = patients.filter(p => p.accountStatus === 'Active');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Editorial Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Platform Overview
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            System-wide account directory, clinical team assignments, and post-discharge recovery platform metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <Link to="/admin/assignments" className="btn btn-secondary btn-sm">
            <UserCheck size={14} />
            <span>Doctor Assignments</span>
          </Link>
          <Link to="/admin/users" className="btn btn-primary btn-sm">
            <Users size={14} />
            <span>User Directory</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <MetricCard
          title="Patient Accounts"
          value={patients.length}
          subtitle={`${activePatients.length} active recovery cases`}
          icon={Users}
        />
        <MetricCard
          title="Attending Physicians"
          value={doctors.length}
          subtitle="Supervising clinical care"
          icon={Stethoscope}
        />
        <MetricCard
          title="Active Recovery Protocols"
          value={recoveryPlans.length}
          subtitle="Post-discharge care plans"
          icon={FileText}
        />
        <MetricCard
          title="Total Check-in Entries"
          value={checkins.length}
          subtitle="Processed patient logs"
          icon={Activity}
        />
      </div>

      {/* Role Overview */}
      <div className="care-card">
        <div className="care-card-header">
          <div>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
              Role Permissions &amp; Scope
            </h2>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Standard CarePath role boundaries
            </span>
          </div>
        </div>

        <div className="care-card-body" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem'
        }}>
          <div style={{
            padding: '1rem 1.15rem',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Patient Role ({patients.length})
              </span>
              <span className="badge badge-terracotta" style={{ fontSize: '0.68rem' }}>Self-Care</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Read-only view of physician-authored recovery plans. Daily self-reporting of pain (0-10), mobility, sleep, symptoms, personal notes, and weekly summaries.
            </p>
          </div>

          <div style={{
            padding: '1rem 1.15rem',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Doctor Role ({doctors.length})
              </span>
              <span className="badge badge-orange" style={{ fontSize: '0.68rem' }}>Clinical</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Full patient management for assigned cohorts, authoring recovery plans, reviewing daily check-in logs, acknowledging rule-based alerts, and tracking recovery trends.
            </p>
          </div>

          <div style={{
            padding: '1rem 1.15rem',
            backgroundColor: 'var(--bg-app)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Admin Role (1)
              </span>
              <span className="badge badge-terracotta" style={{ fontSize: '0.68rem' }}>Operations</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Administrative account oversight, patient-to-doctor assignments, account status management (active/inactive), and platform monitoring without clinical decision-making.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Readiness */}
      <div style={{
        padding: '1rem 1.25rem',
        backgroundColor: 'var(--bg-app)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        <Database size={16} color="var(--color-primary-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Architecture &amp; Migration Readiness:</strong> All mock data structures in this frontend demonstration follow normalized schema conventions matching the planned Node.js + Express REST API endpoints and MySQL database tables.
        </div>
      </div>
    </div>
  );
}
