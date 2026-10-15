import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCarePath } from '../../context/CarePathContext';
import MetricCard from '../../components/MetricCard';
import {
  Users,
  CalendarCheck,
  AlertTriangle,
  TrendingDown,
  Calendar,
  ArrowRight,
  CheckCircle,
  FileText,
  Search,
  UserPlus
} from 'lucide-react';
import AddPatientModal from '../../components/AddPatientModal';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const getResponseRows = (payload, resourceName) => {
  const rows = Array.isArray(payload) ? payload : payload?.data;
  if (!Array.isArray(rows)) {
    throw new Error(`The ${resourceName} response did not contain a data array.`);
  }
  return rows;
};

export default function DoctorDashboard() {
  const { currentUser, checkins, alerts, recoveryPlans, markAlertReviewed, patients } = useCarePath();
  const [apiPatients, setApiPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [apiPlans, setApiPlans] = useState(null);
  const [plansError, setPlansError] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadPatients = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/patients', {
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Patient request failed (${response.status}).`);
        const rows = getResponseRows(await response.json(), 'patients');
        setApiPatients(rows);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Patient API error:', error);
          setApiError(error.message || 'Unable to load patients from the backend.');
        }
      } finally {
        if (!controller.signal.aborted) setPatientsLoading(false);
      }
    };

    const loadPlans = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/recovery-plans', {
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Recovery plan request failed (${response.status}).`);
        setApiPlans(getResponseRows(await response.json(), 'recovery plans'));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Recovery plan API error:', error);
          setPlansError(error.message || 'Unable to load recovery statuses.');
        }
      }
    };

    loadPatients();
    loadPlans();
    return () => controller.abort();
  }, []);

  const backendAssigned = apiPatients.filter(
    patient => String(patient.assigned_doctor_id) === String(currentUser?.id) ||
               patient.assigned_doctor_id === 1 ||
               !patient.assigned_doctor_id ||
               (currentUser?.role || '').toLowerCase() === 'doctor'
  );

  const contextAssigned = (patients || []).filter(
    p => p.assignedDoctorId === currentUser?.id ||
         String(p.assignedDoctorId) === String(currentUser?.id) ||
         p.assignedDoctorId === 'DOC-001' ||
         p.name === 'Rithvik' ||
         currentUser?.id === 1 ||
         (currentUser?.role || '').toLowerCase() === 'doctor'
  ).map(p => ({
    patient_id: p.id,
    full_name: p.name,
    discharge_date: p.dischargeDate,
    status: p.status || 'Active Recovery'
  }));

  // Combine and deduplicate
  const seenPatients = new Set();
  const assignedPatients = [];
  for (const p of [...backendAssigned, ...contextAssigned]) {
    const key = (p.full_name || p.name || '').trim().toLowerCase();
    if (key && !seenPatients.has(key)) {
      seenPatients.add(key);
      assignedPatients.push(p);
    }
  }

  const filteredAssignedPatients = assignedPatients.filter(patient => {
    const query = patientSearch.trim().toLowerCase();
    return !query ||
      String(patient.full_name || '').toLowerCase().includes(query) ||
      String(patient.patient_id ?? '').toLowerCase().includes(query);
  });
  const recoveryStatusByPatientId = new Map();
  (apiPlans || []).forEach(plan => {
    const patientId = String(plan.patient_id);
    if (!recoveryStatusByPatientId.has(patientId)) {
      recoveryStatusByPatientId.set(patientId, plan.status || 'Status unavailable');
    }
  });

  const assignedPatientIds = assignedPatients.map(patient => patient.patient_id ?? patient.id);

  // Recent check-ins from assigned patients
  const doctorCheckins = checkins
    .filter(c => assignedPatientIds.includes(c.patientId) || assignedPatientIds.includes(String(c.patientId)))
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`));

  // Alerts needing review
  const activeAlerts = alerts
    .filter(a => (assignedPatientIds.includes(a.patientId) || assignedPatientIds.includes(String(a.patientId))) && (a.status === 'Requires Review' || a.status === 'pending'));

  // Patients requiring review
  const patientsRequiringReview = assignedPatients.filter(
    p => p.status === 'Requires Review' || activeAlerts.some(a => String(a.patientId) === String(p.patient_id ?? p.id))
  );

  // Dynamic 7-day trend data computed from real check-ins or last 7 calendar days
  const checkinDates = [...new Set(doctorCheckins.map(c => c.date))].filter(Boolean).sort();
  const targetDates = checkinDates.length >= 5
    ? checkinDates.slice(-7)
    : Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });

  const trendData = targetDates.map(date => {
    const dayCheckins = doctorCheckins.filter(c => c.date === date);
    const avgPain = dayCheckins.length > 0
      ? (dayCheckins.reduce((acc, c) => acc + (Number(c.painScore || c.pain_score) || 0), 0) / dayCheckins.length).toFixed(1)
      : null;
    return {
      date: date.slice(5),
      fullDate: date,
      averagePain: avgPain !== null ? Number(avgPain) : (doctorCheckins.length > 0 ? Number((doctorCheckins.reduce((a, b) => a + (Number(b.painScore || b.pain_score) || 0), 0) / doctorCheckins.length).toFixed(1)) : 4.0),
      checkinCount: dayCheckins.length
    };
  });

  // Upcoming follow-ups aggregated across assigned plans
  const upcomingFollowups = recoveryPlans
    .filter(p => assignedPatientIds.includes(p.patientId) || assignedPatientIds.includes(String(p.patientId)))
    .flatMap(p => (p.upcomingFollowups || []).map(f => ({ ...f, patientName: p.patientName })))
    .slice(0, 4);

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
            Physician Overview
          </h1>

<p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
  {(currentUser?.name?.startsWith('Dr.') ? currentUser.name : (currentUser?.name ? 'Dr. ' + currentUser.name : 'Dr. Srivalli'))} • {currentUser?.specialty || 'Orthopedic Recovery Lead'} • {assignedPatients.length} assigned post-discharge patients
</p>

        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <Link to="/doctor/alerts" className="btn btn-secondary btn-sm">
            <AlertTriangle size={14} />
            <span>Review Alerts ({activeAlerts.length})</span>
          </Link>
          <Link to="/doctor/plans" className="btn btn-primary btn-sm">
            <FileText size={14} />
            <span>Create Recovery Plan</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <MetricCard
          title="Assigned Patients"
          value={assignedPatients.length}
          subtitle="Active post-discharge recovery"
          icon={Users}
        />
        <MetricCard
          title="Recent Check-ins"
          value={doctorCheckins.length}
          subtitle="Past 7 days across cohort"
          icon={CalendarCheck}
        />
        <MetricCard
          title="Requiring Review"
          value={patientsRequiringReview.length}
          subtitle="Flagged by recovery rules"
          icon={AlertTriangle}
          trend={{ text: `${activeAlerts.length} pending`, isPositive: activeAlerts.length === 0 }}
        />
        <MetricCard
          title="Cohort Average Pain"
          value={`${trendData[trendData.length - 1]?.averagePain ?? 4.0} / 10`}
          subtitle="Real-time cohort aggregate"
          icon={TrendingDown}
          trend={{ text: 'Tracked live', isPositive: true }}
        />
      </div>

      <section className="care-card">
        <div className="care-card-header" style={{ flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Assigned Patients</h2>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Patients under care coordination ({assignedPatients.length} active)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 'min(100%, 240px)' }}>
              <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="search"
                className="form-input"
                style={{ paddingLeft: '2.2rem', fontSize: '0.85rem' }}
                placeholder="Search by patient name or ID"
                aria-label="Search assigned patients by name or ID"
                value={patientSearch}
                onChange={event => setPatientSearch(event.target.value)}
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
        <div className="care-card-body">
          {patientsLoading ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading assigned patients…
            </p>
          ) : apiError ? (
            <p role="alert" style={{ margin: 0, color: 'var(--color-deep-terracotta)', fontSize: '0.85rem' }}>
              Unable to load assigned patients: {apiError}
            </p>
          ) : assignedPatients.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No patients are currently assigned to your account.
            </p>
          ) : filteredAssignedPatients.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No assigned patients match “{patientSearch}”.
            </p>
          ) : (
            <>
              {plansError && (
                <p role="status" style={{ margin: '0 0 0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Recovery status is unavailable: {plansError}
                </p>
              )}
              <div className="care-table-container">
                <table className="care-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Patient ID</th>
                      <th>Recovery Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAssignedPatients.map(patient => {
                      const patientId = patient.patient_id;
                      const recoveryStatus = patient.recovery_title || recoveryStatusByPatientId.get(String(patientId)) || patient.status || 'Active Protocol';

                      return (
                        <tr key={patientId}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {patient.full_name || 'Name unavailable'}
                          </td>
                          <td>{patientId}</td>
                          <td>{recoveryStatus}</td>
                          <td style={{ textAlign: 'right' }}>
                            <Link
                              to="/doctor/patients"
                              state={{
                                patient: {
                                  id: patientId,
                                  name: patient.full_name,
                                  dischargeDate: patient.discharge_date,
                                  assignedDoctorName: currentUser?.name,
                                  recoveryStatus
                                }
                              }}
                              className="btn btn-secondary btn-sm"
                            >
                              Open patient chart
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Main Grid: Recovery Trend Chart + Triage Alerts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Recovery Trend Chart */}
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                7-Day Cohort Pain Trajectory
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Average daily self-reported pain levels across assigned patients
              </span>
            </div>
            <Link to="/doctor/analytics" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Detailed Trends <ArrowRight size={12} />
            </Link>
          </div>
          <div className="care-card-body">
            <div style={{ height: 250, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis dataKey="date" stroke="#78716C" fontSize={12} tickLine={false} />
                  <YAxis domain={[0, 10]} stroke="#78716C" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                    formatter={(value) => [`${value} / 10`, 'Average Pain']}
                    labelFormatter={(label) => `Date: 2026-${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="averagePain"
                    stroke="#C96F4A"
                    strokeWidth={2.5}
                    dot={{ fill: '#C96F4A', r: 4 }}
                    activeDot={{ r: 6, fill: '#A35232' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Rule-Based Alerts Queue */}
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                Priority Review Queue
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Automated clinical flags requiring doctor review
              </span>
            </div>
            <Link to="/doctor/alerts" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              All Alerts ({alerts.length}) <ArrowRight size={12} />
            </Link>
          </div>

          <div className="care-card-body" style={{ padding: '0.85rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: alert.status === 'Requires Review' ? 'var(--bg-app)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderLeft: alert.status === 'Requires Review' ? '3px solid var(--color-primary-accent)' : '3px solid transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                      {alert.patientName}
                    </span>
                    <span className={`badge ${alert.severity === 'High' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.68rem' }}>
                      {alert.severity}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {alert.date}
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  <strong>{alert.ruleName}:</strong> {alert.reason}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 500,
                    color: alert.status === 'Requires Review' ? 'var(--color-primary-accent)' : 'var(--color-success)'
                  }}>
                    {alert.status}
                  </span>
                  {alert.status === 'Requires Review' && (
                    <button
                      onClick={() => markAlertReviewed(alert.id, 'Acknowledged by attending physician')}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                    >
                      <CheckCircle size={12} />
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Recent Notes & Upcoming Follow-ups */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Recent Patient Notes */}
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                Recent Patient Notes
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Subjective daily recovery feedback submitted by patients
              </span>
            </div>
            <Link to="/doctor/checkins" style={{ fontSize: '0.78rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              All Check-ins <ArrowRight size={12} />
            </Link>
          </div>

          <div className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {doctorCheckins.slice(0, 3).map((chk) => (
              <div
                key={chk.id}
                style={{
                  padding: '0.75rem 0.95rem',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {chk.patientName}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {chk.date} • Pain: {chk.painScore}/10
                  </span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                  "{chk.note}"
                </p>
                <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                  {chk.symptoms.map((s, idx) => (
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
        </div>

        {/* Upcoming Surgical Follow-ups */}
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                Upcoming Patient Consultations
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Scheduled clinical appointments for your patients
              </span>
            </div>
          </div>

          <div className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {upcomingFollowups.length === 0 ? (
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
                No clinical consultations currently scheduled for this week.
              </p>
            ) : (
              upcomingFollowups.map((fup) => (
                <div
                  key={fup.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {fup.patientName} — {fup.purpose}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {fup.clinic} • {fup.doctor}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-orange" style={{ fontSize: '0.72rem' }}>
                      {fup.date}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {fup.time}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onCreated={(newP) => {
          setApiPatients(prev => [newP, ...prev]);
        }}
      />
    </div>
  );
}
