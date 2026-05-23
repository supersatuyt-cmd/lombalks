import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { Save, ChevronLeft, ChevronRight, CheckCircle, BookOpen } from 'lucide-react';

export default function FormPenilaian() {
  const { user, juriList, loading: authLoading } = useAuth();

  // Juri aktif yang sedang dipilih (index dari juriList)
  const [activeBidangIdx, setActiveBidangIdx] = useState(0);

  const [pesertaList, setPesertaList] = useState([]);
  const [modulList, setModulList] = useState([]);
  const [pesertaIndex, setPesertaIndex] = useState(0);
  const [formNilai, setFormNilai] = useState({});
  const [savedPeserta, setSavedPeserta] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Juri yang aktif saat ini
  const activeJuri = juriList[activeBidangIdx] || null;

  // Reset data peserta & nilai saat ganti bidang
  useEffect(() => {
    if (authLoading) return;
    if (activeJuri?.bidang_lomba_id) {
      setPesertaIndex(0);
      setSavedPeserta(new Set());
      setFormNilai({});
      fetchData(activeJuri);
    }
  }, [activeJuri?.id, authLoading]);

  useEffect(() => {
    if (pesertaList.length > 0 && modulList.length > 0) loadNilaiExisting();
  }, [pesertaIndex, pesertaList, modulList]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async (juri) => {
    setLoading(true);
    try {
      const [pesertaRes, modulRes] = await Promise.all([
        supabase.from('peserta').select('*, sekolah(nama)').eq('bidang_lomba_id', juri.bidang_lomba_id).order('nomor_peserta'),
        supabase.from('modul').select('*, deskripsi_nilai(*)').eq('bidang_lomba_id', juri.bidang_lomba_id).order('urutan'),
      ]);
      setPesertaList(pesertaRes.data || []);
      setModulList((modulRes.data || []).map(m => ({
        ...m,
        deskripsi_nilai: (m.deskripsi_nilai || []).sort((a, b) => a.urutan - b.urutan),
      })));
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadNilaiExisting = async () => {
    if (!pesertaList[pesertaIndex] || !activeJuri) return;
    const { data } = await supabase
      .from('penilaian')
      .select('*')
      .eq('juri_id', activeJuri.id)
      .eq('peserta_id', pesertaList[pesertaIndex].id);

    if (data?.length > 0) {
      const map = {};
      data.forEach(p => { map[p.deskripsi_nilai_id] = p.nilai; });
      setFormNilai(map);
      setSavedPeserta(prev => new Set(prev).add(pesertaList[pesertaIndex].id));
    } else {
      setFormNilai({});
    }
  };

  const handleNilaiChange = (deskId, max, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = '';
    else if (num < 0) num = 0;
    else if (num > max) num = max;
    setFormNilai(prev => ({ ...prev, [deskId]: num }));
  };

  const handleSimpan = async () => {
    if (!pesertaList[pesertaIndex] || !activeJuri) return;
    setSaving(true);
    const pesertaId = pesertaList[pesertaIndex].id;
    const allDeskIds = modulList.flatMap(m => m.deskripsi_nilai.map(d => d.id));
    const payload = allDeskIds.map(deskId => ({
      juri_id: activeJuri.id,
      peserta_id: pesertaId,
      deskripsi_nilai_id: deskId,
      nilai: parseFloat(formNilai[deskId]) || 0,
    }));

    const { error } = await supabase
      .from('penilaian')
      .upsert(payload, { onConflict: 'juri_id,peserta_id,deskripsi_nilai_id' });

    setSaving(false);
    if (error) {
      showToast('Gagal menyimpan: ' + error.message, 'error');
    } else {
      setSavedPeserta(prev => new Set(prev).add(pesertaId));
      showToast(`Nilai ${pesertaList[pesertaIndex].nama} berhasil disimpan!`);
      if (pesertaIndex < pesertaList.length - 1) {
        setTimeout(() => setPesertaIndex(i => i + 1), 1000);
      }
    }
  };

  const hitungTotalModul = (modul) =>
    modul.deskripsi_nilai.reduce((s, d) => s + (parseFloat(formNilai[d.id]) || 0), 0);
  const hitungGrandTotal = () => modulList.reduce((s, m) => s + hitungTotalModul(m), 0);
  const hitungNilaiMaxTotal = () => modulList.flatMap(m => m.deskripsi_nilai).reduce((s, d) => s + Number(d.nilai_max), 0);

  if (!user) return <Navigate to="/login" replace />;

  if (authLoading) return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p>Memeriksa sesi login juri...</p>
      </div>
    </PageWrapper>
  );

  if (loading) return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p>Memuat data peserta dan modul penilaian...</p>
      </div>
    </PageWrapper>
  );

  if (!activeJuri) return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <p>Anda tidak memiliki akses Juri yang valid.</p>
      </div>
    </PageWrapper>
  );

  const currentPeserta = pesertaList[pesertaIndex];
  const isCurrentSaved = currentPeserta && savedPeserta.has(currentPeserta.id);
  const grandTotal = hitungGrandTotal();
  const maxTotal = hitungNilaiMaxTotal();

  return (
    <PageWrapper>
      <div className="space-y-5">
        {toast && (
          <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium
            ${toast.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {toast.msg}
          </div>
        )}

        {/* Header Juri */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Selamat datang,</p>
              <h1 className="text-xl font-bold">{activeJuri?.nama || 'Juri'}</h1>
              <Badge className="bg-white/20 text-white mt-1 border-0">
                {activeJuri?.bidang_lomba?.nama || 'Bidang Lomba'}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-sm">Progress</div>
              <div className="text-3xl font-bold">{savedPeserta.size}/{pesertaList.length}</div>
              <div className="text-blue-100 text-xs">peserta dinilai</div>
            </div>
          </div>
        </div>

        {/* Tab Bidang Lomba — hanya tampil kalau juri punya lebih dari 1 bidang */}
        {juriList.length > 1 && (
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" /> Pilih Bidang Lomba
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {juriList.map((j, idx) => (
                <button
                  key={j.id}
                  onClick={() => setActiveBidangIdx(idx)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${
                    idx === activeBidangIdx
                      ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                    idx === activeBidangIdx ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {j.bidang_lomba?.kode}
                  </span>
                  {j.bidang_lomba?.nama}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab Peserta */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {pesertaList.map((p, idx) => (
            <button key={p.id} onClick={() => setPesertaIndex(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                idx === pesertaIndex ? 'bg-primary text-white shadow-sm'
                : savedPeserta.has(p.id) ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-primary'
              }`}>
              {savedPeserta.has(p.id) && <CheckCircle className="h-3.5 w-3.5" />}
              {p.nomor_peserta}
            </button>
          ))}
        </div>

        {/* Nav */}
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" disabled={pesertaIndex === 0} onClick={() => setPesertaIndex(i => i - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Sebelumnya
          </Button>
          <span className="text-sm text-gray-500">Peserta {pesertaIndex + 1} dari {pesertaList.length}</span>
          <Button variant="outline" size="sm" disabled={pesertaIndex === pesertaList.length - 1} onClick={() => setPesertaIndex(i => i + 1)}>
            Selanjutnya <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>

        {/* Form */}
        {currentPeserta && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{currentPeserta.nama}</CardTitle>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <span className="font-medium text-dark">{currentPeserta.nomor_peserta}</span>
                    <span>•</span>
                    <span>{currentPeserta.sekolah?.nama}</span>
                    {isCurrentSaved && <Badge variant="success">Sudah Dinilai</Badge>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400">Total Nilai</div>
                  <div className="text-3xl font-bold text-primary">{grandTotal.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">dari {maxTotal}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              {modulList.map((modul) => (
                <div key={modul.id} className="border border-blue-100 rounded-xl overflow-hidden shadow-sm bg-white transition-all hover:shadow-md">
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
                    <h3 className="font-bold text-dark text-lg flex items-center gap-2">
                      <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm">📋</span>
                      {modul.nama}
                    </h3>
                    <div className="bg-white px-3 py-1 rounded-md shadow-sm border border-blue-50">
                      <span className="text-sm text-gray-500 mr-2">Subtotal:</span>
                      <span className="font-bold text-primary text-lg">{hitungTotalModul(modul).toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50/30">
                          <TableHead className="w-1/2 font-semibold text-gray-600">Deskripsi Penilaian</TableHead>
                          <TableHead className="text-center font-semibold text-gray-600 w-32">Nilai Max</TableHead>
                          <TableHead className="text-center font-semibold text-gray-600 w-48">Skor Diberikan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {modul.deskripsi_nilai.map((desc) => (
                          <TableRow key={desc.id} className="hover:bg-blue-50/20 transition-colors">
                            <TableCell className="font-medium text-gray-700 pl-5">{desc.nama}</TableCell>
                            <TableCell className="text-center">
                              <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full">
                                {desc.nilai_max}
                              </span>
                            </TableCell>
                            <TableCell className="pr-5">
                              <input
                                type="number" min="0" max={desc.nilai_max} step="0.5"
                                value={formNilai[desc.id] !== undefined ? formNilai[desc.id] : ''}
                                onChange={e => handleNilaiChange(desc.id, desc.nilai_max, e.target.value)}
                                placeholder="0"
                                className="w-full text-center p-2.5 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none text-lg font-bold text-dark transition-all"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}

              <div className="p-6 border rounded-xl flex flex-col sm:flex-row items-center justify-between bg-gradient-to-br from-gray-50 to-blue-50/30 shadow-inner">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                  <div className="text-sm text-gray-500 mb-1">Persentase Pencapaian</div>
                  <div className="text-2xl font-black text-primary flex items-end gap-1">
                    {maxTotal > 0 ? ((grandTotal / maxTotal) * 100).toFixed(1) : 0}
                    <span className="text-lg text-gray-400">%</span>
                  </div>
                </div>
                <Button onClick={handleSimpan} disabled={saving} size="lg" className="w-full sm:w-auto shadow-lg shadow-primary/30">
                  {saving ? 'Menyimpan...' : <><Save className="h-5 w-5 mr-2" />Simpan Semua Nilai</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
