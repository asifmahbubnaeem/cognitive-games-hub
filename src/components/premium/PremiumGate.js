import React from 'react';
import { Crown } from 'lucide-react';
import { usePremium } from '../../contexts/PremiumContext';
import PremiumUpgradeModal from './PremiumUpgradeModal';

export default function PremiumGate({ children, gameId = null, difficulty = null, feature = null }) {
  const { isPremium } = usePremium();
  const [showUpgrade, setShowUpgrade] = React.useState(false);

  const isLocked = React.useMemo(() => {
    if (isPremium) return false;
    
    if (gameId) {
      const { canPlayGame } = require('../../utils/premium');
      return !canPlayGame(gameId);
    }
    
    if (difficulty) {
      const { canAccessDifficulty } = require('../../utils/premium');
      return !canAccessDifficulty(difficulty);
    }
    
    return feature !== null;
  }, [isPremium, gameId, difficulty, feature]);

  if (!isLocked) {
    return children;
  }

  return (
    <>
      <div className="relative">
        <div className="opacity-50 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl">
          <button
            onClick={() => setShowUpgrade(true)}
            className="flex flex-col items-center gap-3 p-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Crown className="w-8 h-8 text-white" />
            <span className="text-white font-bold">Premium Required</span>
            <span className="text-yellow-100 text-sm">Unlock with Premium</span>
          </button>
        </div>
      </div>
      {showUpgrade && <PremiumUpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
