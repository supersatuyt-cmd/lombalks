import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { BidangProgressChart } from '../../components/charts/BidangProgressChart';
import { supabase } from '../../lib/supabase';
import { ArrowRight, Trophy } from 'lucide-react';

export default function Dashboard() {
  const [bidangList, setBidangList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();

    // Realtime: update saat ada penilaian baru
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'penilaian' }, () => {
        fetchDashboard();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const fetchDashboard = async () => {
    const { data: bidang } = await supabase.from('bidang_lomba').select('*, juri(id)').order('nama');
    const { data: peserta } = await supabase.from('peserta').select('id, bidang_lomba_id');
    const { data: penilaian } = await supabase.from('penilaian').select('juri_id, peserta_id, deskripsi_nilai_id');

    if (!bidang) return;

    const result = bidang.map(b => {
      const juriIds = (b.juri || []).map(j => j.id);
      const pesertaIds = (peserta || []).filter(p => p.bidang_lomba_id === b.id).map(p => p.id);
      const totalCombinations = juriIds.length * pesertaIds.length;

      // Hitung progress secara granular (jumlah peserta yang sudah dinilai oleh juri)
      const expectedEvaluations = juriIds.length * pesertaIds.length;
      let completedEvaluations = 0;

      if (expectedEvaluations > 0) {
        const uniqueEvaluations = new Set();
        (penilaian || []).forEach(p => {
          if (juriIds.includes(p.juri_id) && pesertaIds.includes(p.peserta_id)) {
            uniqueEvaluations.add(`${p.juri_id}-${p.peserta_id}`);
          }
        });
        completedEvaluations = uniqueEvaluations.size;
      }

      // Progress bar percentage
      const progress = expectedEvaluations > 0 ? (completedEvaluations / expectedEvaluations) * 100 : 0;

      // Juri selesai (yang sudah menilai SEMUA peserta)
      const juriSelesai = juriIds.filter(juriId => {
        return pesertaIds.every(pesertaId =>
          (penilaian || []).some(p => p.juri_id === juriId && p.peserta_id === pesertaId)
        );
      }).length;

      return {
        ...b,
        juriSelesai,
        totalJuri: juriIds.length,
        totalPeserta: pesertaIds.length,
        progress,
      };
    });

    setBidangList(result);
    setLoading(false);
  };

  const chartData = bidangList.map(b => ({
    name: b.kode.toUpperCase(), // Menggunakan kode agar muat
    fullName: b.nama,
    progress: Math.round(b.progress),
  }));

  return (
    <PageWrapper>
      <div className="space-y-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark via-primary to-secondary p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="h-8 w-8 text-yellow-300" />
              <span className="text-blue-200 text-sm font-medium uppercase tracking-widest">Live Score</span>
            </div>
            <h1 className="text-3xl font-bold mb-1">LKS Dikmen</h1>
            <p className="text-blue-100">Kabupaten Kutai Timur — Pantau nilai dan progress penjurian secara realtime</p>
          </div>
          {/* decorative circles */}
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/5"></div>
          <div className="absolute -right-4 bottom-4 h-24 w-24 rounded-full bg-white/5"></div>
        </div>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Penjurian per Bidang Lomba</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">Memuat grafik...</div>
            ) : (
              <BidangProgressChart data={chartData} />
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Bidang Lomba</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">No</TableHead>
                  <TableHead>Bidang Lomba</TableHead>
                  <TableHead className="w-16 text-center">Peserta</TableHead>
                  <TableHead className="w-48">Progress Penjurian</TableHead>
                  <TableHead className="w-36">Status Juri</TableHead>
                  <TableHead className="w-24 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-400">Memuat data...</TableCell>
                  </TableRow>
                ) : bidangList.map((bidang, index) => (
                  <TableRow key={bidang.id}>
                    <TableCell className="text-gray-400 font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-dark">{bidang.nama}</div>
                      <div className="text-xs text-gray-400">/{bidang.kode}</div>
                    </TableCell>
                    <TableCell className="text-center text-gray-600">{bidang.totalPeserta}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ProgressBar progress={bidang.progress} />
                        <span className="text-xs font-medium w-10">{Math.round(bidang.progress)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={bidang.progress === 100 ? 'success' : bidang.progress === 0 ? 'default' : 'warning'}>
                        {bidang.juriSelesai}/{bidang.totalJuri} Juri
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link to={`/bidang/${bidang.kode}`}
                        className="inline-flex items-center justify-center p-2 rounded-full hover:bg-blue-50 text-primary transition-colors">
                        <ArrowRight className="h-5 w-5" />
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
