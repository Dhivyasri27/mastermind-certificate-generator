import React from 'react';
import { useNavigate } from 'react-router-dom';
import UploadStudentModal from '../components/UploadStudentModal';

const UploadStudents = () => {
  const navigate = useNavigate();

  return (
    <UploadStudentModal
      onClose={() => navigate('/students')}
      onSuccess={() => navigate('/students')}
    />
  );
};

export default UploadStudents;
