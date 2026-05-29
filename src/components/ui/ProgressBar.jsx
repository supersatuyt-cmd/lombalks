import React from 'react';
import { cn } from '../../lib/utils';

export function ProgressBar({ progress, className, indicatorClassName }) {
  // Tentukan warna berdasarkan progress
  const getProgressColor = (progress) => {
    if (progress === 0) return 'bg-gray-300'; // Abu-abu untuk 0%
    if (progress < 25) return 'bg-red-500'; // Merah untuk 1-24%
    if (progress < 50) return 'bg-orange-500'; // Orange untuk 25-49%
    if (progress < 75) return 'bg-yellow-500'; // Kuning untuk 50-74%
    if (progress < 100) return 'bg-blue-500'; // Biru untuk 75-99%
    return 'bg-green-500'; // Hijau untuk 100%
  };

  const progressColor = getProgressColor(progress);

  return (
    <div className={cn("relative h-3 w-full bg-gray-200 rounded-full overflow-hidden", className)}>
      {/* Progress bar dengan animasi */}
      <div 
        className={cn(
          "h-full transition-all duration-700 ease-out relative",
          progressColor,
          indicatorClassName
        )}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      >
        {/* Shimmer/shine effect - hanya muncul jika progress > 0 dan < 100 */}
        {progress > 0 && progress < 100 && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                 style={{ 
                   animation: 'shimmer 2s infinite',
                   backgroundSize: '200% 100%'
                 }} 
            />
          </div>
        )}
        
        {/* Pulse effect untuk progress yang sedang berjalan */}
        {progress > 0 && progress < 100 && (
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 animate-pulse" />
        )}
      </div>

      {/* CSS Animation untuk shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
