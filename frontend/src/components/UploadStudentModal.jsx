import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, X, Sparkles, Download, RefreshCw, FileText } from 'lucide-react';
import { studentAPI, templateAPI, certificateAPI } from '../services/api';

const UploadStudentModal = ({ onClose, onSuccess }) => {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');
  const [batchResult, setBatchResult] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewData(null);
      setError('');
      setBatchResult(null);
    }
  };

  const handleUploadAndValidate = async (e) => {
    if (e) e.preventDefault();
    if (!file) {
      setError('Please select an Excel (.xlsx/.xls) or CSV file.');
      return;
    }

    try {
      setParsing(true);
      setError('');
      const formData = new FormData();
      formData.append('file', file);

      const res = await studentAPI.uploadFile(formData);
      setPreviewData(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse student file. Please check Excel column names.');
    } finally {
      setParsing(false);
    }
  };

  const handleSaveAndGenerateAll = async () => {
    if (!previewData || previewData.valid_records.length === 0) {
      setError('No valid student records available for generation.');
      return;
    }

    if (previewData.invalid_count > 0) {
      if (!window.confirm(`Warning: ${previewData.invalid_count} row(s) contain validation errors and will be skipped. Proceed with ${previewData.valid_count} valid students?`)) {
        return;
      }
    }

    try {
      setSaving(true);
      setError('');

      const saveRes = await studentAPI.bulkSave(previewData.valid_records);
      const insertedStudents = saveRes.data.inserted_students || [];

      if (insertedStudents.length === 0) {
        throw new Error('No new student records saved.');
      }

      const tplRes = await templateAPI.getTemplates();
      const templates = tplRes.data.templates || [];
      if (templates.length === 0) {
        throw new Error('No active certificate template found.');
      }
      const masterTemplate = templates.find((tpl) => tpl.is_active) || templates[0];
      const templateId = masterTemplate.id || masterTemplate._id;
      const studentIds = insertedStudents.map(s => s.id || s._id);

      const genRes = await certificateAPI.generateBulk(templateId, studentIds);

      setBatchResult({
        total: genRes.data.total_requested,
        generated: genRes.data.total_generated,
        failed: genRes.data.total_failed,
        zip_download: certificateAPI.getZipDownloadUrl()
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to generate batch certificates.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '900px' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <FileSpreadsheet color="#2563eb" size={24} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
              Bulk Student Excel / CSV Importer & Generator
            </h3>
          </div>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>

        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.875rem', borderRadius: '10px', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          {/* Batch Result Success Banner */}
          {batchResult && (
            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', padding: '1.5rem', borderRadius: '14px', textAlign: 'center', marginBottom: '1.5rem' }}>
              <CheckCircle size={44} color="#166534" style={{ margin: '0 auto 0.5rem auto' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#166534' }}>
                Batch Certificates Generated Successfully! ({batchResult.generated} PDFs)
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#15803d', margin: '0.25rem 0 1.25rem 0' }}>
                Individual student PDFs (`21IT001_Arun_Kumar.pdf`, etc.) have been generated using the Master Template background.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <a
                  href={batchResult.zip_download}
                  download
                  className="btn btn-success"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '1rem', textDecoration: 'none' }}
                >
                  <Download size={18} />
                  <span>Download All Certificates (ZIP Bundle)</span>
                </a>

                <button
                  type="button"
                  onClick={() => navigate('/generated-certificates')}
                  className="btn btn-secondary"
                >
                  View Generated List
                </button>
              </div>
            </div>
          )}

          {/* Step 1: File Selection */}
          {!previewData && !batchResult && (
            <form onSubmit={handleUploadAndValidate}>
              <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '16px',
                padding: '2rem',
                textAlign: 'center',
                backgroundColor: '#f8fafc',
                marginBottom: '1.25rem'
              }}>
                <Upload size={38} color="#3b82f6" style={{ margin: '0 auto 0.75rem auto' }} />
                <h4 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.25rem' }}>
                  Choose Excel (.xlsx / .xls) or CSV File
                </h4>
                <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
                  Required Columns: <strong>Register Number, Student Name, Course Name, Start Date, End Date, Duration</strong>
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="excel-file-input"
                  />

                  <label htmlFor="excel-file-input" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex' }}>
                    <Upload size={16} />
                    <span>Browse Excel File</span>
                  </label>

                  <a
                    href={studentAPI.getDownloadTemplateUrl()}
                    download="Student_Upload_Template.xlsx"
                    className="btn btn-outline"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                  >
                    <Download size={16} />
                    <span>Download Excel Template</span>
                  </a>
                </div>

                {file && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '600', color: '#2563eb' }}>
                    Selected File: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                {onClose && (
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Cancel
                  </button>
                )}
                <button type="submit" disabled={!file || parsing} className="btn btn-primary">
                  <RefreshCw size={16} />
                  <span>{parsing ? 'Parsing & Validating...' : 'Validate Excel Data'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Student Preview Table & Validation Diagnostic Summary */}
          {previewData && !batchResult && (
            <div>
              {/* Stat Metric Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ backgroundColor: '#f1f5f9', padding: '0.875rem', borderRadius: '10px', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>Total Rows</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>{previewData.total_records}</p>
                </div>
                <div style={{ backgroundColor: '#f0fdf4', padding: '0.875rem', borderRadius: '10px', textAlign: 'center', border: '1px solid #bbf7d0' }}>
                  <p style={{ fontSize: '0.75rem', color: '#166534', fontWeight: '600' }}>Valid Students</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '800', color: '#166534' }}>{previewData.valid_count}</p>
                </div>
                <div style={{ backgroundColor: previewData.invalid_count > 0 ? '#fef2f2' : '#f8fafc', padding: '0.875rem', borderRadius: '10px', textAlign: 'center', border: previewData.invalid_count > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.75rem', color: previewData.invalid_count > 0 ? '#991b1b' : '#64748b', fontWeight: '600' }}>Invalid Rows</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '800', color: previewData.invalid_count > 0 ? '#991b1b' : '#64748b' }}>{previewData.invalid_count}</p>
                </div>
                <div style={{ backgroundColor: previewData.duplicate_count > 0 ? '#fffbeb' : '#f8fafc', padding: '0.875rem', borderRadius: '10px', textAlign: 'center', border: previewData.duplicate_count > 0 ? '1px solid #fde68a' : '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.75rem', color: previewData.duplicate_count > 0 ? '#92400e' : '#64748b', fontWeight: '600' }}>Duplicates</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: '800', color: previewData.duplicate_count > 0 ? '#92400e' : '#64748b' }}>{previewData.duplicate_count}</p>
                </div>
              </div>

              {/* Invalid Rows Alert Diagnostic Box */}
              {previewData.invalid_records.length > 0 && (
                <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem', marginBottom: '1.25rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: '#991b1b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <AlertTriangle size={16} />
                    Validation Diagnostic Errors ({previewData.invalid_records.length} row error[s])
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: '#b91c1c' }}>
                    {previewData.invalid_records.map((inv, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>
                        Row {inv.row_index}: {inv.errors.join(' | ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Student Preview Table */}
              <div className="table-responsive" style={{ maxHeight: '280px', marginBottom: '1.5rem' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>Row</th>
                      <th>Register No</th>
                      <th>Student Name</th>
                      <th>Course Name</th>
                      <th>Dates</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.valid_records.concat(previewData.invalid_records).sort((a, b) => a.row_index - b.row_index).map((st) => (
                      <tr key={st.row_index} style={{ backgroundColor: st.is_valid ? 'white' : '#fef2f2' }}>
                        <td style={{ fontWeight: '600', color: '#64748b' }}>{st.row_index}</td>
                        <td><code>{st.register_number || 'N/A'}</code></td>
                        <td style={{ fontWeight: '700', color: '#0f172a' }}>{st.name || 'Missing'}</td>
                        <td style={{ fontSize: '0.8125rem' }}>{st.course_name || 'Missing'}</td>
                        <td style={{ fontSize: '0.75rem', color: '#475569' }}>
                          {st.start_date && st.end_date ? `${st.start_date} to ${st.end_date}` : 'N/A'}
                        </td>
                        <td>{st.duration || 'N/A'}</td>
                        <td>
                          {st.is_valid ? (
                            <span className="badge badge-success">Valid</span>
                          ) : (
                            <span className="badge badge-danger">Invalid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setPreviewData(null)}
                  className="btn btn-secondary"
                >
                  Choose Different Excel File
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndGenerateAll}
                  disabled={saving || previewData.valid_count === 0}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                >
                  <Sparkles size={18} />
                  <span>{saving ? 'Generating Batch Certificates...' : `Generate ${previewData.valid_count} Certificates`}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadStudentModal;
