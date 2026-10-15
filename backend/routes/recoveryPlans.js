
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all recovery plans
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        rp.id,
        rp.patient_id,
        pu.full_name AS patient_name,
        rp.doctor_id,
        du.full_name AS doctor_name,
        rp.title,
        rp.instructions,
        rp.start_date,
        rp.end_date,
        rp.status
      FROM recovery_plans rp
      JOIN patients p ON p.id = rp.patient_id
      JOIN users pu ON pu.id = p.user_id
      JOIN users du ON du.id = rp.doctor_id
      ORDER BY rp.created_at DESC
    `);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Fetch recovery plans:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recovery plans'
    });
  }
});

// GET recovery plan for one patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const [plans] = await pool.query(`
      SELECT
        rp.id,
        rp.patient_id,
        pu.full_name AS patient_name,
        rp.doctor_id,
        du.full_name AS doctor_name,
        rp.title,
        rp.instructions,
        rp.start_date,
        rp.end_date,
        rp.status,
        rp.created_at
      FROM recovery_plans rp
      JOIN patients p ON p.id = rp.patient_id
      JOIN users pu ON pu.id = p.user_id
      JOIN users du ON du.id = rp.doctor_id
      WHERE rp.patient_id = ?
      ORDER BY rp.created_at DESC
      LIMIT 1
    `, [req.params.patientId]);

    if (plans.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No recovery plan found for this patient'
      });
    }

    const plan = plans[0];
    const [activities] = await pool.query(`
      SELECT id, activity_name AS title, description AS category, scheduled_time AS time, is_completed AS completed
      FROM scheduled_activities
      WHERE plan_id = ?
      ORDER BY scheduled_time ASC
    `, [plan.id]);

    plan.scheduledActivities = activities.map(a => ({
      ...a,
      completed: Boolean(a.completed)
    }));

    res.json({ success: true, data: plan });
  } catch (error) {
    console.error('Fetch patient recovery plan:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient recovery plan'
    });
  }
});

// CREATE a recovery plan
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      patient_id,
      doctor_id,
      title,
      instructions,
      start_date,
      end_date,
      scheduledActivities,
      scheduled_activities
    } = req.body;

    let doctorId = doctor_id ? Number(doctor_id) : null;
    if (!doctorId) {
      const [doctorRows] = await connection.query("SELECT id FROM users WHERE role = 'doctor' ORDER BY id ASC LIMIT 1");
      doctorId = doctorRows.length > 0 ? doctorRows[0].id : 1;
    }

    if (!patient_id || !title || !start_date) {
      return res.status(400).json({
        success: false,
        message: 'patient_id, title and start_date are required'
      });
    }

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO recovery_plans
       (patient_id, doctor_id, title, instructions, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [
        Number(patient_id),
        doctorId,
        title.trim(),
        instructions || null,
        start_date,
        end_date || null
      ]
    );

    const planId = result.insertId;

    const acts = scheduledActivities || scheduled_activities || [];
    if (Array.isArray(acts) && acts.length > 0) {
      for (const act of acts) {
        await connection.query(
          `INSERT INTO scheduled_activities (plan_id, activity_name, description, scheduled_time, activity_date, is_completed)
           VALUES (?, ?, ?, ?, CURDATE(), ?)`,
          [
            planId,
            act.title || act.activity_name || 'Recovery Activity',
            act.category || act.description || 'Physiotherapy',
            '09:00:00',
            act.completed ? 1 : 0
          ]
        );
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Recovery plan created successfully',
      id: planId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create recovery plan:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create recovery plan'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
