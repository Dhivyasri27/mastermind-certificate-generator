import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Upload, 
  Award, 
  FileCheck, 
  Sparkles, 
  Settings, 
  LogOut,
  GraduationCap
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Certificate', path: '/generate-certificate', icon: Sparkles },
    { name: 'Certificates', path: '/generated-certificates', icon: FileCheck },
    { name: 'Students Directory', path: '/students', icon: Users },
    { name: 'Upload Excel', path: '/upload-students', icon: Upload },
    { name: 'Templates', path: '/templates', icon: Award },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            zIndex: 40
          }}
          className="lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 bg-slate-900 text-slate-100 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      style={{
        backgroundColor: '#0f172a',
        width: '265px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid #1e293b',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)'
      }}>
        <div>
          {/* Brand Header */}
          <div style={{
            padding: '1.5rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.875rem',
            borderBottom: '1px solid #1e293b'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 0 16px rgba(37, 99, 235, 0.45)'
            }}>
              <GraduationCap size={26} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#f8fafc', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                Mastermind
              </h1>
              <p style={{ fontSize: '0.725rem', color: '#94a3b8', fontWeight: '600' }}>
                Certificates Engine
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '1.25rem 0.875rem' }}>
            <p style={{
              fontSize: '0.675rem',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#64748b',
              padding: '0 0.75rem 0.625rem 0.75rem'
            }}>
              Core Platform
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.725rem 1rem',
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? '#2563eb' : 'transparent',
                    boxShadow: isActive ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
                    textDecoration: 'none',
                    marginBottom: '0.375rem',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                  })}
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Admin Info & Logout */}
        <div style={{
          padding: '1.25rem 1.25rem',
          borderTop: '1px solid #1e293b',
          backgroundColor: '#0b1120'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: '700'
              }}>
                A
              </div>
              <div>
                <p style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
                  Administrator
                </p>
                <p style={{ fontSize: '0.7rem', color: '#64748b', margin: 0 }}>
                  admin@college.edu
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
