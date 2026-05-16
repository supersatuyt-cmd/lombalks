import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Medal, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
            src="/lks-logo.png"
            alt="Logo LKS Dikmen"
            className="h-10 w-10 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-primary transition-colors"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Beranda</span>
          </Link>

          {user ? (
            <>
              <Link
                to="/juri/penilaian"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-primary transition-colors"
              >
                <Medal className="h-4 w-4" />
                <span className="hidden sm:inline">Penilaian</span>
              </Link>
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-blue-50 hover:text-primary transition-colors"
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
      <footer className="border-t border-blue-100 py-4 text-center text-sm text-gray-400 bg-white">
        &copy; {new Date().getFullYear()} LKS Dikmen Kabupaten Kutai Timur
      </footer>
    </div>
  );
}
