import React from 'react';

const DashboardCard = ({ title, value, subtext, icon: Icon, color = 'blue' }) => {
  const colorStyles = {
    blue: { bg: '#eff6ff', iconBg: '#2563eb', text: '#1e40af', border: '#bfdbfe' },
    green: { bg: '#f0fdf4', iconBg: '#10b981', text: '#15803d', border: '#bbf7d0' },
    amber: { bg: '#fffbeb', iconBg: '#f59e0b', text: '#b45309', border: '#fef3c7' },
    purple: { bg: '#faf5ff', iconBg: '#7c3aed', text: '#6b21a8', border: '#e9d5ff' },
  };

  const currentStyle = colorStyles[color] || colorStyles.blue;

  return (
    <div className="glass-card" style={{
      padding: '1.5rem',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
          {title}
        </p>
        <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1, marginBottom: '0.375rem' }}>
          {value}
        </h3>
        {subtext && (
          <p style={{ fontSize: '0.75rem', fontWeight: '500', color: currentStyle.text }}>
            {subtext}
          </p>
        )}
      </div>

      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '12px',
        backgroundColor: currentStyle.iconBg,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 8px 16px ${currentStyle.iconBg}40`
      }}>
        {Icon && <Icon size={26} />}
      </div>
    </div>
  );
};

export default DashboardCard;
