import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CarePathProvider, useCarePath } from './context/CarePathContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientManagement from './pages/doctor/PatientManagement';
import RecoveryPlanManagement from './pages/doctor/RecoveryPlanManagement';
import DailyCheckinsReview from './pages/doctor/DailyCheckinsReview';
import DoctorRecoveryAnalytics from './pages/doctor/RecoveryAnalytics';
import RuleBasedAlerts from './pages/doctor/RuleBasedAlerts';

// Patient Pages
import RecoveryPlanView from './pages/patient/RecoveryPlanView';
import DailyCheckinSubmit from './pages/patient/DailyCheckinSubmit';
import RecoveryAnalyticsTimeline from './pages/patient/RecoveryAnalyticsTimeline';
import UpcomingFollowups from './pages/patient/UpcomingFollowups';

// Admin Pages
import PlatformOverview from './pages/admin/PlatformOverview';
import UserManagement from './pages/admin/UserManagement';
import DoctorAssignments from './pages/admin/DoctorAssignments';
import AccountManagement from './pages/admin/AccountManagement';

// Role Guard Component
function RequireAuth({ children, allowedRoles }) {
  const { currentUser } = useCarePath();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = (currentUser.role || '').toLowerCase();
  const allowed = (allowedRoles || []).map(r => String(r).toLowerCase());

  if (allowed.length > 0 && !allowed.includes(role)) {
    // Redirect to default page for user's actual role
    if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (role === 'patient') return <Navigate to="/patient/plan" replace />;
    if (role === 'admin') return <Navigate to="/admin/overview" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Root redirect based on role
function RootRedirect() {
  const { currentUser } = useCarePath();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = (currentUser.role || '').toLowerCase();
  if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  if (role === 'patient') return <Navigate to="/patient/plan" replace />;
  if (role === 'admin') return <Navigate to="/admin/overview" replace />;

  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <CarePathProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Application Workspace */}
          <Route path="/" element={<Layout />}>
            <Route index element={<RootRedirect />} />

            {/* Doctor Routes (Six Core Modules) */}
            <Route
              path="doctor/dashboard"
              element={
                <RequireAuth allowedRoles={['Doctor']}>
                  <DoctorDashboard />
                </RequireAuth>
              }
            />
            <Route
              path="doctor/patients"
              element={
                <RequireAuth allowedRoles={['Doctor']}>
                  <PatientManagement />
                </RequireAuth>
              }
            />
            <Route
              path="doctor/plans"
              element={
                <RequireAuth allowedRoles={['Doctor']}>
                  <RecoveryPlanManagement />
                </RequireAuth>
              }
            />
            <Route
              path="doctor/checkins"
              element={
                <RequireAuth allowedRoles={['Doctor']}>
                  <DailyCheckinsReview />
                </RequireAuth>
              }
            />
            <Route
              path="doctor/analytics"
              element={
                <RequireAuth allowedRoles={['Doctor']}>
                  <DoctorRecoveryAnalytics />
                </RequireAuth>
              }
            />
            <Route
              path="doctor/alerts"
              element={
                <RequireAuth allowedRoles={['Doctor']}>
                  <RuleBasedAlerts />
                </RequireAuth>
              }
            />

            {/* Patient Routes */}
            <Route
              path="patient/plan"
              element={
                <RequireAuth allowedRoles={['Patient']}>
                  <RecoveryPlanView />
                </RequireAuth>
              }
            />
            <Route
              path="patient/checkins"
              element={
                <RequireAuth allowedRoles={['Patient']}>
                  <DailyCheckinSubmit />
                </RequireAuth>
              }
            />
            <Route
              path="patient/analytics"
              element={
                <RequireAuth allowedRoles={['Patient']}>
                  <RecoveryAnalyticsTimeline />
                </RequireAuth>
              }
            />
            <Route
              path="patient/followups"
              element={
                <RequireAuth allowedRoles={['Patient']}>
                  <UpcomingFollowups />
                </RequireAuth>
              }
            />

            {/* Admin Routes */}
            <Route
              path="admin/overview"
              element={
                <RequireAuth allowedRoles={['Admin']}>
                  <PlatformOverview />
                </RequireAuth>
              }
            />
            <Route
              path="admin/users"
              element={
                <RequireAuth allowedRoles={['Admin']}>
                  <UserManagement />
                </RequireAuth>
              }
            />
            <Route
              path="admin/assignments"
              element={
                <RequireAuth allowedRoles={['Admin']}>
                  <DoctorAssignments />
                </RequireAuth>
              }
            />
            <Route
              path="admin/accounts"
              element={
                <RequireAuth allowedRoles={['Admin']}>
                  <AccountManagement />
                </RequireAuth>
              }
            />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </CarePathProvider>
  );
}
