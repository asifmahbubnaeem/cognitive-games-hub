import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

export default function AchievementNotification({ achievement, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose && onClose(), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement || !isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
      <div className="bg-gradient-to-r from-yellow-500/90 to-orange-500/90 backdrop-blur-sm rounded-xl p-4 shadow-2xl border-2 border-yellow-400 max-w-sm">
        <div className="flex items-start gap-3">
          <div className="text-4xl flex-shrink-0">{achievement.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Trophy className="w-5 h-5 text-yellow-200" />
              <h3 className="font-bold text-white text-lg">Achievement Unlocked!</h3>
            </div>
            <p className="text-white font-semibold mb-1">{achievement.name}</p>
            <p className="text-yellow-100 text-sm">{achievement.description}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose && onClose(), 300);
            }}
            className="text-white hover:text-yellow-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
