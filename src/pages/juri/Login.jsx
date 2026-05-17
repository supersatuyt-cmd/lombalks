import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/juri/penilaian');
    } catch (err) {
      setError(err.message || 'Gagal login. Cek kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#051122]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1e36] via-[#0d2a4a] to-[#041222]"></div>
      <div className="absolute inset-0 dot-pattern opacity-[0.05]"></div>

      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-500/20 rounded-full blur-[120px] animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[35vw] h-[35vw] bg-accent/20 rounded-full blur-[100px] animate-pulse-glow delay-1000"></div>
      <div className="absolute top-[30%] right-[20%] w-[20vw] h-[20vw] bg-purple-500/15 rounded-full blur-[90px] animate-pulse-glow delay-500"></div>

      {/* Back to Home Button */}
      <Link to="/" className="absolute top-6 left-6 lg:top-10 lg:left-10 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group z-20">
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium text-sm hidden sm:block">Kembali ke Beranda</span>
      </Link>

      <div className="w-full max-w-md px-4 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[2rem] p-8 sm:p-10 relative overflow-hidden">

          {/* Subtle card gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

          <div className="flex flex-col items-center justify-center mb-10 relative z-10">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] p-3 mb-6 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <img src="/lksicon.png" alt="LKS" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight text-center">Portal Juri</h1>
            <p className="text-blue-200 text-sm mt-2 font-medium text-center">LKS Dikmen Kabupaten Kutai Timur</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {error && (
              <div className="p-4 text-sm text-red-200 bg-red-950/50 border border-red-500/50 rounded-xl backdrop-blur-md animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-blue-300/80 uppercase tracking-widest ml-1">Username / Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:bg-black/40 focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                  placeholder="Masukkan username/email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-blue-300/80 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-accent transition-colors" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:bg-black/40 focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-8 py-4 bg-gradient-to-r from-accent to-blue-600 hover:from-blue-500 hover:to-accent text-white font-bold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Memproses...
                </span>
              ) : 'Masuk ke Portal'}
            </button>
          </form>
        </div>

        {/* Sponsor/Organizer Logos */}
        <div className="mt-10 flex flex-col items-center">
          <p className="text-[10px] text-blue-300/50 uppercase tracking-[0.2em] font-semibold mb-5">Diselenggarakan Oleh</p>
          <div className="flex items-center justify-center gap-12 bg-white/20 px-12 py-8 rounded-[2.5rem] backdrop-blur-md border border-white/30 shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
            <img src="/lkss.png" alt="Logo LKS" className="h-28 w-auto object-contain opacity-100 hover:scale-105 transition-transform duration-300" />
            <div className="w-px h-20 bg-white/40"></div>
            <img src="/mkn.png" alt="Logo MKN" className="h-28 w-auto object-contain opacity-100 hover:scale-105 transition-transform duration-300" />
          </div>
        </div>

      </div>
    </div>
  );
}
