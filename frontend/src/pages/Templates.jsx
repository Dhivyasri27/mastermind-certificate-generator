import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Plus, Sliders, Eye, Trash2, X, Upload } from 'lucide-react';
import { templateAPI } from '../services/api';

const Templates = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [templateName, setTemplateName] = useState('');
  const [certificateType, setCertificateType] = useState('Completion');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await templateAPI.getTemplates();
      setTemplates(res.data.templates || []);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadTemplate = async (e) => {
    e.preventDefault();
    if (!templateName.trim() || !file) {
      setError('Please provide template name and select an image file (PNG/JPG).');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('template_name', templateName);
      formData.append('certificate_type', certificateType);
      formData.append('file', file);

      const res = await templateAPI.uploadTemplate(formData);
      setShowUploadModal(false);
      setTemplateName('');
      setFile(null);
      fetchTemplates();

      // Launch Visual Designer immediately for newly uploaded template
      if (res.data.template) {
        navigate(`/templates/${res.data.template.id || res.data.template._id}/designer`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload template image.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async (tpl) => {
    if (window.confirm(`Are you sure you want to delete template '${tpl.template_name}'?`)) {
      try {
        await templateAPI.deleteTemplate(tpl.id || tpl._id);
        fetchTemplates();
      } catch (err) {
        alert('Failed to delete template.');
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            Certificate Templates Library
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Configure visual template backgrounds and dynamic text coordinates.
          </p>
        </div>

        <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
          <Plus size={16} />
          <span>Upload Custom Template</span>
        </button>
      </div>

      {/* Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {templates.map((tpl) => (
          <div key={tpl.id || tpl._id} className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Image Thumbnail */}
            <div style={{
              height: '240px',
              backgroundColor: '#f1f5f9',
              position: 'relative',
              overflow: 'hidden',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <img
                src={templateAPI.getImageUrl(tpl.image_path)}
                alt={tpl.template_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <span className="badge badge-purple" style={{ position: 'absolute', top: '12px', right: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                {tpl.certificate_type || 'Completion'}
              </span>
            </div>

            {/* Template Info */}
            <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                  {tpl.template_name}
                </h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Master Dimensions: {tpl.width || 1588} × {tpl.height || 2048} px | Dynamic Fields: {(tpl.fields || []).length}
                </p>
              </div>

              {/* Card Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => navigate(`/templates/${tpl.id || tpl._id}/designer`)}
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                >
                  <Sliders size={14} />
                  <span>Visual Designer</span>
                </button>

                <button
                  onClick={() => handleDeleteTemplate(tpl)}
                  className="btn btn-danger btn-sm"
                  title="Delete Template"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Template Modal */}
      {showUploadModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
                Upload Certificate Template Image
              </h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {error && (
              <div style={{ margin: '1rem 1.5rem 0 1.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleUploadTemplate} style={{ padding: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Template Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Mastermind Techno Solution Certificate 2026"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Certificate Type</label>
                <select
                  className="form-control"
                  value={certificateType}
                  onChange={(e) => setCertificateType(e.target.value)}
                >
                  <option value="Completion">Completion Certificate</option>
                  <option value="Participation">Participation Certificate</option>
                  <option value="Achievement">Achievement Certificate</option>
                  <option value="Internship">Internship Certificate</option>
                  <option value="Workshop">Workshop Certificate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Template Image File (PNG / JPG / JPEG) *</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="form-control"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" onClick={() => setShowUploadModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={uploading} className="btn btn-primary">
                  <Upload size={16} />
                  <span>{uploading ? 'Uploading...' : 'Upload & Launch Designer'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Templates;
