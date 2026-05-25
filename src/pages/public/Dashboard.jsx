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
    const { data: penilaian } = await supabase.from('penilaian').select('juri_id, peserta_id, deskripsi_nilai_id, nilai');
    const { data: modulList } = await supabase.from('modul').select('id, bidang_lomba_id');
    const { data: deskripsiList } = await supabase.from('deskripsi_nilai').select('id, modul_id');

    if (!bidang) return;

    const result = bidang.map(b => {
      const juriIds = (b.juri || []).map(j => j.id);
      const pesertaIds = (peserta || []).filter(p => p.bidang_lomba_id === b.id).map(p => p.id);
      
      const bidangModuls = (modulList || []).filter(m => m.bidang_lomba_id === b.id).map(m => m.id);
      const bidangDeskripsi = (deskripsiList || []).filter(d => bidangModuls.includes(d.modul_id)).map(d => d.id);
      const totalDeskripsi = bidangDeskripsi.length;

      // Hitung progress berdasarkan jumlah kolom nilai (deskripsi_nilai) yang sudah diisi (> 0)
      const expectedEvaluations = juriIds.length * pesertaIds.length * totalDeskripsi;
      let completedEvaluations = 0;

      if (expectedEvaluations > 0) {
        (penilaian || []).forEach(p => {
          if (juriIds.includes(p.juri_id) && pesertaIds.includes(p.peserta_id) && p.nilai > 0) {
            completedEvaluations++;
          }
        });
      }

      // Progress bar percentage
      const progress = expectedEvaluations > 0 ? (completedEvaluations / expectedEvaluations) * 100 : 0;

      // Juri selesai (yang sudah mengisi semua form > 0 untuk seluruh peserta)
      const juriSelesai = juriIds.filter(juriId => {
        let juriCompleted = 0;
        (penilaian || []).forEach(p => {
          if (p.juri_id === juriId && pesertaIds.includes(p.peserta_id) && p.nilai > 0) {
            juriCompleted++;
          }
        });
        const requiredForJuri = pesertaIds.length * totalDeskripsi;
        return requiredForJuri > 0 && juriCompleted === requiredForJuri;
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

        {/* Hasil Karya Peserta (SharePoint Links) */}
        <Card className="border border-blue-100 bg-white/60 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-50/50">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center">📂</span>
              Akses Hasil Karya Peserta
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <style>{`
              .it-btn {
                position: relative;
                min-width: 200px;
                height: 90px;
                border-radius: 22px;
                text-decoration: none;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                background: rgba(255,255,255,0.75);
                border: 1px solid rgba(120,190,255,0.35);
                backdrop-filter: blur(12px);
                color: #2196f3;
                font-weight: 700;
                font-size: 1.25rem;
                letter-spacing: 1px;
                transition: all .35s ease;
                box-shadow: 0 10px 25px rgba(33,150,243,0.08);
                text-transform: uppercase;
              }

              .it-btn.disabled {
                cursor: not-allowed;
              }

              .it-btn::before {
                content: '';
                position: absolute;
                top: 0;
                left: -130%;
                width: 100%;
                height: 100%;
                background: linear-gradient(120deg, transparent, rgba(255,255,255,.7), transparent);
                transition: .7s;
              }

              .it-btn:hover::before {
                left: 130%;
              }

              .it-btn:hover {
                transform: translateY(-6px) scale(1.03);
                background: linear-gradient(135deg, #6ec6ff, #42a5f5);
                color: white;
                box-shadow: 0 18px 35px rgba(33,150,243,0.25);
              }

              .it-title {
                transition: .3s;
                z-index: 2;
                font-size: 1.25rem;
                transform-origin: top center;
              }

              .it-desc {
                position: absolute;
                bottom: 8px;
                font-size: 0.6rem;
                font-weight: 600;
                opacity: 0;
                transform: translateY(10px);
                transition: .3s;
                text-align: center;
                padding: 0 12px;
                line-height: 1.15;
                width: 100%;
              }

              .it-btn:hover .it-title {
                transform: translateY(-16px) scale(0.9);
              }

              .it-btn:hover .it-desc {
                opacity: 1;
                transform: translateY(0);
              }
              
              .it-btn-badge {
                position: absolute;
                top: 8px;
                right: 12px;
                font-size: 0.6rem;
                font-weight: 600;
                color: #ef4444; /* Red color for 'Progress' to make it slightly visible */
                background: rgba(254,226,226,0.8);
                padding: 2px 6px;
                border-radius: 4px;
                transition: .3s;
              }
              .it-btn:hover .it-btn-badge {
                opacity: 0;
                visibility: hidden;
                transform: translateY(-5px);
              }
            `}</style>
            <div className="flex flex-wrap gap-5 justify-center sm:justify-start">
              {loading ? (
                <div className="text-gray-400 text-sm">Memuat link...</div>
              ) : bidangList.map((bidang) => {
                const hasLink = !!bidang.sharepoint_link;
                return (
                  <a
                    key={bidang.id}
                    href={hasLink ? bidang.sharepoint_link : '#'}
                    target={hasLink ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    onClick={(e) => !hasLink && e.preventDefault()}
                    className={`it-btn ${!hasLink ? 'disabled' : ''}`}
                  >
                    <span className="it-title">{bidang.kode}</span>
                    <span className="it-desc">{bidang.nama}</span>
                    {!hasLink && <span className="it-btn-badge">Progress</span>}
                  </a>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>
    </PageWrapper>
  );
}
