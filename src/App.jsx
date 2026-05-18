import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/public/LandingPage';
import Dashboard from './pages/public/Dashboard';
import DetailBidang from './pages/public/DetailBidang';
import DetailPeserta from './pages/public/DetailPeserta';
import Login from './pages/juri/Login';
import FormPenilaian from './pages/juri/FormPenilaian';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminModul from './pages/admin/AdminModul';
import AdminPeserta from './pages/admin/AdminPeserta';
import AdminBidang from './pages/admin/AdminBidang';
import AdminSekolah from './pages/admin/AdminSekolah';
import AdminJuri from './pages/admin/AdminJuri';

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
      <Route path="/" element={<LandingPage />} />
      <Route path="/klasemen" element={<Dashboard />} />
      <Route path="/bidang/:kode" element={<DetailBidang />} />
      <Route path="/peserta/:slug" element={<DetailPeserta />} />
      <Route path="/login" element={<Login />} />
      <Route path="/juri/penilaian" element={<ProtectedRoute><FormPenilaian /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/modul" element={<ProtectedRoute><AdminModul /></ProtectedRoute>} />
      <Route path="/admin/peserta" element={<ProtectedRoute><AdminPeserta /></ProtectedRoute>} />
      <Route path="/admin/bidang" element={<ProtectedRoute><AdminBidang /></ProtectedRoute>} />
      <Route path="/admin/sekolah" element={<ProtectedRoute><AdminSekolah /></ProtectedRoute>} />
      <Route path="/admin/juri" element={<ProtectedRoute><AdminJuri /></ProtectedRoute>} />
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
