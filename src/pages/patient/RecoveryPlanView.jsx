import React from 'react';
import { Link } from 'react-router-dom';
import { useCarePath } from '../../context/CarePathContext';
import {
  Check,
  Calendar,
  Clock,
  MapPin,
  Lock,
  CalendarCheck
} from 'lucide-react';

export default function RecoveryPlanView() {
  const { currentUser, recoveryPlans, markActivityCompleted } = useCarePath();

  // Find plan for current logged in patient or fallback to demo plan (PAT-101 / recoveryPlans[0])
  const patientPlan = recoveryPlans.find(
    p => p.patientId === currentUser?.id ||
         p.patientId === currentUser?.patientId ||
         String(p.patientId) === String(currentUser?.id) ||
         String(p.patientId) === String(currentUser?.patientId) ||
         p.patientId === 'PAT-101'
  ) || recoveryPlans[0];

  const activities = patientPlan?.scheduledActivities || [];
  const completedCount = activities.filter(a => a.completed).length;
  const progressPercent = activities.length > 0
    ? Math.round((completedCount / activities.length) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Primary Header Section */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-success">
              {patientPlan?.status || 'Active Protocol'}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Supervised Clinical Plan
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', color: 'var(--text-primary)', marginBottom: '0.45rem' }}>
            {patientPlan?.title}
          </h1>

          {/* Quiet Secondary Metadata */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            flexWrap: 'wrap',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)'
          }}>
            <span>Supervising Physician: <strong style={{ color: 'var(--text-primary)' }}>{patientPlan?.doctorName}</strong></span>
            <span>•</span>
            <span>Started: <strong style={{ color: 'var(--text-primary)' }}>{patientPlan?.startDate}</strong></span>
            <span>•</span>
            <span>Target Duration: <strong style={{ color: 'var(--text-primary)' }}>{patientPlan?.targetDuration}</strong></span>
          </div>
        </div>

        {/* Compact, Visually Meaningful Daily Progress Indicator */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.15rem',
          minWidth: '220px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Today's Activities
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-primary-accent)' }}>
              {completedCount} of {activities.length} <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 500 }}>({progressPercent}%)</span>
            </span>
          </div>
          <div style={{
            height: 5,
            backgroundColor: 'var(--border-subtle)',
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: 'var(--color-primary-accent)',
              transition: 'width 0.25s ease'
            }} />
          </div>
        </div>
      </div>

      {/* Daily Check-in Quick Action Banner */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderLeft: '4px solid var(--color-primary-accent)',
        borderRadius: 'var(--radius-sm)',
        padding: '1.1rem 1.35rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Daily Recovery Check-in
          </div>
          <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Report your pain score, mobility level, and symptoms today so Dr. Srivalli can monitor your recovery.
          </div>
        </div>
        <Link
          to="/patient/checkins"
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem' }}
        >
          <CalendarCheck size={15} />
          <span>Record Daily Check-in</span>
        </Link>
      </div>

      {/* Doctor's Instructions - Clean, readable section without heavy boxing */}
      <div>
        <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.65rem' }}>
          Doctor's Recovery Guidance
        </h2>
        <div style={{
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border-subtle)',
          borderLeft: '3px solid var(--color-primary-accent)',
          padding: '1.1rem 1.35rem',
          borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
          fontSize: '0.9rem',
          lineHeight: 1.65,
          color: 'var(--text-primary)'
        }}>
          {patientPlan?.instructions}
        </div>
      </div>

      {/* Scheduled Daily Activities - Compact, well-aligned list with restrained indicators */}
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Today's Scheduled Activities
            </h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Select an item to record completion for today
            </p>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden'
        }}>
          {activities.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No scheduled activities configured for today.
            </div>
          ) : (
            activities.map((act, index) => (
              <div
                key={act.id}
                onClick={() => markActivityCompleted(patientPlan.id, act.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.25rem',
                  borderBottom: index < activities.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  backgroundColor: act.completed ? 'var(--bg-app)' : 'var(--bg-surface)',
                  cursor: 'pointer',
                  transition: 'background-color 0.12s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  {/* Custom Minimal Checkbox */}
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: act.completed ? '1.5px solid var(--color-primary-accent)' : '1.5px solid var(--border-medium)',
                    backgroundColor: act.completed ? 'var(--color-primary-accent)' : 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    flexShrink: 0,
                    transition: 'all 0.12s ease'
                  }}>
                    {act.completed && <Check size={13} strokeWidth={2.5} />}
                  </div>

                  <div>
                    {/* Readable, no aggressive strikethrough */}
                    <div style={{
                      fontSize: '0.88rem',
                      fontWeight: 500,
                      color: act.completed ? 'var(--text-secondary)' : 'var(--text-primary)'
                    }}>
                      {act.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {act.category} • {act.time}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', fontWeight: 500, color: act.completed ? 'var(--color-success)' : 'var(--text-muted)' }}>
                  {act.completed ? 'Completed' : 'Pending'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Follow-ups - Compact list */}
      <div>
        <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Upcoming Clinical Follow-ups
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {(patientPlan?.upcomingFollowups || []).map((fup) => (
            <div
              key={fup.id}
              className="care-card"
              style={{ padding: '1rem 1.25rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {fup.purpose}
                </div>
                <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                  {fup.date}
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.35rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={13} color="var(--text-muted)" />
                  {fup.time} with {fup.doctor}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={13} color="var(--text-muted)" />
                  {fup.clinic}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
