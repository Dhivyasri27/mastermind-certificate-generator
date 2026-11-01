import React, { useState } from 'react';
import { X, Download, Sparkles, ShieldCheck } from 'lucide-react';
import { templateAPI, certificateAPI } from '../services/api';

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

const CertificatePreview = ({ student, template, onClose, onGenerated }) => {
  const [generating, setGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState('');

  const handleGeneratePDF = async () => {
    if (!student || !template) return;
    try {
      setGenerating(true);
      setError('');
      const studentId = student.id || student._id || student.register_number;
      const res = await certificateAPI.generateSingle(studentId, template.id || template._id, { student_data: student });
      setCertData(res.data.certificate);
      setDownloadUrl(certificateAPI.getDownloadUrl(res.data.certificate.file_name));
      if (onGenerated) onGenerated(res.data.certificate);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate certificate PDF.');
    } finally {
      setGenerating(false);
    }
  };

  // Preview canvas size based on 1588 x 2048 aspect ratio
  const CANVAS_WIDTH = 500;
  const CANVAS_HEIGHT = Math.round(500 / (1588 / 2048)); // 645px
  const SCALE = CANVAS_WIDTH / 1588.0;

  const studentName = student?.name || '';
  const courseName = (student?.course_name || '').toUpperCase();
  const startDate = student?.start_date || student?.date || '';
  const endDate = student?.end_date || '';
  const duration = student?.duration || '';
  const conductedLine = buildConductedText(startDate, endDate, duration);

  // Auto-scale font sizes if values are long
  let nameFontSize = 76 * SCALE;
  if (studentName.length > 25) {
    nameFontSize = Math.max(38 * SCALE, nameFontSize * (25 / studentName.length));
  }

  let courseFontSize = 32 * SCALE;
  if (courseName.length > 40) {
    courseFontSize = Math.max(20 * SCALE, courseFontSize * (40 / courseName.length));
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '820px', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#0f172a',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck color="#38bdf8" size={24} />
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>
                Certificate Preview: {student?.name || 'Student Certificate'}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Reg No: {student?.register_number || 'N/A'} | Mastermind & Krishnaa Institute
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', textAlign: 'center' }}>
          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'left' }}>
              {error}
            </div>
          )}

          {/* Master Certificate Preview Frame */}
          <div style={{
            position: 'relative',
            width: `${CANVAS_WIDTH}px`,
            height: `${CANVAS_HEIGHT}px`,
            margin: '0 auto 1.5rem auto',
            backgroundColor: 'white',
            boxShadow: '0 12px 36px rgba(0,0,0,0.18)',
            borderRadius: '4px',
            overflow: 'hidden',
            border: '1px solid #cbd5e1'
          }}>
            <img
              src={template ? templateAPI.getImageUrl(template.image_path) : '/mastermind_certificate_template.png'}
              alt="Master Certificate Background"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                imageRendering: 'crisp-edges',
                display: 'block'
              }}
            />

            {/* Field 1: Student Name on the underline */}
            {studentName && (
              <div
                style={{
                  position: 'absolute',
                  left: `${0.5950 * CANVAS_WIDTH}px`,
                  top: `${0.4680 * CANVAS_HEIGHT}px`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'AlexBrush, cursive',
                  fontSize: `${nameFontSize}px`,
                  fontWeight: 'normal',
                  color: '#0e3a8c',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  letterSpacing: '0.5px'
                }}
              >
                {studentName}
              </div>
            )}

            {/* Field 2: Course Name */}
            {courseName && (
              <div
                style={{
                  position: 'absolute',
                  left: `${0.5950 * CANVAS_WIDTH}px`,
                  top: `${0.5760 * CANVAS_HEIGHT}px`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: `${courseFontSize}px`,
                  fontWeight: '800',
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  letterSpacing: '0.5px'
                }}
              >
                {courseName}
              </div>
            )}

            {/* Field 3: Course Duration and Dates */}
            {conductedLine && (
              <div
                style={{
                  position: 'absolute',
                  left: `${0.5950 * CANVAS_WIDTH}px`,
                  top: `${0.6055 * CANVAS_HEIGHT}px`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: `${24 * SCALE}px`,
                  fontWeight: '500',
                  color: '#1e293b',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none'
                }}
              >
                {conductedLine}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>

            {!downloadUrl ? (
              <button
                type="button"
                onClick={handleGeneratePDF}
                disabled={generating}
                className="btn btn-primary"
                style={{ padding: '0.625rem 1.25rem' }}
              >
                <Sparkles size={16} />
                <span>{generating ? 'Rendering PDF...' : 'Generate Certificate PDF'}</span>
              </button>
            ) : (
              <a
                href={downloadUrl}
                download
                className="btn btn-success"
                style={{ textDecoration: 'none', padding: '0.625rem 1.25rem' }}
              >
                <Download size={16} />
                <span>Download High-Res PDF</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificatePreview;
