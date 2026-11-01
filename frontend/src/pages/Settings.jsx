import React, { useState } from 'react';
import { Save, ShieldCheck, Server, Globe, Key, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [institutionName, setInstitutionName] = useState('Krishnaa Institute of Skill Development & Entrepreneurship');
  const [partnerName, setPartnerName] = useState('Mastermind Techno Solution');
  const [adminEmail, setAdminEmail] = useState('admin@college.edu');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setMsg('Settings updated successfully!');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
          System & Institution Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Configure institution credentials, security keys, and environment deployment status.
        </p>
      </div>

      {msg && (
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle size={16} />
          {msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Main Settings Form */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <form onSubmit={handleSaveSettings}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
              Institution & Branding Configuration
            </h3>

            <div className="form-group">
              <label className="form-label">College / Institution Name</label>
              <input
                type="text"
                className="form-control"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technical Partner Name</label>
              <input
                type="text"
                className="form-control"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
              />
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginTop: '2rem', marginBottom: '1rem' }}>
              Administrator Account & Security
            </h3>

            <div className="form-group">
              <label className="form-label">Admin Email</label>
              <input
                type="email"
                className="form-control"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button type="submit" className="btn btn-primary">
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>

        {/* System Deployment Info Panel */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={20} color="#2563eb" />
            Deployment Status
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>FRONTEND HOSTING</p>
              <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Globe size={14} color="#10b981" /> Vercel (Production Ready)
              </p>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>BACKEND REST API</p>
              <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Server size={14} color="#10b981" /> Render / Flask Python 3.13
              </p>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>DATABASE</p>
              <p style={{ fontSize: '0.875rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <ShieldCheck size={14} color="#10b981" /> MongoDB Atlas / Mongomock
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
