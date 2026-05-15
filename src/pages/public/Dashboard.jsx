import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Badge } from '../../components/ui/Badge';
import { BidangProgressChart } from '../../components/charts/BidangProgressChart';
import { ArrowRight, Trophy } from 'lucide-react';

// Data dummy untuk tahap awal
const dummyBidangLomba = [
  { id: '1', kode: 'cybersec', nama: 'Cyber Security', juriSelesai: 2, totalJuri: 3, progress: 66.67 },
  { id: '2', kode: 'itns', nama: 'IT Network System Admin', juriSelesai: 3, totalJuri: 3, progress: 100 },
  { id: '3', kode: 'design', nama: 'Graphic Design', juriSelesai: 1, totalJuri: 4, progress: 25 },
  { id: '4', kode: 'cabling', nama: 'IT Software Solutions', juriSelesai: 0, totalJuri: 2, progress: 0 },
];

export default function Dashboard() {
  const [data, setData] = useState(dummyBidangLomba);

  // Nantinya di sini fetch ke Supabase
  // useEffect(() => { ... }, [])

  return (
    <PageWrapper>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-dark flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Live Score LKS Kabupaten
          </h1>
          <p className="text-gray-500">Pantau perolehan nilai dan progress penjurian Lomba Kompetensi Siswa secara realtime.</p>
        </div>

        {/* Chart Section */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Penjurian per Bidang Lomba</CardTitle>
          </CardHeader>
          <CardContent>
            <BidangProgressChart data={data} />
          </CardContent>
        </Card>

        {/* Table Section */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Bidang Lomba</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Bidang Lomba</TableHead>
                  <TableHead className="w-48">Progress (%)</TableHead>
                  <TableHead className="w-32">Status Juri</TableHead>
                  <TableHead className="w-32 text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((bidang, index) => (
                  <TableRow key={bidang.id}>
                    <TableCell className="font-medium text-gray-500">{index + 1}</TableCell>
                    <TableCell>
                      <div className="font-semibold text-dark">{bidang.nama}</div>
                      <div className="text-xs text-gray-400">Kode: {bidang.kode}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ProgressBar progress={bidang.progress} />
                        <span className="text-sm font-medium w-12">{Math.round(bidang.progress)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={bidang.progress === 100 ? 'success' : bidang.progress === 0 ? 'default' : 'warning'}>
                        {bidang.juriSelesai} / {bidang.totalJuri} Selesai
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link 
                        to={`/bidang/${bidang.kode}`}
                        className="inline-flex items-center justify-center p-2 rounded-full hover:bg-blue-50 text-primary transition-colors"
                        title="Lihat Detail"
                      >
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
