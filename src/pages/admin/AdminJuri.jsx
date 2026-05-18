import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { Gavel, Search, Plus, Edit2, Trash2, X, ArrowLeft, Mail, Lock, Eye, EyeOff, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function AdminJuri() {
  const { user } = useAuth();
  const [juriList, setJuriList] = useState([]);
  const [bidangList, setBidangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ nama: '', bidang_lomba_id: '', email: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = async () => {
    setLoading(true);
    const [jRes, bRes] = await Promise.all([
      supabase.from('juri').select('*, bidang_lomba(nama, kode)').order('nama'),
      supabase.from('bidang_lomba').select('*').order('nama')
    ]);

    setJuriList(jRes.data || []);
    setBidangList(bRes.data || []);
    setLoading(false);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        nama: item.nama,
        bidang_lomba_id: item.bidang_lomba_id || '',
        email: '',
        password: ''
      });
    } else {
      setEditItem(null);
      setFormData({ nama: '', bidang_lomba_id: '', email: '', password: '' });
    }
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        // Update existing juri — only update nama and bidang_lomba_id
        const { error } = await supabase.from('juri').update({
          nama: formData.nama,
          bidang_lomba_id: formData.bidang_lomba_id
        }).eq('id', editItem.id);

        if (error) throw error;
        showToast(`Data juri "${formData.nama}" berhasil diperbarui!`);
      } else {
        // Create new juri — need to sign up auth user first
        if (!formData.email || !formData.password) {
          alert('Email dan password wajib diisi untuk juri baru!');
          setSaving(false);
          return;
        }

        if (formData.password.length < 6) {
          alert('Password minimal 6 karakter!');
          setSaving(false);
          return;
        }

        // 1. Sign up auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) {
          throw new Error(`Gagal membuat akun: ${authError.message}`);
        }

        const userId = authData.user?.id;
        if (!userId) {
          throw new Error('User ID tidak didapatkan. Mungkin perlu konfirmasi email di Supabase.');
        }

        // 2. Insert juri record
        const { error: insertError } = await supabase.from('juri').insert([{
          user_id: userId,
          nama: formData.nama,
          bidang_lomba_id: formData.bidang_lomba_id
        }]);

        if (insertError) {
          throw new Error(`Akun berhasil dibuat tapi gagal menyimpan data juri: ${insertError.message}`);
        }

        showToast(`Juri "${formData.nama}" berhasil ditambahkan dengan email ${formData.email}!`);
      }

      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Gagal menyimpan data', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (juri) => {
    if (!window.confirm(`Yakin ingin menghapus juri "${juri.nama}"?\n\nSeluruh data penilaian yang telah diberikan juri ini juga akan terhapus!`)) return;
    try {
      const { error } = await supabase.from('juri').delete().eq('id', juri.id);
      if (error) throw error;
      showToast(`Juri "${juri.nama}" berhasil dihapus.`);
      fetchData();
    } catch (err) {
      console.error(err);
      showToast('Gagal menghapus data: ' + (err.message || ''), 'error');
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const adminEmails = ['admin@lks.com'];
  if (!adminEmails.includes(user.email)) return <Navigate to="/admin" replace />;

  const filtered = juriList.filter(j =>
    j.nama.toLowerCase().includes(search.toLowerCase()) ||
    j.bidang_lomba?.nama?.toLowerCase().includes(search.toLowerCase()) ||
    j.bidang_lomba?.kode?.toLowerCase().includes(search.toLowerCase())
  );

  // Group juri by bidang for summary cards
  const bidangSummary = bidangList.map(b => ({
    ...b,
    juriCount: juriList.filter(j => j.bidang_lomba_id === b.id).length
  }));

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-20 right-4 z-[60] px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2.5 animate-in fade-in slide-in-from-right duration-300
            ${toast.type === 'error'
              ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white'
              : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white'
            }`}>
            {toast.type === 'error'
              ? <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              : <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            }
            {toast.msg}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 rounded-lg hover:bg-amber-50 text-amber-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
                <Gavel className="h-6 w-6 text-amber-500" />
                Kelola Juri
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manajemen daftar juri penilai untuk setiap bidang lomba</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="h-5 w-5 mr-2" /> Tambah Juri Baru
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {bidangSummary.map(b => (
            <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-3.5 hover:shadow-md hover:border-amber-200 transition-all group">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 group-hover:scale-125 transition-transform"></div>
                <span className="text-xs font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{b.kode}</span>
              </div>
              <p className="text-xs text-gray-500 truncate mb-1" title={b.nama}>{b.nama}</p>
              <p className="text-lg font-bold text-dark">{b.juriCount} <span className="text-xs font-normal text-gray-400">juri</span></p>
            </div>
          ))}
        </div>

        {/* Main Table Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle>Daftar Juri</CardTitle>
              <span className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium border border-amber-100">
                {juriList.length} total
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari juri, bidang..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none w-64"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Nama Juri</TableHead>
                  <TableHead>Bidang Lomba</TableHead>
                  <TableHead>Kode Bidang</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                        <span>Memuat data juri...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Gavel className="h-10 w-10 text-gray-300" />
                        <span className="text-sm">Tidak ada juri ditemukan.</span>
                        {search && <span className="text-xs">Coba ubah kata kunci pencarian.</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filtered.map((juri, idx) => (
                  <TableRow key={juri.id}>
                    <TableCell className="text-gray-400 font-medium">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {juri.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-dark">{juri.nama}</p>
                          <p className="text-xs text-gray-400">ID: {juri.id?.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700">{juri.bidang_lomba?.nama || '-'}</span>
                    </TableCell>
                    <TableCell>
                      {juri.bidang_lomba?.kode ? (
                        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-mono border border-amber-100">
                          {juri.bidang_lomba.kode}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                        <ShieldCheck className="h-3 w-3" />
                        Aktif
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenModal(juri)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit Juri"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(juri)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Hapus Juri"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal Create/Edit */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Gavel className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-dark">{editItem ? 'Edit Data Juri' : 'Tambah Juri Baru'}</h3>
                    <p className="text-xs text-gray-500">{editItem ? 'Perbarui informasi juri yang ada' : 'Daftarkan akun juri baru ke sistem'}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-dark p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSave} className="p-5 space-y-4">
                {/* Nama Juri */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Juri *</label>
                  <input
                    required
                    type="text"
                    value={formData.nama}
                    onChange={e => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                    placeholder="Contoh: Dr. Ahmad Fauzi, M.Pd."
                  />
                </div>

                {/* Bidang Lomba */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bidang Lomba *</label>
                  <select
                    required
                    value={formData.bidang_lomba_id}
                    onChange={e => setFormData({ ...formData, bidang_lomba_id: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white transition-all"
                  >
                    <option value="" disabled>Pilih Bidang Lomba...</option>
                    {bidangList.map(b => (
                      <option key={b.id} value={b.id}>{b.nama} ({b.kode})</option>
                    ))}
                  </select>
                </div>

                {/* Credentials — only for new juri */}
                {!editItem && (
                  <>
                    <div className="border-t pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-amber-500" />
                        Kredensial Login Juri
                      </p>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                          placeholder="Contoh: juri1@lks.com"
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Email ini digunakan untuk login ke portal juri.</p>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          required
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          minLength={6}
                          className="w-full pl-10 pr-12 p-2.5 border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                          placeholder="Minimal 6 karakter"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800 leading-relaxed">
                        <p className="font-semibold mb-0.5">Penting:</p>
                        <p>Pastikan email dan password telah dicatat. Juri akan menggunakan kredensial ini untuk login ke sistem penilaian.</p>
                      </div>
                    </div>
                  </>
                )}

                {editItem && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800 leading-relaxed">
                      <p>Email dan password tidak dapat diubah dari panel ini. Gunakan Supabase Dashboard untuk mereset kredensial login juri.</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-3 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full">
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving} className="w-full bg-amber-600 hover:bg-amber-700 shadow-md">
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Menyimpan...
                      </span>
                    ) : (
                      editItem ? 'Simpan Perubahan' : 'Daftarkan Juri'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
