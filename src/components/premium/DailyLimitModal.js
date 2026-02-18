import React from 'react';
import { Gamepad2, Crown, X, Play } from 'lucide-react';
import { usePremium } from '../../contexts/PremiumContext';
import PremiumUpgradeModal from './PremiumUpgradeModal';
import RewardedVideoAd from '../ads/RewardedVideoAd';

export default function DailyLimitModal({ onClose, onUpgrade }) {
  const { remainingGames, hasUsedTrial, refresh } = usePremium();
  const [showUpgrade, setShowUpgrade] = React.useState(false);
  const [showRewardedAd, setShowRewardedAd] = React.useState(false);

  const handleRewardEarned = () => {
    refresh(); // Refresh to update remaining games
    setShowRewardedAd(false);
    onClose(); // Close the modal after reward
  };

  if (showUpgrade) {
    return <PremiumUpgradeModal onClose={() => setShowUpgrade(false)} />;
  }

  if (showRewardedAd) {
    return (
      <RewardedVideoAd
        show={showRewardedAd}
        onClose={() => setShowRewardedAd(false)}
        onReward={handleRewardEarned}
        rewardText="1 extra game play"
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-orange-500 max-w-md w-full p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 mb-4">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Daily Limit Reached
          </h2>
          <p className="text-gray-400">
            You've played {5 - remainingGames} games today
          </p>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-600/50">
          <p className="text-gray-300 text-sm mb-3">
            <strong className="text-white">Free Tier:</strong> 5 games per day
          </p>
          <p className="text-gray-300 text-sm">
            <strong className="text-white">Premium:</strong> Unlimited games
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setShowRewardedAd(true)}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Watch Ad for Extra Play
          </button>
          <button
            onClick={() => setShowUpgrade(true)}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Upgrade to Premium
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {!hasUsedTrial && (
          <p className="text-center text-sm text-cyan-400 mt-4">
            💡 Try Premium free for 7 days!
          </p>
        )}
      </div>
    </div>
  );
}
