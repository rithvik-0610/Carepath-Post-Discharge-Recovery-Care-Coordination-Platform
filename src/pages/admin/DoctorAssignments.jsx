import React, { useState } from 'react';
import { useCarePath } from '../../context/CarePathContext';
import { CheckCircle } from 'lucide-react';

export default function DoctorAssignments() {
  const { patients, doctors, assignPatientToDoctor } = useCarePath();

  const [notification, setNotification] = useState('');

  const handleDoctorChange = (patientId, newDoctorId) => {
    const targetDoc = doctors.find(d => d.id === newDoctorId);
    const targetPatient = patients.find(p => p.id === patientId);
    if (!targetDoc || !targetPatient) return;

    assignPatientToDoctor(patientId, newDoctorId);
    setNotification(`Assigned ${targetPatient.name} to ${targetDoc.name}.`);
    setTimeout(() => {
      setNotification('');
    }, 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <h1 style={{ fontSize: '1.65rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Doctor Assignments
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Assign and reassign post-discharge recovery patients to supervising physicians.
        </p>
      </div>

      {notification && (
        <div style={{
          backgroundColor: '#EFF6F1',
          border: '1px solid rgba(71, 120, 92, 0.22)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--color-success)',
          fontSize: '0.84rem'
        }}>
          <CheckCircle size={15} color="var(--color-success)" />
          <span>{notification}</span>
        </div>
      )}

      {/* Doctor Workload Cards */}
      <div>
        <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Physician Roster &amp; Workload
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem'
        }}>
          {doctors.map((doc) => {
            const docAssignedPatients = patients.filter(p => p.assignedDoctorId === doc.id);
            return (
              <div key={doc.id} className="care-card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {doc.name}
                  </span>
                  <span className="badge badge-terracotta" style={{ fontSize: '0.7rem' }}>
                    {docAssignedPatients.length} Active
                  </span>
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  {doc.specialty}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {doc.department}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Patient Assignment Table */}
      <div>
        <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Patient Assignments
        </h2>

        <div className="care-table-container">
          <table className="care-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Diagnosis &amp; Procedure</th>
                <th>Current Supervising Physician</th>
                <th>Reassign Physician</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {patient.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {patient.id} • Discharged {patient.dischargeDate}
                    </div>
                  </td>
                  <td style={{ maxWidth: '280px', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                    {patient.diagnosis}
                  </td>
                  <td>
                    <span className="badge badge-orange" style={{ fontSize: '0.74rem' }}>
                      {patient.assignedDoctorName}
                    </span>
                  </td>
                  <td style={{ minWidth: '220px' }}>
                    <select
                      className="form-select"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem' }}
                      value={patient.assignedDoctorId}
                      onChange={(e) => handleDoctorChange(patient.id, e.target.value)}
                    >
                      {doctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.name} ({doc.department})
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
