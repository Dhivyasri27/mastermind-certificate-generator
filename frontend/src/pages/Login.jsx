import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, GraduationCap, ArrowRight } from 'lucide-react';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@college.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await authAPI.login(email, password);
      
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or server offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoCredentials = () => {
    setEmail('admin@college.edu');
    setPassword('admin123');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0f172a',
      backgroundImage: 'radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.15) 0px, transparent 50%)',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)'
          }}>
            <GraduationCap size={36} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.375rem' }}>
            Administrator Login
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Student Certificate Generator System
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.875rem',
            marginBottom: '1.25rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Testing or Demo Purpose?
          </p>
          <button
            type="button"
            onClick={handleDemoCredentials}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.375rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Fill Default Admin Credentials (admin@college.edu)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
