import React, { useState } from 'react';
import { Menu, ShieldCheck, ExternalLink, Search, Bell, User, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ title, toggleSidebar }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/students?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header style={{
      height: '70px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.03)'
    }}>
      {/* Title & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          onClick={toggleSidebar}
          style={{
            background: 'none',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}
          className="lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
            {title || 'Dashboard'}
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0', fontWeight: '500' }}>
            Mastermind Certificate Management System
          </p>
        </div>
      </div>

      {/* Center Search & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} className="input-with-icon" style={{ width: '280px' }}>
          <Search size={16} className="input-icon" />
          <input
            type="text"
            className="form-control"
            placeholder="Search student or certificate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ fontSize: '0.8125rem', height: '38px', borderRadius: '10px', backgroundColor: '#f8fafc' }}
          />
        </form>

        {/* Public Verification Link */}
        <Link
          to="/verify/CERT-2026-000001"
          target="_blank"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: '#2563eb',
            textDecoration: 'none',
            padding: '0.5rem 0.875rem',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe'
          }}
        >
          <ShieldCheck size={16} />
          <span>Verify Portal</span>
          <ExternalLink size={12} />
        </Link>

        {/* Notification Bell */}
        <div style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Bell size={18} color="#475569" />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#2563eb'
          }}></span>
        </div>

        {/* User Profile Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.375rem 0.75rem',
          borderRadius: '12px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '0.875rem'
          }}>
            A
          </div>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
              Admin User
            </p>
            <p style={{ fontSize: '0.675rem', color: '#10b981', margin: 0, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <CheckCircle2 size={10} /> Active
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
