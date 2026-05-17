import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Medal, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo & Title */}
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img
            src="/lks-icon.png"
            alt="Logo LKS Dikmen"
            className="h-10 w-10 object-contain"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-base font-bold text-dark">LKS Dikmen</span>
            <span className="text-xs text-gray-500">Kabupaten Kutai Timur</span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/' ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-blue-50 hover:text-primary'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
          <Link
            to="/klasemen"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/klasemen' || pathname.startsWith('/bidang') ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-blue-50 hover:text-primary'
            }`}
          >
            <Medal className="h-4 w-4" />
            <span className="hidden sm:inline">Klasemen</span>
          </Link>

          {user ? (
            <>
              <Link
                to="/juri/penilaian"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/juri') ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-blue-50 hover:text-primary'
                }`}
              >
                <Medal className="h-4 w-4" />
                <span className="hidden sm:inline">Penilaian</span>
              </Link>
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin') ? 'bg-blue-50 text-primary' : 'text-gray-600 hover:bg-blue-50 hover:text-primary'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Admin Panel</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-dark transition-colors"
            >
              <Medal className="h-4 w-4" />
              Portal Juri
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      {/* Wave Divider to Footer */}
      <div className="relative mt-auto bg-transparent">
        <svg viewBox="0 0 1440 80" fill="none" className="w-full block" preserveAspectRatio="none" style={{ height: '60px' }}>
          <path d="M0,40 C360,80 720,10 1080,50 C1260,65 1360,55 1440,40 L1440,80 L0,80 Z" fill="#0a1e36" />
        </svg>
      </div>

      <footer className="bg-[#0a1e36] text-white pt-12 pb-8 mt-[-1px]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Organizer Logos */}
          <div className="flex flex-col items-center mb-12">
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-6 font-medium">Diselenggarakan Oleh</p>
            <div className="flex items-center gap-10">
              <img src="/logo-lks.png" alt="Logo LKS" className="h-24 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
              <div className="w-px h-16 bg-gray-600"></div>
              <img src="/logo-mkn.png" alt="Logo MKN" className="h-24 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/lks-icon.png" alt="LKS" className="w-9 h-9 object-contain" />
              <span className="font-extrabold text-xl tracking-tight">LKS<span className="text-blue-400">Dikmen</span></span>
            </div>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-8">
              Sistem penilaian dan monitoring LKS Dikmen Kabupaten Kutai Timur. Transparan, real-time, dan profesional.
            </p>

            <div className="flex gap-6 mb-8 text-sm">
              <Link to="/klasemen" className="text-gray-400 hover:text-white transition-colors">Klasemen</Link>
              <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Portal Juri</Link>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
            <p>© {new Date().getFullYear()} LKS Dikmen Kabupaten Kutai Timur. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
