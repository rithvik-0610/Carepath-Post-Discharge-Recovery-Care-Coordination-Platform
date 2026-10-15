import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCarePath } from '../../context/CarePathContext';
import {
  Search,
  FileText,
  Activity,
  AlertTriangle,
  X,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import AddPatientModal from '../../components/AddPatientModal';

export default function PatientManagement() {
  const { currentUser, patients, checkins, recoveryPlans, alerts } = useCarePath();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(() => location.state?.patient || null);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  // Filter assigned patients for Dr. Srivalli (DOC-001) or current doctor
  const assignedPatients = patients.filter(
    p => p.assignedDoctorId === currentUser?.id ||
         String(p.assignedDoctorId) === String(currentUser?.id) ||
         currentUser?.id === 'DOC-001' ||
         currentUser?.id === 1 ||
         (currentUser?.role || '').toLowerCase() === 'doctor'
  );

  const filteredPatients = assignedPatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPatientHistory = (patientId) => {
    return checkins
      .filter(c => c.patientId === patientId || String(c.patientId) === String(patientId))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getPatientPlan = (patientId) => {
    return recoveryPlans.find(p => p.patientId === patientId || String(p.patientId) === String(patientId));
  };

  const getPatientAlerts = (patientId) => {
    return alerts.filter(a => a.patientId === patientId || String(a.patientId) === String(patientId));
  };

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
            Patient Management
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Supervise assigned recovery patients, monitor reported symptoms, and review clinical check-in histories.
          </p>
        </div>

        {/* Actions: Search & Add Patient */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
              placeholder="Search by name, ID, or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setIsAddPatientOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}
          >
            <UserPlus size={14} />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Patient Table */}
      <div className="care-table-container">
        <table className="care-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Diagnosis &amp; Procedure</th>
              <th>Discharge Date</th>
              <th>Latest Pain</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No patients found matching "{searchQuery}".
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => {
                const history = getPatientHistory(patient.id);
                const latestCheckin = history[0];
                const patientAlerts = getPatientAlerts(patient.id);
                const hasActiveAlert = patientAlerts.some(a => a.status === 'Requires Review');

                return (
                  <tr key={patient.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {patient.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {patient.id} • {patient.age} yrs • {patient.gender}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: 280, color: 'var(--text-primary)' }}>
                        {patient.diagnosis}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {patient.roomBed}
                      </div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.84rem' }}>
                      {patient.dischargeDate}
                    </td>
                    <td>
                      {latestCheckin ? (
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                          <span style={{
                            fontWeight: 700,
                            color: latestCheckin.painScore >= 7 ? 'var(--color-deep-terracotta)' : 'var(--color-terracotta)',
                            fontSize: '0.9rem'
                          }}>
                            {latestCheckin.painScore}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>/ 10</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            ({latestCheckin.date.slice(5)})
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No entries</span>
                      )}
                    </td>
                    <td>
                      {hasActiveAlert ? (
                        <span className="badge badge-danger">
                          <AlertTriangle size={11} /> Requires Review
                        </span>
                      ) : (
                        <span className="badge badge-success">
                          <CheckCircle size={11} /> Active Recovery
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        onClick={() => setSelectedPatient(patient)}
                        className="btn btn-secondary btn-sm"
                      >
                        Patient Chart
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Patient Details & Recovery History Modal */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '720px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="care-card-header" style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface)', zIndex: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h2 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
                    {selectedPatient.name}
                  </h2>
                  <span className="badge badge-terracotta" style={{ fontSize: '0.7rem' }}>
                    {selectedPatient.id}
                  </span>
                  {selectedPatient.recoveryStatus && (
                    <span className="badge badge-orange" style={{ fontSize: '0.7rem' }}>
                      {selectedPatient.recoveryStatus}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Discharged: {selectedPatient.dischargeDate || 'Not available'} • Physician: {selectedPatient.assignedDoctorName || 'Not available'}
                </span>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* Core Information Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>DIAGNOSIS</span>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {selectedPatient.diagnosis || 'Not available'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>CONTACT</span>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                    {selectedPatient.phone || 'Not available'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {selectedPatient.emergencyContact || 'Not available'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>RECOVERY PLAN / STATUS</span>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--color-primary-accent)', marginTop: '0.15rem' }}>
                    {getPatientPlan(selectedPatient.id)?.title || selectedPatient.recoveryStatus || 'Standard Protocol'}
                  </div>
                </div>
              </div>

              {/* Recovery History Check-in Logs */}
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <h3 style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                    Check-in History ({getPatientHistory(selectedPatient.id).length})
                  </h3>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Chronological entries
                  </span>
                </div>

                {getPatientHistory(selectedPatient.id).length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No check-in entries submitted yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '300px', overflowY: 'auto' }}>
                    {getPatientHistory(selectedPatient.id).map((entry) => (
                      <div
                        key={entry.id}
                        style={{
                          padding: '0.75rem 0.95rem',
                          backgroundColor: 'var(--bg-app)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          borderLeft: entry.painScore >= 7 ? '3px solid var(--color-primary-accent)' : '3px solid transparent'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <span style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
                              {entry.date} ({entry.time || '18:00'})
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-accent)' }}>
                              Pain: {entry.painScore}/10
                            </span>
                          </div>

                          <span style={{ fontSize: '0.72rem', color: entry.reviewed ? 'var(--color-success)' : 'var(--text-muted)' }}>
                            {entry.reviewed ? `Reviewed by ${entry.reviewedBy}` : 'Pending review'}
                          </span>
                        </div>

                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0.2rem 0' }}>
                          "{entry.note}"
                        </p>

                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                          {entry.symptoms.map((s, idx) => (
                            <span key={idx} style={{
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.45rem',
                              borderRadius: 'var(--radius-pill)',
                              backgroundColor: 'var(--color-active-nav-bg)',
                              color: 'var(--text-primary)'
                            }}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal footer quick buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.65rem',
                borderTop: '1px solid var(--border-subtle)',
                paddingTop: '0.85rem'
              }}>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    navigate('/doctor/plans');
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <FileText size={13} /> View Plan
                </button>
                <button
                  onClick={() => {
                    setSelectedPatient(null);
                    navigate('/doctor/analytics');
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Activity size={13} /> Open Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
      />
    </div>
  );
}
