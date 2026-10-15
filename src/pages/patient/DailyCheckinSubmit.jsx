import React, { useState } from 'react';
import { useCarePath } from '../../context/CarePathContext';
import { symptomOptions, mobilityOptions, sleepQualityOptions } from '../../data/mockData';
import {
  Send,
  CheckCircle,
  Plus,
  Check
} from 'lucide-react';

export default function DailyCheckinSubmit() {
  const { currentUser, checkins, submitCheckin } = useCarePath();

  const patientId = (currentUser?.role || '').toLowerCase() === 'patient'
    ? (currentUser?.patient_id || currentUser?.id || 1)
    : 'PAT-101';
  const patientName = currentUser?.name || 'Patient';

  // Form State
  const [painScore, setPainScore] = useState(4);
  const [sleepQuality, setSleepQuality] = useState(sleepQualityOptions[1] || 'Fair');
  const [mobility, setMobility] = useState(mobilityOptions[1] || 'Walking with assistance');
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [note, setNote] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Patient's history (including demonstration records)
  const patientHistory = checkins
    .filter(c =>
      String(c.patientId) === String(patientId) ||
      String(c.patientId) === String(currentUser?.patient_id) ||
      String(c.patientId) === String(currentUser?.id)
    )
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`));

  const toggleSymptom = (sym) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(prev => prev.filter(s => s !== sym));
    } else {
      setSelectedSymptoms(prev => [...prev, sym]);
    }
  };

  const handleAddCustomSymptom = (e) => {
    e.preventDefault();
    if (!customSymptom.trim()) return;
    if (!selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms(prev => [...prev, customSymptom.trim()]);
    }
    setCustomSymptom('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitCheckin({
        patientId,
        painScore: Number(painScore),
        sleepQuality,
        mobility,
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : ['Normal healing sensation'],
        note: note.trim()
      });

      setSubmissionSuccess(true);
      setNote('');
      setSelectedSymptoms([]);
      setTimeout(() => {
        setSubmissionSuccess(false);
      }, 4000);
    } catch (err) {
      console.error('Checkin submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPainDescriptor = (val) => {
    if (val === 0) return 'No Pain';
    if (val <= 3) return 'Mild Discomfort';
    if (val <= 6) return 'Moderate Pain';
    if (val <= 8) return 'Elevated Pain';
    return 'Severe Pain';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.65rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
          Daily Check-in
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Record your symptoms, comfort levels, and daily notes for your doctor to review.
        </p>
      </div>

      {submissionSuccess && (
        <div style={{
          backgroundColor: '#EFF6F1',
          border: '1px solid rgba(71, 120, 92, 0.22)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.85rem 1.15rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          color: 'var(--color-success)',
          fontSize: '0.85rem'
        }}>
          <CheckCircle size={17} color="var(--color-success)" />
          <span>Check-in recorded successfully and shared with your attending care team.</span>
        </div>
      )}

      {/* Grid: Form + History */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '1.75rem',
        alignItems: 'start'
      }}>
        {/* Form Card */}
        <div className="care-card">
          <div className="care-card-header">
            <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
              Today's Entry
            </h2>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {new Date().toISOString().split('T')[0]}
            </span>
          </div>

          <div className="care-card-body">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
              {/* Pain Score Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Pain Score
                  </label>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-primary-accent)' }}>
                    {painScore} / 10 — {getPainDescriptor(painScore)}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  value={painScore}
                  onChange={(e) => setPainScore(Number(e.target.value))}
                  style={{
                    width: '100%',
                    accentColor: 'var(--color-primary-accent)',
                    cursor: 'pointer'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  <span>0 (None)</span>
                  <span>5 (Moderate)</span>
                  <span>10 (Severe)</span>
                </div>
              </div>

              {/* Mobility Level */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Functional Mobility
                </label>
                <select
                  className="form-select"
                  value={mobility}
                  onChange={(e) => setMobility(e.target.value)}
                >
                  {mobilityOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Sleep Quality */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Sleep Quality
                </label>
                <select
                  className="form-select"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value)}
                >
                  {sleepQualityOptions.map((opt, idx) => (
                    <option key={idx} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Symptoms Selection */}
              <div>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                  Observed Symptoms
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.65rem' }}>
                  {symptomOptions.slice(0, 9).map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => toggleSymptom(sym)}
                        style={{
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-pill)',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          backgroundColor: isSelected ? 'var(--color-primary-accent)' : 'var(--bg-app)',
                          color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                          border: isSelected ? '1px solid var(--color-primary-accent)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        {isSelected && <Check size={11} style={{ marginRight: 4, verticalAlign: -1 }} />}
                        {sym}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Add other symptom..."
                    value={customSymptom}
                    onChange={(e) => setCustomSymptom(e.target.value)}
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomSymptom}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} />
                    Add
                  </button>
                </div>
              </div>

              {/* Personal Recovery Note */}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">
                  Personal Recovery Note
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe your progress today, comfort during physical therapy, medication changes, or specific questions for your doctor..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ padding: '0.65rem', marginTop: '0.25rem', opacity: isSubmitting ? 0.7 : 1 }}
              >
                <Send size={14} />
                <span>{isSubmitting ? 'Recording Check-in…' : 'Submit Daily Check-in'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* History Feed */}
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Previous Check-ins
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {patientHistory.length} total entries recorded
              </span>
            </div>
          </div>

          <div className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxHeight: '620px', overflowY: 'auto' }}>
            {patientHistory.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No prior records found.
              </div>
            ) : (
              patientHistory.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-app)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: item.painScore >= 7 ? '3px solid var(--color-primary-accent)' : '3px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {item.date}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-accent)' }}>
                        Pain {item.painScore}/10
                      </span>
                    </div>

                    <span style={{ fontSize: '0.72rem', color: item.reviewed ? 'var(--color-success)' : 'var(--text-muted)' }}>
                      {item.reviewed ? `Reviewed` : 'Pending review'}
                    </span>
                  </div>

                  {item.note && (
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: '0.3rem 0' }}>
                      "{item.note}"
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                    {item.symptoms.map((s, i) => (
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
