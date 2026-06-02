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
      {/* Hero Banner - Screen Only */}
      <div className="screen-only relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 opacity-10">
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

      {/* Filter Kategori - Screen Only */}
      <div className="screen-only mb-8">
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

      {/* Winners Content */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500">Memuat data pemenang...</p>
        </div>
      ) : (
        <>
          {/* Screen Version */}
          <div className="screen-only space-y-6">
            {filteredWinners.map((item, idx) => {
              const iconData = getBidangIcon(item.bidang.kode);
              
              return (
                <div key={item.bidang.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="bg-white rounded-3xl shadow-md border border-gray-200 p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0 md:w-72 bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div className={`w-14 h-14 bg-gradient-to-br ${iconData.bg} rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}>
                            {iconData.emoji}
                          </div>
                          <div>
                            <span className="inline-block px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500 mb-2">
                              {item.bidang.kode.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <h2 className="text-lg font-bold text-dark leading-tight mb-3">
                          {item.bidang.nama}
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Lomba kompetensi tingkat SMK
                        </p>
                      </div>

                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {item.topPeserta.map((peserta) => {
                          const badge = getRankBadge(peserta.rank);
                          
                          return (
                            <div
                              key={peserta.id}
                              className={`relative ${badge.bg} border-2 ${badge.border} rounded-2xl p-5 transition-all duration-300 hover:scale-105 hover:shadow-lg`}
                            >
                              <div className="flex justify-center mb-3">
                                <span className="text-5xl">{badge.icon}</span>
                              </div>
                              <div className="text-center mb-4">
                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold ${badge.textBg} ${badge.textColor} uppercase tracking-wide`}>
                                  {badge.label}
                                </span>
                              </div>
                              <h3 className="text-base font-bold text-dark text-center mb-2 leading-tight min-h-[40px] flex items-center justify-center">
                                {peserta.nama}
                              </h3>
                              <p className="text-xs text-gray-600 text-center mb-4 leading-snug">
                                {peserta.sekolah}
                              </p>
                              <div className="h-px bg-gray-300 mb-3"></div>
                              <p className="text-[10px] text-gray-500 uppercase tracking-wider text-center mb-1">
                                Total Nilai
                              </p>
                              <p className="text-4xl font-extrabold text-dark text-center">
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

          {/* Print Version - Compact Table */}
          <div className="print-container">
            <div className="print-header">
              <div className="print-title-bar">
                <div>
                  <h1 className="print-main-title">PENGUMUMAN PEMENANG</h1>
                  <p className="print-subtitle">Lomba Kompetensi Siswa SMK - Tahun 2026</p>
                </div>
                <div className="print-stats">
                  <span className="print-stat-item">{stats.bidang} Bidang</span>
                  <span className="print-stat-divider">•</span>
                  <span className="print-stat-item">{stats.peserta} Peserta</span>
                  <span className="print-stat-divider">•</span>
                  <span className="print-stat-item">{stats.pemenang} Pemenang</span>
                </div>
              </div>
            </div>

            <div className="print-table">
            {winners.map((item, idx) => {
              const iconData = getBidangIcon(item.bidang.kode);
              
              return (
                <div key={item.bidang.id} className="print-row">
                  {/* Bidang Info Column */}
                  <div className="print-bidang-col">
                    <div className="print-icon">{iconData.emoji}</div>
                    <div className="print-bidang-text">
                      <div className="print-kode">{item.bidang.kode.toUpperCase()}</div>
                      <div className="print-nama-bidang">{item.bidang.nama}</div>
                    </div>
                  </div>

                  {/* Winners Columns */}
                  {[1, 2, 3].map(rank => {
                    const peserta = item.topPeserta.find(p => p.rank === rank);
                    const badge = getRankBadge(rank);
                    
                    if (!peserta) {
                      return <div key={rank} className="print-winner-col print-empty">-</div>;
                    }

                    return (
                      <div key={rank} className={`print-winner-col rank-${rank}`}>
                        <div className="print-medal">{badge.icon}</div>
                        <div className="print-winner-name">{peserta.nama}</div>
                        <div className="print-winner-school">{peserta.sekolah}</div>
                        <div className="print-winner-score">{peserta.totalNilai.toFixed(2)}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            </div>

            {/* Print Footer */}
            <div className="print-footer-note">
              <div className="print-footer-text">
                Hasil resmi LKS Dikmen Kabupaten Kutai Timur - Diumumkan: {new Date().toLocaleDateString('id-ID', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </>
      )}
      <div className="screen-only mt-12 grid md:grid-cols-3 gap-4">
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

      {/* Catatan Footer - Screen Only */}
      <div className="screen-only mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
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
        
        /* Screen Only Elements */
        .screen-only {
          display: block;
        }
        
        /* Print Only Elements - Hidden on Screen */
        .print-header,
        .print-container,
        .print-footer-note {
          display: none;
        }
        
        /* ============================================ */
        /* PRINT STYLES - CENTERED & 1 PAGE */
        /* ============================================ */
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden !important;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 6.5pt;
            line-height: 1.1;
            background: white;
          }
          
          /* Hide screen elements */
          .screen-only,
          header,
          nav,
          footer,
          .animate-fade-in > div:first-child {
            display: none !important;
          }
          
          /* Show print elements */
          .print-header,
          .print-container,
          .print-table,
          .print-footer-note {
            display: block !important;
          }
          
          /* Main container - perfectly centered */
          .print-container {
            display: block !important;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 27.5cm;
            margin: 0;
          }
          
          /* ===== HEADER ===== */
          .print-header {
            margin-bottom: 0.4cm;
            border-bottom: 2.5px solid #3b82f6;
            padding-bottom: 0.25cm;
            text-align: center;
          }
          
          .print-title-bar {
            display: block;
          }
          
          .print-main-title {
            font-size: 13pt;
            font-weight: 800;
            color: #1e40af;
            margin: 0 0 0.1cm 0;
            line-height: 1;
            letter-spacing: 0.1em;
          }
          
          .print-subtitle {
            font-size: 7.5pt;
            color: #64748b;
            margin: 0 0 0.15cm 0;
          }
          
          .print-stats {
            display: inline-block;
            font-size: 7pt;
            color: #475569;
          }
          
          .print-stat-item {
            font-weight: 600;
          }
          
          .print-stat-divider {
            color: #cbd5e1;
            margin: 0 0.2cm;
          }
          
          /* ===== TABLE ===== */
          .print-table {
            width: 100%;
          }
          
          .print-row {
            display: grid;
            grid-template-columns: 2.6cm repeat(3, 1fr);
            gap: 0.2cm;
            margin-bottom: 0.25cm;
            page-break-inside: avoid;
            break-inside: avoid;
            height: 2.4cm;
          }
          
          /* Bidang Column */
          .print-bidang-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 0.1cm;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 0.2cm 0.15cm;
            border-radius: 0.15cm;
            border: 1px solid #cbd5e1;
          }
          
          .print-icon {
            font-size: 15pt;
            line-height: 1;
          }
          
          .print-bidang-text {
            width: 100%;
          }
          
          .print-kode {
            font-size: 5.5pt;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.03em;
            margin-bottom: 0.05cm;
          }
          
          .print-nama-bidang {
            font-size: 6pt;
            font-weight: 700;
            color: #1e293b;
            line-height: 1.15;
          }
          
          /* Winner Columns */
          .print-winner-col {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            text-align: center;
            padding: 0.18cm 0.15cm;
            border-radius: 0.15cm;
            border: 1.5px solid;
          }
          
          .print-winner-col.rank-1 {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-color: #f59e0b;
          }
          
          .print-winner-col.rank-2 {
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-color: #3b82f6;
          }
          
          .print-winner-col.rank-3 {
            background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
            border-color: #ea580c;
          }
          
          .print-winner-col.print-empty {
            background: #f8fafc;
            border-color: #e2e8f0;
            color: #cbd5e1;
            border-style: dashed;
            font-size: 9pt;
          }
          
          .print-medal {
            font-size: 12pt;
            line-height: 1;
            margin-bottom: 0.1cm;
          }
          
          .print-winner-name {
            font-size: 6.5pt;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 0.08cm;
            line-height: 1.1;
            max-height: 0.7cm;
            overflow: hidden;
          }
          
          .print-winner-school {
            font-size: 5.5pt;
            color: #475569;
            margin-bottom: 0.1cm;
            line-height: 1.1;
            max-height: 0.6cm;
            overflow: hidden;
          }
          
          .print-winner-score {
            font-size: 10pt;
            font-weight: 800;
            color: #0f172a;
            line-height: 1;
            margin-top: auto;
            padding-top: 0.1cm;
            border-top: 1px solid rgba(0,0,0,0.1);
            width: 100%;
          }
          
          /* ===== FOOTER ===== */
          .print-footer-note {
            margin-top: 0.3cm;
            padding-top: 0.2cm;
            border-top: 1px solid #e2e8f0;
            text-align: center;
          }
          
          .print-footer-text {
            font-size: 5.5pt;
            color: #64748b;
            font-style: italic;
          }
          
          /* Shadows for depth */
          .print-bidang-col,
          .print-winner-col {
            box-shadow: 0 1px 2px rgba(0,0,0,0.08);
          }
          
          /* Force single page */
          .print-container,
          .print-table,
          .print-row {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          
          .print-row:last-child {
            margin-bottom: 0;
          }
        }
      `}</style>
    </PageWrapper>
  );
}
