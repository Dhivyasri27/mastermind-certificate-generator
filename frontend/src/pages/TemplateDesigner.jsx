import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Move, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sliders, 
  QrCode, 
  CheckCircle,
  Eye
} from 'lucide-react';
import { templateAPI } from '../services/api';

const TemplateDesigner = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [fields, setFields] = useState([]);
  const [selectedFieldKey, setSelectedFieldKey] = useState('student_name');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    fetchTemplateDetails();
  }, [id]);

  const fetchTemplateDetails = async () => {
    try {
      setLoading(true);
      const res = await templateAPI.getTemplateById(id);
      setTemplate(res.data);
      setFields(res.data.fields || []);
    } catch (err) {
      setErrorMsg('Failed to load template details.');
    } finally {
      setLoading(false);
    }
  };

  const selectedField = fields.find(f => (f.field_key || f.name) === selectedFieldKey) || fields[0];

  const handleFieldChange = (key, value) => {
    setFields(prev => prev.map(f => {
      const fieldIdentifier = f.field_key || f.name;
      if (fieldIdentifier === selectedFieldKey) {
        return { ...f, [key]: value };
      }
      return f;
    }));
  };

  // Dragging logic over visual canvas
  const handleMouseDown = (fieldKey, e) => {
    e.stopPropagation();
    setSelectedFieldKey(fieldKey);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    let pctX = (clientX / rect.width) * 100;
    let pctY = (clientY / rect.height) * 100;

    pctX = Math.max(0, Math.min(100, pctX));
    pctY = Math.max(0, Math.min(100, pctY));

    setFields(prev => prev.map(f => {
      const fieldIdentifier = f.field_key || f.name;
      if (fieldIdentifier === selectedFieldKey) {
        return {
          ...f,
          x: parseFloat(pctX.toFixed(2)),
          y: parseFloat(pctY.toFixed(2))
        };
      }
      return f;
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveCoordinates = async () => {
    try {
      setSaving(true);
      setSuccessMsg('');
      setErrorMsg('');
      await templateAPI.saveFields(id, fields);
      setSuccessMsg('Certificate field coordinates saved successfully to MongoDB!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to save field coordinates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ fontSize: '1rem', color: '#64748b' }}>Loading Certificate Designer Canvas...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: '#ef4444' }}>Template not found.</p>
        <button onClick={() => navigate('/templates')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Templates
        </button>
      </div>
    );
  }

  const samplePreviewText = {
    student_name: 'Vijayan Rajesh - M',
    course_name: 'ARTIFICIAL INTELLIGENCE WITH PYTHON',
    start_date: '07.04.2025',
    end_date: '27.04.2025',
    duration: '100 Hrs.',
    register_number: '23IT001',
    qr_code: '[QR Code]'
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      {/* Top Action Bar */}
      <div style={{
        height: '60px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/templates')} className="btn btn-secondary btn-sm">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Visual Certificate Designer: {template.template_name}
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {successMsg && (
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={16} />
              {successMsg}
            </span>
          )}
          {errorMsg && (
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#991b1b' }}>
              {errorMsg}
            </span>
          )}
          
          <button
            onClick={handleSaveCoordinates}
            disabled={saving}
            className="btn btn-primary"
          >
            <Save size={18} />
            <span>{saving ? 'Saving...' : 'Save Field Positions'}</span>
          </button>
        </div>
      </div>

      {/* Main Designer Workspace */}
      <div 
        style={{ flex: 1, display: 'flex', backgroundColor: '#0f172a', userSelect: 'none' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Left Sidebar: Fields List */}
        <div style={{
          width: '260px',
          backgroundColor: '#1e293b',
          borderRight: '1px solid #334155',
          padding: '1.25rem 1rem',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <p style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Dynamic Fields
          </p>

          {fields.map((field) => {
            const key = field.field_key || field.name;
            const isSelected = key === selectedFieldKey;

            return (
              <button
                key={key}
                onClick={() => setSelectedFieldKey(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.875rem',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#2563eb' : '#0f172a',
                  color: 'white',
                  border: isSelected ? '1px solid #60a5fa' : '1px solid #334155',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: isSelected ? '600' : '400',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {key === 'qr_code' ? <QrCode size={16} /> : <Type size={16} />}
                  <span>{field.field_name || key}</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: isSelected ? '#dbeafe' : '#64748b' }}>
                  ({field.x}%, {field.y}%)
                </span>
              </button>
            );
          })}
        </div>

        {/* Center Canvas Area */}
        <div style={{
          flex: 1,
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          position: 'relative'
        }}>
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              width: '600px', // Scaling display canvas maintaining 1588x2048 portrait ratio (1:1.289)
              height: '773px',
              backgroundColor: 'white',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            {/* Master Template Background Image */}
            <img
              src={templateAPI.getImageUrl(template.image_path)}
              alt="Master Template Background"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none'
              }}
            />

            {/* Render Overlay Fields */}
            {(() => {
              const samplePreviewText = {
                student_name: 'Arun Kumar',
                course_name: 'ARTIFICIAL INTELLIGENCE WITH PYTHON',
                course_duration: 'Conducted from 07.04.2025 to 27.04.2025 (100 Hrs.)',
                conducted_dates: 'Conducted from 07.04.2025 to 27.04.2025 (100 Hrs.)',
                start_date: '07.04.2025',
                end_date: '27.04.2025',
                duration: '100 Hrs',
                register_number: '21IT001',
                certificate_id: 'CERT-2026-000001',
                issue_date: '27.04.2025'
              };

              return fields.map((field) => {
                const key = field.field_key || field.name;
                const isSelected = key === selectedFieldKey;
                const val = samplePreviewText[key] || field.field_name || key;

              // Convert percentage to canvas CSS px
              const leftPx = (field.x / 100) * 600;
              const topPx = (field.y / 100) * 773;

              if (key === 'qr_code') {
                const qrPx = 60; // preview box
                return (
                  <div
                    key={key}
                    onMouseDown={(e) => handleMouseDown(key, e)}
                    style={{
                      position: 'absolute',
                      left: `${leftPx}px`,
                      top: `${topPx}px`,
                      transform: 'translate(-50%, -50%)',
                      width: `${qrPx}px`,
                      height: `${qrPx}px`,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: isSelected ? '2px solid #2563eb' : '1px dashed #64748b',
                      borderRadius: '4px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'move',
                      boxShadow: isSelected ? '0 0 10px rgba(37, 99, 235, 0.5)' : 'none',
                      zIndex: isSelected ? 20 : 10
                    }}
                  >
                    <QrCode size={32} color="#000000" />
                    <span style={{ fontSize: '9px', fontWeight: '700' }}>QR VERIFY</span>
                  </div>
                );
              }

              const isScript = field.font_family === 'AlexBrush' || field.font_family === 'AlexBrush-Regular' || key === 'student_name';

              return (
                <div
                  key={key}
                  onMouseDown={(e) => handleMouseDown(key, e)}
                  style={{
                    position: 'absolute',
                    left: `${leftPx}px`,
                    top: `${topPx}px`,
                    transform: field.alignment === 'center' ? 'translate(-50%, -50%)' : field.alignment === 'right' ? 'translate(-100%, -50%)' : 'translate(0, -50%)',
                    fontFamily: isScript ? 'AlexBrush, cursive' : (field.font_family || 'sans-serif'),
                    fontSize: `${(field.font_size || 24) * 0.4}px`, // Scaled for 600px preview
                    fontWeight: field.font_weight || 'normal',
                    color: field.color || '#000000',
                    border: isSelected ? '2px dashed #2563eb' : '1px transparent solid',
                    backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    cursor: 'move',
                    whiteSpace: 'nowrap',
                    zIndex: isSelected ? 20 : 10,
                    boxShadow: isSelected ? '0 0 8px rgba(37, 99, 235, 0.4)' : 'none'
                  }}
                >
                  {val}
                </div>
              );
            });
          })()}
          </div>
        </div>

        {/* Right Sidebar: Field Property Inspector */}
        <div style={{
          width: '320px',
          backgroundColor: '#1e293b',
          borderLeft: '1px solid #334155',
          padding: '1.25rem',
          color: 'white',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #334155' }}>
            <Sliders size={20} color="#3b82f6" />
            <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>
              Field Styling & Coordinates
            </h4>
          </div>

          {selectedField && (
            <div>
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Selected Element</span>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f8fafc' }}>
                  {selectedField.field_name || selectedFieldKey}
                </h3>
              </div>

              {/* Coordinates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>X Position (% canvas)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    style={{ backgroundColor: '#0f172a', color: 'white', borderColor: '#334155' }}
                    value={selectedField.x || 50}
                    onChange={(e) => handleFieldChange('x', parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Y Position (% canvas)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    style={{ backgroundColor: '#0f172a', color: 'white', borderColor: '#334155' }}
                    value={selectedField.y || 50}
                    onChange={(e) => handleFieldChange('y', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Font Size & Weight */}
              {selectedFieldKey !== 'qr_code' ? (
                <>
                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Font Size (PDF Pixels)</label>
                    <input
                      type="number"
                      className="form-control"
                      style={{ backgroundColor: '#0f172a', color: 'white', borderColor: '#334155' }}
                      value={selectedField.font_size || 24}
                      onChange={(e) => handleFieldChange('font_size', parseInt(e.target.value) || 12)}
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Font Family</label>
                    <select
                      className="form-control"
                      style={{ backgroundColor: '#0f172a', color: 'white', borderColor: '#334155' }}
                      value={selectedField.font_family || 'Helvetica'}
                      onChange={(e) => handleFieldChange('font_family', e.target.value)}
                    >
                      <option value="AlexBrush">AlexBrush Script (Handwritten)</option>
                      <option value="Helvetica-Bold">Helvetica / Arial Bold</option>
                      <option value="Helvetica">Helvetica / Arial Regular</option>
                      <option value="Times-Roman">Times New Roman</option>
                      <option value="Georgia">Georgia Serif</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Font Weight</label>
                    <select
                      className="form-control"
                      style={{ backgroundColor: '#0f172a', color: 'white', borderColor: '#334155' }}
                      value={selectedField.font_weight || 'normal'}
                      onChange={(e) => handleFieldChange('font_weight', e.target.value)}
                    >
                      <option value="normal">Normal</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Text Alignment</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.25rem' }}>
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          type="button"
                          onClick={() => handleFieldChange('alignment', align)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            backgroundColor: selectedField.alignment === align ? '#2563eb' : '#0f172a',
                            color: 'white',
                            border: '1px solid #334155',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {align === 'left' && <AlignLeft size={16} />}
                          {align === 'center' && <AlignCenter size={16} />}
                          {align === 'right' && <AlignRight size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Text Color</label>
                    <input
                      type="color"
                      className="form-control"
                      style={{ backgroundColor: '#0f172a', height: '40px', padding: '0.25rem' }}
                      value={selectedField.color || '#000000'}
                      onChange={(e) => handleFieldChange('color', e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>QR Code Size (Pixels)</label>
                  <input
                    type="number"
                    className="form-control"
                    style={{ backgroundColor: '#0f172a', color: 'white', borderColor: '#334155' }}
                    value={selectedField.font_size || 130}
                    onChange={(e) => handleFieldChange('font_size', parseInt(e.target.value) || 100)}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateDesigner;
