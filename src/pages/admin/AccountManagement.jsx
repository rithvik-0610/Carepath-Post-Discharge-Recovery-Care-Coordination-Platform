import React, { useState } from 'react';
import { useCarePath } from '../../context/CarePathContext';
import {
  CheckCircle,
  Search
} from 'lucide-react';

export default function AccountManagement() {
  const { patients, doctors, updateAccountStatus } = useCarePath();

  const [search, setSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const handleStatusChange = (id, type, newStatus, name) => {
    updateAccountStatus(id, type, newStatus);
    setStatusMessage(`Status for ${name} updated to ${newStatus}.`);
    setTimeout(() => setStatusMessage(''), 3500);
  };

  const allAccounts = [
    ...patients.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: 'Patient',
      type: 'patient',
      status: p.accountStatus || 'Active'
    })),
    ...doctors.map(d => ({
      id: d.id,
      name: d.name,
      email: d.email,
      role: 'Doctor',
      type: 'doctor',
      status: d.status || 'Active'
    }))
  ].filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

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
            Account Management
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Manage user account lifecycles, active/inactive states, and platform access controls.
          </p>
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2rem', padding: '0.4rem 0.75rem', fontSize: '0.82rem' }}
            placeholder="Filter accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {statusMessage && (
        <div style={{
          backgroundColor: '#EFF6F1',
          border: '1px solid rgba(71, 120, 92, 0.22)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1.15rem',
          color: 'var(--color-success)',
          fontSize: '0.84rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle size={15} color="var(--color-success)" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Account Status Table */}
      <div className="care-table-container">
        <table className="care-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {allAccounts.map((acc) => (
              <tr key={acc.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {acc.name}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {acc.id}
                  </div>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {acc.email}
                </td>
                <td>
                  <span className={`badge ${acc.role === 'Doctor' ? 'badge-orange' : 'badge-terracotta'}`} style={{ fontSize: '0.7rem' }}>
                    {acc.role}
                  </span>
                </td>
                <td>
                  <span className={`badge ${acc.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                    {acc.status}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => handleStatusChange(acc.id, acc.type, 'Active', acc.name)}
                      className={`btn ${acc.status === 'Active' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => handleStatusChange(acc.id, acc.type, 'Inactive', acc.name)}
                      className={`btn ${acc.status === 'Inactive' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                    >
                      Inactive
                    </button>
                    <button
                      onClick={() => handleStatusChange(acc.id, acc.type, 'Pending', acc.name)}
                      className={`btn ${acc.status === 'Pending' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                      style={{ padding: '0.2rem 0.55rem', fontSize: '0.72rem' }}
                    >
                      Pending
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
