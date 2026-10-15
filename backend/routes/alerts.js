
const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all alerts
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        a.id,
        a.patient_id,
        u.full_name AS patient_name,
        a.check_in_id,
        a.reason,
        a.severity,
        a.status,
        a.created_at,
        a.reviewed_at
      FROM alerts a
      JOIN patients p ON p.id = a.patient_id
      JOIN users u ON u.id = p.user_id
      ORDER BY
        CASE a.severity
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          ELSE 3
        END,
        a.created_at DESC
    `);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('Fetch alerts:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts'
    });
  }
});

// Mark an alert as reviewed
router.patch('/:id/review', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE alerts
       SET status = 'reviewed', reviewed_at = NOW()
       WHERE id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({ success: true, message: 'Alert marked as reviewed' });
  } catch (error) {
    console.error('Review alert:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert'
    });
  }
});

module.exports = router;
