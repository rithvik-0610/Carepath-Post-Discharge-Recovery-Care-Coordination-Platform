import React from 'react';
import { useCarePath } from '../../context/CarePathContext';
import {
  Calendar,
  Clock,
  MapPin,
  FileCheck
} from 'lucide-react';

export default function UpcomingFollowups() {
  const { currentUser, recoveryPlans, doctors } = useCarePath();

  const patientId = currentUser?.id && (currentUser?.role || '').toLowerCase() === 'patient'
    ? currentUser.id
    : 'PAT-101';
  const plan = recoveryPlans.find(
    p => p.patientId === patientId ||
         p.patientId === currentUser?.patientId ||
         String(p.patientId) === String(currentUser?.id) ||
         String(p.patientId) === String(currentUser?.patientId) ||
         p.patientId === 'PAT-101'
  ) || recoveryPlans[0];
  const assignedDoctor = doctors.find(d => d.id === plan?.doctorId) || doctors[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Follow-up Consultations
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Scheduled clinical appointments, physical therapy reviews, and care contacts.
        </p>
      </div>

      {/* Appointments List */}
      <div>
        <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Scheduled Appointments
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {(plan?.upcomingFollowups || []).map((fup) => (
            <div key={fup.id} className="care-card">
              <div className="care-card-header">
                <div>
                  <h3 style={{ fontSize: '0.98rem', color: 'var(--text-primary)' }}>
                    {fup.purpose}
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    With {fup.doctor}
                  </span>
                </div>

                <span className="badge badge-orange" style={{ fontSize: '0.75rem' }}>
                  {fup.date} at {fup.time}
                </span>
              </div>

              <div className="care-card-body" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1rem',
                fontSize: '0.84rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={15} color="var(--color-primary-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>LOCATION</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{fup.clinic}</span>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.74rem' }}>Post-Discharge Surgical Center</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <FileCheck size={15} color="var(--color-primary-accent)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>INSTRUCTIONS</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Bring mobility support. Have your past 7 days of recovery check-in logs ready for review.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Care Coordination Team */}
      <div className="care-card">
        <div className="care-card-header">
          <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            Care Coordination Team
          </h2>
        </div>

        <div className="care-card-body" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem'
        }}>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>ATTENDING SURGEON</span>
            <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              {assignedDoctor.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              {assignedDoctor.specialty}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-accent)', marginTop: '0.35rem', fontWeight: 500 }}>
              {assignedDoctor.phone}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>POST-DISCHARGE CLINICAL NURSE LINE</span>
            <div style={{ fontSize: '0.98rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
              CarePath Clinical Desk
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Available Monday – Friday, 8:00 AM – 6:00 PM
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-primary-accent)', marginTop: '0.35rem', fontWeight: 500 }}>
              +1 (555) 999-CARE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
