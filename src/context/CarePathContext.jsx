import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialDoctors,
  initialPatients,
  initialAdmin,
  initialRecoveryPlans,
  initialCheckins,
  initialAlertRules,
  initialAlerts
} from '../data/mockData';
import { API_ENDPOINTS } from '../config/api';

const CarePathContext = createContext(null);

const STORAGE_KEY_PREFIX = 'carepath_demo_v3_';

const normalizeRole = (r) => {
  if (!r) return '';
  const lower = String(r).toLowerCase();
  if (lower === 'doctor') return 'Doctor';
  if (lower === 'patient') return 'Patient';
  if (lower === 'admin') return 'Admin';
  return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
};

export function CarePathProvider({ children }) {
  // Initialize state with localStorage fallback
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);

    if (saved) {
      try {
        const user = JSON.parse(saved);

        if (user.token && user.id && user.role) {
          user.role = normalizeRole(user.role);
          return user;
        }
      } catch {
        // Ignore invalid saved session
      }
    }

    return null;
  });

  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}patients`);
    return saved ? JSON.parse(saved) : initialPatients;
  });

  const [doctors, setDoctors] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}doctors`);
    return saved ? JSON.parse(saved) : initialDoctors;
  });

  const [recoveryPlans, setRecoveryPlans] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}plans`);
    return saved ? JSON.parse(saved) : initialRecoveryPlans;
  });

  const [checkins, setCheckins] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}checkins`);
    return saved ? JSON.parse(saved) : initialCheckins;
  });

  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}alerts`);
    return saved ? JSON.parse(saved) : initialAlerts;
  });

  const [alertRules] = useState(initialAlertRules);

  // Sync state changes to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}patients`, JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}doctors`, JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}plans`, JSON.stringify(recoveryPlans));
  }, [recoveryPlans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}checkins`, JSON.stringify(checkins));
  }, [checkins]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}alerts`, JSON.stringify(alerts));
  }, [alerts]);

  // Live MySQL API Data Synchronization
  useEffect(() => {
    let isMounted = true;

    async function fetchDatabaseData() {
      try {
        // 1. Fetch Patients from MySQL
        const pRes = await fetch(API_ENDPOINTS.patients);
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.success && Array.isArray(pData.data) && pData.data.length > 0) {
            const dbPatients = pData.data.map(p => ({
              id: p.patient_id,
              name: p.full_name,
              email: p.email,
              assignedDoctorId: p.assigned_doctor_id || 1,
              assignedDoctorName: 'Dr. Srivalli',
              dischargeDate: p.discharge_date ? p.discharge_date.slice(0, 10) : '2026-10-10',
              diagnosis: p.recovery_title || 'Post-Discharge Rehabilitation Protocol',
              roomBed: 'Ambulatory Care Unit',
              emergencyContact: 'Registered Family Contact',
              status: (p.pending_alerts_count > 0 || (p.latest_pain_score && p.latest_pain_score >= 7)) ? 'Requires Review' : 'Active Recovery',
              accountStatus: 'Active'
            }));

            if (isMounted) {
              setPatients(prev => {
                const combined = [...dbPatients];
                prev.forEach(item => {
                  if (!combined.some(c => c.name?.toLowerCase() === item.name?.toLowerCase() || String(c.id) === String(item.id))) {
                    combined.push(item);
                  }
                });
                return combined;
              });
            }
          }
        }

        // 2. Fetch Check-ins from MySQL
        const cRes = await fetch(API_ENDPOINTS.checkins);
        if (cRes.ok) {
          const cData = await cRes.json();
          if (cData.success && Array.isArray(cData.data) && cData.data.length > 0) {
            const dbCheckins = cData.data.map(c => ({
              id: `CHK-DB-${c.id}`,
              dbId: c.id,
              patientId: c.patient_id,
              patientName: c.patient_name || 'Patient',
              date: c.check_in_date ? c.check_in_date.slice(0, 10) : new Date().toISOString().slice(0, 10),
              time: '08:30',
              painScore: Number(c.pain_score),
              sleepQuality: c.sleep_quality ? (c.sleep_quality.charAt(0).toUpperCase() + c.sleep_quality.slice(1)) : 'Fair',
              mobility: c.mobility || 'Walking with assistance',
              symptoms: typeof c.symptoms === 'string' ? c.symptoms.split(',').map(s => s.trim()) : (c.symptoms || []),
              note: c.notes || '',
              reviewed: false,
              reviewedBy: null,
              reviewedAt: null
            }));

            if (isMounted) {
              setCheckins(prev => {
                const combined = [...dbCheckins];
                prev.forEach(item => {
                  if (!combined.some(c => c.id === item.id)) {
                    combined.push(item);
                  }
                });
                return combined;
              });
            }
          }
        }

        // 3. Fetch Alerts from MySQL
        const aRes = await fetch(API_ENDPOINTS.alerts);
        if (aRes.ok) {
          const aData = await aRes.json();
          if (aData.success && Array.isArray(aData.data) && aData.data.length > 0) {
            const dbAlerts = aData.data.map(a => ({
              id: `ALT-DB-${a.id}`,
              dbId: a.id,
              patientId: a.patient_id,
              patientName: a.patient_name || 'Patient',
              doctorId: a.doctor_id || 1,
              ruleId: 'RULE-1',
              ruleName: 'High Pain Threshold',
              reason: a.reason,
              date: a.created_at ? a.created_at.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
              severity: a.severity ? (a.severity.charAt(0).toUpperCase() + a.severity.slice(1)) : 'High',
              status: a.status === 'reviewed' ? 'Reviewed' : 'Requires Review',
              checkinId: a.check_in_id,
              notes: 'Alert recorded in MySQL database.'
            }));

            if (isMounted) {
              setAlerts(prev => {
                const combined = [...dbAlerts];
                prev.forEach(item => {
                  if (!combined.some(c => c.id === item.id)) {
                    combined.push(item);
                  }
                });
                return combined;
              });
            }
          }
        }

        // 4. Fetch Recovery Plans from MySQL
        const rRes = await fetch(API_ENDPOINTS.recoveryPlans);
        if (rRes.ok) {
          const rData = await rRes.json();
          if (rData.success && Array.isArray(rData.data) && rData.data.length > 0) {
            const dbPlans = rData.data.map(r => ({
              id: `PLAN-DB-${r.id}`,
              dbId: r.id,
              patientId: r.patient_id,
              patientName: r.patient_name || 'Rithvik',
              doctorId: r.doctor_id,
              doctorName: r.doctor_name || 'Dr. Srivalli',
              title: r.title,
              startDate: r.start_date ? r.start_date.slice(0, 10) : '2026-10-04',
              targetDuration: '4 Weeks',
              instructions: r.instructions,
              scheduledActivities: [
                { id: `ACT-DB-1`, title: 'Morning Gentle Quad Sets (15 min)', time: '08:30 AM', category: 'Physiotherapy', completed: true },
                { id: `ACT-DB-2`, title: 'Cryotherapy / Ice Compression (20 min)', time: '11:00 AM', category: 'Swelling Management', completed: true },
                { id: `ACT-DB-3`, title: 'Prescribed Anti-inflammatory Medication', time: '01:00 PM', category: 'Medication', completed: true },
                { id: `ACT-DB-4`, title: 'Afternoon Heel Slides (15 min)', time: '04:30 PM', category: 'Physiotherapy', completed: false }
              ],
              upcomingFollowups: [
                { id: `FUP-DB-1`, date: '2026-10-18', time: '10:30 AM', doctor: 'Dr. Srivalli', clinic: 'Orthopedics Suite 2B', purpose: 'Day 14 Post-Op Wound Inspection & Suture Check' }
              ],
              status: r.status === 'active' ? 'Active' : r.status,
              lastUpdated: new Date().toISOString().split('T')[0]
            }));

            if (isMounted) {
              setRecoveryPlans(prev => {
                const combined = [...dbPlans];
                prev.forEach(item => {
                  if (!combined.some(c => c.id === item.id)) {
                    combined.push(item);
                  }
                });
                return combined;
              });
            }
          }
        }
      } catch (err) {
        console.warn('Live MySQL sync skipped:', err.message);
      }
    }

    fetchDatabaseData();
    return () => { isMounted = false; };
  }, []);

  // Auth / Role switching functions

  const login = async (roleOrEmail, emailOrPassword, maybePassword) => {
    let expectedRole = null;
    let email = '';
    let password = '';

    if (maybePassword !== undefined) {
      expectedRole = roleOrEmail;
      email = emailOrPassword;
      password = maybePassword;
    } else {
      email = roleOrEmail;
      password = emailOrPassword;
    }

    const response = await fetch(`${API_ENDPOINTS.auth}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: String(email).trim(), password })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Login failed');
    }

    if (expectedRole && result.user.role.toLowerCase() !== expectedRole.toLowerCase()) {
      throw new Error(`This account is not registered as ${expectedRole}.`);
    }

    const normalizedRole = normalizeRole(result.user.role);

    const user = {
      id: result.user.id,
      patientId: result.user.patient_id || result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: normalizedRole,
      token: result.token
    };

    setCurrentUser(user);
    return user;
  };

const logout = () => {
  setCurrentUser(null);
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
};

const switchRole = () => {
  logout();
};
  // Module 2 Action: Mark activity completed (Patient)
  const markActivityCompleted = (planId, activityId) => {
    setRecoveryPlans(prevPlans =>
      prevPlans.map(plan => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          scheduledActivities: plan.scheduledActivities.map(act => {
            if (act.id !== activityId) return act;
            return { ...act, completed: !act.completed };
          })
        };
      })
    );
  };

  // Module 2 Action: Create recovery plan (Doctor)
  const createRecoveryPlan = (planData) => {
    const newId = `PLAN-${Date.now().toString().slice(-4)}`;
    const patient = patients.find(p => p.id === planData.patientId);
    const newPlan = {
      id: newId,
      patientId: planData.patientId,
      patientName: patient ? patient.name : 'Unknown Patient',
      doctorId: currentUser.id,
      doctorName: currentUser.name,
      title: planData.title,
      startDate: planData.startDate,
      targetDuration: planData.targetDuration || '4 Weeks',
      instructions: planData.instructions,
      scheduledActivities: planData.scheduledActivities || [],
      upcomingFollowups: planData.upcomingFollowups || [
        {
          id: `FUP-${Date.now()}`,
          date: '2026-10-24',
          time: '11:00 AM',
          doctor: currentUser.name,
          clinic: 'Post-Op Follow-up Clinic',
          purpose: 'Recovery Progress & Incision Check'
        }
      ],
      status: 'Active',
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    setRecoveryPlans(prev => [newPlan, ...prev]);

    fetch(API_ENDPOINTS.recoveryPlans, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: typeof planData.patientId === 'number' ? planData.patientId : 1,
        doctor_id: typeof currentUser?.id === 'number' ? currentUser.id : 1,
        title: planData.title,
        instructions: planData.instructions,
        start_date: planData.startDate,
        end_date: planData.endDate || null
      })
    }).catch(err => console.warn('Plan creation sync skipped:', err.message));

    return newPlan;
  };

  // Module 2 Action: Update recovery plan schedule & instructions (Doctor)
  const updateRecoveryPlan = (planId, updatedFields) => {
    setRecoveryPlans(prev =>
      prev.map(plan => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          ...updatedFields,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
      })
    );
  };

  // Module 3 & 5 Action: Patient submits daily check-in with Rule-Based Alert Trigger
  const submitCheckin = (checkinData) => {
    const newCheckinId = `CHK-${Date.now().toString().slice(-4)}`;
    const patientObj = patients.find(p => p.id === checkinData.patientId || String(p.id) === String(checkinData.patientId)) || {
      id: currentUser?.patient_id || currentUser?.id || 1,
      name: currentUser?.name || 'Patient',
      assignedDoctorId: currentUser?.assignedDoctorId || 1
    };

    const newCheckin = {
      id: newCheckinId,
      patientId: patientObj.id,
      patientName: patientObj.name,
      date: checkinData.date || new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      painScore: Number(checkinData.painScore),
      sleepQuality: checkinData.sleepQuality,
      mobility: checkinData.mobility,
      symptoms: checkinData.symptoms || [],
      note: checkinData.note || '',
      reviewed: false,
      reviewedBy: null,
      reviewedAt: null
    };

    // Evaluate Rule-Based Alerts based on predefined demonstration rules
    const patientPastCheckins = checkins
      .filter(c => c.patientId === patientObj.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    const latestPreviousCheckin = patientPastCheckins[0];
    const prevPain = latestPreviousCheckin ? latestPreviousCheckin.painScore : null;
    const deltaPain = prevPain !== null ? newCheckin.painScore - prevPain : 0;

    const triggeredAlerts = [];

    // Rule 1: High Pain Threshold (>= 7)
    if (newCheckin.painScore >= 7) {
      triggeredAlerts.push({
        ruleId: 'RULE-1',
        ruleName: 'High Pain Threshold',
        reason: `Reported severe pain score of ${newCheckin.painScore}/10.`,
        severity: 'High'
      });
    }

    // Rule 2: Acute Pain Spike (>= 3 points increase)
    if (deltaPain >= 3) {
      triggeredAlerts.push({
        ruleId: 'RULE-2',
        ruleName: 'Acute Pain Spike',
        reason: `Pain spiked by +${deltaPain} points from previous check-in (${prevPain}/10 → ${newCheckin.painScore}/10).`,
        severity: 'High'
      });
    }

    // Rule 3: Restricted Mobility with Pain
    if (
      (newCheckin.mobility.includes('Bed-restricted') || newCheckin.mobility.includes('Moderate difficulty')) &&
      newCheckin.painScore >= 5
    ) {
      triggeredAlerts.push({
        ruleId: 'RULE-3',
        ruleName: 'Restricted Mobility with Pain',
        reason: `Limited mobility reported alongside pain score of ${newCheckin.painScore}/10.`,
        severity: 'Medium'
      });
    }

    // Rule 5: Critical Recovery Symptom
    const criticalSymptoms = ['Severe Swelling', 'High Fever', 'Redness around Incision', 'Warmth around Joint'];
    const matchedCritical = newCheckin.symptoms.filter(s => criticalSymptoms.includes(s));
    if (matchedCritical.length > 0) {
      triggeredAlerts.push({
        ruleId: 'RULE-5',
        ruleName: 'Critical Symptom Flag',
        reason: `Reported flagged recovery symptoms: ${matchedCritical.join(', ')}.`,
        severity: 'High'
      });
    }

    // Create alert objects if triggered
    if (triggeredAlerts.length > 0) {
      const combinedAlert = {
        id: `ALT-${Date.now().toString().slice(-4)}`,
        patientId: patientObj.id,
        patientName: patientObj.name,
        doctorId: patientObj.assignedDoctorId || 'DOC-001',
        ruleId: triggeredAlerts[0].ruleId,
        ruleName: triggeredAlerts.map(t => t.ruleName).join(' & '),
        reason: triggeredAlerts.map(t => t.reason).join(' '),
        date: `${newCheckin.date} ${newCheckin.time}`,
        severity: triggeredAlerts.some(t => t.severity === 'High') ? 'High' : 'Medium',
        status: 'Requires Review',
        checkinId: newCheckinId,
        notes: 'Demonstration rule triggered from patient daily check-in submission.'
      };

      setAlerts(prev => [combinedAlert, ...prev]);

      // Update patient status to 'Requires Review'
      setPatients(prev =>
        prev.map(p => (p.id === patientObj.id ? { ...p, status: 'Requires Review' } : p))
      );
    }

    setCheckins(prev => [newCheckin, ...prev]);

    // Sync check-in to MySQL database
    fetch(API_ENDPOINTS.checkins, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentUser?.token ? { Authorization: `Bearer ${currentUser.token}` } : {})
      },
      body: JSON.stringify({
        patient_id: typeof patientObj.id === 'number' ? patientObj.id : (currentUser?.patient_id || currentUser?.patientId || 1),
        check_in_date: newCheckin.date,
        pain_score: newCheckin.painScore,
        sleep_quality: newCheckin.sleepQuality,
        mobility: newCheckin.mobility,
        symptoms: newCheckin.symptoms,
        notes: newCheckin.note
      })
    }).then(async res => {
      if (res.ok) {
        try {
          const aRes = await fetch(API_ENDPOINTS.alerts);
          if (aRes.ok) {
            const aData = await aRes.json();
            if (aData.success && Array.isArray(aData.data)) {
              const dbAlerts = aData.data.map(a => ({
                id: `ALT-DB-${a.id}`,
                dbId: a.id,
                patientId: a.patient_id,
                patientName: a.patient_name || patientObj.name,
                doctorId: 1,
                ruleId: 'RULE-1',
                ruleName: 'High Pain Threshold',
                reason: a.reason,
                date: a.created_at ? a.created_at.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
                severity: a.severity ? (a.severity.charAt(0).toUpperCase() + a.severity.slice(1)) : 'High',
                status: a.status === 'reviewed' ? 'Reviewed' : 'Requires Review',
                notes: 'Alert recorded in MySQL database.'
              }));
              setAlerts(prev => {
                const combined = [...dbAlerts];
                prev.forEach(item => {
                  if (!combined.some(c => c.id === item.id)) combined.push(item);
                });
                return combined;
              });
            }
          }
        } catch {}
      }
    }).catch(err => console.warn('Checkin sync skipped:', err.message));

    return newCheckin;
  };

  // Module 3 Action: Doctor marks checkin as reviewed
  const markCheckinReviewed = (checkinId) => {
    setCheckins(prev =>
      prev.map(c => {
        if (c.id !== checkinId) return c;
        return {
          ...c,
          reviewed: true,
          reviewedBy: currentUser?.name || 'Dr. Srivalli',
          reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
      })
    );
  };

  // Module 5 Action: Doctor marks alert as reviewed
  const markAlertReviewed = (alertId, reviewNote = '') => {
    const target = alerts.find(a => a.id === alertId);
    const dbId = target?.dbId || (typeof alertId === 'number' ? alertId : null);
    if (dbId) {
      fetch(`${API_ENDPOINTS.alerts}/${dbId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => console.warn('Alert review sync skipped:', err.message));
    }

    setAlerts(prev =>
      prev.map(a => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          status: 'Reviewed',
          reviewedBy: currentUser?.name || 'Dr. Srivalli',
          reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          notes: reviewNote ? `${a.notes} | Doctor note: ${reviewNote}` : a.notes
        };
      })
    );

    // If no more open alerts for this patient, update patient status
    setTimeout(() => {
      setAlerts(currentAlerts => {
        const targetAlert = currentAlerts.find(a => a.id === alertId);
        if (targetAlert) {
          const hasPendingAlerts = currentAlerts.some(
            a => a.patientId === targetAlert.patientId && a.status === 'Requires Review'
          );
          if (!hasPendingAlerts) {
            setPatients(prevP =>
              prevP.map(p =>
                p.id === targetAlert.patientId ? { ...p, status: 'Active Recovery' } : p
              )
            );
          }
        }
        return currentAlerts;
      });
    }, 50);
  };

  // Module 1 (Admin) Action: Assign patient to doctor
  const assignPatientToDoctor = (patientId, doctorId) => {
    const doctorObj = doctors.find(d => d.id === doctorId);
    if (!doctorObj) return;

    setPatients(prev =>
      prev.map(p => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          assignedDoctorId: doctorId,
          assignedDoctorName: doctorObj.name
        };
      })
    );

    setDoctors(prev =>
      prev.map(d => {
        const currentList = d.assignedPatientIds || [];
        if (d.id === doctorId) {
          return {
            ...d,
            assignedPatientIds: currentList.includes(patientId)
              ? currentList
              : [...currentList, patientId]
          };
        } else {
          return {
            ...d,
            assignedPatientIds: currentList.filter(id => id !== patientId)
          };
        }
      })
    );
  };

  // Module 1 & 4 (Admin) Action: Update account status
  const updateAccountStatus = (userId, userType, newStatus) => {
    if (userType === 'patient') {
      setPatients(prev =>
        prev.map(p => (p.id === userId ? { ...p, accountStatus: newStatus } : p))
      );
    } else if (userType === 'doctor') {
      setDoctors(prev =>
        prev.map(d => (d.id === userId ? { ...d, status: newStatus } : d))
      );
    }
  };

  // Register / Add a new patient and sync with MySQL database
  const createPatient = async (patientData) => {
    try {
      const res = await fetch(API_ENDPOINTS.patients, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create patient account');
      }

      const newP = data.data;
      const formattedPatient = {
        id: newP.patient_id,
        name: newP.full_name,
        email: newP.email,
        assignedDoctorId: newP.assigned_doctor_id,
        assignedDoctorName: 'Dr. Srivalli',
        dischargeDate: newP.discharge_date,
        diagnosis: newP.recovery_title || 'Post-Discharge Rehabilitation Protocol',
        roomBed: 'Ambulatory Care Unit',
        emergencyContact: 'Family Contact',
        status: 'Active Recovery',
        accountStatus: 'Active'
      };

      setPatients(prev => [formattedPatient, ...prev.filter(p => p.id !== newP.patient_id)]);
      return formattedPatient;
    } catch (err) {
      console.error('Error creating patient:', err);
      throw err;
    }
  };

  // Reset to initial dataset
  const resetDemoData = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}user`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}patients`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}doctors`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}plans`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}checkins`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}alerts`);

    setPatients(initialPatients);
    setDoctors(initialDoctors);
    setRecoveryPlans(initialRecoveryPlans);
    setCheckins(initialCheckins);
    setAlerts(initialAlerts);
    setCurrentUser({
      role: 'Doctor',
      id: initialDoctors[0].id,
      name: initialDoctors[0].name,
      email: initialDoctors[0].email,
      specialty: initialDoctors[0].specialty,
      department: initialDoctors[0].department
    });
  };

  return (
    <CarePathContext.Provider
      value={{
        currentUser,
        login,
        logout,
        switchRole,
        patients,
        doctors,
        recoveryPlans,
        checkins,
        alerts,
        alertRules,
        markActivityCompleted,
        createRecoveryPlan,
        updateRecoveryPlan,
        submitCheckin,
        markCheckinReviewed,
        markAlertReviewed,
        assignPatientToDoctor,
        updateAccountStatus,
        createPatient,
        resetDemoData
      }}
    >
      {children}
    </CarePathContext.Provider>
  );
}

export function useCarePath() {
  const context = useContext(CarePathContext);
  if (!context) {
    throw new Error('useCarePath must be used within a CarePathProvider');
  }
  return context;
}
