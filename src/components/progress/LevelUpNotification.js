import React, { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';

export default function LevelUpNotification({ level, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!level || !isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-purple-500/90 to-pink-500/90 backdrop-blur-sm rounded-xl p-6 shadow-2xl border-2 border-purple-400 max-w-sm">
        <div className="flex items-start gap-3">
          <Sparkles className="w-8 h-8 text-yellow-200 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <h3 className="font-bold text-white text-xl mb-1">🎉 Level Up!</h3>
            <p className="text-white font-semibold text-2xl mb-1">Level {level}</p>
            <p className="text-purple-100 text-sm">Keep training to reach the next level!</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose && onClose(), 300);
            }}
            className="text-white hover:text-purple-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
