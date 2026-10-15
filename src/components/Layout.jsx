import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useCarePath } from '../context/CarePathContext';
import AlertBanner from './AlertBanner';
import {
  LayoutDashboard,
  Users,
  FileText,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Calendar,
  LogOut,
  RefreshCw,
  Menu,
  X
} from 'lucide-react';

export default function Layout() {
  const { currentUser, logout, resetDemoData, alerts } = useCarePath();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingAlertCount = alerts.filter(
    a => a.status === 'Requires Review' || a.status === 'pending'
  ).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!currentUser) return [];

    const role = (currentUser.role || '').toLowerCase();

    if (role === 'doctor') {
      return [
        { path: '/doctor/dashboard', label: 'Overview', icon: LayoutDashboard },
        { path: '/doctor/patients', label: 'Patients', icon: Users },
        { path: '/doctor/plans', label: 'Recovery Plans', icon: FileText },
        { path: '/doctor/checkins', label: 'Daily Check-ins', icon: CalendarCheck },
        { path: '/doctor/analytics', label: 'Analytics & Trends', icon: TrendingUp },
        {
          path: '/doctor/alerts',
          label: 'Review Alerts',
          icon: AlertTriangle,
          badge: pendingAlertCount > 0 ? pendingAlertCount : null
        }
      ];
    }

    if (role === 'patient') {
      return [
        { path: '/patient/plan', label: 'My Recovery Plan', icon: FileText },
        { path: '/patient/checkins', label: 'Daily Check-in', icon: CalendarCheck },
        { path: '/patient/analytics', label: 'Progress & Trends', icon: TrendingUp },
        { path: '/patient/followups', label: 'Follow-up Care', icon: Calendar }
      ];
    }

    if (role === 'admin') {
      return [
        { path: '/admin/overview', label: 'Platform Overview', icon: LayoutDashboard },
        { path: '/admin/users', label: 'User Directory', icon: Users },
        { path: '/admin/assignments', label: 'Doctor Assignments', icon: UserCheck },
        { path: '/admin/accounts', label: 'Account Status', icon: ShieldCheck }
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Quiet Banner */}
      <AlertBanner />

      <div className="app-container">
        {/* Sidebar */}
        <aside
          className="app-sidebar"
          style={{
            display: mobileMenuOpen ? 'flex' : undefined,
          }}
        >
          {/* Brand header - Text-only wordmark CarePath */}
          <div style={{
            padding: '1.25rem 1.4rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <span className="brand-text">CarePath</span>
              <span style={{
                display: 'block',
                fontSize: '0.72rem',
                color: 'var(--text-muted)',
                fontWeight: 500,
                marginTop: '0.1rem'
              }}>
                Post-Discharge Recovery
              </span>
            </div>
            {mobileMenuOpen && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Navigation Items */}
          <nav style={{ padding: '0.85rem 0.65rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'var(--color-active-nav-bg)' : 'transparent',
                    borderLeft: isActive ? '2.5px solid var(--color-primary-accent)' : '2.5px solid transparent',
                    transition: 'all 0.12s ease'
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <Icon size={16} color="currentColor" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{
                      backgroundColor: 'var(--color-terracotta)',
                      color: 'var(--color-white)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.1rem 0.4rem',
                      borderRadius: 'var(--radius-pill)'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Clean Bottom Section: User Info & Actions */}
          <div style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'var(--color-active-nav-bg)',
                color: 'var(--color-primary-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.78rem'
              }}>
                {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CP'}
              </div>
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden'
                }}>
                  {currentUser?.name || 'User'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {currentUser?.role}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.35rem' }}>
              <button
                onClick={() => {
                  if (window.confirm('Reset demonstration data to defaults?')) {
                    resetDemoData();
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: 0
                }}
                title="Reset demo data"
              >
                <RefreshCw size={12} />
                <span>Reset Data</span>
              </button>

              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-accent)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: 0
                }}
              >
                <LogOut size={12} />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <div className="app-main">
          {/* Top Bar */}
          <header className="app-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                className="mobile-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                style={{
                  display: 'none',
                  background: 'none',
                  border: '1px solid var(--border-medium)',
                  padding: '0.35rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
              >
                <Menu size={18} color="var(--text-secondary)" />
              </button>

              <span style={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                letterSpacing: '0.01em'
              }}>
                {(currentUser?.role || '').toLowerCase() === 'doctor' && 'Physician Recovery Console'}
                {(currentUser?.role || '').toLowerCase() === 'patient' && 'Patient Recovery Portal'}
                {(currentUser?.role || '').toLowerCase() === 'admin' && 'Platform Administration'}
              </span>
            </div>

            {/* Quiet User Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-terracotta" style={{ fontSize: '0.7rem' }}>
                {currentUser?.role}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.76rem' }}
              >
                <LogOut size={12} />
                <span>Sign out</span>
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="app-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
