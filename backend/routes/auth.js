const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Register a new patient
router.post('/register', async (req, res) => {
  const { full_name, email, password, date_of_birth } = req.body;

  if (!full_name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email and password are required'
    });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 8 characters'
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await connection.query(
      `INSERT INTO users
       (full_name, email, password_hash, role)
       VALUES (?, ?, ?, 'patient')`,
      [
        full_name.trim(),
        email.trim().toLowerCase(),
        passwordHash
      ]
    );

    // Dynamically resolve active doctor or passed doctor_id
    let assignedDoctorId = req.body.doctor_id ? Number(req.body.doctor_id) : null;
    if (!assignedDoctorId) {
      const [doctorRows] = await connection.query(
        "SELECT id FROM users WHERE role = 'doctor' ORDER BY id ASC LIMIT 1"
      );
      assignedDoctorId = doctorRows.length > 0 ? doctorRows[0].id : 1;
    }

    const [patientResult] = await connection.query(
      `INSERT INTO patients (user_id, assigned_doctor_id, date_of_birth, discharge_date)
       VALUES (?, ?, ?, CURDATE())`,
      [result.insertId, assignedDoctorId, date_of_birth || null]
    );

    const newPatientId = patientResult.insertId;

    // Create default recovery plan for the registered patient
    const [planResult] = await connection.query(
      `INSERT INTO recovery_plans (patient_id, doctor_id, title, instructions, start_date, end_date, status)
       VALUES (?, ?, 'Post-Discharge Rehabilitation & Recovery Protocol', 'Follow prescribed activity guidelines, monitor daily pain and surgical site healing, and submit daily check-in reports.', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active')`,
      [newPatientId, assignedDoctorId]
    );

    const planId = planResult.insertId;

    // Create 4 initial scheduled activities
    await connection.query(
      `INSERT INTO scheduled_activities (plan_id, activity_name, description, scheduled_time, activity_date, is_completed)
       VALUES 
       (?, 'Morning Mobility Routine (15 min)', 'Physical Therapy', '08:30:00', CURDATE(), 0),
       (?, 'Targeted Cryotherapy / Ice Application (20 min)', 'Pain & Swelling Management', '11:00:00', CURDATE(), 0),
       (?, 'Prescribed Post-Op Medication', 'Medication', '13:00:00', CURDATE(), 0),
       (?, 'Evening Range-of-Motion Exercises', 'Physical Therapy', '16:30:00', CURDATE(), 0)`,
      [planId, planId, planId, planId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Registration successful! You can now log in.'
    });
  } catch (error) {
    await connection.rollback();

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    console.error('Registration error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  } finally {
    connection.release();
  }
});

// Log in an existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const [users] = await pool.query(
      `SELECT id, full_name, email, password_hash, role, is_active
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (
      users.length === 0 ||
      !users[0].is_active ||
      !users[0].password_hash
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];
    const matches = await bcrypt.compare(password, user.password_hash);

    if (!matches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from backend/.env');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    let patientId = null;
    if (user.role === 'patient') {
      const [patientRows] = await pool.query(
        'SELECT id FROM patients WHERE user_id = ? LIMIT 1',
        [user.id]
      );
      if (patientRows.length > 0) {
        patientId = patientRows[0].id;
      }
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        patient_id: patientId,
        name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);

    res.status(500).json({
      success: false,
      message: 'Login failed due to a server error'
    });
  }
});

module.exports = router;