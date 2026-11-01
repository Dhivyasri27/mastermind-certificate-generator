import React from 'react';
import { Edit, Trash2, Eye, Sparkles } from 'lucide-react';

const StudentTable = ({ students, total, page, limit, onPageChange, onEdit, onDelete, onGenerate }) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div>
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>S.No</th>
              <th>Student Name</th>
              <th>Register Number</th>
              <th>Department</th>
              <th>Course / Event</th>
              <th>Certificate Type</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No student records found. Try adjusting your search query or department filter.
                </td>
              </tr>
            ) : (
              students.map((student, index) => {
                const sNo = (page - 1) * limit + index + 1;
                return (
                  <tr key={student.id || student._id}>
                    <td style={{ fontWeight: '600', color: '#64748b' }}>{sNo}</td>
                    <td style={{ fontWeight: '700', color: '#0f172a' }}>{student.name}</td>
                    <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#1e293b' }}>{student.register_number}</code></td>
                    <td>{student.department}</td>
                    <td>{student.course_name}</td>
                    <td>
                      <span className="badge badge-purple">
                        {student.certificate_type || 'Completion'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
                        <button
                          onClick={() => onGenerate(student)}
                          className="btn btn-sm btn-success"
                          title="Generate PDF Certificate"
                        >
                          <Sparkles size={13} />
                          <span>Generate</span>
                        </button>

                        <button
                          onClick={() => onEdit(student)}
                          className="btn btn-sm btn-secondary"
                          title="Edit Student"
                        >
                          <Edit size={13} />
                        </button>

                        <button
                          onClick={() => onDelete(student)}
                          className="btn btn-sm btn-danger"
                          title="Delete Student"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '1.25rem',
        padding: '0.5rem 0.25rem'
      }}>
        <p style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          Showing {students.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} students
        </p>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>

          <span style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', fontSize: '0.875rem', fontWeight: '600' }}>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
