import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/Layout';
import { Trophy, Download, FileText, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function PengumumanPemenang() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stats, setStats] = useState({ bidang: 0, peserta: 0, pemenang: 0 });

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    setLoading(true);
    
    try {
      // Ambil semua bidang lomba
      const { data: bidangList, error: bidangError } = await supabase
        .from('bidang_lomba')
        .select('*')
        .order('nama');

      console.log('Bidang List:', bidangList);

      if (!bidangList || bidangList.length === 0) {
        console.log('Tidak ada bidang lomba');
        setLoading(false);
        return;
      }

      // Ambil SEMUA data peserta, penilaian, dan sekolah sekaligus
      const { data: allPeserta } = await supabase.from('peserta').select('*');
      const { data: allPenilaian } = await supabase.from('penilaian').select('peserta_id, nilai');
      const { data: allSekolah } = await supabase.from('sekolah').select('*');

      console.log('All Peserta:', allPeserta);
      console.log('All Penilaian:', allPenilaian);
      console.log('All Sekolah:', allSekolah);

      let totalPeserta = 0;
      let totalPemenang = 0;

      const allWinners = bidangList.map(bidang => {
        // Filter peserta untuk bidang ini
        const pesertaInBidang = (allPeserta || []).filter(p => p.bidang_lomba_id === bidang.id);
        
        console.log(`Peserta di ${bidang.nama}:`, pesertaInBidang);

        if (pesertaInBidang.length === 0) {
          return { bidang, topPeserta: [] };
        }

        totalPeserta += pesertaInBidang.length;

        // Hitung total nilai untuk setiap peserta
        const pesertaWithScores = pesertaInBidang.map(peserta => {
          // Filter penilaian untuk peserta ini
          const penilaianPeserta = (allPenilaian || []).filter(p => p.peserta_id === peserta.id);
          const totalNilai = penilaianPeserta.reduce((sum, p) => sum + (p.nilai || 0), 0);

          // Cari nama sekolah
          const sekolahData = (allSekolah || []).find(s => s.id === peserta.sekolah_id);
          
          console.log(`${peserta.nama}: ${penilaianPeserta.length} penilaian, total: ${totalNilai}`);

          return {
            id: peserta.id,
            nama: peserta.nama,
            kode_peserta: peserta.kode_peserta,
            sekolah: sekolahData?.nama || 'Unknown',
            totalNilai
          };
        });

        // Sort dan ambil top 3
        const topPeserta = pesertaWithScores
          .sort((a, b) => b.totalNilai - a.totalNilai)
          .slice(0, 3)
          .map((p, index) => ({ ...p, rank: index + 1 }));

        console.log(`Top 3 di ${bidang.nama}:`, topPeserta);

        if (topPeserta.length > 0) totalPemenang += topPeserta.length;
        
        return { bidang, topPeserta };
      });

      const validWinners = allWinners.filter(w => w.topPeserta.length > 0);
      
      console.log('Valid Winners:', validWinners);
      console.log('Stats:', { bidang: validWinners.length, peserta: totalPeserta, pemenang: totalPemenang });

      setWinners(validWinners);
      setStats({ bidang: validWinners.length, peserta: totalPeserta, pemenang: totalPemenang });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching winners:', error);
      setLoading(false);
    }
  };

  const getBidangIcon = (kode) => {
    const iconMap = {
      'itnc': { emoji: '🌐', bg: 'from-blue-500 to-blue-600' },
      'itgdt': { emoji: '🎨', bg: 'from-pink-500 to-pink-600' },
      'itnsa': { emoji: '⚙️', bg: 'from-blue-500 to-blue-600' },
      'itcs': { emoji: '🔒', bg: 'from-blue-500 to-blue-600' },
      'itwt': { emoji: '💻', bg: 'from-blue-500 to-blue-600' },
    };
    return iconMap[kode?.toLowerCase()] || { emoji: '🏆', bg: 'from-blue-500 to-blue-600' };
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return { 
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100', 
      border: 'border-yellow-300',
      textBg: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      icon: '🥇', 
      label: 'JUARA 1' 
    };
    if (rank === 2) return { 
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100', 
      border: 'border-blue-200',
      textBg: 'bg-blue-50',
      textColor: 'text-blue-700',
      icon: '🥈', 
      label: 'JUARA 2' 
    };
    return { 
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100', 
      border: 'border-orange-300',
      textBg: 'bg-orange-100',
      textColor: 'text-orange-800',
      icon: '🥉', 
      label: 'JUARA 3' 
    };
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Untuk sementara, gunakan print to PDF
    // Nanti bisa diganti dengan library PDF generator seperti jsPDF atau pdfmake
    alert('Silakan gunakan Print dan pilih "Save as PDF" untuk download PDF');
    window.print();
  };

  const filteredWinners = selectedCategory === 'all' 
    ? winners 
    : winners.filter(w => w.bidang.kode.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <PageWrapper>
      {/* Hero Banner */}
      <div className="hero-print relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 opacity-10 print:hidden">
          <Trophy className="w-64 h-64" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold uppercase tracking-wider">Hasil Resmi</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">PENGUMUMAN JUARA</h1>
          <p className="text-xl text-blue-100 mb-6">Lomba Kompetensi Siswa SMK 2026</p>
          <p className="text-sm text-blue-100 max-w-2xl">
            Selamat kepada para peserta terbaik yang telah menunjukkan kompetensi dan prestasi terbaiknya
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats.bidang}</div>
              <div className="text-xs text-blue-100 mt-1">Bidang Lomba</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats.peserta}</div>
              <div className="text-xs text-blue-100 mt-1">Peserta</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <div className="text-3xl font-bold">{stats.pemenang}</div>
              <div className="text-xs text-blue-100 mt-1">Pemenang</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Kategori */}
      <div className="mb-8 print:hidden">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">Pilih Bidang Lomba</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              selectedCategory === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Semua Bidang
          </button>
          {winners.map(w => (
            <button
              key={w.bidang.id}
              onClick={() => setSelectedCategory(w.bidang.kode)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                selectedCategory.toLowerCase() === w.bidang.kode.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {w.bidang.kode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Winners List */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Memuat data pemenang...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredWinners.map((item, idx) => {
            const iconData = getBidangIcon(item.bidang.kode);
            
            return (
              <div key={item.bidang.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                {/* Card Container dengan padding putih */}
                <div className="print-card bg-white rounded-3xl shadow-md border border-gray-200 p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Side - Icon & Info Bidang dengan background abu */}
                    <div className="print-bidang-info flex-shrink-0 md:w-72 bg-gray-50 rounded-2xl p-6">
                      <div className="flex items-start gap-4 mb-4">
                        {/* Icon Gradient */}
                        <div className={`w-14 h-14 bg-gradient-to-br ${iconData.bg} rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                          {iconData.emoji}
                        </div>
                        
                        {/* Kode Badge */}
                        <div>
                          <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500 mb-2">
                            {item.bidang.kode.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Nama Bidang */}
                      <h2 className="text-lg font-bold text-dark leading-tight mb-3">
                        {item.bidang.nama}
                      </h2>
                      
                      {/* Deskripsi */}
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Lomba kompetensi tingkat SMK
                      </p>
                    </div>

                    {/* Right Side - 3 Winner Cards Horizontal */}
                    <div className="print-winners-grid flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      {item.topPeserta.map((peserta) => {
                        const badge = getRankBadge(peserta.rank);
                        
                        return (
                          <div
                            key={peserta.id}
                            className={`print-winner-card rank-${peserta.rank} relative ${badge.bg} border-2 ${badge.border} rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                          >
                            {/* Medal Icon TOP */}
                            <div className="flex justify-center mb-3">
                              <span className="text-5xl">{badge.icon}</span>
                            </div>

                            {/* Rank Label */}
                            <div className="text-center mb-4">
                              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${badge.textBg} ${badge.textColor} uppercase tracking-wide`}>
                                {badge.label}
                              </span>
                            </div>

                            {/* Nama Peserta */}
                            <h3 className="text-base font-bold text-dark text-center mb-2 leading-tight min-h-[40px] flex items-center justify-center">
                              {peserta.nama}
                            </h3>

                            {/* Sekolah */}
                            <p className="school text-xs text-gray-600 text-center mb-4 leading-snug">
                              {peserta.sekolah}
                            </p>

                            {/* Divider */}
                            <div className="h-px bg-gray-300 mb-3"></div>

                            {/* Label Total Nilai */}
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider text-center mb-1">
                              Total Nilai
                            </p>
                            
                            {/* Total Nilai Besar */}
                            <p className="score text-4xl font-extrabold text-dark text-center">
                              {peserta.totalNilai.toFixed(2)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Actions */}
      <div className="mt-12 grid md:grid-cols-3 gap-4 print:hidden">
        <Link 
          to="/klasemen" 
          className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all hover:shadow-lg"
        >
          <Trophy className="w-5 h-5" />
          Lihat Klasemen Lengkap
        </Link>
        <button 
          onClick={handleDownloadPDF}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-red-500 hover:text-red-600 transition-all hover:shadow-lg"
        >
          <Download className="w-5 h-5" />
          Download Hasil Resmi (PDF)
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl font-semibold text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-all hover:shadow-lg"
        >
          <Clock className="w-5 h-5" />
          Cetak Pengumuman
        </button>
      </div>

      {/* Catatan Footer */}
      <div className="print-footer mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0 print:hidden">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-dark mb-1">Catatan:</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Hasil ini bersifat resmi dan telah divalidasi oleh tim juri. Untuk informasi lebih lanjut atau pengaduan, 
              silakan hubungi panitia LKS Dikmen Kabupaten Kutai Timur.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Diumumkan pada: {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        
        /* Print Styles - Optimized for PDF */
        @media print {
          @page {
            size: A4;
            margin: 1.5cm;
          }
          
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background: white !important;
          }
          
          /* Hide elements */
          .print\\:hidden,
          header,
          nav,
          footer,
          button {
            display: none !important;
          }
          
          /* Hero section - compact for print */
          .hero-print {
            background: linear-gradient(to right, #3b82f6, #8b5cf6) !important;
            color: white !important;
            padding: 1.5rem !important;
            border-radius: 1rem !important;
            margin-bottom: 1.5rem !important;
            page-break-after: avoid;
          }
          
          /* Stats in hero */
          .hero-print h1 {
            font-size: 1.75rem !important;
            margin-bottom: 0.5rem !important;
          }
          
          .hero-print p {
            font-size: 0.9rem !important;
          }
          
          /* Winner cards - better spacing */
          .animate-fade-in {
            page-break-inside: avoid;
            margin-bottom: 1rem !important;
          }
          
          /* Card container */
          .print-card {
            border: 1px solid #e5e7eb !important;
            padding: 1rem !important;
            border-radius: 0.75rem !important;
            page-break-inside: avoid;
          }
          
          /* Left side - bidang info */
          .print-bidang-info {
            background: #f9fafb !important;
            padding: 1rem !important;
            border-radius: 0.5rem !important;
            margin-bottom: 1rem !important;
          }
          
          /* Winner cards grid */
          .print-winners-grid {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 0.75rem !important;
          }
          
          .print-winner-card {
            border: 2px solid !important;
            padding: 1rem !important;
            border-radius: 0.75rem !important;
            text-align: center !important;
          }
          
          /* Winner card backgrounds */
          .print-winner-card.rank-1 {
            background: #fef3c7 !important;
            border-color: #fbbf24 !important;
          }
          
          .print-winner-card.rank-2 {
            background: #dbeafe !important;
            border-color: #60a5fa !important;
          }
          
          .print-winner-card.rank-3 {
            background: #fed7aa !important;
            border-color: #fb923c !important;
          }
          
          /* Typography for print */
          .print-winner-card h3 {
            font-size: 0.9rem !important;
            font-weight: 700 !important;
            margin: 0.5rem 0 !important;
            line-height: 1.2 !important;
          }
          
          .print-winner-card .school {
            font-size: 0.75rem !important;
            color: #6b7280 !important;
            margin-bottom: 0.5rem !important;
          }
          
          .print-winner-card .score {
            font-size: 1.75rem !important;
            font-weight: 800 !important;
            color: #1f2937 !important;
          }
          
          /* Catatan footer */
          .print-footer {
            margin-top: 2rem !important;
            padding: 1rem !important;
            background: #eff6ff !important;
            border: 1px solid #bfdbfe !important;
            border-radius: 0.75rem !important;
            page-break-inside: avoid;
          }
          
          .print-footer p {
            font-size: 0.75rem !important;
            line-height: 1.4 !important;
            margin: 0.25rem 0 !important;
          }
          
          /* Remove shadows for print */
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
          
          /* Preserve colors */
          .bg-gradient-to-r,
          .bg-gradient-to-br,
          .bg-blue-500,
          .bg-yellow-100,
          .bg-blue-100,
          .bg-orange-100 {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </PageWrapper>
  );
}
