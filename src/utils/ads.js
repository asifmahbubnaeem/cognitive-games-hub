/**
 * Ads management utility
 * Handles Google AdSense integration and ad display logic
 */

import { isPremium } from './premium';

// Google AdSense Publisher ID - Replace with your actual AdSense publisher ID
export const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'; // Replace with your ID

// Ad unit IDs - Replace with your actual ad unit IDs
export const AD_UNITS = {
  banner: '1234567890', // Banner ad unit ID
  interstitial: '0987654321', // Interstitial ad unit ID
  rewarded: '1122334455', // Rewarded video ad unit ID
};

// Ad display frequency settings
export const AD_CONFIG = {
  // Show interstitial after every N games
  interstitialFrequency: 3,
  // Minimum time between interstitials (seconds)
  minInterstitialInterval: 60,
  // Track last interstitial time
  lastInterstitialTime: null,
};

/**
 * Check if ads should be shown (not premium, ads enabled)
 */
export function shouldShowAds() {
  return !isPremium();
}

/**
 * Initialize Google AdSense
 */
export function initAdSense() {
  if (typeof window === 'undefined') return;
  
  // Check if AdSense script already loaded
  if (window.adsbygoogle) {
    return;
  }

  // Load AdSense script
  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

/**
 * Push ad to AdSense
 */
export function pushAd(adElement) {
  if (typeof window === 'undefined' || !window.adsbygoogle) {
    // AdSense not loaded yet, try again after a delay
    setTimeout(() => {
      if (window.adsbygoogle && adElement) {
        try {
          window.adsbygoogle.push({});
        } catch (e) {
          console.warn('AdSense push failed:', e);
        }
      }
    }, 1000);
    return;
  }

  try {
    window.adsbygoogle.push({});
  } catch (e) {
    console.warn('AdSense push failed:', e);
  }
}

/**
 * Check if we should show an interstitial ad
 */
export function shouldShowInterstitial() {
  if (!shouldShowAds()) return false;
  
  const lastTime = localStorage.getItem('cognitiveHub_lastInterstitialTime');
  if (lastTime) {
    const timeDiff = (Date.now() - parseInt(lastTime, 10)) / 1000;
    if (timeDiff < AD_CONFIG.minInterstitialInterval) {
      return false;
    }
  }
  
  return true;
}

/**
 * Record interstitial ad shown
 */
export function recordInterstitialShown() {
  localStorage.setItem('cognitiveHub_lastInterstitialTime', String(Date.now()));
}

/**
 * Get rewarded video ad reward (extra game play)
 */
export function getRewardedVideoReward() {
  // Grant 1 extra game play
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem('cognitiveHub_lastGamesDate');
  const gamesToday = parseInt(localStorage.getItem('cognitiveHub_gamesPlayedToday') || '0', 10);
  
  if (lastDate === today) {
    // Same day, decrement games played to allow one more
    localStorage.setItem('cognitiveHub_gamesPlayedToday', String(Math.max(0, gamesToday - 1)));
  }
  
  // Record rewarded video watched
  localStorage.setItem('cognitiveHub_rewardedVideoWatched', String(Date.now()));
}
