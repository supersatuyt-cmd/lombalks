import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageWrapper } from '../../components/layout/Layout';
import { Card, CardContent } from '../../components/ui/Card';
import { Settings, Users, BookOpen, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ peserta: 0, modul: 0, bidang: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const { count: peserta } = await supabase.from('peserta').select('*', { count: 'exact', head: true });
      const { count: modul } = await supabase.from('modul').select('*', { count: 'exact', head: true });
      const { count: bidang } = await supabase.from('bidang_lomba').select('*', { count: 'exact', head: true });
      
      setStats({
        peserta: peserta || 0,
        modul: modul || 0,
        bidang: bidang || 0
      });
    };
    fetchStats();
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const menuItems = [
    {
      title: 'Kelola Peserta',
      description: 'Manajemen data peserta dari seluruh bidang lomba dan asal sekolah',
      icon: Users,
      link: '/admin/peserta',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      stat: `${stats.peserta} Peserta`
    },
    {
      title: 'Kelola Modul & Kriteria',
      description: 'Sesuaikan modul penilaian, bobot kriteria, dan struktur penjurian',
      icon: Settings,
      link: '/admin/modul',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      stat: `${stats.modul} Modul`
    },
    {
      title: 'Bidang Lomba',
      description: 'Lihat daftar bidang lomba yang diselenggarakan',
      icon: BookOpen,
      link: '/',
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      stat: `${stats.bidang} Bidang`
    }
  ];

  return (
    <PageWrapper>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col mb-8">
          <h1 className="text-3xl font-bold text-dark">Dashboard Admin</h1>
          <p className="text-gray-500 mt-2">Selamat datang di panel administrasi LKS Dikmen. Pilih menu di bawah untuk mengelola sistem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, idx) => (
            <Link key={idx} to={item.link}>
              <Card className="hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer h-full border-gray-100 group">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${item.bgColor} ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                      {item.stat}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-dark mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 flex-grow mb-4">{item.description}</p>
                  
                  <div className="flex items-center text-sm font-medium text-primary mt-auto">
                    Kelola Sekarang <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
