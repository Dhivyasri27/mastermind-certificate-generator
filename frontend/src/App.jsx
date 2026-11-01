import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import { ToastProvider } from './components/Toast';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import UploadStudents from './pages/UploadStudents';
import Templates from './pages/Templates';
import TemplateDesigner from './pages/TemplateDesigner';
import GenerateCertificate from './pages/GenerateCertificate';
import GeneratedCertificates from './pages/GeneratedCertificates';
import VerifyCertificate from './pages/VerifyCertificate';
import Settings from './pages/Settings';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout Shell for authenticated admin pages
const AdminLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-content">
        <Navbar title={title} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify/:certificate_id" element={<VerifyCertificate />} />

          {/* Protected Admin Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminLayout title="Dashboard">
                  <Dashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <AdminLayout title="Students Directory">
                  <Students />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload-students"
            element={
              <ProtectedRoute>
                <AdminLayout title="Upload Student Records">
                  <UploadStudents />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/templates"
            element={
              <ProtectedRoute>
                <AdminLayout title="Certificate Templates">
                  <Templates />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/templates/:id/designer"
            element={
              <ProtectedRoute>
                <TemplateDesigner />
              </ProtectedRoute>
            }
          />

          <Route
            path="/generate-certificate"
            element={
              <ProtectedRoute>
                <AdminLayout title="Generate Certificates">
                  <GenerateCertificate />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/generated-certificates"
            element={
              <ProtectedRoute>
                <AdminLayout title="Generated Certificates">
                  <GeneratedCertificates />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AdminLayout title="Settings">
                  <Settings />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;

