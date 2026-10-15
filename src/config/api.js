// Centralized API configuration for local development and cloud deployment
export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  patients: `${API_BASE_URL}/api/patients`,
  checkins: `${API_BASE_URL}/api/checkins`,
  alerts: `${API_BASE_URL}/api/alerts`,
  recoveryPlans: `${API_BASE_URL}/api/recovery-plans`,
  dbTest: `${API_BASE_URL}/api/db-test`
};
