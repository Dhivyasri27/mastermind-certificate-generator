import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Award, 
  Users, 
  Download, 
  Printer, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  Calendar, 
  FileText, 
  User, 
  CheckCircle, 
  Loader, 
  ShieldCheck,
  Hash,
  Clock,
  Layers,
  X
} from 'lucide-react';
import { templateAPI, studentAPI, certificateAPI } from '../services/api';
import { useToast } from '../components/Toast';

const formatDateStr = (dStr) => {
  if (!dStr) return '';
  const s = String(dStr).trim();
  if (['none', 'null', 'nan', 'undefined', ''].includes(s.toLowerCase())) return '';
  const isoMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const [, yyyy, mm, dd] = isoMatch;
    return `${String(dd).padStart(2, '0')}.${String(mm).padStart(2, '0')}.${yyyy}`;
  }
  const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const [, dd, mm, yyyy] = dmyMatch;
    return `${String(dd).padStart(2, '0')}.${String(mm).padStart(2, '0')}.${yyyy}`;
  }
  return s;
};

const formatDurationStr = (durStr) => {
  if (!durStr) return '';
  const s = String(durStr).trim();
  if (['none', 'null', 'nan', 'undefined', ''].includes(s.toLowerCase())) return '';
  if (/^\d+$/.test(s)) return `${s} Hrs.`;
  const hrsMatch = s.match(/^(\d+)\s*(?:hrs?|hours?)\.?$/i);
  if (hrsMatch) return `${hrsMatch[1]} Hrs.`;
  const daysMatch = s.match(/^(\d+)\s*days?\.?$/i);
  if (daysMatch) return `${daysMatch[1]} Days`;
  return s;
};

const buildConductedText = (startDate, endDate, duration) => {
  const sDt = formatDateStr(startDate);
  const eDt = formatDateStr(endDate);
  const dDur = formatDurationStr(duration);
  if (sDt && eDt) {
    return `Conducted from ${sDt} to ${eDt}${dDur ? ` (${dDur})` : ''}`;
  } else if (sDt) {
    return `Conducted from ${sDt}${dDur ? ` (${dDur})` : ''}`;
  } else if (eDt) {
    return `Completed on ${eDt}${dDur ? ` (${dDur})` : ''}`;
  } else if (dDur) {
    return `Duration: ${dDur}`;
  }
  return '';
};

const GenerateCertificate = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  
  // Real-time Form Fields State
  const [formData, setFormData] = useState({
    student_name: 'Arun Kumar',
    course_name: 'ARTIFICIAL INTELLIGENCE WITH PYTHON',
    start_date: '2025-04-07',
    end_date: '2025-04-27',
    duration: '100 Hrs',
    register_number: '21IT001',
    certificate_id: 'CERT-2026-000001',
    issue_date: '2025-04-28'
  });

  // UI Interactive States
  const [zoomLevel, setZoomLevel] = useState(1);
  const [fitToScreen, setFitToScreen] = useState(false);
  const [fullScreenModal, setFullScreenModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialTemplate();
  }, []);

  const fetchInitialTemplate = async () => {
    try {
      const res = await templateAPI.getTemplates();
      const tpls = res.data.templates || [];
      setTemplates(tpls);
      const activeTemplate = tpls.find((tpl) => tpl.is_active) || tpls[0] || null;
      if (activeTemplate) {
        setSelectedTemplate(activeTemplate);
      }
    } catch (err) {
      console.error('Failed to load certificate template:', err);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.student_name.trim()) {
      setError('Please enter Student Name.');
      addToast('Student Name is required', 'error');
      return;
    }
    if (!formData.course_name.trim()) {
      setError('Please enter Course Name.');
      addToast('Course Name is required', 'error');
      return;
    }

    try {
      setGenerating(true);
      setError('');
      addToast('Rendering high-resolution PDF certificate...', 'info');

      // Save/Generate via Backend API
      const studentPayload = {
        name: formData.student_name.trim(),
        register_number: formData.register_number.trim() || '21IT001',
        course_name: formData.course_name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        duration: formData.duration,
        certificate_id: formData.certificate_id,
        issue_date: formData.issue_date
      };

      const tplId = selectedTemplate ? (selectedTemplate.id || selectedTemplate._id) : null;
      const res = await certificateAPI.generateSingle(studentPayload, tplId);
      
      const fileUrl = certificateAPI.getDownloadUrl(res.data.certificate.file_name);
      setDownloadUrl(fileUrl);
      addToast('Certificate PDF generated successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to render certificate PDF.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleResetForm = () => {
    setFormData({
      student_name: '',
      course_name: '',
      start_date: '',
      end_date: '',
      duration: '',
      register_number: '',
      certificate_id: '',
      issue_date: ''
    });
    setDownloadUrl(null);
    setShowResetConfirm(false);
    addToast('Form fields cleared', 'info');
  };

  const handlePrint = () => {
    window.print();
  };

  // Preview Aspect Ratio scaling calculations (1588 x 2048 px portrait canvas)
  const fields = selectedTemplate?.fields || [];
  const BASE_WIDTH = 480;
  const BASE_HEIGHT = Math.round(BASE_WIDTH / (1588 / 2048)); // 619px
  const SCALE = BASE_WIDTH / 1588.0;

  const activeZoom = fitToScreen ? 0.75 : zoomLevel;

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>
            Certificate Generator Studio
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>
            Real-time split-screen editor with instant live canvas preview and high-precision PDF exporter.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={() => navigate('/upload-students')} className="btn btn-secondary btn-sm">
            <Users size={16} /> Bulk Excel Mode
          </button>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.875rem 1.25rem', borderRadius: '12px', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Main Split Screen Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
        {/* LEFT COLUMN: Certificate Details Form */}
        <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={22} color="#2563eb" />
                Certificate Details
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>
                Fill out the dynamic fields to update live preview instantly.
              </p>
            </div>

            {/* Active Template Selector */}
            {templates.length > 0 && (
              <select
                className="form-control"
                style={{ width: '180px', fontSize: '0.8125rem' }}
                value={selectedTemplate?.id || selectedTemplate?._id || ''}
                onChange={(e) => {
                  const found = templates.find(t => (t.id || t._id) === e.target.value);
                  if (found) setSelectedTemplate(found);
                }}
              >
                {templates.map(t => (
                  <option key={t.id || t._id} value={t.id || t._id}>
                    {t.template_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <form onSubmit={handleGenerate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Field 1: Student Name */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Student Name *</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Arun Kumar"
                    value={formData.student_name}
                    onChange={(e) => handleInputChange('student_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Field 2: Course Name */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Course Name *</label>
                <div className="input-with-icon">
                  <Award size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. ARTIFICIAL INTELLIGENCE WITH PYTHON"
                    value={formData.course_name}
                    onChange={(e) => handleInputChange('course_name', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Field 3: Start Date */}
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    className="form-control"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Field 4: End Date */}
              <div className="form-group">
                <label className="form-label">End Date</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    className="form-control"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                  />
                </div>
              </div>

              {/* Field 5: Duration */}
              <div className="form-group">
                <label className="form-label">Duration</label>
                <div className="input-with-icon">
                  <Clock size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 100 Hrs"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  />
                </div>
              </div>

              {/* Field 6: Register Number */}
              <div className="form-group">
                <label className="form-label">Register Number</label>
                <div className="input-with-icon">
                  <Hash size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 21IT001"
                    value={formData.register_number}
                    onChange={(e) => handleInputChange('register_number', e.target.value)}
                  />
                </div>
              </div>

              {/* Field 7: Certificate ID */}
              <div className="form-group">
                <label className="form-label">Certificate ID</label>
                <div className="input-with-icon">
                  <ShieldCheck size={18} className="input-icon" />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. CERT-2026-000001"
                    value={formData.certificate_id}
                    onChange={(e) => handleInputChange('certificate_id', e.target.value)}
                  />
                </div>
              </div>

              {/* Field 8: Issue Date */}
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" />
                  <input
                    type="date"
                    className="form-control"
                    value={formData.issue_date}
                    onChange={(e) => handleInputChange('issue_date', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Prominent Generate CTA Button */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="submit"
                disabled={generating}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  fontSize: '1rem',
                  borderRadius: '12px'
                }}
              >
                {generating ? (
                  <>
                    <Loader size={20} className="spin" />
                    <span>Rendering PDF Certificate...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Generate Certificate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Live Certificate Preview */}
        <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '18px', display: 'flex', flexDirection: 'column' }}>
          {/* Card Title & Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.875rem', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={22} color="#7c3aed" />
              Live Certificate Preview
            </h2>

            {/* Interactive Zoom & Screen Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
                className="btn btn-secondary btn-sm"
                title="Zoom Out (-)"
              >
                <ZoomOut size={14} />
              </button>

              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#475569', minWidth: '42px', textAlign: 'center' }}>
                {Math.round(activeZoom * 100)}%
              </span>

              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.1))}
                className="btn btn-secondary btn-sm"
                title="Zoom In (+)"
              >
                <ZoomIn size={14} />
              </button>

              <button
                type="button"
                onClick={() => setFitToScreen(!fitToScreen)}
                className={`btn btn-sm ${fitToScreen ? 'btn-primary' : 'btn-secondary'}`}
                title="Fit to Screen"
              >
                Fit
              </button>

              <button
                type="button"
                onClick={() => setFullScreenModal(true)}
                className="btn btn-secondary btn-sm"
                title="Full Screen Preview"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>

          {/* Canvas Wrapper Frame */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f1f5f9',
            borderRadius: '12px',
            padding: '1.5rem',
            overflow: 'auto',
            minHeight: '480px',
            border: '1px solid #e2e8f0'
          }}>
            {/* Certificate Preview Card */}
            <div style={{
              position: 'relative',
              width: `${BASE_WIDTH * activeZoom}px`,
              height: `${BASE_HEIGHT * activeZoom}px`,
              backgroundColor: 'white',
              boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
              borderRadius: '4px',
              overflow: 'hidden',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
              {selectedTemplate && (
                <img
                  src={templateAPI.getImageUrl(selectedTemplate.image_path)}
                  alt="Master Certificate Background"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    imageRendering: 'crisp-edges',
                    display: 'block'
                  }}
                />
              )}

              {/* Overlaid Live Dynamic Text Fields */}
              {(() => {
                const curStudentName = formData.student_name || '';
                const curCourseName = (formData.course_name || '').toUpperCase();
                const curConductedLine = buildConductedText(formData.start_date, formData.end_date, formData.duration);

                let nameSize = 76 * SCALE * activeZoom;
                if (curStudentName.length > 25) {
                  nameSize = Math.max(38 * SCALE * activeZoom, nameSize * (25 / curStudentName.length));
                }

                let courseSize = 32 * SCALE * activeZoom;
                if (curCourseName.length > 40) {
                  courseSize = Math.max(20 * SCALE * activeZoom, courseSize * (40 / curCourseName.length));
                }

                return (
                  <>
                    {curStudentName && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${0.5950 * BASE_WIDTH * activeZoom}px`,
                          top: `${0.4680 * BASE_HEIGHT * activeZoom}px`,
                          transform: 'translate(-50%, -50%)',
                          fontFamily: 'AlexBrush, cursive',
                          fontSize: `${nameSize}px`,
                          fontWeight: 'normal',
                          color: '#0e3a8c',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {curStudentName}
                      </div>
                    )}

                    {curCourseName && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${0.5950 * BASE_WIDTH * activeZoom}px`,
                          top: `${0.5760 * BASE_HEIGHT * activeZoom}px`,
                          transform: 'translate(-50%, -50%)',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: `${courseSize}px`,
                          fontWeight: '800',
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {curCourseName}
                      </div>
                    )}

                    {curConductedLine && (
                      <div
                        style={{
                          position: 'absolute',
                          left: `${0.5950 * BASE_WIDTH * activeZoom}px`,
                          top: `${0.6055 * BASE_HEIGHT * activeZoom}px`,
                          transform: 'translate(-50%, -50%)',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          fontSize: `${24 * SCALE * activeZoom}px`,
                          fontWeight: '500',
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none'
                        }}
                      >
                        {curConductedLine}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          {/* Action Buttons Row Below Preview */}
          <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {downloadUrl ? (
                <a
                  href={downloadUrl}
                  download
                  className="btn btn-success"
                  style={{ textDecoration: 'none' }}
                >
                  <Download size={16} />
                  <span>Download Certificate</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={generating}
                  className="btn btn-primary"
                >
                  <Download size={16} />
                  <span>Download PDF</span>
                </button>
              )}

              <button
                type="button"
                onClick={handlePrint}
                className="btn btn-secondary"
              >
                <Printer size={16} />
                <span>Print Certificate</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="btn btn-secondary"
              style={{ color: '#ef4444' }}
            >
              <RotateCcw size={16} />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Preview Modal */}
      {fullScreenModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '780px', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              backgroundColor: '#0f172a',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Maximize2 size={18} color="#38bdf8" /> Full-Screen Certificate Preview
              </h3>
              <button
                onClick={() => setFullScreenModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '2rem', backgroundColor: '#f8fafc', textAlign: 'center' }}>
              <div style={{
                position: 'relative',
                width: '520px',
                height: '670px',
                margin: '0 auto',
                backgroundColor: 'white',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                {selectedTemplate && (
                  <img
                    src={templateAPI.getImageUrl(selectedTemplate.image_path)}
                    alt="Master Certificate Background"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
                {(() => {
                  const curStudentName = formData.student_name || '';
                  const curCourseName = (formData.course_name || '').toUpperCase();
                  const curConductedLine = buildConductedText(formData.start_date, formData.end_date, formData.duration);
                  const MODAL_SCALE = 520 / 1588.0;

                  let nameSize = 76 * MODAL_SCALE;
                  if (curStudentName.length > 25) {
                    nameSize = Math.max(38 * MODAL_SCALE, nameSize * (25 / curStudentName.length));
                  }

                  let courseSize = 32 * MODAL_SCALE;
                  if (curCourseName.length > 40) {
                    courseSize = Math.max(20 * MODAL_SCALE, courseSize * (40 / curCourseName.length));
                  }

                  return (
                    <>
                      {curStudentName && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${0.5950 * 520}px`,
                            top: `${0.4680 * 670}px`,
                            transform: 'translate(-50%, -50%)',
                            fontFamily: 'AlexBrush, cursive',
                            fontSize: `${nameSize}px`,
                            fontWeight: 'normal',
                            color: '#0e3a8c',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {curStudentName}
                        </div>
                      )}

                      {curCourseName && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${0.5950 * 520}px`,
                            top: `${0.5760 * 670}px`,
                            transform: 'translate(-50%, -50%)',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: `${courseSize}px`,
                            fontWeight: '800',
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {curCourseName}
                        </div>
                      )}

                      {curConductedLine && (
                        <div
                          style={{
                            position: 'absolute',
                            left: `${0.5950 * 520}px`,
                            top: `${0.6055 * 670}px`,
                            transform: 'translate(-50%, -50%)',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            fontSize: `${24 * MODAL_SCALE}px`,
                            fontWeight: '500',
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                            pointerEvents: 'none'
                          }}
                        >
                          {curConductedLine}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px', borderRadius: '16px', padding: '1.75rem', textAlign: 'center' }}>
            <RotateCcw size={42} color="#ef4444" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
              Reset Form Fields?
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>
              Are you sure you want to clear all entered student details? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button onClick={() => setShowResetConfirm(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleResetForm} className="btn btn-danger">
                Yes, Clear All Fields
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateCertificate;
