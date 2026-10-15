import React, { useState } from 'react';
import { useCarePath } from '../../context/CarePathContext';
import {
  FileText,
  Plus,
  Clock,
  Check,
  Edit,
  Trash2,
  X
} from 'lucide-react';

export default function RecoveryPlanManagement() {
  const { currentUser, patients, recoveryPlans, createRecoveryPlan, updateRecoveryPlan } = useCarePath();

  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'create'
  const [selectedPlanForEdit, setSelectedPlanForEdit] = useState(null);

  // New Plan Form State
  const [newPatientId, setNewPatientId] = useState(patients[0]?.id || '');
  const [newTitle, setNewTitle] = useState('');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDuration, setNewDuration] = useState('4 Weeks');
  const [newInstructions, setNewInstructions] = useState('');
  const [activitiesList, setActivitiesList] = useState([
    { id: 'ACT-1', title: 'Morning Isometric Muscle Sets (15 min)', time: '08:30 AM', category: 'Physiotherapy', completed: false },
    { id: 'ACT-2', title: 'Cryotherapy / Ice Compression (20 min)', time: '11:00 AM', category: 'Swelling Management', completed: false },
    { id: 'ACT-3', title: 'Prescribed Analgesic / Anti-inflammatory', time: '01:00 PM', category: 'Medication', completed: false },
    { id: 'ACT-4', title: 'Evening Range-of-Motion Exercises (15 min)', time: '07:30 PM', category: 'Physiotherapy', completed: false }
  ]);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityTime, setNewActivityTime] = useState('09:00 AM');
  const [newActivityCat, setNewActivityCat] = useState('Physiotherapy');

  // Edit Plan Form State
  const [editInstructions, setEditInstructions] = useState('');
  const [editActivities, setEditActivities] = useState([]);

  const handleAddActivity = () => {
    if (!newActivityTitle.trim()) return;
    setActivitiesList(prev => [
      ...prev,
      {
        id: `ACT-${Date.now().toString().slice(-4)}`,
        title: newActivityTitle.trim(),
        time: newActivityTime,
        category: newActivityCat,
        completed: false
      }
    ]);
    setNewActivityTitle('');
  };

  const handleRemoveActivity = (id) => {
    setActivitiesList(prev => prev.filter(a => a.id !== id));
  };

  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newInstructions.trim()) {
      alert('Please fill out the plan title and instructions.');
      return;
    }

    createRecoveryPlan({
      patientId: newPatientId,
      title: newTitle.trim(),
      startDate: newStartDate,
      targetDuration: newDuration,
      instructions: newInstructions.trim(),
      scheduledActivities: activitiesList
    });

    setNewTitle('');
    setNewInstructions('');
    setActiveTab('list');
  };

  const handleOpenEdit = (plan) => {
    setSelectedPlanForEdit(plan);
    setEditInstructions(plan.instructions);
    setEditActivities([...plan.scheduledActivities]);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!selectedPlanForEdit) return;

    updateRecoveryPlan(selectedPlanForEdit.id, {
      instructions: editInstructions,
      scheduledActivities: editActivities
    });

    setSelectedPlanForEdit(null);
  };

  const handleAddEditActivity = () => {
    if (!newActivityTitle.trim()) return;
    setEditActivities(prev => [
      ...prev,
      {
        id: `ACT-${Date.now().toString().slice(-4)}`,
        title: newActivityTitle.trim(),
        time: newActivityTime,
        category: newActivityCat,
        completed: false
      }
    ]);
    setNewActivityTitle('');
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
            Recovery Plan Management
          </h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Author patient-specific recovery schedules, update instructions, and monitor rehabilitation activities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('list')}
            className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            Existing Plans ({recoveryPlans.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`btn ${activeTab === 'create' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          >
            <Plus size={14} /> Create Recovery Plan
          </button>
        </div>
      </div>

      {/* Tab: List of Existing Recovery Plans */}
      {activeTab === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          {recoveryPlans.map((plan) => (
            <div key={plan.id} className="care-card">
              <div className="care-card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      {plan.title}
                    </h2>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      {plan.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    Patient: <strong style={{ color: 'var(--text-primary)' }}>{plan.patientName}</strong> ({plan.patientId}) • Started: {plan.startDate} • Duration: {plan.targetDuration}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="btn btn-secondary btn-sm"
                >
                  <Edit size={13} />
                  Edit Schedule &amp; Guidance
                </button>
              </div>

              <div className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Clinical Guidance */}
                <div>
                  <h3 style={{ fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    Clinical Guidance &amp; Precautions
                  </h3>
                  <div style={{
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderLeft: '3px solid var(--color-primary-accent)',
                    padding: '0.85rem 1.15rem',
                    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    color: 'var(--text-primary)'
                  }}>
                    {plan.instructions}
                  </div>
                </div>

                {/* Scheduled Activities */}
                <div>
                  <h3 style={{ fontSize: '0.86rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    Scheduled Activities ({plan.scheduledActivities?.length || 0})
                  </h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '0.6rem'
                  }}>
                    {plan.scheduledActivities?.map((act) => (
                      <div
                        key={act.id}
                        style={{
                          padding: '0.65rem 0.85rem',
                          backgroundColor: act.completed ? 'var(--bg-app)' : '#FFFFFF',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 500, color: act.completed ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                            {act.title}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {act.category} • {act.time}
                          </div>
                        </div>

                        <span style={{ fontSize: '0.72rem', color: act.completed ? 'var(--color-success)' : 'var(--text-muted)' }}>
                          {act.completed ? 'Completed' : 'Scheduled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Create New Recovery Plan */}
      {activeTab === 'create' && (
        <div className="care-card">
          <div className="care-card-header">
            <div>
              <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Author New Recovery Plan
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Set title, start date, rehabilitation instructions, and scheduled daily activities
              </span>
            </div>
          </div>

          <div className="care-card-body">
            <form onSubmit={handleCreatePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Assign to Patient</label>
                  <select
                    className="form-select"
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.id}) — {p.diagnosis}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Recovery Plan Title</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Total Hip Replacement Rehabilitation Protocol"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target Duration</label>
                  <select
                    className="form-select"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                  >
                    <option value="2 Weeks">2 Weeks</option>
                    <option value="3 Weeks">3 Weeks</option>
                    <option value="4 Weeks">4 Weeks</option>
                    <option value="6 Weeks">6 Weeks</option>
                    <option value="8 Weeks">8 Weeks</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Clinical Instructions &amp; Guidance</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Detail instructions for weight bearing, wound care, cryotherapy, elevation, hygiene, warning signs..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  required
                />
              </div>

              {/* Schedule Activities Builder */}
              <div>
                <label className="form-label">Scheduled Daily Activities</label>
                <div style={{
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}>
                  {activitiesList.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#FFFFFF',
                        padding: '0.55rem 0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={13} color="var(--color-primary-accent)" />
                        <span style={{ fontSize: '0.84rem', fontWeight: 500 }}>{act.title}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          • {act.category} ({act.time})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveActivity(act.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr auto',
                    gap: '0.5rem',
                    alignItems: 'center',
                    marginTop: '0.35rem'
                  }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Activity name (e.g. Quadriceps sets, Ice application)"
                      value={newActivityTitle}
                      onChange={(e) => setNewActivityTitle(e.target.value)}
                    />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Time (e.g. 10:00 AM)"
                      value={newActivityTime}
                      onChange={(e) => setNewActivityTime(e.target.value)}
                    />
                    <select
                      className="form-select"
                      value={newActivityCat}
                      onChange={(e) => setNewActivityCat(e.target.value)}
                    >
                      <option value="Physiotherapy">Physiotherapy</option>
                      <option value="Medication">Medication</option>
                      <option value="Swelling Management">Swelling Management</option>
                      <option value="Mobility">Mobility</option>
                      <option value="Wound Care">Wound Care</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddActivity}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={13} /> Add
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Recovery Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedPlanForEdit && (
        <div className="modal-overlay" onClick={() => setSelectedPlanForEdit(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="care-card-header">
              <h2 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                Edit Recovery Plan — {selectedPlanForEdit.patientName}
              </h2>
              <button
                onClick={() => setSelectedPlanForEdit(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="care-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Recovery Guidance</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={editInstructions}
                  onChange={(e) => setEditInstructions(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Scheduled Activities</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
                  {editActivities.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg-app)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <span style={{ fontSize: '0.84rem' }}>{act.title} ({act.time})</span>
                      <button
                        type="button"
                        onClick={() => setEditActivities(prev => prev.filter(a => a.id !== act.id))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="New activity title"
                    value={newActivityTitle}
                    onChange={(e) => setNewActivityTitle(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Time (e.g. 02:00 PM)"
                    value={newActivityTime}
                    onChange={(e) => setNewActivityTime(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddEditActivity}
                    className="btn btn-secondary btn-sm"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', paddingTop: '0.65rem', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setSelectedPlanForEdit(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
