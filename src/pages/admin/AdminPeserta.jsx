import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';
import { Users, Search, ArrowLeft } from 'lucide-react';

export default function AdminPeserta() {
  const { user } = useAuth();
  const [pesertaList, setPesertaList] = useState([]);
  const [sekolahList, setSekolahList] = useState([]);
  const [bidangList, setBidangList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({ nama: '', nomor_peserta: '', slug: '', sekolah_id: '', bidang_lomba_id: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPeserta();
  }, []);

  const fetchPeserta = async () => {
    setLoading(true);
    const [pRes, sRes, bRes] = await Promise.all([
      supabase.from('peserta').select('*, bidang_lomba(nama, kode), sekolah(nama)').order('nama'),
      supabase.from('sekolah').select('*').order('nama'),
      supabase.from('bidang_lomba').select('*').order('nama')
    ]);
    
    setPesertaList(pRes.data || []);
    setSekolahList(sRes.data || []);
    setBidangList(bRes.data || []);
    setLoading(false);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({ 
        nama: item.nama, 
        nomor_peserta: item.nomor_peserta, 
        slug: item.slug || '',
        sekolah_id: item.sekolah_id || '',
        bidang_lomba_id: item.bidang_lomba_id || ''
      });
    } else {
      setEditItem(null);
      setFormData({ nama: '', nomor_peserta: '', slug: '', sekolah_id: '', bidang_lomba_id: '' });
    }
    setShowModal(true);
  };

  const generateSlug = (nama) => {
    return nama.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nama: formData.nama,
        nomor_peserta: formData.nomor_peserta,
        slug: formData.slug || generateSlug(formData.nama),
        sekolah_id: formData.sekolah_id,
        bidang_lomba_id: formData.bidang_lomba_id
      };

      if (editItem) {
        await supabase.from('peserta').update(payload).eq('id', editItem.id);
      } else {
        await supabase.from('peserta').insert([payload]);
      }
      setShowModal(false);
      fetchPeserta();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus peserta ini? Seluruh data nilai juri peserta ini juga akan terhapus!')) return;
    try {
      await supabase.from('peserta').delete().eq('id', id);
      fetchPeserta();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const filtered = pesertaList.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.nomor_peserta?.toLowerCase().includes(search.toLowerCase()) ||
    p.sekolah?.nama?.toLowerCase().includes(search.toLowerCase()) ||
    p.bidang_lomba?.nama?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Kelola Peserta
              </h1>
              <p className="text-gray-500 text-sm mt-1">Daftar peserta lomba dari berbagai bidang dan sekolah</p>
            </div>
          </div>
          <Button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700">
            <Users className="h-5 w-5 mr-2" /> Tambah Peserta Baru
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Peserta</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari peserta, sekolah, bidang..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none w-72"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>No. Peserta</TableHead>
                  <TableHead>Nama Peserta</TableHead>
                  <TableHead>Sekolah</TableHead>
                  <TableHead>Bidang Lomba</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-400">Memuat data...</TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-gray-400">Tidak ada peserta ditemukan.</TableCell>
                  </TableRow>
                ) : filtered.map((peserta, idx) => (
                  <TableRow key={peserta.id}>
                    <TableCell className="text-gray-400 font-medium">{idx + 1}</TableCell>
                    <TableCell className="font-semibold text-dark">{peserta.nomor_peserta}</TableCell>
                    <TableCell>{peserta.nama}</TableCell>
                    <TableCell>{peserta.sekolah?.nama}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-blue-50 text-primary px-2 py-1 rounded-md border border-blue-100">
                        {peserta.bidang_lomba?.nama}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenModal(peserta)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                        </button>
                        <button onClick={() => handleDelete(peserta.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
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
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-5 border-b">
                <h3 className="font-bold text-lg">{editItem ? 'Edit Data Peserta' : 'Tambah Peserta Baru'}</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                    <input required type="text" value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Nama Peserta" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Peserta *</label>
                    <input required type="text" value={formData.nomor_peserta} onChange={e => setFormData({...formData, nomor_peserta: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Cth: WEB-001" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bidang Lomba *</label>
                  <select required value={formData.bidang_lomba_id} onChange={e => setFormData({...formData, bidang_lomba_id: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="" disabled>Pilih Bidang Lomba...</option>
                    {bidangList.map(b => (
                      <option key={b.id} value={b.id}>{b.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asal Sekolah *</label>
                  <select required value={formData.sekolah_id} onChange={e => setFormData({...formData, sekolah_id: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white">
                    <option value="" disabled>Pilih Sekolah...</option>
                    {sekolahList.map(s => (
                      <option key={s.id} value={s.id}>{s.nama}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="w-full">Batal</Button>
                  <Button type="submit" disabled={saving} className="w-full shadow-md">
                    {saving ? 'Menyimpan...' : 'Simpan Data Peserta'}
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
