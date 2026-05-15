import React from 'react';
import { cn } from '../../lib/utils';

export function ProgressBar({ progress, className, indicatorClassName }) {
  return (
    <div className={cn("h-3 w-full bg-gray-200 rounded-full overflow-hidden", className)}>
      <div 
        className={cn("h-full bg-primary transition-all duration-500 ease-in-out", indicatorClassName)}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  );
}
