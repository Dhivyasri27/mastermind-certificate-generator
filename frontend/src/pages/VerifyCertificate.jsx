import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, GraduationCap, CheckCircle, Clock, Building2, Calendar, Award } from 'lucide-react';
import { verifyAPI } from '../services/api';

const VerifyCertificate = () => {
  const { certificate_id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (certificate_id) {
      verifyCertificateId();
    }
  }, [certificate_id]);

  const verifyCertificateId = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await verifyAPI.verifyCertificate(certificate_id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Certificate ID not found or unverified.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: '1.5rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <ShieldCheck size={48} color="#3b82f6" className="spin" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>Verifying Certificate Authenticity...</p>
        </div>
      </div>
    );
  }

  const isValid = data && data.valid;
  const cert = data?.certificate;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      backgroundImage: 'radial-gradient(at 50% 0%, rgba(37, 99, 235, 0.2) 0px, transparent 70%)',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative'
      }}>
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.75rem auto',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)'
          }}>
            <GraduationCap size={32} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
            Mastermind Techno Solution & Krishnaa Institute
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
            Official Public Certificate Verification System
          </p>
        </div>

        {/* Verification Status Badge */}
        {isValid ? (
          <div>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '2px solid #bbf7d0',
              borderRadius: '16px',
              padding: '1.25rem',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              <CheckCircle size={40} color="#166534" style={{ margin: '0 auto 0.5rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#166534', margin: 0 }}>
                AUTHENTIC & VALID CERTIFICATE
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#15803d', marginTop: '0.25rem' }}>
                Certificate ID: <strong>{cert.certificate_id}</strong>
              </p>
            </div>

            {/* Certificate Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recipient Student Name
                </p>
                <h2 style={{ fontSize: '2rem', fontFamily: 'AlexBrush, cursive', color: '#0d253f', margin: '0.25rem 0' }}>
                  {cert.student_name}
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Register Number</p>
                  <p style={{ fontSize: '0.9375rem', fontWeight: '700', color: '#0f172a' }}><code>{cert.register_number}</code></p>
                </div>

                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Department</p>
                  <p style={{ fontSize: '0.9375rem', fontWeight: '600', color: '#0f172a' }}>{cert.department}</p>
                </div>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Course / Event Title</p>
                <p style={{ fontSize: '1rem', fontWeight: '800', color: '#1e40af' }}>{cert.course_name}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Course Dates & Duration</p>
                  <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#334155' }}>
                    {cert.start_date} to {cert.end_date} ({cert.duration})
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Issued Date</p>
                  <p style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#334155' }}>{cert.issued_date || cert.date}</p>
                </div>
              </div>

              <div style={{ paddingTop: '0.75rem', borderTop: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>Issuing Institution</p>
                <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>{cert.college_name}</p>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1.5rem' }}>
              Verified securely via MongoDB Atlas & Mastermind QR Signature Verification API.
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <ShieldAlert size={48} color="#dc2626" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#991b1b', marginBottom: '0.5rem' }}>
              UNVERIFIED OR INVALID CERTIFICATE
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#7f1d1d', marginBottom: '1.5rem' }}>
              {error || `No valid record found for Certificate ID '${certificate_id}'.`}
            </p>
            <Link to="/login" className="btn btn-secondary">
              Back to Portal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
