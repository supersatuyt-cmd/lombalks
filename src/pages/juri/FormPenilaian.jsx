import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LogOut, Save, User, ChevronLeft, ChevronRight } from 'lucide-react';
// import { supabase } from '../../lib/supabase'; // Will be used later

// Dummy data
const dummyPeserta = [
  { id: '1', nama: 'Budi Santoso', nomor_peserta: 'CS-001', sekolah: 'SMKN 1 Sangatta' },
  { id: '2', nama: 'Siti Aminah', nomor_peserta: 'CS-002', sekolah: 'SMKN 2 Sangatta' }
];

const dummyModul = [
  {
    id: 'm1', nama: 'Modul 1: Network Setup', urutan: 1, deskripsi_nilai: [
      { id: 'd1', nama: 'Konfigurasi IP', nilai_max: 20 },
      { id: 'd2', nama: 'Routing', nilai_max: 30 }
    ]
  },
  {
    id: 'm2', nama: 'Modul 2: Security', urutan: 2, deskripsi_nilai: [
      { id: 'd3', nama: 'Firewall Rules', nilai_max: 25 },
      { id: 'd4', nama: 'VPN Setup', nilai_max: 25 }
    ]
  }
];

export default function FormPenilaian() {
  const { user, juriData, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [pesertaIndex, setPesertaIndex] = useState(0);
  const [pesertaList, setPesertaList] = useState(dummyPeserta);
  const [modulList, setModulList] = useState(dummyModul);
  
  // State untuk menyimpan nilai form. Format: { [deskripsi_nilai_id]: nilai }
  const [formNilai, setFormNilai] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Jika tidak ada user/juri, lempar ke login
  // Komentar sementara agar Anda bisa melihat UI tanpa perlu database terhubung
  /*
  if (!user || !juriData) {
    return <Navigate to="/login" replace />;
  }
  */

  const currentPeserta = pesertaList[pesertaIndex];

  // Handler input nilai
  const handleNilaiChange = (deskripsiId, max, value) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
    
    // Validasi 0 sampai nilai_max
    if (num < 0) num = 0;
    if (num > max) num = max;

    setFormNilai(prev => ({
      ...prev,
      [deskripsiId]: num
    }));
    setSaveSuccess(false);
  };

  const handleSimpan = async () => {
    setSaving(true);
    // Simulasi simpan ke database
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      // Di sini nanti insert/upsert ke Supabase
      // const payload = Object.entries(formNilai).map(([deskripsi_id, nilai]) => ({
      //   juri_id: juriData.id,
      //   peserta_id: currentPeserta.id,
      //   deskripsi_nilai_id: deskripsi_id,
      //   nilai: parseFloat(nilai)
      // }));
      // await supabase.from('penilaian').upsert(payload, { onConflict: 'juri_id, peserta_id, deskripsi_nilai_id' });
    }, 1000);
  };

  const hitungTotalModul = (modul) => {
    return modul.deskripsi_nilai.reduce((total, d) => total + (formNilai[d.id] || 0), 0);
  };

  const hitungGrandTotal = () => {
    return modulList.reduce((total, m) => total + hitungTotalModul(m), 0);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header Juri */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-xl border border-gray-200 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-dark">Portal Penilaian Juri</h1>
            <p className="text-gray-500">
              Selamat datang, <span className="font-semibold text-primary">{juriData?.nama || 'Juri Dummy'}</span>
            </p>
            <Badge className="mt-2" variant="default">
              Bidang: {juriData?.bidang_lomba?.nama || 'Cyber Security'}
            </Badge>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Keluar
          </Button>
        </div>

        {/* Kontrol Peserta */}
        <div className="flex justify-between items-center">
          <Button 
            variant="secondary" 
            disabled={pesertaIndex === 0}
            onClick={() => { setPesertaIndex(p => p - 1); setSaveSuccess(false); }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
          </Button>
          <div className="text-sm font-medium text-gray-500">
            Peserta {pesertaIndex + 1} dari {pesertaList.length}
          </div>
          <Button 
            variant="secondary"
            disabled={pesertaIndex === pesertaList.length - 1}
            onClick={() => { setPesertaIndex(p => p + 1); setSaveSuccess(false); }}
          >
            Selanjutnya <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Form Penilaian */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle className="text-xl">{currentPeserta.nama}</CardTitle>
              <div className="text-sm text-gray-500 mt-1 flex gap-2">
                <span className="font-medium text-dark">{currentPeserta.nomor_peserta}</span> • 
                <span>{currentPeserta.sekolah}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Nilai</div>
              <div className="text-3xl font-bold text-primary">{hitungGrandTotal()}</div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-1/2">Deskripsi Penilaian</TableHead>
                  <TableHead className="text-center">Nilai Maksimal</TableHead>
                  <TableHead className="text-center w-48">Nilai Diberikan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modulList.map((modul) => (
                  <React.Fragment key={modul.id}>
                    {/* Header Modul */}
                    <TableRow className="bg-blue-50/50">
                      <TableCell colSpan={3} className="font-semibold text-primary py-2">
                        {modul.nama}
                      </TableCell>
                    </TableRow>
                    
                    {/* Item Penilaian */}
                    {modul.deskripsi_nilai.map((desc) => (
                      <TableRow key={desc.id}>
                        <TableCell className="pl-8 text-gray-700">{desc.nama}</TableCell>
                        <TableCell className="text-center text-gray-500 font-medium">{desc.nilai_max}</TableCell>
                        <TableCell>
                          <input
                            type="number"
                            min="0"
                            max={desc.nilai_max}
                            step="0.1"
                            value={formNilai[desc.id] !== undefined ? formNilai[desc.id] : ''}
                            onChange={(e) => handleNilaiChange(desc.id, desc.nilai_max, e.target.value)}
                            className="w-full text-center p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg font-semibold text-dark"
                            placeholder="0"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Subtotal Modul */}
                    <TableRow className="bg-gray-50/50 border-t-2 border-t-gray-100">
                      <TableCell colSpan={2} className="text-right font-medium text-gray-600">Subtotal Modul:</TableCell>
                      <TableCell className="text-center font-bold text-dark">{hitungTotalModul(modul)}</TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                {saveSuccess && <span className="text-green-600 font-medium text-sm flex items-center"><Badge variant="success" className="mr-2">Berhasil</Badge> Nilai tersimpan!</span>}
              </div>
              <Button onClick={handleSimpan} disabled={saving} size="lg" className="min-w-[150px]">
                {saving ? 'Menyimpan...' : <><Save className="w-5 h-5 mr-2" /> Simpan Nilai</>}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
