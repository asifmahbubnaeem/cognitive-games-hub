/**
 * Leveling and XP system
 */

const STORAGE_KEY_XP = 'cognitiveHub_xp';
const STORAGE_KEY_LEVEL = 'cognitiveHub_level';

// XP required per level (exponential growth)
const XP_PER_LEVEL = [
  0,    // Level 1
  100,  // Level 2
  250,  // Level 3
  500,  // Level 4
  1000, // Level 5
  2000, // Level 6
  3500, // Level 7
  5500, // Level 8
  8000, // Level 9
  12000, // Level 10
  17000, // Level 11
  25000, // Level 12
  35000, // Level 13
  50000, // Level 14
  70000, // Level 15
];

const MAX_LEVEL = XP_PER_LEVEL.length;

function getXPForLevel(level) {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) return XP_PER_LEVEL[MAX_LEVEL - 1];
  return XP_PER_LEVEL[level - 1];
}

export function getCurrentXP() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY_XP) || '0', 10);
  } catch {
    return 0;
  }
}

export function getCurrentLevel() {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY_LEVEL) || '1', 10);
  } catch {
    return 1;
  }
}

export function calculateLevel(xp) {
  for (let level = MAX_LEVEL; level >= 1; level--) {
    if (xp >= getXPForLevel(level)) {
      return level;
    }
  }
  return 1;
}

export function getXPForNextLevel(level) {
  if (level >= MAX_LEVEL) return null;
  return getXPForLevel(level + 1);
}

export function getXPProgress(level, xp) {
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForNextLevel(level);
  if (!nextLevelXP) return { progress: 100, current: xp, required: currentLevelXP };
  
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  return {
    progress: Math.min(100, Math.max(0, progress)),
    current: xp - currentLevelXP,
    required: nextLevelXP - currentLevelXP,
  };
}

export function addXP(amount, source = 'game') {
  try {
    const currentXP = getCurrentXP();
    const currentLevel = getCurrentLevel();
    const newXP = currentXP + amount;
    const newLevel = calculateLevel(newXP);

    localStorage.setItem(STORAGE_KEY_XP, String(newXP));

    if (newLevel > currentLevel) {
      localStorage.setItem(STORAGE_KEY_LEVEL, String(newLevel));
      return { leveledUp: true, oldLevel: currentLevel, newLevel, xp: newXP };
    }

    return { leveledUp: false, level: currentLevel, xp: newXP };
  } catch (e) {
    console.warn('leveling.addXP failed', e);
    return { leveledUp: false, level: 1, xp: 0 };
  }
}

export function calculateXPFromGame(score, difficulty = 'beginner', perfect = false) {
  const difficultyMultipliers = {
    beginner: 1,
    intermediate: 1.5,
    advanced: 2,
    expert: 3,
    master: 5,
  };

  const multiplier = difficultyMultipliers[difficulty] || 1;
  const baseXP = Math.floor(score / 10); // 10 points = 1 XP
  const difficultyBonus = baseXP * (multiplier - 1);
  const perfectBonus = perfect ? 50 : 0;

  return Math.floor(baseXP + difficultyBonus + perfectBonus);
}

export function getLevelTitle(level) {
  if (level >= 20) return 'Grandmaster';
  if (level >= 15) return 'Master';
  if (level >= 10) return 'Expert';
  if (level >= 5) return 'Advanced';
  return 'Novice';
}
