import React from 'react';
import { Info } from 'lucide-react';

export default function AlertBanner() {
  return (
    <div style={{
      backgroundColor: 'var(--bg-app)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '0.35rem 1.5rem',
      fontSize: '0.74rem',
      color: 'var(--text-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.45rem'
    }}>
      <Info size={13} color="var(--color-primary-accent)" style={{ flexShrink: 0 }} />
      <span>
        CarePath Demonstration — Synthetic patient recovery records for clinical workflow evaluation. Non-diagnostic.
      </span>
    </div>
  );
}
