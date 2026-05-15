import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { Save, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

export default function FormPenilaian() {
  const { user, juriData } = useAuth();
  const [pesertaList, setPesertaList] = useState([]);
  const [modulList, setModulList] = useState([]);
  const [pesertaIndex, setPesertaIndex] = useState(0);
  const [formNilai, setFormNilai] = useState({});
  const [savedPeserta, setSavedPeserta] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (juriData?.bidang_lomba_id) fetchData();
  }, [juriData]);

  useEffect(() => {
    if (pesertaList.length > 0 && modulList.length > 0) loadNilaiExisting();
  }, [pesertaIndex, pesertaList, modulList]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    const [pesertaRes, modulRes] = await Promise.all([
      supabase.from('peserta').select('*, sekolah(nama)').eq('bidang_lomba_id', juriData.bidang_lomba_id).order('nomor_peserta'),
      supabase.from('modul').select('*, deskripsi_nilai(*)').eq('bidang_lomba_id', juriData.bidang_lomba_id).order('urutan'),
    ]);
    setPesertaList(pesertaRes.data || []);
    setModulList((modulRes.data || []).map(m => ({
      ...m,
      deskripsi_nilai: (m.deskripsi_nilai || []).sort((a, b) => a.urutan - b.urutan),
    })));
    setLoading(false);
  };

  const loadNilaiExisting = async () => {
    if (!pesertaList[pesertaIndex] || !juriData) return;
    const { data } = await supabase
      .from('penilaian')
      .select('*')
      .eq('juri_id', juriData.id)
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
    if (!pesertaList[pesertaIndex] || !juriData) return;
    setSaving(true);
    const pesertaId = pesertaList[pesertaIndex].id;
    const allDeskIds = modulList.flatMap(m => m.deskripsi_nilai.map(d => d.id));
    const payload = allDeskIds.map(deskId => ({
      juri_id: juriData.id,
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

  if (loading) return (
    <PageWrapper>
      <div className="flex items-center justify-center h-64 text-gray-400">Memuat data penilaian...</div>
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
              <h1 className="text-xl font-bold">{juriData?.nama || 'Juri'}</h1>
              <Badge className="bg-white/20 text-white mt-1 border-0">
                {juriData?.bidang_lomba?.nama || 'Bidang Lomba'}
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-blue-100 text-sm">Progress</div>
              <div className="text-3xl font-bold">{savedPeserta.size}/{pesertaList.length}</div>
              <div className="text-blue-100 text-xs">peserta dinilai</div>
            </div>
          </div>
        </div>

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
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-1/2">Deskripsi Penilaian</TableHead>
                    <TableHead className="text-center">Nilai Max</TableHead>
                    <TableHead className="text-center w-40">Nilai Diberikan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modulList.map((modul) => (
                    <React.Fragment key={modul.id}>
                      <TableRow className="bg-blue-50/50">
                        <TableCell colSpan={3} className="font-semibold text-primary py-2 text-sm">
                          📋 {modul.nama}
                        </TableCell>
                      </TableRow>
                      {modul.deskripsi_nilai.map((desc) => (
                        <TableRow key={desc.id}>
                          <TableCell className="pl-8 text-gray-700 text-sm">{desc.nama}</TableCell>
                          <TableCell className="text-center text-gray-500 font-medium">{desc.nilai_max}</TableCell>
                          <TableCell>
                            <input type="number" min="0" max={desc.nilai_max} step="0.5"
                              value={formNilai[desc.id] !== undefined ? formNilai[desc.id] : ''}
                              onChange={e => handleNilaiChange(desc.id, desc.nilai_max, e.target.value)}
                              placeholder="0"
                              className="w-full text-center p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg font-semibold text-dark"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-gray-50/80">
                        <TableCell colSpan={2} className="text-right text-sm font-medium text-gray-600">
                          Subtotal {modul.nama.split(':')[0]}:
                        </TableCell>
                        <TableCell className="text-center font-bold text-dark">{hitungTotalModul(modul).toFixed(1)}</TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
              <div className="p-5 border-t flex items-center justify-between bg-gray-50">
                <div className="text-sm text-gray-500">
                  Persentase: <span className="font-bold text-primary">
                    {maxTotal > 0 ? ((grandTotal / maxTotal) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Button onClick={handleSimpan} disabled={saving} size="lg">
                  {saving ? 'Menyimpan...' : <><Save className="h-5 w-5 mr-2" />Simpan Nilai</>}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  );
}
