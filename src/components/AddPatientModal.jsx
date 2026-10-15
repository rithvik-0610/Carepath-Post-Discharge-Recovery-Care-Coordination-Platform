import React, { useState } from 'react';
import { useCarePath } from '../context/CarePathContext';
import { X, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export default function AddPatientModal({ isOpen, onClose, onCreated }) {
  const { createPatient } = useCarePath();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Password123!');
  const [diagnosis, setDiagnosis] = useState('');
  const [dischargeDate, setDischargeDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName.trim() || !email.trim()) {
      setError('Please provide the patient name and email address.');
      return;
    }

    setLoading(true);

    try {
      const newPatient = await createPatient({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password || 'Password123!',
        diagnosis: diagnosis.trim() || 'Post-Discharge Rehabilitation Protocol',
        discharge_date: dischargeDate,
        notes: notes.trim()
      });

      setSuccess(`Account created for ${newPatient.name}! Email: ${newPatient.email}`);
      if (onCreated) onCreated(newPatient);

      setTimeout(() => {
        setFullName('');
        setEmail('');
        setDiagnosis('');
        setNotes('');
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create patient account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(41, 37, 36, 0.45)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-subtle)',
        width: '100%',
        maxWidth: '520px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-active-nav-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-primary-accent)'
            }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', margin: 0, color: 'var(--text-primary)' }}>
                Register New Patient
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Create a patient account and attach to Dr. Srivalli's care protocol
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {error && (
            <div role="alert" style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#FCE8E6',
              borderRadius: 'var(--radius-sm)',
              color: '#9B2420',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div role="status" style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#EFF6F1',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-success)',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle size={15} />
              <span>{success}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ramesh Kumar"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="ramesh@carepath.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Password</label>
              <input
                type="text"
                className="form-input"
                placeholder="Default: Password123!"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem' }}>Discharge Date</label>
              <input
                type="date"
                className="form-input"
                value={dischargeDate}
                onChange={e => setDischargeDate(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Diagnosis / Procedure</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Total Hip Replacement, Rotator Cuff Repair"
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Clinical Recovery Guidance &amp; Instructions</label>
            <textarea
              className="form-input"
              rows={2}
              placeholder="Doctor's instructions for post-discharge home care..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Action buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Account…' : 'Register & Assign Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
