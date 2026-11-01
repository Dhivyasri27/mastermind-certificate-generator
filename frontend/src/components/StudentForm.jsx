import React, { useState, useEffect } from 'react';
import { X, Save, Sparkles } from 'lucide-react';

const StudentForm = ({ student, onClose, onSave, onSaveAndGenerate }) => {
  const [formData, setFormData] = useState({
    name: '',
    register_number: '',
    department: 'Information Technology',
    year: 'IV',
    college_name: 'Krishnaa Institute of Skill Development & Entrepreneurship',
    course_name: 'ARTIFICIAL INTELLIGENCE WITH PYTHON',
    start_date: '07.04.2025',
    end_date: '27.04.2025',
    duration: '100 Hrs.',
    certificate_type: 'Completion',
    date: '27.04.2025'
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        register_number: student.register_number || '',
        department: student.department || 'Information Technology',
        year: student.year || 'IV',
        college_name: student.college_name || 'Krishnaa Institute of Skill Development & Entrepreneurship',
        course_name: student.course_name || '',
        start_date: student.start_date || '07.04.2025',
        end_date: student.end_date || '27.04.2025',
        duration: student.duration || '100 Hrs.',
        certificate_type: student.certificate_type || 'Completion',
        date: student.date || '27.04.2025'
      });
    }
  }, [student]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e, shouldGenerate = false) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.register_number.trim() || !formData.department.trim() || !formData.course_name.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      if (shouldGenerate && onSaveAndGenerate) {
        await onSaveAndGenerate(formData);
      } else {
        await onSave(formData);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save student.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '750px' }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#0f172a' }}>
            {student ? 'Edit Student Record' : 'Add New Student'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ margin: '1rem 1.5rem 0 1.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Student Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Vijayan Rajesh - M"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Register Number *</label>
              <input
                type="text"
                name="register_number"
                className="form-control"
                placeholder="e.g. 23IT001"
                value={formData.register_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="Information Technology">Information Technology</option>
                <option value="Computer Science Engineering">Computer Science Engineering</option>
                <option value="Artificial Intelligence and Data Science">Artificial Intelligence and Data Science</option>
                <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select name="year" className="form-control" value={formData.year} onChange={handleChange}>
                <option value="I">I Year</option>
                <option value="II">II Year</option>
                <option value="III">III Year</option>
                <option value="IV">IV Year</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">College / Institution Name *</label>
              <input
                type="text"
                name="college_name"
                className="form-control"
                value={formData.college_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Course / Event Name *</label>
              <input
                type="text"
                name="course_name"
                className="form-control"
                placeholder="e.g. ARTIFICIAL INTELLIGENCE WITH PYTHON"
                value={formData.course_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="text"
                name="start_date"
                className="form-control"
                placeholder="07.04.2025"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="text"
                name="end_date"
                className="form-control"
                placeholder="27.04.2025"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Duration</label>
              <input
                type="text"
                name="duration"
                className="form-control"
                placeholder="100 Hrs."
                value={formData.duration}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Certificate Type</label>
              <select name="certificate_type" className="form-control" value={formData.certificate_type} onChange={handleChange}>
                <option value="Completion">Completion Certificate</option>
                <option value="Participation">Participation Certificate</option>
                <option value="Achievement">Achievement Certificate</option>
                <option value="Internship">Internship Certificate</option>
                <option value="Workshop">Workshop Certificate</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save Student'}</span>
            </button>

            {onSaveAndGenerate && (
              <button
                type="button"
                disabled={loading}
                onClick={(e) => handleSubmit(e, true)}
                className="btn btn-success"
              >
                <Sparkles size={16} />
                <span>Save & Generate Certificate</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;
