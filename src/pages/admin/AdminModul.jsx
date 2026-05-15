import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { Plus, Save, Trash2, ChevronDown, ChevronRight, Settings } from 'lucide-react';

export default function AdminModul() {
  const { user } = useAuth();
  const [bidangList, setBidangList] = useState([]);
  const [selectedBidang, setSelectedBidang] = useState(null);
  const [modulList, setModulList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedModul, setExpandedModul] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchBidang();
  }, []);

  useEffect(() => {
    if (selectedBidang) fetchModul(selectedBidang.id);
  }, [selectedBidang]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBidang = async () => {
    const { data } = await supabase.from('bidang_lomba').select('*').order('nama');
    setBidangList(data || []);
    if (data?.length > 0) setSelectedBidang(data[0]);
    setLoading(false);
  };

  const fetchModul = async (bidangId) => {
    setLoading(true);
    const { data } = await supabase
      .from('modul')
      .select('*, deskripsi_nilai(*)')
      .eq('bidang_lomba_id', bidangId)
      .order('urutan');
    setModulList((data || []).map(m => ({
      ...m,
      deskripsi_nilai: (m.deskripsi_nilai || []).sort((a, b) => a.urutan - b.urutan),
      _dirty: false,
    })));
    setLoading(false);
  };

  const updateModulField = (modulId, field, value) => {
    setModulList(prev => prev.map(m => m.id === modulId ? { ...m, [field]: value, _dirty: true } : m));
  };

  const updateDeskripsiField = (modulId, deskId, field, value) => {
    setModulList(prev => prev.map(m => {
      if (m.id !== modulId) return m;
      return {
        ...m,
        _dirty: true,
        deskripsi_nilai: m.deskripsi_nilai.map(d =>
          d.id === deskId ? { ...d, [field]: value } : d
        )
      };
    }));
  };

  const tambahModul = async () => {
    const maxUrutan = modulList.length > 0 ? Math.max(...modulList.map(m => m.urutan)) : 0;
    const { data, error } = await supabase.from('modul').insert({
      bidang_lomba_id: selectedBidang.id,
      nama: `Modul ${maxUrutan + 1}: (Nama Baru)`,
      urutan: maxUrutan + 1,
    }).select().single();
    if (!error) {
      setModulList(prev => [...prev, { ...data, deskripsi_nilai: [], _dirty: false }]);
      setExpandedModul(prev => ({ ...prev, [data.id]: true }));
    }
  };

  const hapusModul = async (modulId) => {
    if (!confirm('Hapus modul ini beserta semua deskripsi nilainya?')) return;
    await supabase.from('modul').delete().eq('id', modulId);
    setModulList(prev => prev.filter(m => m.id !== modulId));
    showToast('Modul dihapus');
  };

  const tambahDeskripsi = async (modulId) => {
    const modul = modulList.find(m => m.id === modulId);
    const maxUrutan = modul.deskripsi_nilai.length > 0
      ? Math.max(...modul.deskripsi_nilai.map(d => d.urutan)) : 0;
    const { data, error } = await supabase.from('deskripsi_nilai').insert({
      modul_id: modulId,
      nama: 'Deskripsi Baru',
      nilai_max: 100,
      urutan: maxUrutan + 1,
    }).select().single();
    if (!error) {
      setModulList(prev => prev.map(m =>
        m.id === modulId
          ? { ...m, deskripsi_nilai: [...m.deskripsi_nilai, data] }
          : m
      ));
    }
  };

  const hapusDeskripsi = async (modulId, deskId) => {
    await supabase.from('deskripsi_nilai').delete().eq('id', deskId);
    setModulList(prev => prev.map(m =>
      m.id === modulId
        ? { ...m, deskripsi_nilai: m.deskripsi_nilai.filter(d => d.id !== deskId) }
        : m
    ));
    showToast('Deskripsi dihapus');
  };

  const simpanSemua = async () => {
    setSaving(true);
    try {
      for (const modul of modulList.filter(m => m._dirty)) {
        await supabase.from('modul').update({ nama: modul.nama, urutan: modul.urutan }).eq('id', modul.id);
        for (const desk of modul.deskripsi_nilai) {
          await supabase.from('deskripsi_nilai').update({
            nama: desk.nama,
            nilai_max: Number(desk.nilai_max),
            urutan: desk.urutan,
          }).eq('id', desk.id);
        }
      }
      showToast('Semua perubahan tersimpan!');
      await fetchModul(selectedBidang.id);
    } catch (e) {
      showToast('Gagal menyimpan: ' + e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const hasDirty = modulList.some(m => m._dirty);

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium
            ${toast.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {toast.msg}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
              <Settings className="h-7 w-7 text-primary" />
              Kelola Modul & Deskripsi Nilai
            </h1>
            <p className="text-gray-500 text-sm mt-1">Edit nama modul, deskripsi, dan nilai maksimal per bidang lomba</p>
          </div>
          <div className="flex gap-2">
            {hasDirty && (
              <Button onClick={simpanSemua} disabled={saving} variant="primary">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Menyimpan...' : 'Simpan Semua'}
              </Button>
            )}
            <Button onClick={tambahModul} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Tambah Modul
            </Button>
          </div>
        </div>

        {/* Filter Bidang */}
        <div className="flex gap-2 flex-wrap">
          {bidangList.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBidang(b)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedBidang?.id === b.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
              }`}
            >
              {b.nama}
            </button>
          ))}
        </div>

        {/* Modul List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Memuat...</div>
        ) : modulList.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-gray-400">
              Belum ada modul. Klik "Tambah Modul" untuk membuat modul baru.
            </CardContent>
          </Card>
        ) : modulList.map((modul) => (
          <Card key={modul.id} className={modul._dirty ? 'border-orange-300' : ''}>
            <CardHeader className="py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExpandedModul(prev => ({ ...prev, [modul.id]: !prev[modul.id] }))}
                  className="text-gray-400 hover:text-primary"
                >
                  {expandedModul[modul.id]
                    ? <ChevronDown className="h-5 w-5" />
                    : <ChevronRight className="h-5 w-5" />
                  }
                </button>
                <input
                  type="text"
                  value={modul.nama}
                  onChange={e => updateModulField(modul.id, 'nama', e.target.value)}
                  className="flex-1 text-base font-semibold text-dark bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary outline-none transition-colors px-1"
                />
                {modul._dirty && <Badge variant="warning">Belum disimpan</Badge>}
                <button
                  onClick={() => hapusModul(modul.id)}
                  className="text-red-400 hover:text-red-600 p-1 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>

            {expandedModul[modul.id] && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {/* Header tabel deskripsi */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-gray-400 px-2 pb-1 border-b">
                    <div className="col-span-1">No</div>
                    <div className="col-span-7">Nama Deskripsi Penilaian</div>
                    <div className="col-span-2 text-center">Nilai Max</div>
                    <div className="col-span-2 text-center">Aksi</div>
                  </div>

                  {modul.deskripsi_nilai.map((desk, idx) => (
                    <div key={desk.id} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-lg px-2 py-1.5">
                      <div className="col-span-1 text-sm text-gray-400">{idx + 1}</div>
                      <div className="col-span-7">
                        <input
                          type="text"
                          value={desk.nama}
                          onChange={e => updateDeskripsiField(modul.id, desk.id, 'nama', e.target.value)}
                          className="w-full text-sm bg-white border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={desk.nilai_max}
                          onChange={e => updateDeskripsiField(modul.id, desk.id, 'nilai_max', e.target.value)}
                          className="w-full text-sm text-center bg-white border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-primary outline-none"
                          min="0"
                        />
                      </div>
                      <div className="col-span-2 text-center">
                        <button
                          onClick={() => hapusDeskripsi(modul.id, desk.id)}
                          className="text-red-400 hover:text-red-600 p-1 rounded"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => tambahDeskripsi(modul.id)}
                    className="flex items-center gap-2 text-sm text-primary hover:text-dark px-2 py-2 rounded-lg hover:bg-blue-50 w-full transition-colors"
                  >
                    <Plus className="h-4 w-4" /> Tambah Deskripsi Penilaian
                  </button>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </PageWrapper>
  );
}
