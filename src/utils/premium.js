/**
 * Premium subscription management
 * Phase 1: localStorage-based (can be upgraded to backend later)
 */

const STORAGE_KEY_PREMIUM = 'cognitiveHub_premium';
const STORAGE_KEY_PREMIUM_EXPIRY = 'cognitiveHub_premiumExpiry';
const STORAGE_KEY_TRIAL_USED = 'cognitiveHub_trialUsed';

// Free tier limits
export const FREE_TIER_LIMITS = {
  dailyGames: 5,
  freeGames: ['number-chain', 'speed-truth', 'focus-flow', 'color-match'], // First 4 games
  maxDifficulty: 'intermediate', // Free users can't access advanced/expert/master
  adsEnabled: true,
};

export function isPremium() {
  try {
    const premium = localStorage.getItem(STORAGE_KEY_PREMIUM);
    if (premium !== 'true') return false;
    
    // Check expiry
    const expiry = localStorage.getItem(STORAGE_KEY_PREMIUM_EXPIRY);
    if (expiry) {
      const expiryDate = new Date(expiry);
      if (expiryDate < new Date()) {
        // Expired, remove premium
        localStorage.removeItem(STORAGE_KEY_PREMIUM);
        localStorage.removeItem(STORAGE_KEY_PREMIUM_EXPIRY);
        return false;
      }
    }
    
    return true;
  } catch {
    return false;
  }
}

export function setPremium(expiryDate = null) {
  try {
    localStorage.setItem(STORAGE_KEY_PREMIUM, 'true');
    if (expiryDate) {
      localStorage.setItem(STORAGE_KEY_PREMIUM_EXPIRY, expiryDate.toISOString());
    }
  } catch (e) {
    console.warn('premium.setPremium failed', e);
  }
}

export function removePremium() {
  try {
    localStorage.removeItem(STORAGE_KEY_PREMIUM);
    localStorage.removeItem(STORAGE_KEY_PREMIUM_EXPIRY);
  } catch (e) {
    console.warn('premium.removePremium failed', e);
  }
}

export function hasUsedTrial() {
  try {
    return localStorage.getItem(STORAGE_KEY_TRIAL_USED) === 'true';
  } catch {
    return false;
  }
}

export function setTrialUsed() {
  try {
    localStorage.setItem(STORAGE_KEY_TRIAL_USED, 'true');
  } catch (e) {
    console.warn('premium.setTrialUsed failed', e);
  }
}

export function canPlayGame(gameId) {
  if (isPremium()) return true;
  return FREE_TIER_LIMITS.freeGames.includes(gameId);
}

export function canAccessDifficulty(difficulty) {
  if (isPremium()) return true;
  const difficultyOrder = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
  const maxFreeIndex = difficultyOrder.indexOf(FREE_TIER_LIMITS.maxDifficulty);
  const requestedIndex = difficultyOrder.indexOf(difficulty);
  return requestedIndex <= maxFreeIndex;
}

export function getGamesPlayedToday() {
  try {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('cognitiveHub_lastGamesDate');
    if (lastDate !== today) return 0;
    return parseInt(localStorage.getItem('cognitiveHub_gamesPlayedToday') || '0', 10);
  } catch {
    return 0;
  }
}

export function canPlayMoreGames() {
  if (isPremium()) return true;
  return getGamesPlayedToday() < FREE_TIER_LIMITS.dailyGames;
}

export function getRemainingGames() {
  if (isPremium()) return Infinity;
  return Math.max(0, FREE_TIER_LIMITS.dailyGames - getGamesPlayedToday());
}
