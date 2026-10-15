import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, trend }) {
  return (
    <div className="care-card" style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && <Icon size={16} color="var(--text-muted)" />}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.15rem' }}>
        <span style={{
          fontSize: '1.85rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1.15
        }}>
          {value}
        </span>
        {trend && (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: trend.isPositive ? 'var(--color-success)' : 'var(--color-primary-accent)',
            backgroundColor: trend.isPositive ? '#EFF6F1' : 'var(--color-active-nav-bg)',
            padding: '0.15rem 0.45rem',
            borderRadius: 'var(--radius-pill)'
          }}>
            {trend.text}
          </span>
        )}
      </div>

      {subtitle && (
        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
          {subtitle}
        </span>
      )}
    </div>
  );
}
