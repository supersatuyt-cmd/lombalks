import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { Building2, Search, Plus, Edit2, Trash2, X, ArrowLeft } from 'lucide-react';

export default function AdminSekolah() {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ nama: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: res } = await supabase.from('sekolah').select('*').order('nama');
    setData(res || []);
    setLoading(false);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({ nama: item.nama });
    } else {
      setEditItem(null);
      setFormData({ nama: '' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        await supabase.from('sekolah').update({ nama: formData.nama }).eq('id', editItem.id);
      } else {
        await supabase.from('sekolah').insert([{ nama: formData.nama }]);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus sekolah ini? Data peserta yang berasal dari sekolah ini mungkin akan terpengaruh!')) return;
    try {
      await supabase.from('sekolah').delete().eq('id', id);
      fetchData();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const filtered = data.filter(p => p.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
                <Building2 className="h-6 w-6 text-emerald-500" />
                Kelola Sekolah
              </h1>
              <p className="text-gray-500 text-sm mt-1">Manajemen daftar sekolah yang berpartisipasi</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-5 w-5 mr-2" /> Tambah Sekolah Baru
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Sekolah</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari sekolah..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none w-64"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Nama Sekolah</TableHead>
                  <TableHead className="w-32 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-12 text-gray-400">Memuat data...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={3} className="text-center py-12 text-gray-400">Data tidak ditemukan.</TableCell></TableRow>
                ) : filtered.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-gray-400 font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-semibold text-dark">{item.nama}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="h-4 w-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b">
                <h3 className="font-bold text-lg">{editItem ? 'Edit Sekolah' : 'Tambah Sekolah Baru'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-dark"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap Sekolah *</label>
                  <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Contoh: SMKN 1 Sangatta Utara" />
                </div>
                <div className="pt-2 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full">Batal</Button>
                  <Button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-700">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
