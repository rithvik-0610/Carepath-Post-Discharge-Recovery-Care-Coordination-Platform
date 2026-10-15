import React, { useState } from 'react';
import { useCarePath } from '../../context/CarePathContext';
import MetricCard from '../../components/MetricCard';
import {
  FileText,
  Calendar,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Activity,
  HeartPulse,
  Info
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function RecoveryAnalyticsTimeline() {
  const { currentUser, checkins, recoveryPlans } = useCarePath();

  const patientId = currentUser?.id && (currentUser?.role || '').toLowerCase() === 'patient'
    ? currentUser.id
    : 'PAT-101';
  const patientPlan = recoveryPlans.find(
    p => p.patientId === patientId ||
         p.patientId === currentUser?.patientId ||
         String(p.patientId) === String(currentUser?.id) ||
         String(p.patientId) === String(currentUser?.patientId) ||
         p.patientId === 'PAT-101'
  ) || recoveryPlans[0];

  const [selectedPeriod, setSelectedPeriod] = useState('Current 7-Day Window (Oct 4 - Oct 10)');
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);

  // Filter checkins for current patient (including demonstration cohort)
  const patientCheckins = checkins
    .filter(c =>
      c.patientId === patientId ||
      String(c.patientId) === String(currentUser?.id) ||
      String(c.patientId) === String(currentUser?.patientId) ||
      (c.patientId === 'PAT-101' && (patientId === 2 || patientId === 1 || patientId === 'PAT-101'))
    )
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Dynamic calculations from demonstration records
  const totalSubmissions = patientCheckins.length;
  const expectedCheckins = 7;
  const completionRate = Math.min(100, Math.round((totalSubmissions / expectedCheckins) * 100));

  const avgPain = totalSubmissions > 0
    ? (patientCheckins.reduce((acc, c) => acc + c.painScore, 0) / totalSubmissions).toFixed(1)
    : '0.0';

  const initialPain = totalSubmissions > 0 ? patientCheckins[0].painScore : 0;
  const latestPain = totalSubmissions > 0 ? patientCheckins[totalSubmissions - 1].painScore : 0;
  const painDelta = latestPain - initialPain;

  // Chart 1: Pain Score Line Data
  const lineChartData = patientCheckins.map(c => ({
    date: c.date.slice(5),
    fullDate: c.date,
    painScore: c.painScore,
    mobility: c.mobility
  }));

  // Chart 2: Recovery Activity Completion Distribution
  const scheduledActs = patientPlan?.scheduledActivities || [];
  const completedActsCount = scheduledActs.filter(a => a.completed).length;
  const pendingActsCount = Math.max(0, scheduledActs.length - completedActsCount);

  const pieData = [
    { name: 'Completed Activities', value: completedActsCount, color: '#C96F4A' },
    { name: 'Pending Activities', value: pendingActsCount, color: '#E7E5E4' }
  ];

  // Chart 3: Recorded Symptom Frequency
  const symptomCounts = {};
  patientCheckins.forEach(c => {
    (c.symptoms || []).forEach(s => {
      symptomCounts[s] = (symptomCounts[s] || 0) + 1;
    });
  });

  const symptomBarData = Object.entries(symptomCounts)
    .map(([symptom, frequency]) => ({ symptom, frequency }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 5);

  const getConciseProgressSummary = () => {
    let trendDesc = 'remained stable';
    if (painDelta < 0) {
      trendDesc = `improved steadily, decreasing from ${initialPain}/10 down to ${latestPain}/10`;
    } else if (painDelta > 0) {
      trendDesc = `increased from ${initialPain}/10 to ${latestPain}/10`;
    }

    return `Across the selected 7-day reporting period, you submitted ${totalSubmissions} of ${expectedCheckins} scheduled daily check-ins (${completionRate}% adherence). Your reported pain score ${trendDesc}, averaging ${avgPain} out of 10. Daily recovery activities are currently at ${completedActsCount} of ${scheduledActs.length} completed for today. Continue observing prescribed rest, ice elevation, and scheduled quad exercises.`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header & Controls */}
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
            Recovery Analytics &amp; Timeline
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Review your pain trajectory, activity adherence, and generate structured 7-day recovery reports.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <select
            className="form-select"
            style={{ width: '270px', fontSize: '0.82rem' }}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="Current 7-Day Window (Oct 4 - Oct 10)">Current 7-Day Window (Oct 4 - Oct 10)</option>
            <option value="Initial Post-Discharge Week">Initial Post-Discharge Week</option>
          </select>

          {/* Prominent Generate Weekly Summary button */}
          <button
            onClick={() => setShowWeeklySummary(!showWeeklySummary)}
            className="btn btn-primary"
          >
            <Sparkles size={14} />
            <span>{showWeeklySummary ? 'Hide Summary Report' : 'Generate Weekly Summary'}</span>
          </button>
        </div>
      </div>

      {/* Generated Weekly Summary - Clean Clinical Document Layout */}
      {showWeeklySummary && (
        <div className="care-card" style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-subtle)'
        }}>
          <div className="care-card-header" style={{ backgroundColor: 'var(--bg-app)' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                7-Day Recovery Progress Summary
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Period: {selectedPeriod} • Patient: {currentUser?.name || 'Sarah Jenkins'}
              </span>
            </div>
            <span className="badge badge-success">
              Report Generated
            </span>
          </div>

          <div className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{
              fontSize: '0.92rem',
              color: 'var(--text-primary)',
              lineHeight: 1.65,
              margin: 0
            }}>
              {getConciseProgressSummary()}
            </p>

            {/* Structured Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>AVERAGE PAIN</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                  {avgPain} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 10</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>CHECK-IN ADHERENCE</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary-accent)', marginTop: '0.1rem' }}>
                  {completionRate}%
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVITIES COMPLETED</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-success)', marginTop: '0.1rem' }}>
                  {completedActsCount} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>of {scheduledActs.length}</span>
                </div>
              </div>
            </div>

            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <Info size={13} />
              <span>Summary compiled from patient check-in logs. Intended for care coordination, not clinical diagnosis.</span>
            </div>
          </div>
        </div>
      )}

      {/* KPI Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem'
      }}>
        <MetricCard
          title="Average Pain Score"
          value={`${avgPain} / 10`}
          subtitle="Computed across 7-day period"
          trend={{ text: painDelta <= 0 ? 'Improving' : 'Elevated', isPositive: painDelta <= 0 }}
        />
        <MetricCard
          title="Check-in Completion"
          value={`${completionRate}%`}
          subtitle={`${totalSubmissions} of ${expectedCheckins} days recorded`}
          trend={{ text: `${totalSubmissions} entries`, isPositive: true }}
        />
        <MetricCard
          title="Pain Score Progression"
          value={painDelta > 0 ? `+${painDelta}` : `${painDelta}`}
          subtitle={`${initialPain} on Day 1 → ${latestPain} Today`}
        />
        <MetricCard
          title="Today's Activities"
          value={`${completedActsCount} / ${scheduledActs.length}`}
          subtitle="Prescribed physical exercises"
        />
      </div>

      {/* Recharts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Chart 1: Pain Score Line Chart */}
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                Pain Score Progression
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Daily self-reported pain levels (0 to 10)
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
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      fontSize: '0.8rem'
                    }}
                    formatter={(val) => [`${val} / 10`, 'Pain']}
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

        {/* Chart 2: Activity Completion Doughnut Chart */}
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                Activity Completion Distribution
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Today's scheduled recovery exercises
              </span>
            </div>
          </div>
          <div className="care-card-body">
            <div style={{ height: 240, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                    formatter={(val, name) => [`${val} activities`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '0.78rem', paddingTop: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Chart 3: Recorded Symptom Frequency Bar Chart */}
        <div className="care-card" style={{ gridColumn: '1 / -1' }}>
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                Recorded Symptom Frequency
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Most common symptoms reported across the 7-day period
              </span>
            </div>
          </div>
          <div className="care-card-body">
            <div style={{ height: 240, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={symptomBarData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E7E5E4" vertical={false} />
                  <XAxis dataKey="symptom" stroke="#78716C" fontSize={11} tickLine={false} />
                  <YAxis stroke="#78716C" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E7E5E4',
                      borderRadius: '6px',
                      fontSize: '0.8rem'
                    }}
                    formatter={(val) => [`${val} entries`, 'Frequency']}
                  />
                  <Bar dataKey="frequency" fill="#C96F4A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline of Check-ins & Personal Notes */}
      <div className="care-card">
        <div className="care-card-header">
          <div>
            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Recovery Timeline &amp; Notes
            </h2>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Chronological log of check-in entries and personal notes
            </span>
          </div>
        </div>

        <div className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {[...patientCheckins].reverse().map((chk, idx) => (
            <div
              key={chk.id}
              style={{
                display: 'flex',
                gap: '1rem',
                position: 'relative'
              }}
            >
              {/* Timeline marker */}
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

              {/* Content */}
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
                      {chk.time || '18:00'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: chk.reviewed ? 'var(--color-success)' : 'var(--text-muted)' }}>
                    {chk.reviewed ? `Reviewed` : 'Pending review'}
                  </span>
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0.25rem 0' }}>
                  "{chk.note}"
                </p>

                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
