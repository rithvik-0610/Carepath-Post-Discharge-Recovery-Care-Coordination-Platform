import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCarePath } from '../context/CarePathContext';
import { ArrowRight } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const API_URL = API_ENDPOINTS.auth;

export default function Login() {
  const { login } = useCarePath();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isRegistering && password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isRegistering) {
        const response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName.trim(),
            email: email.trim(),
            password
          })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Registration failed.');
        }

        setSuccess('Account created successfully! You can now sign in.');
        setIsRegistering(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        // Authenticate directly through context
        const user = await login(email.trim(), password);
        const role = (user.role || '').toLowerCase();
        const routes = {
          patient: '/patient/plan',
          doctor: '/doctor/dashboard',
          admin: '/admin/overview'
        };

        if (!routes[role]) {
          throw new Error('This account has an unsupported role.');
        }

        navigate(routes[role]);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to CarePath. Check the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'var(--bg-app)'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-subtle)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '2.25rem 2rem 1.5rem',
          textAlign: 'center',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <span className="brand-text" style={{ fontSize: '1.85rem' }}>
            CarePath
          </span>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.84rem',
            marginTop: '0.25rem'
          }}>
            Post-Discharge Recovery &amp; Care Coordination
          </p>
        </div>

        <div style={{ padding: '1.75rem 2rem' }}>
          <h2 style={{
            margin: '0 0 0.4rem',
            fontSize: '1.2rem',
            color: 'var(--text-primary)'
          }}>
            {isRegistering ? 'Create your account' : 'Welcome back'}
          </h2>

          <p style={{
            margin: '0 0 1.25rem',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem'
          }}>
            {isRegistering
              ? 'Register as a patient to begin your recovery journey.'
              : 'Sign in with your registered email and password.'}
          </p>

          {error && (
            <div role="alert" style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              backgroundColor: '#FCE8E6',
              color: '#9B2420',
              fontSize: '0.84rem'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div role="status" style={{
              padding: '0.75rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              backgroundColor: '#E8F3E9',
              color: '#27623A',
              fontSize: '0.84rem'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                autoComplete={isRegistering ? 'new-password' : 'current-password'}
                minLength={isRegistering ? 8 : undefined}
                required
              />
            </div>

            {isRegistering && (
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '0.5rem',
                padding: '0.7rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer'
              }}
            >
              <span>
                {loading
                  ? 'Please wait...'
                  : isRegistering
                    ? 'Create Patient Account'
                    : 'Sign In'}
              </span>
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          <div style={{
            marginTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.84rem',
            color: 'var(--text-secondary)'
          }}>
            {isRegistering
              ? 'Already have an account? '
              : "Don't have an account? "}

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccess('');
                setPassword('');
                setConfirmPassword('');
              }}
              style={{
                border: 'none',
                background: 'none',
                padding: 0,
                color: 'var(--color-primary-accent)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {isRegistering ? 'Sign in' : 'Register'}
            </button>
          </div>

          {!isRegistering && (
            <p style={{
              marginTop: '1rem',
              fontSize: '0.76rem',
              lineHeight: 1.5,
              color: 'var(--text-muted)',
              textAlign: 'center'
            }}>
              Doctor and administrator accounts must be provisioned
              by an authorized administrator.
            </p>
          )}
        </div>

        <div style={{
          padding: '0.85rem 2rem',
          backgroundColor: 'var(--bg-app)',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          CarePath Demonstration Environment • Non-diagnostic clinical workflow
        </div>
      </div>
    </div>
  );
}