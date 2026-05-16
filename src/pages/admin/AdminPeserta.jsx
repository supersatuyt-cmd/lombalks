import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { supabase } from '../../lib/supabase';
import { Users, Search } from 'lucide-react';

export default function AdminPeserta() {
  const { user } = useAuth();
  const [pesertaList, setPesertaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchPeserta();
  }, []);

  const fetchPeserta = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('peserta')
      .select('*, bidang_lomba(nama, kode), sekolah(nama)')
      .order('nama');
    setPesertaList(data || []);
    setLoading(false);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              Kelola Peserta
            </h1>
            <p className="text-gray-500 text-sm mt-1">Daftar peserta lomba dari berbagai bidang dan sekolah</p>
          </div>
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
                      <span className="text-xs bg-blue-50 text-primary px-2 py-1 rounded-md">
                        {peserta.bidang_lomba?.nama}
                      </span>
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
