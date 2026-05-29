import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function BidangProgressChart({ data }) {
  // data format: [{ name: 'Cyber Security', progress: 80 }, ...]
  
  // Warna unik untuk setiap bidang lomba berdasarkan kode bidang
  const getBidangColor = (bidangName) => {
    const colorMap = {
      'ITNC': '#3b82f6',    // Biru - IT Network Cable
      'ITGDT': '#10b981',   // Hijau - Graphic Design
      'ITNSA': '#f59e0b',   // Orange - IT Network System Admin
      'ITCS': '#ef4444',    // Merah - Cyber Security
      'ITWT': '#8b5cf6',    // Ungu - Web Technologies
      'ITSWC': '#ec4899',   // Pink - Software Solutions
      'ITMC': '#14b8a6',    // Teal - Mobile Apps
      'ITCC': '#f97316',    // Orange terang - Cloud Computing
    };
    
    // Cari warna berdasarkan kode bidang (uppercase)
    const upperName = bidangName.toUpperCase();
    return colorMap[upperName] || '#6b7280'; // Default abu-abu jika tidak ditemukan
  };

  // Fungsi untuk membuat warna lebih gelap saat progress rendah (opsional)
  const getBarColorWithProgress = (bidangName, progress) => {
    const baseColor = getBidangColor(bidangName);
    
    // Jika progress 0%, gunakan warna abu-abu
    if (progress === 0) {
      return '#d1d5db';
    }
    
    // Jika progress 100%, tambahkan efek glow/brightness
    if (progress === 100) {
      return baseColor; // Warna penuh untuk 100%
    }
    
    // Untuk progress 1-99%, gunakan warna bidang dengan sedikit transparansi
    return baseColor;
  };
  
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            domain={[0, 100]}
            tickFormatter={(val) => `${val}%`}
          />
          <Tooltip 
            cursor={{ fill: '#f3f4f6', opacity: 0.5 }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', 
              padding: '12px 16px',
              backgroundColor: 'white'
            }}
            labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px', fontSize: '14px' }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0 && payload[0].payload.fullName) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
            formatter={(value) => [`${value}%`, 'Progress Penjurian']}
          />
          <Bar 
            dataKey="progress" 
            radius={[8, 8, 0, 0]} 
            maxBarSize={60}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => {
              const barColor = getBarColorWithProgress(entry.name, entry.progress);
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={barColor}
                  style={{
                    filter: entry.progress === 100 
                      ? 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.4))' // Glow hijau untuk 100%
                      : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                    transition: 'all 0.3s ease'
                  }}
                />
              );
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
