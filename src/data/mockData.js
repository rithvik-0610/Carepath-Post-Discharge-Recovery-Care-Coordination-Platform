// CarePath Synthetic Demonstration Mock Data
// Structured for seamless future migration to REST API endpoints

export const initialDoctors = [
  {
    id: 'DOC-001',
    numericId: 1,
    name: 'Dr. Srivalli',
    email: 'srivalli@carepath.com',
    specialty: 'Orthopedic Surgery & Post-Op Recovery Lead',
    department: 'Orthopedics & Joint Reconstruction',
    phone: '+1 (555) 234-5678',
    avatar: 'SV',
    assignedPatientIds: ['PAT-101', 'PAT-102', 'PAT-103'],
    status: 'Active'
  },
  {
    id: 'DOC-002',
    name: 'Dr. Evelyn Harper',
    email: 'dr.harper@demo.carepath.org',
    specialty: 'General Surgery & Post-Op Care',
    department: 'General Surgery',
    phone: '+1 (555) 345-6789',
    avatar: 'EH',
    assignedPatientIds: ['PAT-105'],
    status: 'Active'
  },
  {
    id: 'DOC-003',
    name: 'Dr. Amir Patel',
    email: 'dr.patel@demo.carepath.org',
    specialty: 'Cardiothoracic Care Coordinator',
    department: 'Cardiovascular Surgery',
    phone: '+1 (555) 456-7890',
    avatar: 'AP',
    assignedPatientIds: ['PAT-104'],
    status: 'Active'
  }
];

export const initialPatients = [
  {
    id: 'PAT-101',
    numericId: 1,
    name: 'Rithvik',
    email: 'rithvik@carepath.com',
    age: 26,
    gender: 'Male',
    phone: '+1 (555) 901-2345',
    dischargeDate: '2026-10-04',
    diagnosis: 'Right Knee Arthroscopy & Meniscal Repair',
    assignedDoctorId: 'DOC-001',
    assignedDoctorName: 'Dr. Srivalli',
    roomBed: 'Ortho Wing - 304B (Discharged)',
    emergencyContact: 'Family Contact - +1 (555) 901-2346',
    status: 'Requires Review',
    accountStatus: 'Active'
  },
  {
    id: 'PAT-102',
    name: 'Robert Miller',
    email: 'robert.m@demo.carepath.org',
    age: 58,
    gender: 'Male',
    phone: '+1 (555) 902-3456',
    dischargeDate: '2026-10-01',
    diagnosis: 'Total Left Hip Arthroplasty',
    assignedDoctorId: 'DOC-001',
    assignedDoctorName: 'Dr. Srivalli',
    roomBed: 'Ortho Wing - 212A (Discharged)',
    emergencyContact: 'Clara Miller (Daughter) - +1 (555) 902-3457',
    status: 'Requires Review',
    accountStatus: 'Active'
  },
  {
    id: 'PAT-103',
    name: 'Priya Sharma',
    email: 'priya.s@demo.carepath.org',
    age: 31,
    gender: 'Female',
    phone: '+1 (555) 903-4567',
    dischargeDate: '2026-10-06',
    diagnosis: 'Anterior Cruciate Ligament (ACL) Reconstruction',
    assignedDoctorId: 'DOC-001',
    assignedDoctorName: 'Dr. Srivalli',
    roomBed: 'Sports Med - 108 (Discharged)',
    emergencyContact: 'Raj Sharma (Brother) - +1 (555) 903-4568',
    status: 'Active Recovery',
    accountStatus: 'Active'
  },
  {
    id: 'PAT-104',
    name: 'David Chen',
    email: 'david.c@demo.carepath.org',
    age: 65,
    gender: 'Male',
    phone: '+1 (555) 904-5678',
    dischargeDate: '2026-10-02',
    diagnosis: 'Coronary Artery Bypass Graft (CABG x2)',
    assignedDoctorId: 'DOC-003',
    assignedDoctorName: 'Dr. Amir Patel',
    roomBed: 'Cardiac Rehab - 415 (Discharged)',
    emergencyContact: 'Linda Chen (Spouse) - +1 (555) 904-5679',
    status: 'Active Recovery',
    accountStatus: 'Active'
  },
  {
    id: 'PAT-105',
    name: 'Elena Rostova',
    email: 'elena.r@demo.carepath.org',
    age: 28,
    gender: 'Female',
    phone: '+1 (555) 905-6789',
    dischargeDate: '2026-10-07',
    diagnosis: 'Laparoscopic Appendectomy',
    assignedDoctorId: 'DOC-002',
    assignedDoctorName: 'Dr. Evelyn Harper',
    roomBed: 'General Ward - 119 (Discharged)',
    emergencyContact: 'Dmitri Rostov (Father) - +1 (555) 905-6790',
    status: 'Active Recovery',
    accountStatus: 'Active'
  }
];

export const initialAdmin = {
  id: 'ADM-001',
  name: 'Clara Hayes',
  email: 'admin@demo.carepath.org',
  role: 'Admin',
  department: 'Post-Discharge Care Coordination & IT Systems',
  status: 'Active'
};

export const initialRecoveryPlans = [
  {
    id: 'PLAN-101',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Srivalli',
    title: 'Post-Operative Knee Arthroscopy Rehabilitation',
    startDate: '2026-10-04',
    targetDuration: '4 Weeks',
    instructions: 'Maintain weight-bearing as tolerated with two crutches for days 1-7. Apply cryotherapy ice wrap for 20 minutes every 3-4 hours to manage joint swelling. Perform gentle quad contractions and ankle pumps thrice daily. Keep surgical incisions dry and clean. Do not submerge incision in water.',
    scheduledActivities: [
      { id: 'ACT-101-1', title: 'Morning Gentle Quad Sets (15 min)', time: '08:30 AM', category: 'Physiotherapy', completed: true },
      { id: 'ACT-101-2', title: 'Cryotherapy / Ice Compression (20 min)', time: '11:00 AM', category: 'Swelling Management', completed: true },
      { id: 'ACT-101-3', title: 'Prescribed Anti-inflammatory Medication', time: '01:00 PM', category: 'Medication', completed: true },
      { id: 'ACT-101-4', title: 'Afternoon Heel Slides Range-of-Motion (15 min)', time: '04:30 PM', category: 'Physiotherapy', completed: false },
      { id: 'ACT-101-5', title: 'Evening Ankle Pumps & Leg Elevation (20 min)', time: '08:00 PM', category: 'Physiotherapy', completed: false }
    ],
    upcomingFollowups: [
      { id: 'FUP-101-1', date: '2026-10-18', time: '10:30 AM', doctor: 'Dr. Srivalli', clinic: 'Orthopedics Suite 2B', purpose: 'Day 14 Post-Op Wound Inspection & Suture Check' },
      { id: 'FUP-101-2', date: '2026-10-25', time: '02:00 PM', doctor: 'Physical Therapy Staff', clinic: 'Outpatient Rehabilitation', purpose: 'Full Weight-Bearing Range & Stability Test' }
    ],
    status: 'Active',
    lastUpdated: '2026-10-04'
  },
  {
    id: 'PLAN-102',
    patientId: 'PAT-102',
    patientName: 'Robert Miller',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Srivalli',
    title: 'Total Hip Arthroplasty Recovery Protocol',
    startDate: '2026-10-01',
    targetDuration: '6 Weeks',
    instructions: 'Strict hip precautions: do not bend hip beyond 90 degrees, do not cross legs, use walker during all transfers. Wear compression stockings during the day. Inspect incision site daily for erythema or fluid.',
    scheduledActivities: [
      { id: 'ACT-102-1', title: 'Supported Walker Ambulatory Walk (15 min)', time: '09:00 AM', category: 'Mobility', completed: true },
      { id: 'ACT-102-2', title: 'Prescribed Anticoagulant Injection', time: '10:00 AM', category: 'Medication', completed: true },
      { id: 'ACT-102-3', title: 'Gluteal & Quadriceps Isometric Sets (15 min)', time: '03:00 PM', category: 'Physiotherapy', completed: false }
    ],
    upcomingFollowups: [
      { id: 'FUP-102-1', date: '2026-10-15', time: '09:00 AM', doctor: 'Dr. Srivalli', clinic: 'Orthopedic Joint Center', purpose: 'Week 2 Post-Discharge Pelvic X-Ray & Wound Check' }
    ],
    status: 'Active',
    lastUpdated: '2026-10-01'
  },
  {
    id: 'PLAN-103',
    patientId: 'PAT-103',
    patientName: 'Priya Sharma',
    doctorId: 'DOC-001',
    doctorName: 'Dr. Srivalli',
    title: 'ACL Reconstruction Early Phase Stabilization',
    startDate: '2026-10-06',
    targetDuration: '8 Weeks',
    instructions: 'Knee brace locked in full extension during sleep and ambulation. Straight leg raises with brace on. Cryotherapy 20 mins every 2 hours.',
    scheduledActivities: [
      { id: 'ACT-103-1', title: 'Braced Straight Leg Raises (10 reps x 3)', time: '10:00 AM', category: 'Physiotherapy', completed: true },
      { id: 'ACT-103-2', title: 'Cold Pack Application (20 min)', time: '02:00 PM', category: 'Swelling Management', completed: true }
    ],
    upcomingFollowups: [
      { id: 'FUP-103-1', date: '2026-10-20', time: '11:15 AM', doctor: 'Dr. Srivalli', clinic: 'Sports Med Center', purpose: 'Range of Motion Expansion & Brace Adjustment' }
    ],
    status: 'Active',
    lastUpdated: '2026-10-06'
  }
];

export const initialCheckins = [
  // Rithvik (PAT-101) - 7-day period
  {
    id: 'CHK-101-1',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    date: '2026-10-04',
    time: '19:15',
    painScore: 7,
    sleepQuality: 'Interrupted',
    mobility: 'Bed-restricted',
    symptoms: ['Swelling', 'Stiffness', 'Incision Tenderness'],
    note: 'Discharged this afternoon. Knee feels very stiff and swollen around the incision. Resting in bed with leg propped up on two pillows.',
    reviewed: true,
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-05 08:30'
  },
  {
    id: 'CHK-101-2',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    date: '2026-10-05',
    time: '18:40',
    painScore: 6,
    sleepQuality: 'Interrupted',
    mobility: 'Minor assistance',
    symptoms: ['Swelling', 'Stiffness'],
    note: 'Used crutches to reach the bathroom with help from family. Ice wrap helped numb the throbbing sensation.',
    reviewed: true,
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-06 09:10'
  },
  {
    id: 'CHK-101-3',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    date: '2026-10-06',
    time: '19:00',
    painScore: 6,
    sleepQuality: 'Normal',
    mobility: 'Minor assistance',
    symptoms: ['Mild Swelling', 'Stiffness'],
    note: 'Did gentle quad flexes as instructed in the plan. Less sharp pain while resting. Incision looks clean and dry.',
    reviewed: true,
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-07 08:45'
  },
  {
    id: 'CHK-101-4',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    date: '2026-10-07',
    time: '20:10',
    painScore: 5,
    sleepQuality: 'Normal',
    mobility: 'Minor assistance',
    symptoms: ['Mild Swelling', 'Stiffness'],
    note: 'Swelling reduced slightly compared to yesterday. Able to put partial weight on my right foot without sharp pain.',
    reviewed: true,
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-08 09:20'
  },
  {
    id: 'CHK-101-5',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    date: '2026-10-08',
    time: '18:50',
    painScore: 4,
    sleepQuality: 'Restful',
    mobility: 'Minor assistance',
    symptoms: ['Mild Stiffness'],
    note: 'Slept 7 hours uninterrupted. Heel slide exercises are feeling smoother. No increased heat or redness around the knee.',
    reviewed: true,
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-09 08:50'
  },
  {
    id: 'CHK-101-6',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    date: '2026-10-09',
    time: '19:30',
    painScore: 4,
    sleepQuality: 'Restful',
    mobility: 'Independent',
    symptoms: ['Mild Stiffness'],
    note: 'Walked to the kitchen with just one crutch for balance. Very pleased with recovery progress so far.',
    reviewed: true,
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-10 09:00'
  },
  {
    id: 'CHK-101-7',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    date: '2026-10-15',
    time: '08:30',
    painScore: 8,
    sleepQuality: 'Fair',
    mobility: 'Walking with assistance',
    symptoms: ['Incision Tenderness', 'Mild Swelling'],
    note: 'Post-op knee feels stiff this morning, walking with crutches. Taking prescribed anti-inflammatory.',
    reviewed: false,
    reviewedBy: null,
    reviewedAt: null
  },

  // Robert Miller (PAT-102) - recent pain spike triggering alert
  {
    id: 'CHK-102-1',
    patientId: 'PAT-102',
    patientName: 'Robert Miller',
    date: '2026-10-08',
    time: '19:00',
    painScore: 4,
    sleepQuality: 'Normal',
    mobility: 'Minor assistance',
    symptoms: ['Mild Soreness'],
    note: 'Routine walker exercises completed.',
    reviewed: true,
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-09 08:15'
  },
  {
    id: 'CHK-102-2',
    patientId: 'PAT-102',
    patientName: 'Robert Miller',
    date: '2026-10-09',
    time: '21:15',
    painScore: 8,
    sleepQuality: 'Poor',
    mobility: 'Moderate difficulty',
    symptoms: ['Severe Swelling', 'Sharp Pain on Bearing Weight', 'Warmth'],
    note: 'Had a sudden sharp twinge in hip while transferring to the armchair. Throbbing has persisted all evening.',
    reviewed: false,
    reviewedBy: null,
    reviewedAt: null
  },

  // Priya Sharma (PAT-103)
  {
    id: 'CHK-103-1',
    patientId: 'PAT-103',
    patientName: 'Priya Sharma',
    date: '2026-10-08',
    time: '18:10',
    painScore: 6,
    sleepQuality: 'Interrupted',
    mobility: 'Bed-restricted',
    symptoms: ['Swelling', 'Stiffness'],
    note: 'Brace feels snug, keeping leg elevated on foam wedge.',
    reviewed: true,
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-09 09:00'
  },
  {
    id: 'CHK-103-2',
    patientId: 'PAT-103',
    patientName: 'Priya Sharma',
    date: '2026-10-09',
    time: '19:45',
    painScore: 5,
    sleepQuality: 'Normal',
    mobility: 'Minor assistance',
    symptoms: ['Stiffness'],
    note: 'Managed 3 sets of straight leg raises. Cryotherapy helping with tenderness.',
    reviewed: false,
    reviewedBy: null,
    reviewedAt: null
  }
];

export const initialAlertRules = [
  {
    id: 'RULE-1',
    name: 'High Pain Threshold',
    condition: 'Reported pain score >= 7 out of 10',
    severity: 'High',
    description: 'Flags check-ins where patient reports elevated acute post-operative pain requiring analgesia or physical review.'
  },
  {
    id: 'RULE-2',
    name: 'Acute Pain Spike',
    condition: 'Pain score increases by >= 3 points from previous entry',
    severity: 'High',
    description: 'Flags abrupt pain elevation that could indicate improper joint loading, wound irritation, or internal strain.'
  },
  {
    id: 'RULE-3',
    name: 'Restricted Mobility with Pain',
    condition: 'Mobility marked as Bed-restricted or Moderate difficulty with pain >= 5',
    severity: 'Medium',
    description: 'Identifies patients struggling with basic recovery transfers or functional ambulation.'
  },
  {
    id: 'RULE-4',
    name: 'Consecutive Missed Check-ins',
    condition: 'No recovery check-in submitted for >= 2 consecutive days',
    severity: 'Medium',
    description: 'Alerts coordination team of potential patient disengagement or communication barrier.'
  },
  {
    id: 'RULE-5',
    name: 'Critical Symptom Flag',
    condition: 'Patient reported symptoms include Severe Swelling, High Fever, or Abnormal Warmth',
    severity: 'High',
    description: 'Flags signs that may require clinical assessment of the surgical incision or systemic response.'
  }
];

export const initialAlerts = [
  {
    id: 'ALT-100',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    doctorId: 'DOC-001',
    ruleId: 'RULE-1',
    ruleName: 'High Pain Threshold',
    reason: 'Reported acute post-operative pain score of 8/10. Clinical review recommended.',
    date: '2026-10-15 08:30',
    severity: 'High',
    status: 'Requires Review',
    checkinId: 'CHK-101-7',
    notes: 'Triggered automatically from check-in CHK-101-7.'
  },
  {
    id: 'ALT-101',
    patientId: 'PAT-102',
    patientName: 'Robert Miller',
    doctorId: 'DOC-001',
    ruleId: 'RULE-1',
    ruleName: 'High Pain Threshold & Acute Pain Spike',
    reason: 'Pain score jumped to 8/10 (+4 from prior day) accompanied by Severe Swelling.',
    date: '2026-10-09 21:15',
    severity: 'High',
    status: 'Requires Review',
    checkinId: 'CHK-102-2',
    notes: 'Triggered automatically from check-in CHK-102-2.'
  },
  {
    id: 'ALT-102',
    patientId: 'PAT-101',
    patientName: 'Rithvik',
    doctorId: 'DOC-001',
    ruleId: 'RULE-1',
    ruleName: 'High Pain Threshold',
    reason: 'Reported pain score of 7/10 on initial discharge day.',
    date: '2026-10-04 19:15',
    severity: 'Medium',
    status: 'Reviewed',
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-05 08:35',
    checkinId: 'CHK-101-1',
    notes: 'Reviewed and noted as normal Day 1 post-arthroscopy tenderness.'
  },
  {
    id: 'ALT-103',
    patientId: 'PAT-103',
    patientName: 'Priya Sharma',
    doctorId: 'DOC-001',
    ruleId: 'RULE-3',
    ruleName: 'Restricted Mobility with Pain',
    reason: 'Reported Bed-restricted mobility with pain score of 6/10.',
    date: '2026-10-08 18:10',
    severity: 'Medium',
    status: 'Reviewed',
    reviewedBy: 'Dr. Srivalli',
    reviewedAt: '2026-10-09 09:05',
    checkinId: 'CHK-103-1',
    notes: 'Patient resting with post-op knee brace locked.'
  }
];

export const symptomOptions = [
  'Normal healing sensation',
  'Mild Stiffness',
  'Stiffness',
  'Mild Swelling',
  'Moderate Swelling',
  'Severe Swelling',
  'Incision Tenderness',
  'Mild Fever (under 100°F)',
  'High Fever',
  'Nausea',
  'Dizziness',
  'Sharp Pain on Bearing Weight',
  'Numbness or Tingling',
  'Redness around Incision',
  'Warmth around Joint'
];

export const mobilityOptions = [
  'Independent (Normal or crutch-assisted steady walk)',
  'Minor assistance (Needs steadying arm or companion)',
  'Moderate difficulty (Significant effort/pain during transfers)',
  'Bed-restricted (Unable to safely ambulate without full assist)'
];

export const sleepQualityOptions = [
  'Restful (6+ hours undisturbed sleep)',
  'Normal (Woke up once or twice, manageable comfort)',
  'Interrupted (Woke frequently due to pain or discomfort)',
  'Poor (Severe insomnia or intense discomfort)'
];
