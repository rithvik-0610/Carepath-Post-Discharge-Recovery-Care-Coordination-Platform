
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all check-ins
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.id,
        c.patient_id,
        u.full_name AS patient_name,
        c.check_in_date,
        c.pain_score,
        c.sleep_quality,
        c.mobility,
        c.symptoms,
        c.notes
      FROM check_ins c
      JOIN patients p ON p.id = c.patient_id
      JOIN users u ON u.id = p.user_id
      ORDER BY c.check_in_date DESC, c.id DESC
    `);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Fetch check-ins:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch check-ins'
    });
  }
});

// GET check-ins for one patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM check_ins
       WHERE patient_id = ?
       ORDER BY check_in_date DESC`,
      [req.params.patientId]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Patient check-ins:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient check-ins'
    });
  }
});

// CREATE a check-in and generate a review alert when needed
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      patient_id,
      check_in_date,
      pain_score,
      sleep_quality,
      mobility,
      symptoms,
      notes
    } = req.body;

    const score = Number(pain_score);

    if (
      !patient_id ||
      !check_in_date ||
      pain_score === undefined ||
      pain_score === null ||
      !Number.isInteger(score) ||
      score < 0 ||
      score > 10
    ) {
      return res.status(400).json({
        success: false,
        message: 'Valid patient_id, check_in_date and pain_score (0–10) are required'
      });
    }

    // Confirm that this patient exists
    const [patients] = await connection.query(
      'SELECT id FROM patients WHERE id = ?',
      [patient_id]
    );

    if (patients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    let normalizedSleep = null;
    if (sleep_quality) {
      const sq = String(sleep_quality).toLowerCase();
      if (sq.includes('poor')) normalizedSleep = 'poor';
      else if (sq.includes('fair') || sq.includes('interrupted')) normalizedSleep = 'fair';
      else if (sq.includes('normal') || sq.includes('good')) normalizedSleep = 'good';
      else if (sq.includes('restful') || sq.includes('excellent')) normalizedSleep = 'excellent';
      else if (['poor', 'fair', 'good', 'excellent'].includes(sq)) normalizedSleep = sq;
    }

    const normalizedSymptoms = Array.isArray(symptoms)
      ? symptoms.join(', ')
      : (symptoms ? String(symptoms) : null);

    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO check_ins
       (patient_id, check_in_date, pain_score, sleep_quality, mobility, symptoms, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         id = LAST_INSERT_ID(id),
         pain_score = VALUES(pain_score),
         sleep_quality = VALUES(sleep_quality),
         mobility = VALUES(mobility),
         symptoms = VALUES(symptoms),
         notes = VALUES(notes)`,
      [
        patient_id,
        check_in_date,
        score,
        normalizedSleep,
        mobility || null,
        normalizedSymptoms,
        notes || null
      ]
    );

    const checkinId = result.insertId;
    let alertCreated = false;

    // Rule: pain score of 7 or higher needs doctor review
    if (score >= 7) {
      const [existingAlert] = await connection.query(
        'SELECT id FROM alerts WHERE patient_id = ? AND check_in_id = ?',
        [patient_id, checkinId]
      );

      if (existingAlert.length === 0) {
        await connection.query(
          `INSERT INTO alerts
           (patient_id, check_in_id, reason, severity, status)
           VALUES (?, ?, ?, ?, 'pending')`,
          [
            patient_id,
            checkinId,
            `Patient reported a pain score of ${score}/10. Review recommended.`,
            score >= 9 ? 'high' : 'medium'
          ]
        );
      } else {
        await connection.query(
          `UPDATE alerts
           SET reason = ?, severity = ?, status = 'pending'
           WHERE id = ?`,
          [
            `Patient reported a pain score of ${score}/10. Review recommended.`,
            score >= 9 ? 'high' : 'medium',
            existingAlert[0].id
          ]
        );
      }

      alertCreated = true;
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Daily check-in saved',
      id: result.insertId,
      alertCreated
    });
  } catch (error) {
    await connection.rollback();

    console.error('Create check-in:', error.message);

    res.status(error.code === 'ER_DUP_ENTRY' ? 409 : 500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY'
        ? 'A check-in already exists for this patient on that date'
        : 'Failed to save check-in'
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
