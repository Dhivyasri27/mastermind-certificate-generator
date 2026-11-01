import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, 
  FileCheck, 
  Clock, 
  Calendar,
  Upload, 
  Sparkles, 
  ArrowRight, 
  Download, 
  FileArchive,
  Eye,
  PlusCircle,
  Users
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { studentAPI, templateAPI, certificateAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalCertificates: 0,
    generatedToday: 0,
    thisMonth: 0,
    availableTemplates: 0,
  });

  const [recentCertificates, setRecentCertificates] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [stRes, tplRes, certRes] = await Promise.all([
        studentAPI.getStudents({ limit: 5 }),
        templateAPI.getTemplates(),
        certificateAPI.getCertificates({ limit: 5 })
      ]);

      const totalTpl = (tplRes.data.templates || []).length;
      const totalCert = certRes.data.total || 0;
      const certList = certRes.data.certificates || [];

      setStats({
        totalCertificates: totalCert,
        generatedToday: certList.length,
        thisMonth: totalCert,
        availableTemplates: totalTpl || 1
      });

      const tplList = tplRes.data.templates || [];
      const selectedActive = tplList.find((tpl) => tpl.is_active) || tplList[0] || null;

      setTemplates(tplList);
      setActiveTemplate(selectedActive);
      setRecentCertificates(certList);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top Header Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>
            Certificate Management SaaS Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            High-precision certificate generation, validation, and dynamic bulk PDF processing platform.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/upload-students')} className="btn btn-secondary">
            <Upload size={16} />
            <span>Upload Student Excel</span>
          </button>

          <button onClick={() => navigate('/generate-certificate')} className="btn btn-primary">
            <Sparkles size={16} />
            <span>Create Certificate</span>
          </button>

          <a
            href={certificateAPI.getZipDownloadUrl()}
            download
            className="btn btn-success"
            style={{ textDecoration: 'none' }}
          >
            <FileArchive size={16} />
            <span>Download All ZIP</span>
          </a>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid-stats">
        <DashboardCard
          title="Total Certificates"
          value={stats.totalCertificates}
          subtext="Total PDF certificates rendered"
          icon={FileCheck}
          color="blue"
        />
        <DashboardCard
          title="Generated Today"
          value={stats.generatedToday}
          subtext="Active today's session"
          icon={Clock}
          color="green"
        />
        <DashboardCard
          title="This Month"
          value={stats.thisMonth}
          subtext="Monthly issuance count"
          icon={Calendar}
          color="amber"
        />
        <DashboardCard
          title="Available Templates"
          value={stats.availableTemplates}
          subtext="High-resolution 1588x2048 canvas"
          icon={Award}
          color="purple"
        />
      </div>

      {/* Main Content Grid: Recent Certificates & Quick Actions / Template Preview */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Recent Certificates */}
        <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
              Recent Certificates
            </h3>
            <button
              onClick={() => navigate('/generated-certificates')}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8125rem', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <span>View All Certificates</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PDF Filename</th>
                  <th>Student Name</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentCertificates.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                      No certificates generated yet. Click "Create Certificate" to get started.
                    </td>
                  </tr>
                ) : (
                  recentCertificates.map((cert) => (
                    <tr key={cert.id || cert._id}>
                      <td><code style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: '600' }}>{cert.file_name}</code></td>
                      <td style={{ fontWeight: '700', color: '#0f172a' }}>{cert.student_name}</td>
                      <td><span className="badge badge-success">Generated</span></td>
                      <td>
                        <a
                          href={certificateAPI.getDownloadUrl(cert.file_name)}
                          download
                          className="btn btn-sm btn-outline"
                          style={{ textDecoration: 'none' }}
                        >
                          <Download size={12} />
                          <span>Download PDF</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions & Template Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Quick Actions Card */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '1rem' }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={() => navigate('/generate-certificate')}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Sparkles size={18} />
                <span>Create Single / Bulk Certificate</span>
              </button>

              <button
                onClick={() => navigate('/upload-students')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Upload size={18} color="#2563eb" />
                <span>Upload Student Excel File</span>
              </button>

              <button
                onClick={() => navigate('/students')}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }}
              >
                <Users size={18} color="#7c3aed" />
                <span>View Enrolled Students</span>
              </button>
            </div>
          </div>

          {/* Template Preview Card */}
          <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
                Active Template Preview
              </h3>
              <span className="badge badge-purple">1588 × 2048 px</span>
            </div>

            <div style={{
              width: '100%',
              height: '210px',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #cbd5e1',
              position: 'relative',
              backgroundColor: '#FAFBFD'
            }}>
              <img
                src={activeTemplate ? templateAPI.getImageUrl(activeTemplate.image_path) : templateAPI.getImageUrl('mastermind_certificate_template.png')}
                alt={activeTemplate ? activeTemplate.template_name : 'Active Certificate Template'}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
              onMouseLeave={(e) => e.currentTarget.style.opacity = 0}
              onClick={() => navigate('/templates')}
              >
                <span className="btn btn-primary btn-sm">
                  <Eye size={14} /> View Template Manager
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
