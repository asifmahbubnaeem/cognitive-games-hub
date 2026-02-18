import React from 'react';
import { Crown } from 'lucide-react';

export default function PremiumBadge({ size = 'sm' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold">
      <Crown className={sizeClasses[size]} />
      <span className="hidden sm:inline">PREMIUM</span>
    </div>
  );
}
