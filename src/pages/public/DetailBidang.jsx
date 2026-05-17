import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, User, Search } from 'lucide-react';

export default function DetailBidang() {
  const { kode } = useParams();
  const [bidang, setBidang] = useState(null);
  const [pesertaList, setPesertaList] = useState([]);
  const [modulList, setModulList] = useState([]);
  const [penilaianData, setPenilaianData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
    // Realtime subscription
    const channel = supabase
      .channel('penilaian-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'penilaian' }, () => {
        fetchPenilaian();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [kode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch bidang lomba
      const { data: bidangData } = await supabase
        .from('bidang_lomba')
        .select('*')
        .eq('kode', kode)
        .single();
      setBidang(bidangData);

      if (!bidangData) return;

      // Fetch modul
      const { data: modulData } = await supabase
        .from('modul')
        .select('*, deskripsi_nilai(*)')
        .eq('bidang_lomba_id', bidangData.id)
        .order('urutan');
      setModulList(modulData || []);

      // Fetch peserta
      const { data: pesertaData } = await supabase
        .from('peserta')
        .select('*, sekolah(nama)')
        .eq('bidang_lomba_id', bidangData.id)
        .order('nomor_peserta');
      setPesertaList(pesertaData || []);

      // Fetch penilaian
      await fetchPenilaian(bidangData.id);
    } finally {
      setLoading(false);
    }
  };

  const fetchPenilaian = async (bidangId) => {
    const resolvedBidangId = bidangId || bidang?.id;
    if (!resolvedBidangId) return;

    const { data } = await supabase
      .from('penilaian')
      .select('*, juri(*), deskripsi_nilai(*, modul(*))')
      .eq('deskripsi_nilai.modul.bidang_lomba_id', resolvedBidangId);
    setPenilaianData(data || []);
  };

  const getNilaiPesertaPerModul = (pesertaId, modulId) => {
    const penilaianPeserta = penilaianData.filter(p => p.peserta_id === pesertaId && p.deskripsi_nilai?.modul_id === modulId);
    if (penilaianPeserta.length === 0) return null;

    const nilaiPerJuri = {};
    penilaianPeserta.forEach(p => {
      if (!nilaiPerJuri[p.juri_id]) nilaiPerJuri[p.juri_id] = 0;
      nilaiPerJuri[p.juri_id] += Number(p.nilai);
    });

    const totals = Object.values(nilaiPerJuri);
    return totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  };

  const getNilaiAkhir = (pesertaId) => {
    const penilaianPeserta = penilaianData.filter(p => p.peserta_id === pesertaId);
    if (penilaianPeserta.length === 0) return null;
    const nilaiPerJuri = {};
    penilaianPeserta.forEach(p => {
      if (!nilaiPerJuri[p.juri_id]) nilaiPerJuri[p.juri_id] = 0;
      nilaiPerJuri[p.juri_id] += Number(p.nilai);
    });
    const totals = Object.values(nilaiPerJuri);
    return totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  };

  const getNilaiMaxModul = (modul) => {
    return (modul.deskripsi_nilai || []).reduce((sum, d) => sum + Number(d.nilai_max), 0);
  };

  // Sort by nilai akhir untuk ranking
  const pesertaWithRank = [...pesertaList]
    .map(p => ({ ...p, nilaiAkhir: getNilaiAkhir(p.id) }))
    .sort((a, b) => (b.nilaiAkhir || 0) - (a.nilaiAkhir || 0))
    .map((p, i) => ({ ...p, rank: p.nilaiAkhir !== null ? i + 1 : '-' }));

  const filtered = pesertaWithRank.filter(p =>
    p.nama.toLowerCase().includes(search.toLowerCase()) ||
    p.sekolah?.nama?.toLowerCase().includes(search.toLowerCase()) ||
    p.nomor_peserta?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <PageWrapper>
      <div className="flex items-center justify-center h-64 text-gray-400">Memuat data...</div>
    </PageWrapper>
  );

  if (!bidang) return (
    <PageWrapper>
      <div className="text-center py-20 text-gray-500">Bidang lomba tidak ditemukan.</div>
    </PageWrapper>
  );

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/klasemen" className="p-2 rounded-lg hover:bg-blue-50 text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark">{bidang.nama}</h1>
            <p className="text-sm text-gray-500">{bidang.deskripsi} • {pesertaList.length} peserta</p>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daftar Peserta & Nilai</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari peserta atau sekolah..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none w-64"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Peserta</TableHead>
                  <TableHead>Sekolah</TableHead>
                  {modulList.map(m => (
                    <TableHead key={m.id} className="text-center w-32">{m.nama}</TableHead>
                  ))}
                  <TableHead className="text-center w-28">Nilai Akhir</TableHead>
                  <TableHead className="text-center w-20">Rank</TableHead>
                  <TableHead className="w-20 text-center">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={modulList.length + 6} className="text-center py-12 text-gray-400">
                      Tidak ada peserta ditemukan.
                    </TableCell>
                  </TableRow>
                ) : filtered.map((peserta, idx) => (
                  <TableRow key={peserta.id}>
                    <TableCell className="text-gray-400">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-dark">{peserta.nama}</div>
                      <div className="text-xs text-gray-400">{peserta.nomor_peserta}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{peserta.sekolah?.nama}</TableCell>
                    {modulList.map(m => {
                      const nilaiModul = getNilaiPesertaPerModul(peserta.id, m.id);
                      const maxModul = getNilaiMaxModul(m);
                      const pct = nilaiModul !== null && maxModul > 0 ? (nilaiModul / maxModul) * 100 : null;
                      return (
                        <TableCell key={m.id} className="text-center">
                          {nilaiModul !== null ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="font-semibold text-dark">{nilaiModul.toFixed(1)}</span>
                              <ProgressBar progress={pct} className="h-1.5 w-20" />
                            </div>
                          ) : (
                            <Badge variant="default">Belum</Badge>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center">
                      {peserta.nilaiAkhir !== null ? (
                        <span className="font-bold text-primary text-lg">{peserta.nilaiAkhir.toFixed(1)}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {peserta.rank !== '-' ? (
                        <Badge variant={peserta.rank === 1 ? 'success' : 'default'}>#{peserta.rank}</Badge>
                      ) : <span className="text-gray-300">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        to={`/peserta/${peserta.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <User className="h-3 w-3" /> Detail
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
