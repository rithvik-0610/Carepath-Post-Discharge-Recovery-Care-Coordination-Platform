const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = require('./db');
const patientRoutes = require('./routes/patients');
const recoveryPlanRoutes = require('./routes/recoveryPlans');
const checkinRoutes = require('./routes/checkins');
const alertRoutes = require('./routes/alerts');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(express.json());

// Authentication
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CarePath API is running!'
  });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT DATABASE() AS databaseName'
    );

    res.json({
      success: true,
      message: 'MySQL connected successfully!',
      database: rows[0].databaseName
    });
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(500).json({
      success: false,
      message: 'MySQL connection failed'
    });
  }
});

// Other API routes
app.use('/api/patients', patientRoutes);
app.use('/api/recovery-plans', recoveryPlanRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/alerts', alertRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`CarePath API running at http://localhost:${PORT}`);
});