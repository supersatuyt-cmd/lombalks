import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/public/Dashboard';
import DetailBidang from './pages/public/DetailBidang';
import Login from './pages/juri/Login';
import FormPenilaian from './pages/juri/FormPenilaian';
import AdminModul from './pages/admin/AdminModul';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/bidang/:kode" element={<DetailBidang />} />
      <Route path="/peserta/:slug" element={<div className="p-8 text-center">Halaman Detail Peserta (Segera Hadir)</div>} />
      <Route path="/login" element={<Login />} />
      <Route path="/juri/penilaian" element={<ProtectedRoute><FormPenilaian /></ProtectedRoute>} />
      <Route path="/admin/modul" element={<ProtectedRoute><AdminModul /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
