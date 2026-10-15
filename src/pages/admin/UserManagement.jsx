import React, { useState } from 'react';
import { useCarePath } from '../../context/CarePathContext';
import {
  Search,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function UserManagement() {
  const { patients, doctors, updateAccountStatus } = useCarePath();

  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'PATIENTS' | 'DOCTORS'
  const [searchQuery, setSearchQuery] = useState('');

  const unifiedUsers = [
    ...doctors.map(d => ({
      id: d.id,
      name: d.name,
      email: d.email,
      role: 'Doctor',
      attribute: d.specialty,
      status: d.status || 'Active',
      type: 'doctor'
    })),
    ...patients.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      role: 'Patient',
      attribute: `Supervised: ${p.assignedDoctorName} (${p.diagnosis})`,
      status: p.accountStatus || 'Active',
      type: 'patient'
    }))
  ];

  const filteredUsers = unifiedUsers
    .filter(u => {
      if (roleFilter === 'PATIENTS') return u.type === 'patient';
      if (roleFilter === 'DOCTORS') return u.type === 'doctor';
      return true;
    })
    .filter(u =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.attribute.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleToggleStatus = (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    updateAccountStatus(user.id, user.type, newStatus);
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
            User Directory
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Search and manage system accounts across patients, physicians, and administrative staff.
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.2rem', fontSize: '0.84rem' }}
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`btn ${roleFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          All Users ({unifiedUsers.length})
        </button>
        <button
          onClick={() => setRoleFilter('PATIENTS')}
          className={`btn ${roleFilter === 'PATIENTS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Patients ({patients.length})
        </button>
        <button
          onClick={() => setRoleFilter('DOCTORS')}
          className={`btn ${roleFilter === 'DOCTORS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Physicians ({doctors.length})
        </button>
      </div>

      {/* User Table */}
      <div className="care-table-container">
        <table className="care-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Role</th>
              <th>Specialty / Assignment</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Controls</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No accounts found matching "{searchQuery}".
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {user.id} • {user.email}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'Doctor' ? 'badge-orange' : 'badge-terracotta'}`} style={{ fontSize: '0.7rem' }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {user.attribute}
                  </td>
                  <td>
                    <span className={`badge ${user.status === 'Active' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                      {user.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button
                      onClick={() => handleToggleStatus(user)}
                      className={`btn ${user.status === 'Active' ? 'btn-secondary' : 'btn-primary'} btn-sm`}
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.74rem' }}
                    >
                      {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
