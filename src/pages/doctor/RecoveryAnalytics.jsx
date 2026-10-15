import React, { useState } from 'react';
import { useCarePath } from '../../context/CarePathContext';
import MetricCard from '../../components/MetricCard';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function DoctorRecoveryAnalytics() {
  const { patients, checkins, recoveryPlans } = useCarePath();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || 'PAT-101');

  const selectedPatient = patients.find(p => p.id === selectedPatientId || String(p.id) === String(selectedPatientId)) || patients[0];
  const patientPlan = recoveryPlans.find(p => p.patientId === selectedPatientId || String(p.patientId) === String(selectedPatientId));

  // Filter checkins for selected patient
  const patientCheckins = checkins
    .filter(c => c.patientId === selectedPatientId || String(c.patientId) === String(selectedPatientId))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const totalCheckins = patientCheckins.length;
  const avgPainScore = totalCheckins > 0
    ? (patientCheckins.reduce((sum, c) => sum + c.painScore, 0) / totalCheckins).toFixed(1)
    : 'N/A';

  const initialPain = patientCheckins.length > 0 ? patientCheckins[0].painScore : 0;
  const latestPain = patientCheckins.length > 0 ? patientCheckins[patientCheckins.length - 1].painScore : 0;
  const painDelta = latestPain - initialPain;

  const checkinAdherenceRate = Math.min(100, Math.round((totalCheckins / 7) * 100));

  const lineChartData = patientCheckins.map(c => ({
    date: c.date.slice(5),
    fullDate: c.date,
    painScore: c.painScore,
    mobility: c.mobility,
    sleep: c.sleepQuality
  }));

  const symptomCounts = {};
  patientCheckins.forEach(c => {
    (c.symptoms || []).forEach(s => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });

  const symptomChartData = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

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
            Recovery Analytics &amp; Trends
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Evaluate patient pain trends, recorded symptom distributions, and longitudinal journal timelines.
          </p>
        </div>

        {/* Patient Selection Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Patient:
          </span>
          <select
            className="form-select"
            style={{ width: '240px', fontSize: '0.84rem' }}
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Patient Profile Bar */}
      <div style={{
        backgroundColor: 'var(--bg-app)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '1rem 1.35rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {selectedPatient?.name}
            </span>
            <span className="badge badge-terracotta" style={{ fontSize: '0.7rem' }}>
              {selectedPatient?.status}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            {selectedPatient?.diagnosis} • Discharged: {selectedPatient?.dischargeDate}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>WINDOW</span>
            <strong>Past 7 Days (Oct 4 - Oct 10)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem' }}>CHECK-INS</span>
            <strong>{totalCheckins} Submitted</strong>
          </div>
        </div>
      </div>

      {/* Calculated KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <MetricCard
          title="Average Pain Score"
          value={`${avgPainScore} / 10`}
          subtitle="Computed across 7-day window"
        />
        <MetricCard
          title="Pain Trajectory Change"
          value={painDelta > 0 ? `+${painDelta}` : `${painDelta}`}
          subtitle={`${initialPain} on Day 1 → ${latestPain} Today`}
          trend={{ text: painDelta <= 0 ? 'Improving' : 'Elevated', isPositive: painDelta <= 0 }}
        />
        <MetricCard
          title="Check-in Adherence"
          value={`${checkinAdherenceRate}%`}
          subtitle={`${totalCheckins} of 7 expected days logged`}
        />
        <MetricCard
          title="Supervised Plan"
          value={patientPlan?.targetDuration || '4 Weeks'}
          subtitle={patientPlan?.title?.slice(0, 26) + '...' || 'Recovery Plan'}
        />
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Pain Trajectory */}
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                Pain Score Trajectory
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Daily self-reported pain levels for {selectedPatient?.name}
              </span>
            </div>
          </div>
          <div className="care-card-body">
            <div style={{ height: 240, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
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
                    formatter={(val) => [`${val} / 10`, 'Pain Score']}
                  />
                  <Line
                    type="monotone"
                    dataKey="painScore"
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

        {/* Symptom Frequency */}
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                Reported Symptom Frequency
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Occurrences of specific symptoms during the 7-day period
              </span>
            </div>
          </div>
          <div className="care-card-body">
            <div style={{ height: 240, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomChartData} margin={{ top: 10, right: 15, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis dataKey="name" stroke="#78716C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716C" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                    formatter={(val) => [`${val} occurrences`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#C96F4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Chronological Timeline */}
      <div className="care-card">
        <div className="care-card-header">
          <div>
            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Check-in Timeline &amp; Notes
            </h2>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Chronological log of check-in entries and patient notes
            </span>
          </div>
        </div>

        <div className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {patientCheckins.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No check-in entries found for this patient.</p>
          ) : (
            [...patientCheckins].reverse().map((chk, idx) => (
              <div
                key={chk.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-active-nav-bg)',
                    border: '1.5px solid var(--color-primary-accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-accent)'
                  }}>
                    {chk.painScore}
                  </div>
                  {idx !== patientCheckins.length - 1 && (
                    <div style={{ width: 1.5, flex: 1, backgroundColor: 'var(--border-subtle)', marginTop: '4px' }} />
                  )}
                </div>

                <div style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '0.35rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {chk.date}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        at {chk.time || '18:00'}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-primary-accent)', fontWeight: 600 }}>
                      Pain {chk.painScore}/10
                    </span>
                  </div>

                  <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0.25rem 0' }}>
                    "{chk.note}"
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.35rem' }}>
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                      {chk.symptoms.map((s, i) => (
                        <span key={i} style={{
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
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Mobility: {chk.mobility} • Sleep: {chk.sleepQuality}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
