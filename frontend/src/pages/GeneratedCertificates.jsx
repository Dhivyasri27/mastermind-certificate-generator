import React, { useState, useEffect } from 'react';
import { Download, ShieldCheck, Trash2, Search, ExternalLink, FileArchive } from 'lucide-react';
import { certificateAPI } from '../services/api';

const GeneratedCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, [page, search]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const res = await certificateAPI.getCertificates({ page, limit, search });
      setCertificates(res.data.certificates || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch generated certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cert) => {
    if (window.confirm(`Delete certificate '${cert.certificate_id}' for student ${cert.student_name}?`)) {
      try {
        await certificateAPI.deleteCertificate(cert.id || cert._id);
        fetchCertificates();
      } catch (err) {
        alert('Failed to delete certificate record.');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            Generated Certificates History
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            View, download individual high-res PDFs, or export all certificates in a ZIP bundle.
          </p>
        </div>

        <a
          href={certificateAPI.getZipDownloadUrl()}
          download
          className="btn btn-success"
          style={{ textDecoration: 'none' }}
        >
          <FileArchive size={16} />
          <span>Download All as ZIP Bundle</span>
        </a>
      </div>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', maxWidth: '500px' }}>
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search by Certificate ID, Student Name, or Reg No..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Certificate ID</th>
              <th>Student Name</th>
              <th>Register No</th>
              <th>Course / Event</th>
              <th>Generated Date</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {certificates.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No generated certificates found.
                </td>
              </tr>
            ) : (
              certificates.map((cert) => (
                <tr key={cert.id || cert._id}>
                  <td>
                    <span className="badge badge-info">{cert.certificate_id}</span>
                  </td>
                  <td style={{ fontWeight: '700', color: '#0f172a' }}>{cert.student_name}</td>
                  <td><code>{cert.register_number}</code></td>
                  <td style={{ fontSize: '0.8125rem' }}>{cert.course_name}</td>
                  <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {cert.generated_at ? new Date(cert.generated_at).toLocaleString() : 'Recent'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                      <a
                        href={certificateAPI.getDownloadUrl(cert.file_name)}
                        download
                        className="btn btn-sm btn-primary"
                        style={{ textDecoration: 'none' }}
                        title="Download PDF"
                      >
                        <Download size={13} />
                        <span>PDF</span>
                      </a>

                      <a
                        href={`/verify/${cert.certificate_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-secondary"
                        title="Public QR Verification Page"
                      >
                        <ShieldCheck size={13} />
                        <ExternalLink size={10} />
                      </a>

                      <button
                        onClick={() => handleDelete(cert)}
                        className="btn btn-sm btn-danger"
                        title="Delete Certificate"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GeneratedCertificates;
