import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Hitung nilai akhir peserta (AVG dari total per juri)
export function hitungNilaiAkhir(penilaianPerJuri) {
  if (!penilaianPerJuri || penilaianPerJuri.length === 0) return 0;
  
  const totals = penilaianPerJuri.map(juri => 
    juri.penilaian.reduce((sum, p) => sum + Number(p.nilai), 0)
  );
  
  return totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
}

export function hitungRank(pesertaList) {
  return [...pesertaList].sort((a, b) => {
    return hitungNilaiAkhir(b.penilaianPerJuri) - hitungNilaiAkhir(a.penilaianPerJuri);
  }).map((peserta, index) => ({
    ...peserta,
    rank: index + 1
  }));
}

export function formatPersentase(value) {
  return `${Number(value).toFixed(2)}%`;
}
