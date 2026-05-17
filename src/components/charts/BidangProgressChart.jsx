import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function BidangProgressChart({ data }) {
  // data format: [{ name: 'Cyber Security', progress: 80 }, ...]
  
  // Vibrant color palette for different fields
  const COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#14b8a6', '#ef4444', '#f97316', '#06b6d4'];
  
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
            tick={{ fill: '#6b7280', fontSize: 12 }}
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
            cursor={{ fill: '#f3f4f6' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
            labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0 && payload[0].payload.fullName) {
                return payload[0].payload.fullName;
              }
              return label;
            }}
            formatter={(value) => [`${value}%`, 'Progress']}
          />
          <Bar dataKey="progress" radius={[4, 4, 0, 0]} maxBarSize={60}>
            {data.map((entry, index) => {
              // If completed, use green, otherwise use a color from the palette
              const barColor = entry.progress === 100 ? '#10b981' : COLORS[index % COLORS.length];
              return <Cell key={`cell-${index}`} fill={barColor} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
