import React, { useState } from 'react';
import { useCarePath } from '../../context/CarePathContext';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function RuleBasedAlerts() {
  const { alerts, alertRules, markAlertReviewed } = useCarePath();

  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Requires Review' | 'Reviewed'
  const [severityFilter, setSeverityFilter] = useState('ALL'); // 'ALL' | 'High' | 'Medium'
  const [showRulesInfo, setShowRulesInfo] = useState(false);
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [selectedAlertForReview, setSelectedAlertForReview] = useState(null);

  const filteredAlerts = alerts
    .filter(a => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'Requires Review') return a.status === 'Requires Review' || a.status === 'pending';
      if (statusFilter === 'Reviewed') return a.status === 'Reviewed' || a.status === 'reviewed';
      return a.status === statusFilter;
    })
    .filter(a => (severityFilter === 'ALL' ? true : a.severity?.toLowerCase() === severityFilter.toLowerCase()))
    .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at));

  const pendingAlertCount = alerts.filter(a => a.status === 'Requires Review' || a.status === 'pending').length;

  const handleConfirmReview = (e) => {
    e.preventDefault();
    if (!selectedAlertForReview) return;
    markAlertReviewed(selectedAlertForReview.id, reviewNoteInput.trim() || 'Reviewed and acknowledged by attending physician.');
    setSelectedAlertForReview(null);
    setReviewNoteInput('');
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
            Clinical Alerts
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Automated check-in review flags based on predefined recovery thresholds. Intended to prioritize clinical follow-up.
          </p>
        </div>

        {pendingAlertCount > 0 && (
          <span className="badge badge-danger" style={{ fontSize: '0.76rem', padding: '0.3rem 0.65rem' }}>
            <AlertTriangle size={12} />
            {pendingAlertCount} Alerts Requiring Review
          </span>
        )}
      </div>

      {/* Rules Reference Accordion - Quiet & Restrained */}
      <div style={{
        backgroundColor: 'var(--bg-app)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.85rem 1.15rem'
      }}>
        <div
          onClick={() => setShowRulesInfo(!showRulesInfo)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            Configured Alert Rules ({alertRules.length})
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.76rem', color: 'var(--color-primary-accent)' }}>
            <span>{showRulesInfo ? 'Hide Criteria' : 'View Criteria'}</span>
            {showRulesInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>

        {showRulesInfo && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '0.75rem',
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            {alertRules.map((rule) => (
              <div key={rule.id} style={{ fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                  {rule.name}
                </div>
                <div style={{ color: 'var(--color-primary-accent)', fontWeight: 500 }}>
                  {rule.condition}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '0.15rem' }}>
                  {rule.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter Strip */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: '170px', fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Alerts ({alerts.length})</option>
            <option value="Requires Review">Requires Review ({pendingAlertCount})</option>
            <option value="Reviewed">Reviewed ({alerts.length - pendingAlertCount})</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Severity:</span>
          <select
            className="form-select"
            style={{ width: '150px', fontSize: '0.8rem', padding: '0.4rem 0.65rem' }}
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="care-table-container">
        <table className="care-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Triggered Rule</th>
              <th>Reason &amp; Findings</th>
              <th>Date / Time</th>
              <th>Severity</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No alerts match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr key={alert.id} style={{ backgroundColor: alert.status === 'Requires Review' ? '#FCFBF9' : undefined }}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {alert.patientName}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {alert.patientId}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {alert.ruleName}
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                      {alert.reason}
                    </div>
                    {alert.notes && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {alert.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {alert.date}
                  </td>
                  <td>
                    <span className={`badge ${alert.severity === 'High' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.7rem' }}>
                      {alert.severity}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: alert.status === 'Requires Review' ? 'var(--color-primary-accent)' : 'var(--color-success)'
                    }}>
                      {alert.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {alert.status === 'Requires Review' ? (
                      <button
                        onClick={() => setSelectedAlertForReview(alert)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
                      >
                        Acknowledge
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {alert.reviewedBy ? `By ${alert.reviewedBy}` : 'Completed'}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selectedAlertForReview && (
        <div className="modal-overlay" onClick={() => setSelectedAlertForReview(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="care-card-header">
              <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Acknowledge Review Alert
              </h2>
            </div>
            <form onSubmit={handleConfirmReview} className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.85rem',
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem'
              }}>
                <div><strong>Patient:</strong> {selectedAlertForReview.patientName} ({selectedAlertForReview.patientId})</div>
                <div style={{ marginTop: '0.2rem' }}><strong>Rule:</strong> {selectedAlertForReview.ruleName}</div>
                <div style={{ marginTop: '0.2rem', color: 'var(--color-primary-accent)' }}>
                  {selectedAlertForReview.reason}
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Physician Note (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Advised patient to adjust cold pack frequency and maintain joint elevation."
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedAlertForReview(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Confirm Acknowledgment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
