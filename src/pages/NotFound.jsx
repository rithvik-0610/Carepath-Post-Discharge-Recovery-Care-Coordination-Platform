import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <h1 className="brand-text" style={{ fontSize: '3rem' }}>404</h1>
      <h2 style={{ fontSize: '1.25rem', color: 'var(--color-deep-terracotta)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px' }}>
        The requested screen does not exist or requires a different user role.
      </p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
        Return to Dashboard
      </Link>
    </div>
  );
}
