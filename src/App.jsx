import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/public/Dashboard';
import Login from './pages/juri/Login';
import FormPenilaian from './pages/juri/FormPenilaian';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/bidang/:kode" element={<div className="p-8 text-center">Halaman Detail Bidang Lomba (Segera Hadir)</div>} />
      <Route path="/peserta/:slug" element={<div className="p-8 text-center">Halaman Detail Peserta (Segera Hadir)</div>} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/juri/penilaian" 
        element={
          <ProtectedRoute>
            <FormPenilaian />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
