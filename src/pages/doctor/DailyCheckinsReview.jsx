import React, { useState } from 'react';
import { useCarePath } from '../../context/CarePathContext';
import {
  CalendarCheck,
  CheckCircle,
  Search
} from 'lucide-react';

export default function DailyCheckinsReview() {
  const { currentUser, checkins, patients, markCheckinReviewed } = useCarePath();

  const [patientFilter, setPatientFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNREVIEWED' | 'REVIEWED'
  const [searchQuery, setSearchQuery] = useState('');

  // Assigned patients for current doctor
  const assignedPatients = patients.filter(
    p => p.assignedDoctorId === currentUser?.id ||
         String(p.assignedDoctorId) === String(currentUser?.id) ||
         currentUser?.id === 'DOC-001' ||
         currentUser?.id === 1 ||
         (currentUser?.role || '').toLowerCase() === 'doctor'
  );
  const assignedPatientIds = assignedPatients.map(p => p.id);

  const filteredCheckins = checkins
    .filter(c => assignedPatientIds.includes(c.patientId))
    .filter(c => (patientFilter === 'ALL' ? true : c.patientId === patientFilter))
    .filter(c => {
      if (statusFilter === 'UNREVIEWED') return !c.reviewed;
      if (statusFilter === 'REVIEWED') return c.reviewed;
      return true;
    })
    .filter(c =>
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`));

  const unreviewedCount = checkins.filter(
    c => assignedPatientIds.includes(c.patientId) && !c.reviewed
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
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
            Daily Patient Check-ins
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Review daily reported symptoms, pain scores, mobility levels, and personal notes across your recovery cohort.
          </p>
        </div>

        {unreviewedCount > 0 && (
          <span className="badge badge-warning" style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}>
            {unreviewedCount} Awaiting Review
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.85rem',
        alignItems: 'center'
      }}>
        <div>
          <label className="form-label" style={{ fontSize: '0.74rem' }}>Filter by Patient</label>
          <select
            className="form-select"
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
          >
            <option value="ALL">All Assigned Patients ({assignedPatients.length})</option>
            {assignedPatients.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.74rem' }}>Review Status</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Check-ins</option>
            <option value="UNREVIEWED">Unreviewed Only</option>
            <option value="REVIEWED">Reviewed Only</option>
          </select>
        </div>

        <div>
          <label className="form-label" style={{ fontSize: '0.74rem' }}>Search Notes &amp; Symptoms</label>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2rem' }}
              placeholder="e.g. swelling, walking, pain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Check-ins Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredCheckins.length === 0 ? (
          <div className="care-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No check-in entries match the selected filters.
          </div>
        ) : (
          filteredCheckins.map((entry) => (
            <div
              key={entry.id}
              className="care-card"
              style={{
                borderLeft: entry.painScore >= 7
                  ? '3px solid var(--color-primary-accent)'
                  : entry.reviewed
                    ? '3px solid var(--color-success)'
                    : '3px solid var(--border-subtle)'
              }}
            >
              <div className="care-card-header" style={{ padding: '0.9rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {entry.patientName}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        ({entry.patientId})
                      </span>
                      <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--color-primary-accent)' }}>
                        Pain {entry.painScore}/10
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Logged {entry.date} at {entry.time || '18:00'}
                    </span>
                  </div>
                </div>

                <div>
                  {entry.reviewed ? (
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <CheckCircle size={13} /> Reviewed
                    </span>
                  ) : (
                    <button
                      onClick={() => markCheckinReviewed(entry.id)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '0.25rem 0.65rem', fontSize: '0.74rem' }}
                    >
                      <CheckCircle size={13} /> Mark Reviewed
                    </button>
                  )}
                </div>
              </div>

              <div className="care-card-body" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {entry.note && (
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-primary)',
                    fontStyle: 'italic',
                    margin: 0
                  }}>
                    "{entry.note}"
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  paddingTop: '0.35rem',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {entry.symptoms.map((symptom, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.1rem 0.45rem',
                          borderRadius: 'var(--radius-pill)',
                          backgroundColor: 'var(--color-active-nav-bg)',
                          color: 'var(--text-primary)'
                        }}
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Mobility: <strong style={{ color: 'var(--text-secondary)' }}>{entry.mobility}</strong> • Sleep: <strong style={{ color: 'var(--text-secondary)' }}>{entry.sleepQuality}</strong>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
