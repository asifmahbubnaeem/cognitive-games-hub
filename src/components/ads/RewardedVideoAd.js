import React, { useState, useEffect } from 'react';
import { Play, X, Gift } from 'lucide-react';
import { shouldShowAds, initAdSense, pushAd, getRewardedVideoReward, ADSENSE_PUBLISHER_ID, AD_UNITS } from '../../utils/ads';

/**
 * Rewarded Video Ad Component
 * Shows rewarded video ad for extra game plays or features
 * 
 * @param {boolean} show - Whether to show the ad modal
 * @param {function} onClose - Callback when ad is closed
 * @param {function} onReward - Callback when reward is earned
 * @param {string} rewardText - Text describing the reward
 */
export default function RewardedVideoAd({ show = false, onClose, onReward, rewardText = '1 extra game play' }) {
  const adRef = React.useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [rewardEarned, setRewardEarned] = useState(false);

  useEffect(() => {
    if (show && shouldShowAds()) {
      initAdSense();
      // Reset state when showing
      setAdLoaded(false);
      setIsWatching(false);
      setRewardEarned(false);
    }
  }, [show]);

  const handleWatchAd = () => {
    setIsWatching(true);
    
    // Simulate ad watching (in production, this would be handled by AdSense)
    // For now, we'll simulate the reward after a delay
    setTimeout(() => {
      // In production, this would be triggered by AdSense events
      getRewardedVideoReward();
      setRewardEarned(true);
      setIsWatching(false);
      
      if (onReward) {
        onReward();
      }
    }, 3000); // Simulate 3 second ad
  };

  if (!show || !shouldShowAds()) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl shadow-2xl border-2 border-cyan-500 max-w-md w-full p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 mb-4">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Watch Ad for Reward
          </h2>
          <p className="text-gray-400">
            Watch a short video to get {rewardText}
          </p>
        </div>

        {!isWatching && !rewardEarned && (
          <>
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-600/50 text-center">
              <Play className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <p className="text-gray-300 text-sm">
                Watch a short video advertisement to unlock your reward
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleWatchAd}
                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Ad
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-600 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </>
        )}

        {isWatching && (
          <div className="text-center py-8">
            <div className="inline-block w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-semibold">Playing ad...</p>
            <p className="text-gray-400 text-sm mt-2">Please wait</p>
          </div>
        )}

        {rewardEarned && (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 mb-4">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <p className="text-white font-bold text-xl mb-2">Reward Earned!</p>
            <p className="text-gray-300 mb-6">You've received {rewardText}</p>
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
