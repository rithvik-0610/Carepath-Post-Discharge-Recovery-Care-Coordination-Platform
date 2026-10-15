const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

// GET all patients (enriched with recovery plan and clinical status)
router.get('/', async (req, res) => {
  try {
    const [patients] = await pool.query(`
      SELECT
        p.id AS patient_id,
        p.user_id,
        u.full_name,
        u.email,
        p.assigned_doctor_id,
        p.discharge_date,
        rp.id AS recovery_plan_id,
        rp.title AS recovery_title,
        rp.status AS plan_status,
        (SELECT pain_score FROM check_ins WHERE patient_id = p.id ORDER BY check_in_date DESC, id DESC LIMIT 1) AS latest_pain_score,
        (SELECT COUNT(*) FROM alerts WHERE patient_id = p.id AND status = 'pending') AS pending_alerts_count
      FROM patients p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN recovery_plans rp ON rp.patient_id = p.id AND rp.status = 'active'
      ORDER BY p.id DESC
    `);

    res.json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    console.error('Fetch patients error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients'
    });
  }
});

// POST /api/patients - Register / add a patient directly from the doctor portal
router.post('/', async (req, res) => {
  const { full_name, email, password, diagnosis, discharge_date, notes } = req.body;

  if (!full_name?.trim() || !email?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Patient name and email are required'
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password || 'Password123!', 12);

    const [uRes] = await connection.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES (?, ?, ?, 'patient')`,
      [full_name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const userId = uRes.insertId;
    const dischargeDate = discharge_date || new Date().toISOString().slice(0, 10);

    // Dynamically look up active doctor or use passed doctor_id
    let assignedDoctorId = req.body.doctor_id ? Number(req.body.doctor_id) : null;
    if (!assignedDoctorId) {
      const [doctorRows] = await connection.query(
        "SELECT id FROM users WHERE role = 'doctor' ORDER BY id ASC LIMIT 1"
      );
      assignedDoctorId = doctorRows.length > 0 ? doctorRows[0].id : 1;
    }

    const [pRes] = await connection.query(
      `INSERT INTO patients (user_id, assigned_doctor_id, discharge_date)
       VALUES (?, ?, ?)`,
      [userId, assignedDoctorId, dischargeDate]
    );

    const patientId = pRes.insertId;
    const planTitle = diagnosis?.trim() ? `${diagnosis.trim()} Recovery Protocol` : 'Post-Discharge Rehabilitation Protocol';
    const instructions = notes?.trim() || 'Follow prescribed daily activity guidelines, log daily check-ins, and maintain recovery precautions.';

    const [rpRes] = await connection.query(
      `INSERT INTO recovery_plans (patient_id, doctor_id, title, instructions, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, DATE_ADD(?, INTERVAL 30 DAY), 'active')`,
      [patientId, assignedDoctorId, planTitle, instructions, dischargeDate, dischargeDate]
    );

    const planId = rpRes.insertId;

    // Dynamically tailor recovery activities to the patient's diagnosis
    const proc = (diagnosis || '').trim().toLowerCase();
    let activities = [];

    if (proc.includes('knee') || proc.includes('hip') || proc.includes('ortho') || proc.includes('arthroplasty') || proc.includes('acl')) {
      activities = [
        ['Morning Quad Sets & Joint Pumps (15 min)', 'Joint Mobility', '08:30:00'],
        ['Targeted Cryotherapy & Cold Wrap (20 min)', 'Swelling Management', '11:00:00'],
        ['Prescribed Anti-inflammatory & Pain Medication', 'Medication', '13:00:00'],
        ['Assisted Range-of-Motion Flexion Exercises', 'Physical Therapy', '16:30:00']
      ];
    } else if (proc.includes('spine') || proc.includes('lumbar') || proc.includes('back') || proc.includes('disc')) {
      activities = [
        ['Log-Roll Core Stabilization & Posture Check', 'Spine Care', '08:30:00'],
        ['Lumbar Cold Compression Wrap (20 min)', 'Pain Relief', '11:00:00'],
        ['Prescribed Analgesic Medication & Rest', 'Medication', '13:00:00'],
        ['Flat-Surface Recovery Ambulation (15 min)', 'Mobility', '17:00:00']
      ];
    } else {
      activities = [
        ['Morning Gentle Mobility Routine (15 min)', 'Physical Therapy', '08:30:00'],
        ['Targeted Cold Compression / Wound Check (20 min)', 'Pain & Swelling Management', '11:00:00'],
        ['Prescribed Post-Op Medication', 'Medication', '13:00:00'],
        ['Evening Rest & Range-of-Motion Exercises', 'Physical Therapy', '16:30:00']
      ];
    }

    for (const act of activities) {
      await connection.query(
        `INSERT INTO scheduled_activities (plan_id, activity_name, description, scheduled_time, activity_date, is_completed)
         VALUES (?, ?, ?, ?, CURDATE(), 0)`,
        [planId, act[0], act[1], act[2]]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: {
        patient_id: patientId,
        user_id: userId,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        assigned_doctor_id: 1,
        discharge_date: dischargeDate,
        recovery_title: planTitle,
        plan_status: 'active',
        latest_pain_score: null,
        pending_alerts_count: 0
      }
    });
  } catch (error) {
    await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }
    console.error('Create patient error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create patient account'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;