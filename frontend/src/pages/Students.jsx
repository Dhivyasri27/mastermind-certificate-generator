import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Upload, RefreshCw } from 'lucide-react';
import StudentTable from '../components/StudentTable';
import StudentForm from '../components/StudentForm';
import UploadStudentModal from '../components/UploadStudentModal';
import CertificatePreview from '../components/CertificatePreview';
import { studentAPI, templateAPI } from '../services/api';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [certificateType, setCertificateType] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Certificate preview modal state
  const [previewStudent, setPreviewStudent] = useState(null);
  const [masterTemplate, setMasterTemplate] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchDefaultTemplate();
  }, [page, department, certificateType]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentAPI.getStudents({
        search,
        department,
        certificate_type: certificateType,
        page,
        limit
      });
      setStudents(res.data.students || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefaultTemplate = async () => {
    try {
      const res = await templateAPI.getTemplates();
      const templates = res.data.templates || [];
      const activeTemplate = templates.find((tpl) => tpl.is_active) || templates[0] || null;
      setMasterTemplate(activeTemplate);
    } catch (err) {
      console.error('Failed to fetch template:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleSaveStudent = async (formData) => {
    if (editingStudent) {
      await studentAPI.updateStudent(editingStudent.id || editingStudent._id, formData);
    } else {
      await studentAPI.addStudent(formData);
    }
    setShowAddModal(false);
    setEditingStudent(null);
    fetchStudents();
  };

  const handleSaveAndGenerate = async (formData) => {
    let savedSt;
    if (editingStudent) {
      const res = await studentAPI.updateStudent(editingStudent.id || editingStudent._id, formData);
      savedSt = res.data.student;
    } else {
      const res = await studentAPI.addStudent(formData);
      savedSt = res.data.student;
    }
    setShowAddModal(false);
    setEditingStudent(null);
    fetchStudents();
    
    // Open preview
    setPreviewStudent(savedSt);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete student '${student.name}' (${student.register_number})?`)) {
      try {
        await studentAPI.deleteStudent(student.id || student._id);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

  const handleGenerateClick = (student) => {
    setPreviewStudent(student);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>
            Student Management Directory
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Manage student information, register numbers, and individual certificate issuance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setShowUploadModal(true)} className="btn btn-secondary">
            <Upload size={16} />
            <span>Upload Students (CSV/Excel)</span>
          </button>

          <button onClick={() => { setEditingStudent(null); setShowAddModal(true); }} className="btn btn-primary">
            <UserPlus size={16} />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by Student Name or Register Number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          </div>

          <select
            className="form-control"
            value={department}
            onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
          >
            <option value="">All Departments</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Computer Science Engineering">Computer Science Engineering</option>
            <option value="Artificial Intelligence and Data Science">AI & Data Science</option>
            <option value="Electronics and Communication Engineering">ECE</option>
          </select>

          <select
            className="form-control"
            value={certificateType}
            onChange={(e) => { setCertificateType(e.target.value); setPage(1); }}
          >
            <option value="">All Certificate Types</option>
            <option value="Completion">Completion</option>
            <option value="Participation">Participation</option>
            <option value="Achievement">Achievement</option>
            <option value="Internship">Internship</option>
            <option value="Workshop">Workshop</option>
          </select>

          <button type="submit" className="btn btn-secondary">
            <RefreshCw size={16} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {/* Students Table */}
      <StudentTable
        students={students}
        total={total}
        page={page}
        limit={limit}
        onPageChange={(p) => setPage(p)}
        onEdit={(st) => { setEditingStudent(st); setShowAddModal(true); }}
        onDelete={handleDeleteStudent}
        onGenerate={handleGenerateClick}
      />

      {/* Add / Edit Modal */}
      {showAddModal && (
        <StudentForm
          student={editingStudent}
          onClose={() => { setShowAddModal(false); setEditingStudent(null); }}
          onSave={handleSaveStudent}
          onSaveAndGenerate={handleSaveAndGenerate}
        />
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <UploadStudentModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={fetchStudents}
        />
      )}

      {/* Certificate Preview Modal */}
      {previewStudent && masterTemplate && (
        <CertificatePreview
          student={previewStudent}
          template={masterTemplate}
          onClose={() => setPreviewStudent(null)}
        />
      )}
    </div>
  );
};

export default Students;
