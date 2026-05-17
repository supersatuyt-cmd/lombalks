import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { supabase } from '../../lib/supabase';
import { ArrowLeft, Award, BookOpen, GraduationCap } from 'lucide-react';

export default function DetailPeserta() {
  const { slug } = useParams();
  const [peserta, setPeserta] = useState(null);
  const [bidang, setBidang] = useState(null);
  const [modulList, setModulList] = useState([]);
  const [penilaianData, setPenilaianData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('detail-peserta-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'penilaian' }, () => {
        fetchPenilaian();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [slug]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch peserta
      const { data: pesertaData } = await supabase
        .from('peserta')
        .select('*, sekolah(nama)')
        .eq('slug', slug)
        .single();
      
      setPeserta(pesertaData);

      if (!pesertaData) return;

      // 2. Fetch bidang
      const { data: bidangData } = await supabase
        .from('bidang_lomba')
        .select('*')
        .eq('id', pesertaData.bidang_lomba_id)
        .single();
      
      setBidang(bidangData);

      // 3. Fetch modul & deskripsi_nilai
      const { data: modulData } = await supabase
        .from('modul')
        .select('*, deskripsi_nilai(*)')
        .eq('bidang_lomba_id', pesertaData.bidang_lomba_id)
        .order('urutan');
      
      // Urutkan deskripsi per modul
      const sortedModul = (modulData || []).map(m => ({
        ...m,
        deskripsi_nilai: (m.deskripsi_nilai || []).sort((a, b) => a.urutan - b.urutan)
      }));
      setModulList(sortedModul);

      // 4. Fetch penilaian
      await fetchPenilaian(pesertaData.id);
    } finally {
      setLoading(false);
    }
  };

  const fetchPenilaian = async (pesertaId) => {
    const pId = pesertaId || peserta?.id;
    if (!pId) return;

    const { data } = await supabase
      .from('penilaian')
      .select('*')
      .eq('peserta_id', pId);
    
    setPenilaianData(data || []);
  };

  // Kalkulasi rata-rata nilai per deskripsi_nilai dari semua juri
  const getRataRataNilai = (deskripsiId) => {
    const nilaiTerkait = penilaianData.filter(p => p.deskripsi_nilai_id === deskripsiId);
    if (nilaiTerkait.length === 0) return null;

    // Rata-rata antar juri (misal ada 3 juri menilai deskripsi ini, maka dirata-ratakan)
    const total = nilaiTerkait.reduce((sum, p) => sum + Number(p.nilai), 0);
    return total / nilaiTerkait.length;
  };

  if (loading) return (
    <PageWrapper>
      <div className="flex items-center justify-center h-64 text-gray-400">Memuat data...</div>
    </PageWrapper>
  );

  if (!peserta) return (
    <PageWrapper>
      <div className="text-center py-20 text-gray-500">Peserta tidak ditemukan.</div>
    </PageWrapper>
  );

  // Menghitung total per Modul
  const totalPerModul = modulList.map(modul => {
    return modul.deskripsi_nilai.reduce((sum, desk) => {
      const val = getRataRataNilai(desk.id) || 0;
      return sum + val;
    }, 0);
  });

  const grandTotal = totalPerModul.reduce((sum, val) => sum + val, 0);
  const maxTotal = modulList.flatMap(m => m.deskripsi_nilai).reduce((sum, desk) => sum + Number(desk.nilai_max), 0);

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to={`/bidang/${bidang?.kode}`} className="p-2 rounded-lg hover:bg-blue-50 text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" /> Detail Poin Peserta
            </h1>
          </div>
        </div>

        {/* Info Peserta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Nama Peserta</p>
                <p className="text-lg font-bold text-dark">{peserta.nama}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white to-indigo-50/50 border-indigo-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Asal Sekolah</p>
                <p className="text-lg font-bold text-dark">{peserta.sekolah?.nama || '-'}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-white to-cyan-50/50 border-cyan-100">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Bidang Lomba</p>
                <p className="text-lg font-bold text-dark">{bidang?.nama}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabel Detail Poin */}
        <div className="space-y-6">
          {modulList.map((modul, idx) => {
            const subtotal = totalPerModul[idx];
            return (
              <Card key={modul.id} className="overflow-hidden border-blue-100 shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b flex items-center justify-between">
                  <h3 className="text-lg font-bold text-dark flex items-center gap-2">
                    <span className="text-primary">📋</span> {modul.nama}
                  </h3>
                  <div className="text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded shadow-sm border">
                    Subtotal: <span className="text-lg text-primary">{subtotal.toFixed(1)}</span>
                  </div>
                </div>
                <CardContent className="p-0 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white">
                        <TableHead className="w-1/2 font-bold text-gray-500">Deskripsi Penilaian</TableHead>
                        <TableHead className="text-center font-bold text-gray-500 w-32">Nilai Max</TableHead>
                        <TableHead className="text-center font-bold text-gray-500 w-40">Nilai Didapat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modul.deskripsi_nilai.map((desk) => {
                        const nilai = getRataRataNilai(desk.id);
                        return (
                          <TableRow key={desk.id} className="hover:bg-blue-50/20 transition-colors">
                            <TableCell className="font-medium text-gray-700 pl-6">{desk.nama}</TableCell>
                            <TableCell className="text-center text-gray-400 font-medium">
                              {desk.nilai_max}
                            </TableCell>
                            <TableCell className="text-center">
                              {nilai !== null ? (
                                <span className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-100 min-w-[3rem]">
                                  {nilai.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Total Akhir */}
          <Card className="bg-gradient-to-br from-primary to-blue-800 text-white shadow-xl shadow-primary/20 border-0">
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Total Nilai Keseluruhan</h3>
                <p className="text-blue-200 text-sm">Akumulasi dari seluruh modul yang dinilai</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black">{grandTotal.toFixed(1)}</span>
                <span className="text-xl text-blue-200 mb-1">/ {maxTotal}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}
