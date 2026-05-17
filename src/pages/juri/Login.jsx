import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Medal, Lock } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center justify-center mb-8 gap-2">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
            <Medal className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-dark mt-2">Portal Juri LKS Dikmen</h1>
          <p className="text-gray-500 text-sm">Masuk untuk mulai menilai peserta</p>
        </div>

        <Card className="border-0 shadow-xl shadow-blue-900/5 bg-white/80 backdrop-blur-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-xl">
              <Lock className="w-5 h-5 text-primary" />
              Login Akun Juri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username / Email</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="Contoh: rahmad (atau email)"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" className="w-full mt-6 py-2.5 text-base shadow-lg shadow-primary/30" disabled={loading}>
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
